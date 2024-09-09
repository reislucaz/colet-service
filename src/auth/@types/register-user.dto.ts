import { hashSync } from 'bcrypt';

export class RegisterUserDto {
  constructor(
    public readonly name: string,
    public readonly email: string,
    private readonly password: string,
  ) {}

  get passwordHash() {
    return hashSync(this.password, 10);
  }

  validate(): boolean {
    return this.name && this.email && this.password ? true : false;
  }
}
