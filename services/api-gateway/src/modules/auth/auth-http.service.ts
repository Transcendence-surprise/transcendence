import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosError, isAxiosError } from 'axios';

import { LoginUserDto } from '../../interfaces/auth/dto/login-user.dto';
import { SignupUserDto } from '../../interfaces/auth/dto/signup-user.dto';

import { AuthLoginResponse } from '../../interfaces/auth/service-auth-login-response';
import { AuthSignupResponse } from '../../interfaces/auth/service-auth-signup-response';

@Injectable()
export class AuthHttpService {
  constructor(private readonly http: HttpService) {}
  async login(body: LoginUserDto): Promise<AuthLoginResponse> {
    return this.post<AuthLoginResponse>('/api/auth/login', body);
  }

  async signup(body: SignupUserDto): Promise<AuthSignupResponse> {
    return this.post<AuthSignupResponse>('/api/auth/signup', body);
  }

  private async post<T>(path: string, body: unknown) {
    try {
      const res = await lastValueFrom(this.http.post<T>(path, body));
      return res.data;
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      if (isAxiosError(err)) {
        const axiosErr = err as AxiosError;
        const status = axiosErr.response?.status ?? HttpStatus.BAD_GATEWAY;
        const data = axiosErr.response?.data ?? {
          message: 'Upstream request failed',
        };
        throw new HttpException(data, status);
      }
      throw new HttpException(
        'Upstream request failed',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
