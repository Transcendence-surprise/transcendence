import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

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
  ): Promise<T> {
    const res = await lastValueFrom(this.http[method]<T>(path, body));
    return res.data;
  }
}
