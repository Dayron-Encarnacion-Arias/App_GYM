const ExerciseModel = require('../modules/exercises/infrastructure/adapters/exercise.mongo.model');

const initialExercises = [
  {
    name: 'Press de Banca Plano con Barra',
    muscleGroup: 'Pecho',
    description: 'Ejercicio multiarticular indispensable para pectoral mayor, deltoides anterior y tríceps.',
    difficulty: 'Intermedio',
    sets: 4,
    reps: 10,
    restSeconds: 90,
  },
  {
    name: 'Sentadilla Libre con Barra',
    muscleGroup: 'Piernas',
    description: 'Movimiento rey para desarrollo de cuádriceps, glúteos, femorales y fuerza de torso.',
    difficulty: 'Avanzado',
    sets: 4,
    reps: 8,
    restSeconds: 120,
  },
  {
    name: 'Dominadas Pronas (Pull-ups)',
    muscleGroup: 'Espalda',
    description: 'Ejercicio de peso corporal que enfatiza el dorsal ancho, trapecio y fuerza escapular.',
    difficulty: 'Intermedio',
    sets: 4,
    reps: 10,
    restSeconds: 90,
  },
  {
    name: 'Press Militar de Pie con Barra',
    muscleGroup: 'Hombros',
    description: 'Empuje vertical estricto para sobrecarga progresiva de hombros y estabilidad central.',
    difficulty: 'Intermedio',
    sets: 4,
    reps: 10,
    restSeconds: 75,
  },
  {
    name: 'Curl de Bíceps con Barra Z',
    muscleGroup: 'Brazos',
    description: 'Aislamiento de flexores de codo con agarre anatómico que reduce estrés en muñecas.',
    difficulty: 'Principiante',
    sets: 3,
    reps: 12,
    restSeconds: 60,
  },
  {
    name: 'Extensión de Tríceps en Polea Alta',
    muscleGroup: 'Brazos',
    description: 'Trabajo específico para la cabeza lateral y medial del tríceps con cable continuo.',
    difficulty: 'Principiante',
    sets: 3,
    reps: 12,
    restSeconds: 60,
  },
  {
    name: 'Plancha Abdominal Isométrica',
    muscleGroup: 'Core',
    description: 'Activación del transverso abdominal y estabilidad lumbopélvica sin impacto articular.',
    difficulty: 'Principiante',
    sets: 3,
    reps: 45,
    restSeconds: 45,
  },
  {
    name: 'Peso Muerto Rumano',
    muscleGroup: 'Piernas',
    description: 'Enfocado en cadena posterior: isquiotibiales y glúteos con bisagra de cadera.',
    difficulty: 'Intermedio',
    sets: 4,
    reps: 10,
    restSeconds: 90,
  },
];

/**
 * Inserta el catálogo inicial de ejercicios si la colección está vacía.
 */
async function seedExercises() {
  const countExercises = await ExerciseModel.countDocuments();
  if (countExercises === 0) {
    await ExerciseModel.insertMany(initialExercises);
    console.log(`[Seed] ${initialExercises.length} Ejercicios iniciales insertados en MongoDB`);
  }
}

/**
 * Plan semanal de bienvenida que se crea para cada usuario nuevo cuando llega
 * el evento usuario.creado (ver modules/members/user-created.handler.js).
 */
function buildStarterPlan(userId) {
  return [
    {
      user: userId,
      dayOfWeek: 'Lunes',
      routineTitle: 'Empuje Pesado (Push Day)',
      focusMuscle: 'Pecho',
      isRestDay: false,
      durationMinutes: 75,
      restIntervalSeconds: 90,
      targetExercises: ['Press de Banca Plano con Barra', 'Press Militar de Pie con Barra', 'Extensión de Tríceps en Polea Alta'],
      notes: 'Subir 2.5kg al press de banca en la última serie.',
      status: 'Planificado',
    },
    {
      user: userId,
      dayOfWeek: 'Martes',
      routineTitle: 'Pierna & Core (Legs Focus)',
      focusMuscle: 'Piernas',
      isRestDay: false,
      durationMinutes: 80,
      restIntervalSeconds: 120,
      targetExercises: ['Sentadilla Libre con Barra', 'Peso Muerto Rumano', 'Plancha Abdominal Isométrica'],
      notes: 'Calentar bien articulaciones de rodilla y tobillo antes de sentadilla pesada.',
      status: 'Planificado',
    },
    {
      user: userId,
      dayOfWeek: 'Miércoles',
      routineTitle: 'Descanso Total / Recuperación Muscular',
      focusMuscle: 'Descanso',
      isRestDay: true,
      durationMinutes: 0,
      restIntervalSeconds: 0,
      targetExercises: [],
      notes: 'Día de descanso para recuperación de tejidos y recarga de glucógeno.',
      status: 'Planificado',
    },
    {
      user: userId,
      dayOfWeek: 'Jueves',
      routineTitle: 'Tracción & Espalda (Pull Day)',
      focusMuscle: 'Espalda',
      isRestDay: false,
      durationMinutes: 70,
      restIntervalSeconds: 90,
      targetExercises: ['Dominadas Pronas (Pull-ups)', 'Curl de Bíceps con Barra Z'],
      notes: 'Enfocarse en la retracción escapular controlada.',
      status: 'Planificado',
    },
    {
      user: userId,
      dayOfWeek: 'Viernes',
      routineTitle: 'Cuerpo Completo & Hipertrofia (Full Body)',
      focusMuscle: 'Full Body',
      isRestDay: false,
      durationMinutes: 60,
      restIntervalSeconds: 60,
      targetExercises: ['Press de Banca Plano con Barra', 'Sentadilla Libre con Barra'],
      notes: 'Entrenamiento dinámico antes del fin de semana.',
      status: 'Planificado',
    },
    {
      user: userId,
      dayOfWeek: 'Sábado',
      routineTitle: 'Descanso Activo / Caminata Ligera',
      focusMuscle: 'Descanso',
      isRestDay: true,
      durationMinutes: 30,
      restIntervalSeconds: 0,
      targetExercises: [],
      notes: '30 minutos de caminata al aire libre e hidratación.',
      status: 'Planificado',
    },
    {
      user: userId,
      dayOfWeek: 'Domingo',
      routineTitle: 'Descanso Total',
      focusMuscle: 'Descanso',
      isRestDay: true,
      durationMinutes: 0,
      restIntervalSeconds: 0,
      targetExercises: [],
      notes: 'Dormir al menos 8 horas y preparar la comida de la semana.',
      status: 'Planificado',
    },
  ];
}

module.exports = { seedExercises, buildStarterPlan };
