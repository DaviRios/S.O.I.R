import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { asRecord, requiredString } from '../../common/input';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

export interface AuthenticatedUser {
  sub: string;
  username: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR';
  groups: string[];
  iat: number;
  exp: number;
}

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('users/auth')
  signIn(@Body() value: unknown) {
    const input = asRecord(value);
    return this.authService.signIn(
      typeof input.email === 'string'
        ? requiredString(input, 'email', 'E-mail')
        : requiredString(input, 'username', 'Usuário'),
      requiredString(input, 'password', 'Senha'),
    );
  }

  @Get('public/dev/token')
  async devToken(@Query('email') email = 'dev@soir.local') {
    return { token: await this.authService.signDevToken(email) };
  }

  @UseGuards(AuthGuard)
  @Get('users/profile')
  getProfile(@Request() req: { user: AuthenticatedUser }) {
    return req.user;
  }
}
