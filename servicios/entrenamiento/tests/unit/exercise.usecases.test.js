const Exercise = require('../../src/modules/exercises/domain/exercise.entity');
const CreateExerciseUseCase = require('../../src/modules/exercises/application/create-exercise.usecase');
const GetExercisesUseCase = require('../../src/modules/exercises/application/get-exercises.usecase');
const UpdateExerciseUseCase = require('../../src/modules/exercises/application/update-exercise.usecase');
const DeleteExerciseUseCase = require('../../src/modules/exercises/application/delete-exercise.usecase');
const GetExerciseByIdUseCase = require('../../src/modules/exercises/application/get-exercise-by-id.usecase');
const { InMemoryExerciseRepository } = require('../helpers/in-memory');

const sentadilla = { name: 'Sentadilla', muscleGroup: 'Piernas', difficulty: 'Avanzado', sets: 4, reps: 8, restSeconds: 120 };
const curl = { name: 'Curl de Bíceps', muscleGroup: 'Brazos', difficulty: 'Principiante', sets: 3, reps: 12, restSeconds: 60 };

describe('Entidad Exercise (dominio)', () => {
  it('aplica valores por defecto y convierte números', () => {
    const exercise = new Exercise({ name: 'Plancha', muscleGroup: 'Core', sets: '3', reps: '45' });

    expect(exercise.sets).toBe(3);
    expect(exercise.reps).toBe(45);
    expect(exercise.difficulty).toBe('Intermedio');
  });

  it.each([
    [{ name: 'X', muscleGroup: 'Core' }, /nombre/],
    [{ name: 'Plancha', muscleGroup: 'Cuello' }, /Grupo muscular/],
    [{ name: 'Plancha', muscleGroup: 'Core', difficulty: 'Experto' }, /dificultad/],
    [{ name: 'Plancha', muscleGroup: 'Core', sets: 0 }, /series/],
    [{ name: 'Plancha', muscleGroup: 'Core', restSeconds: 900 }, /descanso/],
  ])('rechaza datos que rompen las reglas de negocio (%#)', (data, message) => {
    expect(() => new Exercise(data)).toThrow(message);
  });
});

describe('Casos de uso de ejercicios', () => {
  let repository;

  beforeEach(() => {
    repository = new InMemoryExerciseRepository([sentadilla]);
  });

  describe('CreateExerciseUseCase', () => {
    it('crea el ejercicio y guarda quién lo creó', async () => {
      const created = await new CreateExerciseUseCase(repository).execute(curl, 'user-1');

      expect(created).toMatchObject({ name: 'Curl de Bíceps', createdBy: 'user-1' });
      expect(repository.items).toHaveLength(2);
    });

    it('rechaza nombres duplicados (sin distinguir mayúsculas) con 409', async () => {
      await expect(
        new CreateExerciseUseCase(repository).execute({ ...curl, name: 'SENTADILLA' })
      ).rejects.toMatchObject({ statusCode: 409 });
      expect(repository.items).toHaveLength(1);
    });

    it('no guarda nada si la entidad es inválida', async () => {
      await expect(
        new CreateExerciseUseCase(repository).execute({ ...curl, muscleGroup: 'Cuello' })
      ).rejects.toMatchObject({ statusCode: 400 });
      expect(repository.items).toHaveLength(1);
    });
  });

  describe('GetExercisesUseCase', () => {
    it('convierte los query params en criterios de dominio', async () => {
      const spy = jest.spyOn(repository, 'findAll');

      await new GetExercisesUseCase(repository).execute({ muscleGroup: ' Piernas ', search: 'sent', extra: 'x' });

      expect(spy).toHaveBeenCalledWith({ muscleGroup: 'Piernas', search: 'sent' });
    });
  });

  describe('UpdateExerciseUseCase', () => {
    it('actualiza conservando los campos que no se envían', async () => {
      const updated = await new UpdateExerciseUseCase(repository).execute('1', { reps: 10 });

      expect(updated).toMatchObject({ name: 'Sentadilla', reps: 10, sets: 4 });
    });

    it('responde 404 si el ejercicio no existe', async () => {
      await expect(new UpdateExerciseUseCase(repository).execute('99', { reps: 10 })).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('responde 409 si el nuevo nombre ya lo usa otro ejercicio', async () => {
      await new CreateExerciseUseCase(repository).execute(curl);

      await expect(
        new UpdateExerciseUseCase(repository).execute('2', { name: 'Sentadilla' })
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe('DeleteExerciseUseCase y GetExerciseByIdUseCase', () => {
    it('elimina un ejercicio existente y luego ya no se encuentra', async () => {
      const result = await new DeleteExerciseUseCase(repository).execute('1');

      expect(result).toEqual({ deleted: true, id: '1', name: 'Sentadilla' });
      await expect(new GetExerciseByIdUseCase(repository).execute('1')).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
