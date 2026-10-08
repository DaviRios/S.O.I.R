import { createHash, randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
import type { AuthenticatedUser, PublicUser, UserRole } from '@soir/contracts';
import { UnauthorizedError } from '../../core/errors';
import type {
  AuthRepository,
  AuthUserRecord,
  SessionRecord,
} from './auth.repository';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface RefreshTokenResult {
  refreshToken: string;
  user: PublicUser;
}

export class AuthService {
  constructor(private readonly repository: AuthRepository) {}

  async bootstrapAdmin(input: {
    username: string;
    email: string;
    password: string;
  }): Promise<boolean> {
    if ((await this.repository.countUsers()) > 0) return false;
    await this.repository.createUser({
      username: input.username.trim().toLowerCase(),
      email: input.email.trim().toLowerCase(),
      name: 'Administrador',
      passwordHash: await argon2.hash(input.password),
      role: 'ADMIN',
      groups: ['Soir_admins'],
    });
    return true;
  }

  async authenticate(
    identifier: string,
    password: string,
  ): Promise<AuthUserRecord> {
    const user = await this.repository.findUserByIdentifier(identifier);
    if (
      !user?.isActive ||
      !(await argon2.verify(user.passwordHash, password))
    ) {
      throw new UnauthorizedError('Usuário ou senha inválidos');
    }
    return user;
  }

  async findActiveUser(id: string): Promise<AuthUserRecord> {
    const user = await this.repository.findUserById(id);
    if (!user?.isActive) throw new UnauthorizedError();
    return user;
  }

  async createRefreshSession(userId: string): Promise<string> {
    const refreshToken = randomBytes(48).toString('base64url');
    await this.repository.createSession({
      userId,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });
    return refreshToken;
  }

  async rotateRefreshSession(
    refreshToken: string,
  ): Promise<RefreshTokenResult> {
    const session = await this.validSession(refreshToken);
    const nextToken = randomBytes(48).toString('base64url');
    await this.repository.rotateSession({
      currentId: session.id,
      userId: session.user.id,
      tokenHash: this.hashToken(nextToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });
    return { refreshToken: nextToken, user: this.toPublicUser(session.user) };
  }

  async revokeRefreshSession(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    await this.repository.revokeSession(this.hashToken(refreshToken));
  }

  toJwtPayload(user: AuthUserRecord): Omit<AuthenticatedUser, 'iat' | 'exp'> {
    return {
      sub: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      groups: user.groups,
    };
  }

  toPublicUser(user: AuthUserRecord): PublicUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      groups: user.groups,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  private async validSession(refreshToken: string): Promise<SessionRecord> {
    const session = await this.repository.findSession(
      this.hashToken(refreshToken),
    );
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      !session.user.isActive
    ) {
      throw new UnauthorizedError('Sessão expirada ou inválida');
    }
    return session;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}

export function hasRole(
  actual: UserRole,
  allowed: readonly UserRole[],
): boolean {
  return allowed.includes(actual);
}
