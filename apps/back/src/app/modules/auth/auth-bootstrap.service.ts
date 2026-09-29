import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { PasswordHasherService } from './password-hasher.service';

@Injectable()
export class AuthBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AuthBootstrapService.name);

  constructor(
    private readonly users: UsersService,
    private readonly passwordHasher: PasswordHasherService,
  ) {}

  async onModuleInit(): Promise<void> {
    const username = process.env.CMS_ADMIN_USER ?? 'admin';
    if (await this.users.findOne(username)) return;

    const usingDefaultPassword = !process.env.CMS_ADMIN_PASSWORD;
    await this.users.create({
      username,
      email: process.env.CMS_ADMIN_EMAIL ?? 'admin@soir.local',
      name: 'Administrador',
      passwordHash: await this.passwordHasher.hash(
        process.env.CMS_ADMIN_PASSWORD ?? 'admin123',
      ),
      role: 'ADMIN',
      groups: ['Hub_admins', 'Site_Admins'],
    });

    this.logger.warn(
      usingDefaultPassword
        ? 'Administrador inicial criado. Troque CMS_ADMIN_PASSWORD fora do ambiente local.'
        : 'Administrador inicial criado a partir das variáveis de ambiente.',
    );
  }
}
