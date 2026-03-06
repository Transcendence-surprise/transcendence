import {
  ParseIntPipe,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  Put,
  HttpStatus,
  Res,
  HttpCode,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';

import { UsersService } from './users.service';
import { ValidateCredDto } from './dto/validate-credentials.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPartialDto } from './dto/update-user-partial.dto';

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
  UpdateUserDocs,
  UpdateUserPartialDocs,
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
  async getUserByHisToken(@CurrentUser() user : JwtPayload) {
    console.log("USERS SERVICE /me called");

    if (user.roles?.includes('guest')) {
      return {
        id: user.sub,
        username: user.username,
        email: '',
        roles: ['guest'],
      };
    }

    return this.usersService.findOneById(user.sub as number);
  }

  @Patch('me')
  @UpdateMeDocs()
  updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() updateMeDto: UpdateMeDto,
  ) {
    // Guests cannot update their profile in the database
    if (user.roles?.includes('guest')) {
      return {
        id: user.sub,
        username: user.username,
        email: '',
        roles: ['guest'],
      };
    }
    return this.usersService.updateMe(user.sub as number, updateMeDto);
  }

  // Auth-test: allows to find user by id only if this user logged in
  @Get('id/:id')
  @FindOneByIdDocs()
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneById(id);
  }

  @Put('id/:id')
  @UpdateUserDocs()
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: FastifyReply,
  ) {
    const result = await this.usersService.createOrUpdate(id, updateUserDto);
    const statusCode = result.created ? HttpStatus.CREATED : HttpStatus.OK;
    return res.status(statusCode).send(result.user);
  }

  @Patch('id/:id')
  @UpdateUserPartialDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  updateUserPartial(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserPartialDto: UpdateUserPartialDto,
  ) {
    return this.usersService.updateUserPartial(id, updateUserPartialDto);
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
