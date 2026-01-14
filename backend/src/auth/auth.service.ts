import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const user = await this.usersService.findByUsernameWithPassword(
      loginUserDto.username,
    );

    const passwordCorrect =
      user === null
        ? false
        : await bcrypt.compare(loginUserDto.password, user.password);

    if (!(user && passwordCorrect)) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = {
      sub: user.id,
      username: user.username,
    };

    const acess_token = await this.jwtService.signAsync(payload);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userForToken } = user;
    return {
      acess_token,
      user: userForToken,
    };
  }
}
