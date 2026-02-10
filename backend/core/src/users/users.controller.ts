import {
  ParseIntPipe,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ValidateCredDto } from './dto/validate-credentials.dto';
import { CreateUserDto } from './dto/create-user.dto';

import {
  UsersControllerDocs,
  FindAllDocs,
  ValidateCredentialsDocs,
  FindOneByUsernameDocs,
  FindOneByIdDocs,
  RemoveByUsernameDocs,
  RemoveByIdDocs,
  CreateDocs,
} from './users.controller.docs';

@UsersControllerDocs()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @FindAllDocs()
  getUsers() {
    return this.usersService.findAll();
  }

  @Post('validate-credentials')
  @ValidateCredentialsDocs()
  async validateCredentials(@Body() validateCredDto: ValidateCredDto) {
    return this.usersService.validateCredentials(validateCredDto);
  }

  @Get('by-email/:email')
  getUserByEmail(@Param('email') email: string) {
    return this.usersService.findOneByEmail(email);
  }

  @Get(':username')
  @FindOneByUsernameDocs()
  getUserByUsername(@Param('username') username: string) {
    return this.usersService.findOneByUsername(username);
  }

  // Auth-test: allows to find user by id only if this user logged in
  @Get('id/:id')
  @FindOneByIdDocs()
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneById(id);
  }

  @Delete(':username')
  @RemoveByUsernameDocs()
  removeByUsername(@Param('username') username: string) {
    return this.usersService.removeByUsername(username);
  }

  @Delete('id/:id')
  @RemoveByIdDocs()
  removeById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.removeById(id);
  }

  @Post()
  @CreateDocs()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
