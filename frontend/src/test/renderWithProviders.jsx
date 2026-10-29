import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';

/**
 * Renderiza un componente con React Query, el contexto de autenticación y un
 * router en memoria. `routes` permite declarar páginas extra (p. ej. /login).
 */
export function renderWithProviders(ui, { route = '/', path = '/', routes = {} } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const result = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path={path} element={ui} />
            {Object.entries(routes).map(([routePath, element]) => (
              <Route key={routePath} path={routePath} element={element} />
            ))}
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
  return { ...result, queryClient };
}
