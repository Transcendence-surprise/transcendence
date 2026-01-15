/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';

export interface ValidatedUser {
  id: number;
  username: string;
}

@Injectable()
export class AuthService {
  private readonly backendUrl =
    process.env.BACKEND_URL || 'http://localhost:3000';

  constructor(
    private httpService: HttpService,
    private jwtService: JwtService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    try {
      const response = await this.httpService.axiosRef.post<ValidatedUser>(
        `${this.backendUrl}/api/users/validate-credentials`,
        {
          username: loginUserDto.username,
          password: loginUserDto.password,
        },
      );

      const user = response.data;

      const payload = {
        sub: user.id,
        username: user.username,
      };

      const access_token = await this.jwtService.signAsync(payload);

      return {
        access_token,
        user,
      };
    } catch {
      throw new UnauthorizedException('Invalid username or password');
    }
  }
}
