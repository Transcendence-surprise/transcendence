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

  async intra42Auth<T = unknown>(): Promise<T> {
    return this.request<T>('get', '/api/auth/intra42');
  }

  async intra42AuthRedirect(): Promise<{ status: number; location?: string }> {
    try {
      const res = await lastValueFrom(
        this.http.get('/api/auth/intra42', {
          maxRedirects: 0,
          validateStatus: () => true,
        }),
      );
      return {
        status: res.status,
        location: res.headers?.location as string | undefined,
      };
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response) {
        return {
          status: err.response.status,
          location: err.response.headers?.location as string | undefined,
        };
      }
      throw new HttpException(
        'Upstream request failed',
        HttpStatus.BAD_GATEWAY,
      );
    }
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
