import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import type { FastifyRequest } from 'fastify';

import { CreateUserDto } from './dto/create-user.dto';

interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  roles: string[];
}

interface RequestWithUser extends FastifyRequest {
  user?: JwtPayload;
}

@Injectable()
export class UsersHttpService {
  constructor(private readonly http: HttpService) {}

  async findAll<T = unknown>(): Promise<T> {
    return this.request<T>('get', '/api/users');
  }

  async findOneByUsername<T = unknown>(username: string, req?: FastifyRequest): Promise<T> {
    return this.request<T>('get', `/api/users/${encodeURIComponent(username)}`, undefined, req);
  }

  async findOneById<T = unknown>(id: number, req?: FastifyRequest): Promise<T> {
    return this.request<T>('get', `/api/users/id/${id}`, undefined, req);
  }

  async findOneByEmail<T = unknown>(email: string, req?: FastifyRequest): Promise<T> {
    return this.request<T>(
      'get',
      `/api/users/by-email/${encodeURIComponent(email)}`,
      undefined,
      req,
    );
  }

  async removeByUsername(username: string, req?: FastifyRequest): Promise<void> {
    return this.request<void>(
      'delete',
      `/api/users/${encodeURIComponent(username)}`,
      undefined,
      req,
    );
  }

  async removeById(id: number, req?: FastifyRequest): Promise<void> {
    return this.request<void>('delete', `/api/users/id/${id}`, undefined, req);
  }

  async create<T = unknown>(dto: CreateUserDto, req?: FastifyRequest): Promise<T> {
    return this.request<T>('post', '/api/users', dto, req);
  }

  async findUserByHisToken<T = unknown>(req?: FastifyRequest): Promise<T> {
    return this.request<T>('get', '/api/users/me', undefined, req);
  }

  private async request<T>(
    method: 'get' | 'post' | 'delete' | 'put',
    path: string,
    body?: any,
    req?: FastifyRequest,
  ): Promise<T> {
    let headers: Record<string, string> = {};

    if (req) {
      headers = { ...req.headers as Record<string, string> };

      const reqWithUser = req as RequestWithUser;
      if (reqWithUser.user) {
        headers['x-user-id'] = String(reqWithUser.user.sub);
        headers['x-user-username'] = reqWithUser.user.username;
        headers['x-user-email'] = reqWithUser.user.email;
        headers['x-user-roles'] = Array.isArray(reqWithUser.user.roles)
          ? reqWithUser.user.roles.join(',')
          : String(reqWithUser.user.roles);
      }
    }

    const config = Object.keys(headers).length ? { headers } : undefined;

    const res = method === 'get' || method === 'delete'
      ? await lastValueFrom(this.http[method]<T>(path, config))
      : await lastValueFrom(this.http[method]<T>(path, body, config));

    return res.data;
  }
}
