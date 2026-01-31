import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosError, isAxiosError } from 'axios';

import { LoginUserDto } from './dto/login-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';

@Injectable()
export class AuthHttpService {
  constructor(private readonly http: HttpService) {}
  async login<T = unknown>(body: LoginUserDto): Promise<T> {
    return this.request<T>('post', '/api/auth/login', body);
  }

  async signup<T = unknown>(body: SignupUserDto): Promise<T> {
    return this.request<T>('post', '/api/auth/signup', body);
  }

  private async request<T>(
    method: 'get' | 'post' | 'delete' | 'put',
    path: string,
    body?: any,
  ) {
    try {
      const res = await lastValueFrom(this.http[method]<T>(path, body));
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
