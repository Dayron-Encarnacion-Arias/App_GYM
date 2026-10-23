const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es obligatorio para agendar'],
    },
    dayOfWeek: {
      type: String,
      required: [true, 'El día de la semana es obligatorio'],
      enum: {
        values: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        message: '{VALUE} no es un día de la semana válido',
      },
    },
    routineTitle: {
      type: String,
      required: [true, 'El título de la rutina es obligatorio'],
      trim: true,
      minlength: [3, 'El título debe tener al menos 3 caracteres'],
      maxlength: [100, 'El título no puede exceder 100 caracteres'],
    },
    focusMuscle: {
      type: String,
      required: [true, 'El enfoque muscular o descanso es obligatorio'],
      enum: {
        values: [
          'Pecho',
          'Espalda',
          'Piernas',
          'Brazos',
          'Hombros',
          'Core',
          'Full Body',
          'Cardio',
          'Descanso',
        ],
        message: '{VALUE} no es un enfoque válido',
      },
    },
    isRestDay: {
      type: Boolean,
      default: false,
    },
    durationMinutes: {
      type: Number,
      required: [true, 'La duración estimada en minutos es obligatoria'],
      min: [0, 'La duración no puede ser negativa'],
      max: [300, 'La duración máxima permitida es de 300 minutos'],
      default: 60,
    },
    restIntervalSeconds: {
      type: Number,
      required: [true, 'El intervalo de descanso entre ejercicios es obligatorio'],
      min: [0, 'El descanso no puede ser negativo'],
      max: [300, 'El descanso entre ejercicios no puede exceder 300 segundos'],
      default: 60,
    },
    targetExercises: [
      {
        type: String,
        trim: true,
      },
    ],
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Las observaciones no pueden superar 500 caracteres'],
      default: '',
    },
    status: {
      type: String,
      enum: ['Planificado', 'Completado', 'Omitido'],
      default: 'Planificado',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;
