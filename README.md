# GymFlow - Aplicación Full Stack de Gestión y Planificación de Gimnasio

> **Entrega 1 - Proyecto Final Integrador**  
> Aplicación Full Stack: API REST en Node.js conectada a **SQL Server y MongoDB**, autenticación protegida con JWT y frontend en React + Vite.

---

## 📌 Descripción del Proyecto

**GymFlow** es una plataforma integral diseñada para la organización y seguimiento de entrenamientos físicos. Permite a los usuarios:
- **Autenticarse de forma segura:** Registro e inicio de sesión con encriptación de contraseñas (`bcrypt`) y emisión de tokens `JWT`.
- **Planificar y agendar días de gimnasio:** Asignar rutinas específicas a los días de la semana (Lunes a Domingo), definir tiempos de duración, descansos entre series y marcar explícitamente días de descanso y recuperación.
- **Gestionar el catálogo de ejercicios (CRUD Completo):** Crear, listar, consultar por ID, actualizar y eliminar ejercicios con grupos musculares, series, repeticiones, tiempos de descanso y niveles de dificultad.

---

## 🛠️ Tecnologías Utilizadas

### Backend (`api/`)
- **Node.js & Express:** Servidor HTTP y enrutamiento modular.
- **SQL Server:** CRUD completo de rutinas, consultas parametrizadas y autenticación integrada de Windows.
- **MongoDB & Mongoose:** Ejercicios y agendamientos con validaciones de esquema; Compass inspecciona la instancia local.
- **JSON Web Tokens (`jsonwebtoken`):** Generación y validación de tokens de acceso con expiración (24h).
- **Bcrypt.js (`bcryptjs`):** Hashing seguro de contraseñas antes del almacenamiento.
- **Morgan & CORS:** Middleware de registro de peticiones y control de acceso HTTP.

### Frontend (`frontend/`)
- **React 19 + Vite:** Entorno de desarrollo ultrarrápido y reactivo.
- **TanStack React Query (v5):** Manejo declarativo del estado del servidor, caché inteligente, `useQuery` para consultas y `useMutation` con `invalidateQueries` para actualizaciones en tiempo real sin recarga.
- **React Router Dom (v7):** Enrutamiento SPA y protección de rutas privadas (`ProtectedRoute`).
- **Axios:** Cliente HTTP con interceptores automáticos de cabecera `Authorization: Bearer <token>`.
- **Lucide React:** Iconografía moderna y minimalista.

---

## 🏛️ Explicación de la Arquitectura (Unidad 3)

El módulo de **Ejercicios (`api/src/modules/exercises`)** fue implementado aplicando **Arquitectura Hexagonal (Puertos y Adaptadores)** con el objetivo de desacoplar las reglas de negocio de la tecnología de persistencia y del framework web.

El módulo `/api/workouts` sigue una estructura MVC modular y persiste rutinas en SQL Server. El catálogo `/api/exercises` conserva Mongoose/MongoDB y sus validaciones de esquema. Así, ambos motores se utilizan en el proyecto con responsabilidades distintas.

1. **Capa de Dominio (`domain/`):** Contiene la entidad pura `Exercise` con sus invariantes y validaciones de negocio (reglas de series, repeticiones y grupos musculares), junto con el puerto `ExerciseRepositoryPort`, que define el contrato abstracto que cualquier base de datos debe cumplir.
2. **Capa de Aplicación (`application/`):** Implementa los casos de uso específicos (`CreateExerciseUseCase`, `GetExercisesUseCase`, `GetExerciseByIdUseCase`, `UpdateExerciseUseCase`, `DeleteExerciseUseCase`). Esta capa solo interactúa con el dominio y el puerto abstracto, sin conocer detalles técnicos de la base de datos.
3. **Capa de Infraestructura (`infrastructure/`):** Contiene los adaptadores secundarios o conducidos (`ExerciseMongoRepository`, que implementa el puerto con Mongoose) y los adaptadores primarios o conductores (`ExerciseController`, que recibe peticiones HTTP desde Express y las delega a los casos de uso).

> **¿Por qué se organizó así?**  
> Esta separación garantiza una alta mantenibilidad y testabilidad. El núcleo del negocio es completamente independiente de frameworks o bases de datos; la lógica de ejercicios no depende de Mongoose ni de Express, facilitando pruebas unitarias y posibles cambios tecnológicos en el futuro sin modificar la lógica central.

---

## 📂 Estructura del Repositorio

```text
App_GYM/
├── api/                             # Backend en Node.js + Express
│   ├── src/
│   │   ├── config/                  # Conexión a MongoDB, variables de entorno
│   │   ├── middlewares/             # auth.middleware (JWT) y error.middleware centralizado
│   │   ├── modules/
│   │   │   ├── auth/                # MVC: Registro, Login, JWT, User Model
│   │   │   ├── exercises/           # ARQUITECTURA HEXAGONAL:
│   │   │   │   ├── domain/          # Entidad de Dominio y Puertos del Repositorio
│   │   │   │   ├── application/     # Casos de uso (Create, Get, Update, Delete)
│   │   │   │   └── infrastructure/  # Adaptadores (Mongo Repo, Controller, Routes)
│   │   │   └── schedules/           # Mongoose: Agendamiento de días de gym y descansos
│   │   ├── utils/                   # AppError, Seeder de datos iniciales
│   │   ├── app.js                   # Configuración de Express y middlewares
│   │   └── server.js                # Punto de entrada del servidor
│   ├── .env.example                 # Plantilla de variables de entorno (sin secretos)
│   └── package.json
├── frontend/                        # Frontend en React + Vite
│   ├── src/
│   │   ├── components/              # Navbar, ProtectedRoute, ExerciseModal, ScheduleModal
│   │   ├── context/                 # AuthContext (Gestión de sesión JWT)
│   │   ├── pages/                   # LoginPage, RegisterPage, SchedulesPage, ExercisesPage
│   │   ├── services/                # Axios API, auth, exercise y schedule services
│   │   ├── App.jsx                  # Rutas y React Query Provider
│   │   ├── index.css                # Estilos modernos de gimnasio
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 🚀 Pasos para Ejecutar el Proyecto

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Dayron-Encarnacion-Arias/App_GYM.git
cd App_GYM
```

### 2. Bases de datos

#### SQL Server (CRUD de rutinas)

La API usa autenticación integrada de Windows; no guarda usuario ni contraseña SQL. Agrega a tu `api/.env` las variables que falten de `api/.env.example` y ajusta `SQL_SERVER` con el nombre de instancia que aparece en SSMS (por ejemplo `localhost\SQLEXPRESS` o `localhost`). Conserva los valores locales que ya tienes; no reemplaces tu `.env` completo. En SSMS, con **Windows Authentication**, crea la base de datos una vez:

```sql
CREATE DATABASE GymFlow;
```

Ejecuta `api/sql/create-workouts.sql` en SSMS, seleccionando `GymFlow`. El usuario de Windows que ejecuta Node debe tener permisos en esa base. La API también puede crear la tabla al arrancar. En Windows, `msnodesqlv8` requiere el **Microsoft ODBC Driver for SQL Server**. Se usa SQL Server instalado en Windows porque la autenticación integrada de Windows es la configuración solicitada; el contenedor de SQL Server normalmente requiere otro tipo de autenticación.

#### MongoDB local / Compass
El proyecto se conecta a MongoDB Server en `mongodb://127.0.0.1:27017/gym_app`. Puedes usar el MongoDB Server ya instalado en tu laptop: asegúrate de que el servicio `MongoDB Server` esté iniciado; `mongosh` sirve para consultar y Compass para inspeccionar la base. Mongoose es la librería de Node que usa la API.

Como alternativa, puedes iniciar MongoDB con Docker Compose desde la raíz del repositorio:

```powershell
docker compose up -d mongodb
```

Usa la instancia local o el contenedor, no ambos a la vez en el mismo puerto. Compass puede conectarse con `mongodb://127.0.0.1:27017` en cualquiera de las dos opciones.

### 3. Configurar y Ejecutar el Backend (`api/`)
```bash
cd api

# Instalar dependencias
npm install

# Configurar api/.env: agrega las variables faltantes desde .env.example.
# No sobrescribas tu .env existente; cambia SQL_SERVER y JWT_SECRET según tu equipo.

# Iniciar en modo desarrollo
npm run dev
```
> El servidor iniciará en `http://localhost:5000` cuando MongoDB y SQL Server estén disponibles. El archivo `api/.env` es local y está excluido por `.gitignore`; usa `api/.env.example` como plantilla y cambia `JWT_SECRET` por un valor aleatorio propio. No subas `.env`.

El recurso SQL está disponible en `GET/POST /api/workouts` y `GET/PUT/DELETE /api/workouts/:id`; las escrituras requieren JWT. Los ejercicios siguen usando MongoDB/Mongoose y tienen validaciones en el esquema.

### 4. Configurar y Ejecutar el Frontend (`frontend/`)
En otra terminal:
```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo Vite
npm run dev
```
> Abre tu navegador en `http://localhost:5173`.

---

## 🔐 Credenciales de Acceso Demo

Para probar la aplicación inmediatamente sin necesidad de registrarte:
- **Correo:** `demo@gymflow.com`
- **Contraseña:** `GymPass123!`
*(O puedes registrar una nueva cuenta con cualquier correo y contraseña de al menos 6 caracteres).*

---

## 📡 Endpoints de la API REST

### Autenticación (`/api/auth`)
| Método | Endpoint | Descripción | Protegida |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Registro de nuevo usuario (hashea pass con `bcrypt`) | No |
| `POST` | `/api/auth/login` | Inicia sesión y retorna token JWT | No |
| `GET` | `/api/auth/me` | Obtiene el perfil del usuario autenticado | **Sí (Bearer)** |

### Banco de Ejercicios - Arquitectura Hexagonal (`/api/exercises`)
| Método | Endpoint | Descripción | Protegida |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/exercises` | Lista todos los ejercicios (filtros por músculo/búsqueda) | No |
| `GET` | `/api/exercises/:id` | Obtiene un ejercicio por su ID | No |
| `POST` | `/api/exercises` | Crea un nuevo ejercicio (valida en Dominio) | **Sí (Bearer)** |
| `PUT` | `/api/exercises/:id` | Actualiza un ejercicio existente | **Sí (Bearer)** |
| `DELETE` | `/api/exercises/:id` | Elimina un ejercicio | **Sí (Bearer)** |

### Rutinas en SQL Server (`/api/workouts`)
| Método | Endpoint | Descripción | Protegida |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/workouts` | Lista rutinas | No |
| `GET` | `/api/workouts/:id` | Obtiene una rutina por ID | No |
| `POST` | `/api/workouts` | Crea una rutina | **Sí (Bearer)** |
| `PUT` | `/api/workouts/:id` | Actualiza una rutina | **Sí (Bearer)** |
| `DELETE` | `/api/workouts/:id` | Elimina una rutina | **Sí (Bearer)** |

### Agendamiento Semanal y Descansos (`/api/schedules`)
| Método | Endpoint | Descripción | Protegida |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/schedules` | Lista rutinas y descansos agendados en la semana | Opcional |
| `GET` | `/api/schedules/:id` | Obtiene un agendamiento específico | Opcional |
| `POST` | `/api/schedules` | Agenda un día de gym o descanso (validaciones Mongoose) | **Sí (Bearer)** |
| `PUT` | `/api/schedules/:id` | Modifica un día agendado | **Sí (Bearer)** |
| `DELETE` | `/api/schedules/:id` | Elimina un día agendado | **Sí (Bearer)** |

---

## 🛡️ Manejo Centralizado de Errores

El middleware `api/src/middlewares/error.middleware.js` intercepta y estandariza todas las excepciones:
- **`400 Bad Request`**: Parámetros faltantes, errores de validación de esquema en Mongoose o IDs con formato inválido.
- **`401 Unauthorized`**: Intentar crear, editar o eliminar sin token JWT o con token vencido/alterado.
- **`404 Not Found`**: Recursos no encontrados o endpoints inexistentes.
- **`409 Conflict`**: Correo duplicado en registro o duplicidad de nombres de ejercicios/días ya asignados.
- **`500 Internal Server Error`**: Errores no controlados de base de datos o servidor.

---

## 📸 Vistas de la Aplicación

### 1. Inicio de Sesión y Registro
- Validación en tiempo real, hashing con bcrypt y almacenamiento seguro de token JWT en el cliente.
- Botón rápido de credenciales demo.

### 2. Planificador Semanal (Lunes a Domingo)
- Vista en 7 columnas mostrando rutinas asignadas, duración, tiempo de descanso entre series y etiquetas distintivas para entrenamientos vs. descansos.
- Uso de `useQuery` para listar y `useMutation` con `invalidateQueries` para creación inmediata.

### 3. Banco de Ejercicios (CRUD Completo)
- Filtrado por grupo muscular (Pecho, Espalda, Piernas, Brazos, Hombros, Core).
- Modal interactivo para crear y actualizar ejercicios.
- Botones de editar y eliminar con confirmación y sincronización automática.

---

## 👨‍💻 Autor
- **Dayron Encarnación Arias**
- Repositorio Público: [GitHub - App_GYM](https://github.com/Dayron-Encarnacion-Arias/App_GYM)
