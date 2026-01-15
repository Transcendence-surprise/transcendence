import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // For auth-service to validate credentials
  @Post('validate-credentials')
  async validateCredentials(
    @Body() dto: { username: string; password: string },
  ) {
    const user = await this.usersService.findByUsernameWithPassword(
      dto.username,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordCorrect = await bcrypt.compare(dto.password, user.password);

    if (!passwordCorrect) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Get(':username')
  findOneByUsername(@Param('username') username: string) {
    return this.usersService.findOneByUsername(username);
  }

  // Auth-test: allows to find user by id only if this user logged in
  @UseGuards(AuthGuard)
  @Get('id/:id')
  findOneById(
    @Param('id') id: number,
    @CurrentUser() user: { sub: number; username: string },
  ) {
    if (user.sub !== id) {
      throw new UnauthorizedException();
    }

    return this.usersService.findOneById(id);
  }

  @Delete(':username')
  removeByUsername(@Param('username') username: string) {
    return this.usersService.removeByUsername(username);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
