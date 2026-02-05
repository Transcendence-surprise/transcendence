import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosError, isAxiosError } from 'axios';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersHttpService {
  constructor(private readonly http: HttpService) {}

  async findAll<T = unknown>(): Promise<T> {
    return this.request<T>('get', '/api/users');
  }

  async findOneByUsername<T = unknown>(username: string): Promise<T> {
    return this.request<T>('get', `/api/users/${encodeURIComponent(username)}`);
  }

  async findOneById<T = unknown>(id: number): Promise<T> {
    return this.request<T>('get', `/api/users/id/${id}`);
  }

  async findOneByEmail<T = unknown>(email: string): Promise<T> {
    return this.request<T>(
      'get',
      `/api/users/by-email/${encodeURIComponent(email)}`,
    );
  }

  async removeByUsername(username: string): Promise<void> {
    return this.request<void>(
      'delete',
      `/api/users/${encodeURIComponent(username)}`,
    );
  }

  async removeById(id: number): Promise<void> {
    return this.request<void>('delete', `/api/users/id/${id}`);
  }

  async create<T = unknown>(dto: CreateUserDto): Promise<T> {
    return this.request<T>('post', '/api/users', dto);
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
