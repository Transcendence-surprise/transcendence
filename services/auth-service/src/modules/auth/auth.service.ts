import {
  Injectable,
  UnauthorizedException,
  HttpStatus,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';

import { LoginUserDto } from './dto/login-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import authConfig from 'src/config/auth.config';

export interface ValidatedUser {
  id: number;
  username: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(authConfig.KEY)
    private config: ConfigType<typeof authConfig>,
    private httpService: HttpService,
    private jwtService: JwtService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    try {
      const response = await this.httpService.axiosRef.post<ValidatedUser>(
        `${this.config.backend.url}/api/users/validate-credentials`,
        loginUserDto,
      );
      return this.generateAuthResponse(response.data);
    } catch {
      throw new UnauthorizedException('Invalid username or password');
    }
  }

  async signup(signupUserDto: SignupUserDto) {
    try {
      const response = await this.httpService.axiosRef.post<ValidatedUser>(
        `${this.config.backend.url}/api/users`,
        signupUserDto,
      );
      return this.generateAuthResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === HttpStatus.CONFLICT) {
          throw new ConflictException('Username or email already exists');
        } else if (status === HttpStatus.BAD_REQUEST) {
          throw new BadRequestException('Validation failed');
        }
      }
      throw new InternalServerErrorException();
    }
  }

  intra42Auth() {
    console.log('yes');
  }

  private async generateAuthResponse(user: ValidatedUser) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user,
    };
  }
}
