import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { RegisterPage } from './RegisterPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderRegisterPage(registerMock = vi.fn()) {
  return render(
    <AuthContext.Provider
      value={{
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        register: registerMock,
        logout: vi.fn(),
        updateUser: vi.fn(),
      }}
    >
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('RegisterPage', () => {
  it('renders form fields (username, email, password)', () => {
    renderRegisterPage();

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('submit calls register with username, email, password', async () => {
    const registerMock = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderRegisterPage(registerMock);

    await user.type(screen.getByLabelText('Username'), 'newuser');
    await user.type(screen.getByLabelText('Email'), 'new@test.com');
    await user.type(screen.getByLabelText('Password'), 'secure123');
    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@test.com',
        password: 'secure123',
      });
    });
  });

  it('shows error on failure', async () => {
    const registerMock = vi.fn().mockRejectedValue(new Error('Conflict'));
    const user = userEvent.setup();
    renderRegisterPage(registerMock);

    await user.type(screen.getByLabelText('Username'), 'dup');
    await user.type(screen.getByLabelText('Email'), 'dup@test.com');
    await user.type(screen.getByLabelText('Password'), 'password1');
    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Conflict');
    });
  });

  it('navigates to / on success', async () => {
    const registerMock = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderRegisterPage(registerMock);

    await user.type(screen.getByLabelText('Username'), 'newuser');
    await user.type(screen.getByLabelText('Email'), 'new@test.com');
    await user.type(screen.getByLabelText('Password'), 'secure123');
    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
