import { Controller, Delete, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getAll() {
    return this.usersService.getAllUsers();
  }

  @Get(':username')
  getByusername(@Param('username') username: string) {
    return this.usersService.getUserByusername(username);
  }

  @Delete(':username')
  deleteByusername(@Param('username') username: string) {
    return this.usersService.deleteUserByusername(username);
  }
}