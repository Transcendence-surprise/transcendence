import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { UsersHttpService } from './users.service';
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

  @Patch('me')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  updateMe(@Body() body: unknown, @Req() req: FastifyRequest) {
    return this.usersClient.updateMe(body, req);
  }

  @Get('id/:id')
  @Auth(AuthType.JWT)
  @Roles(['user'])
  @UseGuards(AuthGuard, RolesGuard)
  findOneById(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.usersClient.findOneById(Number(id), req);
  }

  @Delete('id/:id')
  removeById(@Param('id') id: string) {
    return this.usersClient.removeById(Number(id));
  }

  @Post()
  create(@Body() body: unknown) {
    return this.usersClient.create(body);
  }
}
