import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(readonly userService: UserService) {}

  @Get('/:id')
  async getById(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }
}
