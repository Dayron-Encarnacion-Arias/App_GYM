import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../pages/LoginPage';
import { authService } from '../services/auth.service';
import { renderWithProviders } from './renderWithProviders';

vi.mock('../services/auth.service', () => ({
  authService: { login: vi.fn(), register: vi.fn() },
}));

describe('LoginPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('inicia sesión, guarda el token y navega a la página protegida', async () => {
    authService.login.mockResolvedValue({
      data: { user: { id: 'u1', name: 'Ana', email: 'ana@gym.com' }, token: 'jwt-de-prueba' },
    });
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login', path: '/login', routes: { '/': <h1>Agenda privada</h1> } });

    await user.type(screen.getByPlaceholderText('ejemplo@gymflow.com'), 'ana@gym.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'secreto1');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByRole('heading', { name: 'Agenda privada' })).toBeInTheDocument();
    expect(authService.login).toHaveBeenCalledWith({ email: 'ana@gym.com', password: 'secreto1' });
    expect(localStorage.getItem('token')).toBe('jwt-de-prueba');
  });

  it('muestra el mensaje del backend cuando las credenciales son incorrectas', async () => {
    authService.login.mockRejectedValue({
      response: { status: 401, data: { message: 'Credenciales incorrectas: Correo o contraseña no válidos' } },
    });
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login', path: '/login' });

    await user.type(screen.getByPlaceholderText('ejemplo@gymflow.com'), 'ana@gym.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'mala');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByText(/Credenciales incorrectas/)).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('el botón demo rellena las credenciales de prueba', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login', path: '/login' });

    await user.click(screen.getByRole('button', { name: /credenciales demo/i }));

    expect(screen.getByPlaceholderText('ejemplo@gymflow.com')).toHaveValue('demo@gymflow.com');
  });
});
