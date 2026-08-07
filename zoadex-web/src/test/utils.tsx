import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

const mockUser = {
  id: '1',
  username: 'TestUser',
  email: 'test@test.com',
  plan: 'FREE',
  activeRegionId: null,
  activeRegionName: null,
  totalSightings: 0,
  uniqueSpeciesDiscovered: 0,
  createdAt: '2026-01-01',
};

export function renderWithProviders(
  ui: React.ReactElement,
  { authenticated = false, route = '/' } = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user: authenticated ? mockUser : null,
          isAuthenticated: authenticated,
          isLoading: false,
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          updateUser: vi.fn(),
        }}
      >
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}
