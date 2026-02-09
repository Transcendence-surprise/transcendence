import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersHttpService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Auth, AuthType } from '../../common/decorator/auth-type.decorator';

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

  @Get(':username')
  findOneByUsername(@Param('username') username: string) {
    return this.usersClient.findOneByUsername(username);
  }

  @Get('id/:id')
  @UseGuards(AuthGuard)
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  findOneById(@Param('id') id: string) {
    return this.usersClient.findOneById(Number(id));
  }

  @Delete(':username')
  removeByUsername(@Param('username') username: string) {
    return this.usersClient.removeByUsername(username);
  }

  @Delete('id/:id')
  removeById(@Param('id') id: string) {
    return this.usersClient.removeById(Number(id));
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersClient.create(dto);
  }
}
