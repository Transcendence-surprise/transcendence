import {
  Injectable,
  UnauthorizedException,
  HttpStatus,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import axios from 'axios';

export interface ValidatedUser {
  id: number;
  username: string;
  email: string;
}

@Injectable()
export class AuthService {
  private readonly backendUrl = process.env.BACKEND_URL;

  constructor(
    private httpService: HttpService,
    private jwtService: JwtService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    try {
      const response = await this.httpService.axiosRef.post<ValidatedUser>(
        `${this.backendUrl}/api/users/validate-credentials`,
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
        `${this.backendUrl}/api/users`,
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
