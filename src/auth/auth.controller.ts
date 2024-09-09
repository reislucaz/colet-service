import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './@types/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() data: Record<string, any>) {
    const register = await this.authService.registerUser(
      new RegisterUserDto(data.name, data.email, data.password),
    );

    if (!register) {
      throw new UnauthorizedException();
    }

    return register;
  }

  @Post('login')
  async login(@Body() data: Record<string, any>) {
    const login = await this.authService.validateUser(
      data.email,
      data.password,
    );

    if (!login) {
      throw new UnauthorizedException();
    }

    return login;
  }
}
