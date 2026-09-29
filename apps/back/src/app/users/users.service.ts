
import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CmsStoreService } from '../modules/storage/cms-store.service';
import { User, UserRole } from '../modules/storage/cms.types';

export type PublicUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly store: CmsStoreService) {}

  async findOne(username: string): Promise<User | undefined> {
    return this.store.query((data) =>
      data.users.find(
        (user) =>
          user.username.toLowerCase() === username.toLowerCase() ||
          user.email?.toLowerCase() === username.toLowerCase(),
      ),
    );
  }

  async findById(id: string): Promise<User | undefined> {
    return this.store.query((data) => data.users.find((user) => user.id === id));
  }

  async create(input: {
    username: string;
    email?: string;
    passwordHash: string;
    name?: string;
    role?: UserRole;
    groups?: string[];
  }): Promise<PublicUser> {
    const username = input.username.trim().toLowerCase();
    if (!username || username.length < 3) {
      throw new ConflictException('O usuário deve ter ao menos 3 caracteres');
    }
    if (await this.findOne(username)) {
      throw new ConflictException('Este nome de usuário já existe');
    }

    const now = new Date().toISOString();
    const user: User = {
      id: randomUUID(),
      username,
      email: input.email?.trim().toLowerCase() || username,
      name: input.name?.trim() || username,
      passwordHash: input.passwordHash,
      role: input.role ?? 'EDITOR',
      groups: input.groups ?? ['Site_Admins'],
      createdAt: now,
      updatedAt: now,
    };

    await this.store.mutate((data) => data.users.push(user));
    return this.toPublicUser(user);
  }

  toPublicUser(user: User): PublicUser {
    const publicUser = { ...user } as Partial<User>;
    delete publicUser.passwordHash;
    return publicUser as PublicUser;
  }
}
