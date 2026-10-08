const API_BASE_URL = import.meta.env.VITE_API_CMS_URL ?? '/v1';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: unknown;
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/users/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if (response.status === 401) throw new Error('E-mail ou senha inválidos.');
  if (!response.ok) {
    throw new Error('Erro ao conectar com o servidor. Tente novamente.');
  }
  return response.json() as Promise<AuthResponse>;
}
