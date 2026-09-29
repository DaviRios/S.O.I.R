import { createContext, ReactNode, useContext } from 'react';

interface CurrentUser {
  accessToken: string;
}

const tokenKey = 'soir_access_token';

export class AuthService {
  static async getCurrentUser(): Promise<CurrentUser | null> {
    let accessToken = localStorage.getItem(tokenKey);
    if (!accessToken && import.meta.env.VITE_SKIP_AUTH === 'true') {
      const baseUrl = import.meta.env.VITE_API_CMS_URL ?? '/v1';
      const response = await fetch(
        `${baseUrl.replace(/\/$/, '')}/public/dev/token`,
      );
      if (response.ok) {
        const body = (await response.json()) as { token: string };
        accessToken = body.token;
        localStorage.setItem(tokenKey, accessToken);
      }
    }
    return accessToken ? { accessToken } : null;
  }

  static saveToken(accessToken: string) {
    localStorage.setItem(tokenKey, accessToken);
  }

  static signOut() {
    localStorage.removeItem(tokenKey);
  }
}

export class HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly authService: typeof AuthService,
  ) {}

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }
  post<T = void>(path: string, body?: BodyInit): Promise<T> {
    return this.request<T>('POST', path, body);
  }
  put<T = void>(path: string, body?: BodyInit): Promise<T> {
    return this.request<T>('PUT', path, body);
  }
  patch<T = void>(path: string, body?: BodyInit): Promise<T> {
    return this.request<T>('PATCH', path, body);
  }
  delete<T = void>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: BodyInit,
  ): Promise<T> {
    const user = await this.authService.getCurrentUser();
    const response = await fetch(
      `${this.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`,
      {
        method,
        body,
        headers: {
          ...(body && typeof body === 'string'
            ? { 'Content-Type': 'application/json' }
            : {}),
          ...(user?.accessToken
            ? { Authorization: `Bearer ${user.accessToken}` }
            : {}),
        },
      },
    );
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(payload?.message ?? `HTTP ${response.status}`);
    }
    if (
      response.status === 204 ||
      response.headers.get('content-length') === '0'
    )
      return undefined as T;
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }
}

interface AuthContextValue {
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  signOut: () => AuthService.signOut(),
});

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const signOut = () => {
    AuthService.signOut();
    window.location.assign('/');
  };
  return (
    <AuthContext.Provider value={{ signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthRouterMiddleware({
  authenticatedComponent,
  unauthenticatedComponent,
}: {
  authenticatedComponent: ReactNode;
  unauthenticatedComponent: ReactNode;
  errorComponent?: ReactNode;
}) {
  return localStorage.getItem(tokenKey)
    ? authenticatedComponent
    : unauthenticatedComponent;
}
