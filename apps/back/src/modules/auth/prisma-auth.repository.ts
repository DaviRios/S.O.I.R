import type { DatabaseClient } from '../../infrastructure/database/prisma';
import type {
  AuthRepository,
  AuthUserRecord,
  SessionRecord,
} from './auth.repository';

export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly database: DatabaseClient) {}

  countUsers(): Promise<number> {
    return this.database.user.count();
  }

  findUserByIdentifier(identifier: string): Promise<AuthUserRecord | null> {
    const normalized = identifier.trim().toLowerCase();
    return this.database.user.findFirst({
      where: {
        OR: [{ username: normalized }, { email: normalized }],
      },
    });
  }

  findUserById(id: string): Promise<AuthUserRecord | null> {
    return this.database.user.findUnique({ where: { id } });
  }

  createUser(input: {
    username: string;
    email: string;
    name: string;
    passwordHash: string;
    role: 'ADMIN' | 'EDITOR';
    groups: string[];
  }): Promise<AuthUserRecord> {
    return this.database.user.create({ data: input });
  }

  async createSession(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.database.authSession.create({ data: input });
  }

  findSession(tokenHash: string): Promise<SessionRecord | null> {
    return this.database.authSession.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async rotateSession(input: {
    currentId: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.database.$transaction([
      this.database.authSession.update({
        where: { id: input.currentId },
        data: { revokedAt: new Date() },
      }),
      this.database.authSession.create({
        data: {
          userId: input.userId,
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
        },
      }),
    ]);
  }

  async revokeSession(tokenHash: string): Promise<void> {
    await this.database.authSession.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeUserSessions(userId: string): Promise<void> {
    await this.database.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
