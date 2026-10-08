import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import {
  authResponseSchema,
  authenticatedUserSchema,
  loginSchema,
  type AuthenticatedUser,
  type UserRole,
} from '@soir/contracts';
import type { AppEnv } from '../../config/env';
import { ForbiddenError, UnauthorizedError } from '../../core/errors';
import type { AuthService } from './auth.service';
import { hasRole } from './auth.service';

const ACCESS_COOKIE = 'soir_access_token';
const REFRESH_COOKIE = 'soir_refresh_token';
const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

interface AuthRoutesOptions {
  service: AuthService;
  env: AppEnv;
}

export function requireAuth(
  service: AuthService,
  roles: readonly UserRole[] = ['ADMIN', 'EDITOR'],
) {
  return async (request: FastifyRequest): Promise<void> => {
    let payload: AuthenticatedUser;
    try {
      payload = await request.jwtVerify<AuthenticatedUser>();
    } catch {
      throw new UnauthorizedError();
    }
    const user = await service.findActiveUser(payload.sub);
    if (!hasRole(user.role, roles)) throw new ForbiddenError();
    request.authUser = service.toJwtPayload(user);
  };
}

export const authRoutes: FastifyPluginAsync<AuthRoutesOptions> = async (
  app,
  { service, env },
) => {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const cookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  };

  async function issueAccessToken(reply: FastifyReply, userId: string) {
    const user = await service.findActiveUser(userId);
    const token = await reply.jwtSign(service.toJwtPayload(user), {
      expiresIn: '15m',
    });
    reply.setCookie(ACCESS_COOKIE, token, {
      ...cookieOptions,
      maxAge: ACCESS_TTL_SECONDS,
      path: '/v1',
    });
    return service.toPublicUser(user);
  }

  server.post(
    '/users/auth',
    {
      schema: {
        body: loginSchema,
        response: { 200: authResponseSchema },
      },
    },
    async (request, reply) => {
      const identifier = request.body.email ?? request.body.username ?? '';
      const user = await service.authenticate(
        identifier,
        request.body.password,
      );
      const refreshToken = await service.createRefreshSession(user.id);
      const access = await issueAccessToken(reply, user.id);
      reply.setCookie(REFRESH_COOKIE, refreshToken, {
        ...cookieOptions,
        maxAge: REFRESH_TTL_SECONDS,
        path: '/v1/users/auth',
      });
      return { user: access };
    },
  );

  app.post('/users/auth/refresh', async (request, reply) => {
    const currentToken = request.cookies[REFRESH_COOKIE];
    if (!currentToken) throw new UnauthorizedError('Sessão não encontrada');
    const rotated = await service.rotateRefreshSession(currentToken);
    const access = await issueAccessToken(reply, rotated.user.id);
    reply.setCookie(REFRESH_COOKIE, rotated.refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TTL_SECONDS,
      path: '/v1/users/auth',
    });
    return { user: access };
  });

  app.post('/users/auth/logout', async (request, reply) => {
    await service.revokeRefreshSession(request.cookies[REFRESH_COOKIE]);
    reply.clearCookie(ACCESS_COOKIE, { path: '/v1' });
    reply.clearCookie(REFRESH_COOKIE, { path: '/v1/users/auth' });
    return reply.code(204).send();
  });

  app.get(
    '/users/profile',
    {
      preHandler: requireAuth(service),
      schema: { response: { 200: authenticatedUserSchema } },
    },
    async (request) => request.authUser,
  );
};
