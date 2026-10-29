import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkoutsPage from '../pages/WorkoutsPage';
import { workoutService } from '../services/workout.service';
import { renderWithProviders } from './renderWithProviders';

vi.mock('../services/workout.service', () => ({
  workoutService: { getWorkouts: vi.fn(), createWorkout: vi.fn(), updateWorkout: vi.fn(), deleteWorkout: vi.fn() },
}));

describe('WorkoutsPage (useQuery + useMutation + invalidateQueries)', () => {
  let stored;

  beforeEach(() => {
    vi.clearAllMocks();
    stored = [{ id: 1, name: 'Full Body Express', focusMuscle: 'Full Body', durationMinutes: 45, description: 'Circuito rápido' }];
    workoutService.getWorkouts.mockImplementation(async () => ({ success: true, data: [...stored] }));
  });

  it('lista las rutinas que devuelve la API', async () => {
    renderWithProviders(<WorkoutsPage />);

    expect(await screen.findByText('Full Body Express')).toBeInTheDocument();
    expect(screen.getByText(/45 min/)).toBeInTheDocument();
  });

  it('crea una rutina y refresca la lista sin recargar la página', async () => {
    workoutService.createWorkout.mockImplementation(async (payload) => {
      const created = { id: 2, ...payload };
      stored = [created, ...stored];
      return { success: true, message: `Rutina '${payload.name}' creada`, data: created };
    });
    const user = userEvent.setup();
    renderWithProviders(<WorkoutsPage />);
    await screen.findByText('Full Body Express');

    const form = screen.getByRole('form', { name: /formulario de rutina/i });
    await user.type(within(form).getByLabelText('Nombre'), 'Pierna Pesada');
    await user.selectOptions(within(form).getByLabelText('Enfoque'), 'Piernas');
    await user.clear(within(form).getByLabelText('Duración (min)'));
    await user.type(within(form).getByLabelText('Duración (min)'), '70');
    await user.click(within(form).getByRole('button', { name: /crear rutina/i }));

    expect(workoutService.createWorkout).toHaveBeenCalledWith({
      name: 'Pierna Pesada',
      focusMuscle: 'Piernas',
      durationMinutes: 70,
      description: '',
    });
    expect(await screen.findByText('Pierna Pesada')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent("Rutina 'Pierna Pesada' creada");
    expect(workoutService.getWorkouts).toHaveBeenCalledTimes(2);
  });

  it('muestra el error del backend si la creación falla', async () => {
    workoutService.createWorkout.mockRejectedValue({ response: { data: { message: 'Ya existe un registro con esos datos' } } });
    const user = userEvent.setup();
    renderWithProviders(<WorkoutsPage />);
    await screen.findByText('Full Body Express');

    await user.type(screen.getByLabelText('Nombre'), 'Full Body Express');
    await user.click(screen.getByRole('button', { name: /crear rutina/i }));

    expect(await screen.findByRole('status')).toHaveTextContent('Ya existe un registro con esos datos');
  });
});
