import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { FastifyRequest } from 'fastify';

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

  async create<T = unknown>(body: unknown, req?: FastifyRequest): Promise<T> {
    return this.request<T>('post', '/api/users', body, req);
  }

  async findUserByHisToken<T = unknown>(req?: FastifyRequest): Promise<T> {
    return this.request<T>('get', '/api/users/me', undefined, req, true);
  }

  async updateMe<T = unknown>(body: unknown, req?: FastifyRequest): Promise<T> {
    return this.request<T>('patch', '/api/users/me', body, req, true);
  }

  private async request<T>(
    method: 'get' | 'post' | 'delete' | 'put' | 'patch',
    path: string,
    body?: unknown,
    req?: FastifyRequest,
    requireUser = false,
  ): Promise<T> {
    const headers = this.buildForwardHeaders(req, requireUser);
    const res = await this.http.axiosRef.request<T>({
      method,
      url: path,
      headers,
      ...(method === 'get' || method === 'delete' ? {} : { data: body ?? {} }),
    });

    return res.data;
  }

  private buildForwardHeaders(
    req?: FastifyRequest,
    requireUser = false,
  ): Record<string, string> {
    const headers: Record<string, string> = {};

    const reqWithUser = req as RequestWithUser | undefined;
    if (reqWithUser?.user) {
      headers['x-user-id'] = String(reqWithUser.user.sub);
      headers['x-user-username'] = reqWithUser.user.username;
      headers['x-user-email'] = reqWithUser.user.email;
      headers['x-user-roles'] = Array.isArray(reqWithUser.user.roles)
        ? reqWithUser.user.roles.join(',')
        : String(reqWithUser.user.roles);
      return headers;
    }

    if (requireUser) {
      throw new UnauthorizedException('Missing authenticated user context');
    }

    return headers;
  }
}
