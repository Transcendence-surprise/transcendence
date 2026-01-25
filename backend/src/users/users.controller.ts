import {
  ParseIntPipe,
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
import { ValidateCredDto } from './dto/validate-credentials.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import * as bcrypt from 'bcrypt';
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
  findAll() {
    return this.usersService.findAll();
  }

  // For auth-service to validate credentials
  @Post('validate-credentials')
  @ValidateCredentialsDocs()
  async validateCredentials(@Body() validateCredDto: ValidateCredDto) {
    const user = await this.usersService.findByIdentifier(
      validateCredDto.identifier,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordCorrect = await bcrypt.compare(
      validateCredDto.password,
      user.password,
    );

    if (!passwordCorrect) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Get(':username')
  @FindOneByUsernameDocs()
  findOneByUsername(@Param('username') username: string) {
    return this.usersService.findOneByUsername(username);
  }

  // Auth-test: allows to find user by id only if this user logged in
  @UseGuards(AuthGuard)
  @Get('id/:id')
  @FindOneByIdDocs()
  async findOneById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { sub: number; username: string },
  ) {
    if (user.sub !== id) {
      throw new UnauthorizedException();
    }

    return await this.usersService.findOneById(id);
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
