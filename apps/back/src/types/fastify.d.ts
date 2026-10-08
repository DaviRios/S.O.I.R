import type { AuthenticatedUser } from '@soir/contracts';

declare module 'fastify' {
  interface FastifyRequest {
    authUser: AuthenticatedUser | null;
  }
}
