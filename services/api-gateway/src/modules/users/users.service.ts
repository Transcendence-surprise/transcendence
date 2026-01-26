import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosError, isAxiosError } from 'axios';

import { CreateUserDto } from './dto/create-user.dto';
import {
  UserResponse,
  UsersListResponse,
} from './interfaces/service-user-response';

@Injectable()
export class UsersHttpService {
  constructor(private readonly http: HttpService) {}

  findAll(): Promise<UsersListResponse> {
    return this.request<UsersListResponse>('get', '/api/users');
  }

  findOneByUsername(username: string): Promise<UserResponse> {
    return this.request<UserResponse>(
      'get',
      `/api/users/${encodeURIComponent(username)}`,
    );
  }

  findOneById(id: number): Promise<UserResponse> {
    return this.request<UserResponse>('get', `/api/users/id/${id}`);
  }

  removeByUsername(username: string): Promise<void> {
    return this.request<void>(
      'delete',
      `/api/users/${encodeURIComponent(username)}`,
    );
  }

  removeById(id: number): Promise<void> {
    return this.request<void>('delete', `/api/users/id/${id}`);
  }

  create(dto: CreateUserDto): Promise<UserResponse> {
    return this.request<UserResponse>('post', '/api/users', dto);
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
