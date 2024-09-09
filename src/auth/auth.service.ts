import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterUserDto } from './@types/register-user.dto';
import { compareSync } from 'bcrypt';
import { JwtReturnType } from './@types/jwt-return-type';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(data: RegisterUserDto) {
    if (!data.validate()) {
      return null;
    }

    const alreadyExistsEmail = await this.userService.getUserByEmail(
      data.email,
    );

    if (alreadyExistsEmail) {
      return null;
    }

    return await this.userService
      .createUser({
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
      })
      .then(({ id }) => ({ id }));
  }

  async validateUser(email: string, password: string): Promise<JwtReturnType> {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = compareSync(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    const payload = { sub: user.id, name: user.name, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '1d',
      }),
    };
  }
}
