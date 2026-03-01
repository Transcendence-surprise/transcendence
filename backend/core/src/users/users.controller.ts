import {
  ParseIntPipe,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
} from '@nestjs/common';
import { ApiCookieAuth} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { ValidateCredDto } from './dto/validate-credentials.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';

import {
  UsersControllerDocs,
  FindAllDocs,
  ValidateCredentialsDocs,
  FindOneByIdDocs,
  RemoveByIdDocs,
  CreateDocs,
  GetMeDocs,
  UpdateMeDocs,
  FindOneByEmailDocs,
} from './users.controller.docs';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { JwtPayload } from '../decorators/current-user.decorator';


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
  @FindOneByEmailDocs()
  getUserByEmail(@Param('email') email: string) {
    return this.usersService.findOneByEmail(email);
  }

  @Get('me')
  @GetMeDocs()
  getUserByHisToken(@CurrentUser() user : JwtPayload) {
    return this.usersService.findOneById(user.sub);
  }

  @Patch('me')
  @UpdateMeDocs()
  updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() updateMeDto: UpdateMeDto,
  ) {
    return this.usersService.updateMe(user.sub, updateMeDto);
  }

  // Auth-test: allows to find user by id only if this user logged in
  @Get('id/:id')
  @FindOneByIdDocs()
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneById(id);
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
