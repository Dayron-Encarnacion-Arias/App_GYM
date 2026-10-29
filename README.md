# GymFlow — Plataforma de gimnasio con microservicios

> **Entrega 2 — Proyecto Final Integrador (Unidades 1 a 7)**
> Backend dividido en microservicios detrás de un API Gateway, comunicación asíncrona con RabbitMQ, una base de datos por servicio, todo levantado con Docker Compose, pruebas automatizadas y frontend en React + Vite.

---

## 📌 Descripción

**GymFlow** permite a los usuarios:

- **Registrarse e iniciar sesión** de forma segura (contraseñas con `bcrypt`, sesión con `JWT`).
- **Gestionar un banco de ejercicios** (CRUD completo) con grupo muscular, series, repeticiones, descanso y dificultad.
- **Planificar su semana** (agenda de lunes a domingo con días de entrenamiento y descanso). Al registrarse, el sistema le crea automáticamente un **plan de bienvenida**.
- **Administrar rutinas** guardadas en SQL Server (CRUD completo).
- **Recibir notificaciones** (por ejemplo, la bienvenida generada a partir del evento de registro).

## 🛠️ Tecnologías

| Capa | Tecnologías |
| :--- | :--- |
| Frontend | React 19, Vite, TanStack React Query v5 (`useQuery`, `useMutation`, `invalidateQueries`), React Router v7, Axios, Lucide |
| API Gateway | Node.js 22, Express, `http-proxy-middleware`, CORS, Morgan |
| Microservicios | Node.js 22, Express, `jsonwebtoken`, `bcryptjs`, `amqplib` |
| Bases de datos | **PostgreSQL 16** (auth), **SQL Server** y **MongoDB** (entrenamiento), **MongoDB 7** (notificaciones) |
| Mensajería | **RabbitMQ 3.13** (exchange `topic`, colas durables, mensajes persistentes y confirmados) |
| Contenedores | Docker, Docker Compose, nginx (frontend) |
| Pruebas | Jest, Supertest, Vitest, React Testing Library |

---

## 🏛️ Arquitectura

```text
                    Frontend React (nginx :3000  ·  Vite :5173)
                                     │
                                     │  HTTP + Authorization: Bearer <JWT>
                                     ▼
                         ┌───────────────────────┐
                         │   API Gateway :8080   │   única entrada
                         └───────────┬───────────┘
          /api/auth                  │ /api/exercises, /schedules,      /api/notifications
              ┌──────────────────────┤ /workouts, /members  ───────────────────┐
              ▼                      ▼                                         ▼
     ┌─────────────────┐   ┌──────────────────────┐              ┌──────────────────────┐
     │  auth  :4001    │   │ entrenamiento :4002  │              │ notificaciones :4003 │
     └───┬─────────┬───┘   └───┬─────────┬────▲───┘              └────▲────────────┬────┘
         │         │           │         │    │                       │            │
         ▼         │           ▼         ▼    │                       │            ▼
   PostgreSQL      │       MongoDB   SQL Server                       │       MongoDB
   auth_db         │       gym_app   GymFlow  │                       │       notificaciones
   (Docker)        │       (PC)      (PC)     │                       │       (Docker)
                   │ publica                  │ consume               │ consume
                   ▼                          │                       │
     ┌───────────────────────────────────────────────────────────────────────────────┐
     │ RabbitMQ (Docker) · exchange "gymflow.events" · routing key "usuario.creado"  │
     │   cola entrenamiento.usuario.creado        cola notificaciones.usuario.creado │
     └───────────────────────────────────────────────────────────────────────────────┘
```

### Servicios y su base de datos

| Servicio | Carpeta | Responsabilidad | Base de datos propia |
| :--- | :--- | :--- | :--- |
| **API Gateway** | `gateway/` | Única entrada del frontend. Enruta por prefijo, aplica CORS, agrega `x-request-id`, responde 502 si un servicio cae y expone `/api/health`. | — |
| **Autenticación** | `servicios/auth/` | Registro, login, perfil y emisión del JWT. Publica `usuario.creado`. | PostgreSQL `auth_db` (contenedor) |
| **Entrenamiento** (negocio) | `servicios/entrenamiento/` | Ejercicios (arquitectura hexagonal), agenda semanal, rutinas y socios. Consume `usuario.creado`. | MongoDB `gym_app` + SQL Server `GymFlow` (instalados en la PC) |
| **Notificaciones** | `servicios/notificaciones/` | Avisos al usuario. Consume `usuario.creado`. | MongoDB `notificaciones` (contenedor) |

**Ningún servicio lee la base de datos de otro.** Los servicios de negocio no consultan a `auth` para saber quién es el usuario: verifican la firma del JWT con el secreto compartido (`JWT_SECRET`) y usan el `id` del token. Cuando necesitan datos del usuario (nombre, correo), los reciben por el evento `usuario.creado` y guardan su propia copia (colección `members` en entrenamiento).

> SQL Server y el MongoDB de entrenamiento están instalados en Windows (decisión acordada con el profesor). Los contenedores llegan a ellos con `host.docker.internal`. El resto de la infraestructura (PostgreSQL, MongoDB de notificaciones y RabbitMQ) corre en Docker.

### Arquitectura hexagonal

- **`servicios/entrenamiento/src/modules/exercises`**: dominio (`Exercise` con sus invariantes y el puerto `ExerciseRepositoryPort`), aplicación (casos de uso `Create/Get/GetById/Update/DeleteExercise`) e infraestructura (adaptador `ExerciseMongoRepository`, controlador y rutas Express). La capa de aplicación ya no arma consultas de Mongo: entrega criterios de dominio (`{ muscleGroup, difficulty, search }`) y el adaptador decide cómo traducirlos.
- **`servicios/auth`** sigue la misma idea: casos de uso (`RegisterUser`, `LoginUser`, `GetProfile`) que dependen de puertos (`UserRepositoryPort`, `EventPublisherPort`) implementados por adaptadores de PostgreSQL y RabbitMQ.

Cada `app.js` es una fábrica `createApp({ repositorios... })`: en producción recibe los adaptadores reales y en las pruebas repositorios en memoria, sin necesidad de bases de datos.

---

## 📨 Evento de mensajería: `usuario.creado`

| | |
| :--- | :--- |
| **Publica** | `auth` al registrar un usuario (también al crear el usuario demo). Exchange `gymflow.events` (tipo `topic`, durable), routing key `usuario.creado`, mensaje persistente con confirmación del broker. |
| **Consume `entrenamiento`** | Cola `entrenamiento.usuario.creado`: guarda al usuario como **socio** (`members`) y le crea un **plan semanal de bienvenida** en su agenda. |
| **Consume `notificaciones`** | Cola `notificaciones.usuario.creado`: guarda una **notificación de bienvenida** en su MongoDB y la "envía" (log en consola). Aparece en la campana 🔔 del frontend. |

Mensaje:

```json
{
  "event": "usuario.creado",
  "occurredAt": "2026-10-29T15:00:00.000Z",
  "data": { "id": "uuid", "name": "Ana Pérez", "email": "ana@gym.com", "role": "user", "createdAt": "..." }
}
```

Ambos consumidores son **idempotentes** (si RabbitMQ entrega el mismo mensaje dos veces no se duplica nada) y hacen `ack` solo cuando terminan bien. Si `auth` no puede publicar (RabbitMQ caído), el registro no se revierte: queda registrado en el log.

---

## 📂 Estructura del repositorio

```text
App_GYM/
├── gateway/                     # API Gateway (Express + http-proxy-middleware)
├── servicios/
│   ├── auth/                    # Registro, login, JWT · PostgreSQL · publica usuario.creado
│   ├── entrenamiento/           # Ejercicios (hexagonal), agenda, rutinas, socios · MongoDB + SQL Server
│   └── notificaciones/          # Avisos · MongoDB propio · consume usuario.creado
├── frontend/                    # React + Vite (Dockerfile con nginx)
├── evidencias_entrega/          # Capturas y colección de Postman
├── docker-compose.yml
├── .env.example
├── package.json                 # npm test ejecuta todas las pruebas
└── README.md
```

Cada servicio tiene su propio `package.json`, `Dockerfile`, `src/` y `tests/`.

---

## 🚀 Cómo levantar el proyecto

### Requisitos

- Docker Desktop.
- Node.js 22 (solo para correr pruebas o el frontend en modo desarrollo).
- En la PC: **SQL Server** (modo de autenticación mixto, TCP/IP en el puerto 1433) y **MongoDB** en `27017`.

### 1. Variables de entorno

```bash
cp .env.example .env
```

Cambia `JWT_SECRET` por un valor aleatorio propio. El `.env` no se sube a git.

### 2. Preparar SQL Server (una sola vez)

Dentro de Docker (Linux) no existe la autenticación integrada de Windows, así que el servicio de entrenamiento entra con un login SQL **con permisos solo sobre la base `GymFlow`**. En SSMS, conectado con Windows Authentication, ejecuta (cambia la contraseña por una propia):

```sql
IF DB_ID(N'GymFlow') IS NULL CREATE DATABASE GymFlow;
CREATE LOGIN gymflow_app WITH PASSWORD = N'TuContraseñaSegura123', DEFAULT_DATABASE = GymFlow, CHECK_POLICY = ON;
USE GymFlow;
CREATE USER gymflow_app FOR LOGIN gymflow_app;
ALTER ROLE db_datareader ADD MEMBER gymflow_app;
ALTER ROLE db_datawriter ADD MEMBER gymflow_app;
ALTER ROLE db_ddladmin  ADD MEMBER gymflow_app;
```

Luego pon `SQL_USER=gymflow_app` y esa contraseña en `SQL_PASSWORD` dentro de tu `.env`. SQL Server debe estar en modo de autenticación mixto y con TCP/IP habilitado en el puerto 1433. La tabla `dbo.Workouts` la crea el servicio al conectar (también está en `servicios/entrenamiento/sql/create-workouts.sql`).

> Si cambias el `.env` con los contenedores ya creados, aplica los cambios con `docker compose up -d` (un `restart` no vuelve a leer el `.env`).

### 3. Levantar todo

```bash
docker compose up --build
```

| URL | Qué es |
| :--- | :--- |
| http://localhost:3000 | Frontend React (servido por nginx) |
| http://localhost:8080/api | API Gateway (única entrada al backend) |
| http://localhost:8080/api/health | Estado del gateway, de cada servicio y de sus bases de datos |
| http://localhost:15672 | Panel de RabbitMQ (usuario y contraseña de `RABBITMQ_USER`/`RABBITMQ_PASSWORD`, por defecto `gymflow` / `gymflow_dev`) |
| `localhost:5433` | PostgreSQL de auth (para inspeccionarlo con pgAdmin/DBeaver) |
| `mongodb://localhost:27018` | MongoDB de notificaciones (para Compass) |

Los servicios esperan y reintentan la conexión a sus bases de datos y a RabbitMQ, así que no hace falta ningún paso manual extra. Si SQL Server no está disponible, el servicio de entrenamiento arranca igual y `/api/workouts` responde `503` hasta que conecte.

Ver los eventos en vivo:

```bash
docker compose logs -f auth entrenamiento notificaciones
```

### 4. Frontend en modo desarrollo (opcional)

El contenedor `frontend` ya sirve la app en el puerto 3000. Para desarrollar con recarga en caliente:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Abre http://localhost:5173 (el gateway ya permite CORS para ese origen).

### Credenciales demo

- **Correo:** `demo@gymflow.com`
- **Contraseña:** `GymPass123!`

O registra una cuenta nueva: verás el plan de bienvenida en la agenda y la notificación en la campana.

---

## 🧪 Pruebas

```bash
npm run install:all   # instala dependencias de gateway, servicios y frontend
npm test              # ejecuta todas las pruebas
```

También se puede ejecutar cada suite por separado (`npm run test:auth`, `npm run test:entrenamiento`, etc., o `npm test` dentro de cada carpeta).

| Suite | Herramienta | Qué cubre |
| :--- | :--- | :--- |
| `servicios/auth/tests/unit` | Jest | Casos de uso `RegisterUser` (hash, normalización, JWT, publicación de `usuario.creado`, 409, 400, registro con RabbitMQ caído) y `LoginUser`. |
| `servicios/auth/tests/integration` | Supertest | `POST /register`, `POST /login`, `GET /me` **con y sin token**. |
| `servicios/entrenamiento/tests/unit` | Jest | Entidad `Exercise` y los cinco casos de uso de ejercicios con un repositorio en memoria. |
| `servicios/entrenamiento/tests/integration` | Supertest | `/api/exercises` (público y protegido con/sin token), CRUD de `/api/workouts`, 401 en `/api/schedules`. |
| `servicios/notificaciones/tests` | Jest + Supertest | Caso de uso de bienvenida (idempotencia) y `/api/notifications` con/sin token. |
| `gateway/tests` | Jest + Supertest | Enrutamiento a servicios simulados, 502 si un servicio cae, 404, CORS y `/api/health`. |
| `frontend/src/test` | Vitest + React Testing Library | `LoginPage` (login y error), `ProtectedRoute` (redirección) y `WorkoutsPage` (`useQuery` + `useMutation` + `invalidateQueries`). |

---

## 📡 Endpoints principales (a través del gateway `http://localhost:8080`)

### Autenticación → servicio `auth`
| Método | Endpoint | Descripción | Token |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Registra un usuario, devuelve JWT y publica `usuario.creado` | No |
| `POST` | `/api/auth/login` | Inicia sesión y devuelve JWT | No |
| `GET` | `/api/auth/me` | Perfil del usuario autenticado | **Sí** |

### Ejercicios (hexagonal, MongoDB) → servicio `entrenamiento`
| Método | Endpoint | Descripción | Token |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/exercises?muscleGroup=&difficulty=&search=` | Lista y filtra | No |
| `GET` | `/api/exercises/:id` | Detalle | No |
| `POST` | `/api/exercises` | Crea | **Sí** |
| `PUT` | `/api/exercises/:id` | Actualiza | **Sí** |
| `DELETE` | `/api/exercises/:id` | Elimina | **Sí** |

### Rutinas (SQL Server) → servicio `entrenamiento`
| Método | Endpoint | Descripción | Token |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/workouts` | Lista | No |
| `GET` | `/api/workouts/:id` | Detalle | No |
| `POST` | `/api/workouts` | Crea | **Sí** |
| `PUT` | `/api/workouts/:id` | Actualiza | **Sí** |
| `DELETE` | `/api/workouts/:id` | Elimina | **Sí** |

### Agenda semanal (MongoDB) → servicio `entrenamiento`
| Método | Endpoint | Descripción | Token |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/schedules` | Agenda del usuario del token | **Sí** |
| `GET` | `/api/schedules/:id` | Detalle (solo si es propia) | **Sí** |
| `POST` | `/api/schedules` | Agenda un día de entrenamiento o descanso | **Sí** |
| `PUT` | `/api/schedules/:id` | Modifica (solo si es propia) | **Sí** |
| `DELETE` | `/api/schedules/:id` | Elimina (solo si es propia) | **Sí** |
| `GET` | `/api/members/me` | Perfil de socio creado por el evento `usuario.creado` | **Sí** |

### Notificaciones → servicio `notificaciones`
| Método | Endpoint | Descripción | Token |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/notifications` | Notificaciones del usuario | **Sí** |
| `PATCH` | `/api/notifications/:id/read` | Marca como leída | **Sí** |

### Gateway
| Método | Endpoint | Descripción | Token |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Estado de cada servicio y de sus dependencias | No |

Las rutas protegidas responden **401** sin token o con un token inválido/expirado.

---

## 🛡️ Manejo de errores

Cada servicio tiene un middleware de errores centralizado que responde JSON `{ success: false, message }`:

- **400**: validaciones de dominio, JSON mal formado, ids inválidos.
- **401**: sin token, token alterado o expirado.
- **404**: recurso inexistente o ajeno (la agenda de otra persona se trata como inexistente).
- **409**: correo ya registrado o nombres duplicados.
- **502** (gateway): el servicio destino no responde.
- **503**: SQL Server no disponible en ese momento.

## 🔧 Correcciones respecto a la primera entrega

- La agenda (`/api/schedules`) ya no expone las rutinas de todos los usuarios sin token: ahora siempre requiere JWT y cada usuario solo ve, edita o borra lo suyo. Un `PUT` ya no permite cambiar el dueño del agendamiento.
- Búsquedas de ejercicios: el texto del usuario se escapa antes de usarse como expresión regular.
- La capa de aplicación del módulo hexagonal ya no depende de sintaxis de MongoDB.
- El CRUD de SQL Server ahora también se usa desde React (página **Rutinas (SQL Server)**).
- El rol del usuario siempre lo asigna el servidor.

## 📸 Evidencias

Capturas y la colección de Postman están en [`evidencias_entrega/`](evidencias_entrega/).

## 👨‍💻 Autor

- **Dayron Encarnación Arias**
- Repositorio: [GitHub - App_GYM](https://github.com/Dayron-Encarnacion-Arias/App_GYM)
