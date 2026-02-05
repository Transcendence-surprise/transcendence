import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

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

  async intra42AuthRedirect(): Promise<{ status: number; location?: string }> {
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
  }

  async intra42AuthCallback(
    code: string,
    state: string,
  ): Promise<{ status: number; location?: string; cookies?: string[] }> {
    const res = await lastValueFrom(
      this.http.get('/api/auth/intra42/callback', {
        maxRedirects: 0,
        validateStatus: () => true,
        params: { code, state },
      }),
    );

    const setCookieHeaders = res.headers['set-cookie'];
    const cookies = setCookieHeaders
      ? Array.isArray(setCookieHeaders)
        ? setCookieHeaders
        : [setCookieHeaders]
      : [];

    return {
      status: res.status,
      location: res.headers?.location as string | undefined,
      cookies,
    };
  }

  private async request<T>(
    method: 'get' | 'post' | 'delete' | 'put',
    path: string,
    body?: any,
  ): Promise<T> {
    const res = await lastValueFrom(this.http[method]<T>(path, body));
    return res.data;
  }
}
