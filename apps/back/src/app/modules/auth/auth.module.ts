import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthBootstrapService } from './auth-bootstrap.service';
import { PasswordHasherService } from './password-hasher.service';
import { UsersModule } from '../../users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'soir-development-secret-change-me',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthBootstrapService, PasswordHasherService],
  exports: [AuthService],
})
export class AuthModule {}
