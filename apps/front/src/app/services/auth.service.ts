const API_BASE_URL = import.meta.env.VITE_API_CMS_URL ?? '/v1';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  console.log('[auth] login → POST /users/auth', { email: credentials.email });
  try {
    const response = await fetch(`${API_BASE_URL}/users/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (response.status === 401) {
      console.error('[auth] login falhou → 401 Unauthorized', {
        email: credentials.email,
      });
      throw new Error('E-mail ou senha inválidos.');
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error(
        '[auth] login falhou → HTTP',
        response.status,
        response.statusText,
        { body },
      );
      throw new Error('Erro ao conectar com o servidor. Tente novamente.');
    }

    const data = await response.json();
    console.log('[auth] login bem-sucedido');
    return data;
  } catch (err) {
    if (
      !(
        err instanceof Error &&
        (err.message === 'E-mail ou senha inválidos.' ||
          err.message.startsWith('Erro ao conectar'))
      )
    ) {
      console.error('[auth] login → erro inesperado', err);
    }
    throw err;
  }
}
