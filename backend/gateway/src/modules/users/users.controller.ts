import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { UsersHttpService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Auth, AuthType } from '../../common/decorator/auth-type.decorator';
import { Roles } from '../../common/decorator/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersClient: UsersHttpService) {}

  @Get()
  findAll() {
    return this.usersClient.findAll();
  }

  @Get('by-email/:email')
  findOneByEmail(@Param('email') email: string) {
    return this.usersClient.findOneByEmail(email);
  }

  @Get('me')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  getUserByHisToken(@Req() req: FastifyRequest) {
    return this.usersClient.findUserByHisToken(req);
  }

  // @Get(':username')
  // findOneByUsername(@Param('username') username: string) {
  //   return this.usersClient.findOneByUsername(username);
  // }

  @Get('id/:id')
  @Auth(AuthType.JWT)
  @Roles(['user'])
  @UseGuards(AuthGuard, RolesGuard)
  findOneById(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.usersClient.findOneById(Number(id), req);
  }

  // @Delete(':username')
  // removeByUsername(@Param('username') username: string) {
  //   return this.usersClient.removeByUsername(username);
  // }

  @Delete('id/:id')
  removeById(@Param('id') id: string) {
    return this.usersClient.removeById(Number(id));
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersClient.create(dto);
  }
}
