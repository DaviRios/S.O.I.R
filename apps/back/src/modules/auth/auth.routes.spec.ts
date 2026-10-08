import Fastify from 'fastify';
import type { FastifyReply } from 'fastify';
import type {} from '@fastify/cookie';
import jwt from '@fastify/jwt';
import {
  serializerCompiler,
  validatorCompiler,
} from '@fastify/type-provider-zod';
import { randomUUID } from 'node:crypto';
import type {
  AuthRepository,
  AuthUserRecord,
  SessionRecord,
} from './auth.repository';
import { AuthService } from './auth.service';
import { authRoutes } from './auth.routes';

class MemoryAuthRepository implements AuthRepository {
  users: AuthUserRecord[] = [];
  sessions: SessionRecord[] = [];
  countUsers = async () => this.users.length;
  findUserByIdentifier = async (identifier: string) =>
    this.users.find(
      (user) => user.email === identifier || user.username === identifier,
    ) ?? null;
  findUserById = async (id: string) =>
    this.users.find((user) => user.id === id) ?? null;
  createUser = async (
    input: Omit<AuthUserRecord, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>,
  ) => {
    const now = new Date();
    const user = {
      ...input,
      id: randomUUID(),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    this.users.push(user);
    return user;
  };
  createSession = async (input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) => {
    const user = await this.findUserById(input.userId);
    if (!user) throw new Error('user missing');
    this.sessions.push({ id: randomUUID(), ...input, revokedAt: null, user });
  };
  findSession = async (tokenHash: string) =>
    this.sessions.find((session) => session.tokenHash === tokenHash) ?? null;
  rotateSession = async (input: {
    currentId: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) => {
    const current = this.sessions.find(
      (session) => session.id === input.currentId,
    );
    if (current) current.revokedAt = new Date();
    await this.createSession({
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
    });
  };
  revokeSession = async (tokenHash: string) => {
    const session = await this.findSession(tokenHash);
    if (session) session.revokedAt = new Date();
  };
  revokeUserSessions = async (userId: string) => {
    this.sessions
      .filter((session) => session.user.id === userId)
      .forEach((session) => {
        session.revokedAt = new Date();
      });
  };
}

describe('auth API integration', () => {
  it('validates login and authenticates a profile using HttpOnly cookies', async () => {
    const repository = new MemoryAuthRepository();
    const service = new AuthService(repository);
    await service.bootstrapAdmin({
      username: 'admin',
      email: 'admin@soir.local',
      password: 'admin123',
    });
    const app = Fastify({ logger: false });
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);
    app.addHook('onRequest', async (request) => {
      request.cookies = Object.fromEntries(
        (request.headers.cookie ?? '')
          .split(';')
          .map((part) => part.trim().split('='))
          .filter(([name, value]) => Boolean(name && value)),
      );
    });
    app.decorateReply(
      'setCookie',
      function setCookie(this: FastifyReply, name: string, value: string) {
        this.raw.appendHeader(
          'set-cookie',
          `${name}=${value}; HttpOnly; Path=/v1; SameSite=Strict`,
        );
        return this;
      },
    );
    app.decorateReply(
      'clearCookie',
      function clearCookie(this: FastifyReply, name: string) {
        this.raw.appendHeader('set-cookie', `${name}=; Max-Age=0`);
        return this;
      },
    );
    await app.register(jwt, {
      secret: 'a-secure-test-secret-with-at-least-32-chars',
      cookie: { cookieName: 'soir_access_token', signed: false },
    });
    await app.register(authRoutes, {
      prefix: '/v1',
      service,
      env: {
        NODE_ENV: 'test',
        PORT: 3000,
        APP_ORIGIN: 'http://localhost:4200',
        DATABASE_URL: 'memory://',
        JWT_SECRET: 'a-secure-test-secret-with-at-least-32-chars',
        CMS_ADMIN_USER: 'admin',
        CMS_ADMIN_EMAIL: 'admin@soir.local',
        CMS_ADMIN_PASSWORD: 'admin123',
        CMS_UPLOAD_DIR: 'data/uploads',
        MEDIA_STORAGE: 'local',
        S3_REGION: 'us-east-1',
        S3_FORCE_PATH_STYLE: false,
      },
    });

    const invalid = await app.inject({
      method: 'POST',
      url: '/v1/users/auth',
      payload: { email: 'bad' },
    });
    expect(invalid.statusCode).toBe(400);

    const login = await app.inject({
      method: 'POST',
      url: '/v1/users/auth',
      payload: { email: 'admin@soir.local', password: 'admin123' },
    });
    expect(login.statusCode).toBe(200);
    expect(login.json()).toMatchObject({
      user: { username: 'admin', role: 'ADMIN' },
    });
    const setCookies = login.headers['set-cookie'];
    const cookies = Array.isArray(setCookies) ? setCookies : [setCookies ?? ''];
    const accessCookie = cookies.find((value) =>
      value.startsWith('soir_access_token='),
    );
    expect(accessCookie).toContain('HttpOnly');
    const cookieHeader = accessCookie?.split(';', 1)[0];
    expect(cookieHeader).toBeTruthy();

    const profile = await app.inject({
      method: 'GET',
      url: '/v1/users/profile',
      headers: { cookie: cookieHeader ?? '' },
    });
    expect(profile.statusCode).toBe(200);
    expect(profile.json()).toMatchObject({ username: 'admin', role: 'ADMIN' });
    await app.close();
  });
});
