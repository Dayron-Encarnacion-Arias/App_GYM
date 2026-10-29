import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import ProtectedRoute from '../components/ProtectedRoute';
import { renderWithProviders } from './renderWithProviders';

const protectedPage = (
  <ProtectedRoute>
    <h1>Contenido privado</h1>
  </ProtectedRoute>
);

describe('ProtectedRoute', () => {
  it('redirige a /login cuando no hay token', () => {
    renderWithProviders(protectedPage, { route: '/privado', path: '/privado', routes: { '/login': <h1>Pantalla de login</h1> } });

    expect(screen.getByRole('heading', { name: 'Pantalla de login' })).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });

  it('muestra el contenido cuando hay sesión', () => {
    localStorage.setItem('token', 'jwt-de-prueba');
    localStorage.setItem('user', JSON.stringify({ name: 'Ana' }));

    renderWithProviders(protectedPage, { route: '/privado', path: '/privado', routes: { '/login': <h1>Pantalla de login</h1> } });

    expect(screen.getByRole('heading', { name: 'Contenido privado' })).toBeInTheDocument();
  });
});
