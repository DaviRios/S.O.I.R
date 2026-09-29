import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { PasswordHasherService } from './password-hasher.service';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasher: PasswordHasherService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(identifier: string, password: string) {
    const user = await this.usersService.findOne(identifier);

    if (!user) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const passwordIsValid = await this.passwordHasher.verify(
      user.passwordHash, 
      password,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    return {
      accessToken: await this.jwtService.signAsync({
        sub: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        groups: user.groups,
        'cognito:groups': user.groups,
      }),
      user: this.usersService.toPublicUser(user),
    };
  }

  signDevToken(email: string): Promise<string> {
    return this.jwtService.signAsync({
      sub: email,
      email,
      username: email,
      name: 'Desenvolvedor local',
      role: 'ADMIN',
      groups: ['Hub_admins'],
      'cognito:groups': ['Hub_admins'],
    });
  }
}
