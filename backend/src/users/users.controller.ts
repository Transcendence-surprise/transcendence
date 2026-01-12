import { Controller, Delete, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getAll() {
    return this.usersService.getAllUsers();
  }

  @Get(':login')
  getByLogin(@Param('login') login: string) {
    return this.usersService.getUserByLogin(login);
  }

  @Delete(':login')
  deleteByLogin(@Param('login') login: string) {
    return this.usersService.deleteUserByLogin(login);
  }
}