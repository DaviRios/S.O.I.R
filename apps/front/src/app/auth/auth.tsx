import { createContext, type ReactNode, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthenticatedUser } from '@soir/contracts';

const API_BASE_URL = (import.meta.env.VITE_API_CMS_URL ?? '/v1').replace(
  /\/$/,
  '',
);

async function getProfile(): Promise<AuthenticatedUser | null> {
  if (import.meta.env.VITE_SKIP_AUTH === 'true') {
    return {
      sub: '00000000-0000-4000-8000-000000000000',
      username: 'dev',
      email: 'dev@soir.local',
      name: 'Davi Rios',
      role: 'ADMIN',
      groups: ['Soir_admins'],
    };
  }
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    credentials: 'include',
  });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('Não foi possível validar a sessão.');
  return response.json() as Promise<AuthenticatedUser>;
}

interface AuthContextValue {
  user: AuthenticatedUser | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: user = null } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: getProfile,
    staleTime: 60_000,
    retry: false,
  });
  const signOut = async () => {
    await fetch(`${API_BASE_URL}/users/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    queryClient.setQueryData(['auth', 'profile'], null);
    await queryClient.cancelQueries();
    window.location.assign('/');
  };
  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuth deve ser usado dentro de AuthContextProvider');
  return context;
}

export function AuthRouterMiddleware({
  authenticatedComponent,
  unauthenticatedComponent,
  errorComponent,
}: {
  authenticatedComponent: ReactNode;
  unauthenticatedComponent: ReactNode;
  errorComponent?: ReactNode;
}) {
  const { user } = useAuth();
  const profile = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: getProfile,
    staleTime: 60_000,
    retry: false,
  });
  if (profile.isPending) {
    return (
      <div className="grid min-h-screen place-items-center text-slate-500">
        Carregando…
      </div>
    );
  }
  if (profile.isError) return errorComponent ?? unauthenticatedComponent;
  return user ? authenticatedComponent : unauthenticatedComponent;
}
