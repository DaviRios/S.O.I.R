import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Login } from './Login';

jest.mock('../../services/auth.service', () => ({ login: jest.fn() }));

describe('Login', () => {
  it('validates credentials before sending the form', async () => {
    render(<Login />);
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'admin@soir.local' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'short' },
    });
    const button = screen.getByRole('button', { name: 'Entrar' });
    fireEvent.submit(button.closest('form') as HTMLFormElement);
    await waitFor(() => expect(screen.getByText(/8/)).toBeTruthy());
  });
});
