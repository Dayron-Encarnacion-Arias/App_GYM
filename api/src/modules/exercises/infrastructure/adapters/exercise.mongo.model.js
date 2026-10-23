const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del ejercicio es obligatorio'],
      unique: true,
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    muscleGroup: {
      type: String,
      required: [true, 'El grupo muscular es obligatorio'],
      enum: {
        values: ['Pecho', 'Espalda', 'Piernas', 'Brazos', 'Hombros', 'Core', 'Full Body', 'Cardio'],
        message: '{VALUE} no es un grupo muscular válido',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['Principiante', 'Intermedio', 'Avanzado'],
      default: 'Intermedio',
    },
    sets: {
      type: Number,
      required: [true, 'Las series son obligatorias'],
      min: [1, 'Debe tener al menos 1 serie'],
      max: [50, 'No puede superar 50 series'],
      default: 3,
    },
    reps: {
      type: Number,
      required: [true, 'Las repeticiones son obligatorias'],
      min: [1, 'Debe tener al menos 1 repetición'],
      max: [500, 'No puede superar 500 repeticiones'],
      default: 10,
    },
    restSeconds: {
      type: Number,
      required: [true, 'El tiempo de descanso es obligatorio'],
      min: [0, 'El descanso no puede ser negativo'],
      max: [600, 'El descanso no puede superar 600 segundos'],
      default: 60,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

const ExerciseModel = mongoose.model('Exercise', exerciseSchema);
module.exports = ExerciseModel;
