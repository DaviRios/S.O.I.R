import type { UserRole } from '@soir/contracts';

export interface AuthUserRecord {
  id: string;
  username: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  groups: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionRecord {
  id: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  user: AuthUserRecord;
}

export interface AuthRepository {
  countUsers(): Promise<number>;
  findUserByIdentifier(identifier: string): Promise<AuthUserRecord | null>;
  findUserById(id: string): Promise<AuthUserRecord | null>;
  createUser(input: {
    username: string;
    email: string;
    name: string;
    passwordHash: string;
    role: UserRole;
    groups: string[];
  }): Promise<AuthUserRecord>;
  createSession(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
  findSession(tokenHash: string): Promise<SessionRecord | null>;
  rotateSession(input: {
    currentId: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
  revokeSession(tokenHash: string): Promise<void>;
  revokeUserSessions(userId: string): Promise<void>;
}
