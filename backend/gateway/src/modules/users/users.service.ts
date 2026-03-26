import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
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

  async findAll<T = unknown>(): Promise<{ statusCode: number; data: T }> {
    return this.request<T>('/api/users', 'get');
  }

  async findOneByUsername<T = unknown>(username: string, req?: FastifyRequest): Promise<{ statusCode: number; data: T }> {
    return this.request<T>(`/api/users/${encodeURIComponent(username)}`, 'get', undefined, req);
  }

  async findOneById<T = unknown>(id: number, req?: FastifyRequest): Promise<{ statusCode: number; data: T }> {
    return this.request<T>(`/api/users/id/${id}`, 'get', undefined, req);
  }

  async findOneByEmail<T = unknown>(email: string, req?: FastifyRequest): Promise<{ statusCode: number; data: T }> {
    return this.request<T>(
      `/api/users/by-email/${encodeURIComponent(email)}`,
      'get',
      undefined,
      req,
    );
  }

  async removeByUsername(username: string, req?: FastifyRequest): Promise<{ statusCode: number; data: void }> {
    return this.request<void>(
      `/api/users/${encodeURIComponent(username)}`,
      'delete',
      undefined,
      req,
    );
  }

  async removeById(id: number, req?: FastifyRequest): Promise<{ statusCode: number; data: void }> {
    return this.request<void>(`/api/users/id/${id}`, 'delete', undefined, req);
  }

  async create<T = unknown>(body: unknown, req?: FastifyRequest): Promise<{ statusCode: number; data: T }> {
    return this.request<T>('/api/users', 'post', body, req);
  }

  async findUserByHisToken<T = unknown>(req?: FastifyRequest): Promise<{ statusCode: number; data: T }> {
    return this.request<T>('/api/users/me', 'get', undefined, req, true);
  }

  async updateMe<T = unknown>(body: unknown, req?: FastifyRequest): Promise<{ statusCode: number; data: T }> {
    return this.request<T>('/api/users/me', 'patch', body, req, true);
  }

  async uploadAvatar<T = unknown>(req: FastifyRequest): Promise<{ statusCode: number; data: T }> {
    return this.request<T>('/api/users/me/avatar', 'post', req.raw, req, true);
  }

  async updateUser<T = unknown>(id: number, body: unknown, req?: FastifyRequest): Promise<{ statusCode: number; data: T }> {
    return this.request<T>(`/api/users/id/${id}`, 'put', body, req);
  }

  async updateUserPartial<T = unknown>(id: number, body: unknown, req?: FastifyRequest): Promise<{ statusCode: number; data: T }> {
    return this.request<T>(`/api/users/id/${id}`, 'patch', body, req);
  }

  async getDailyLeaderboard<T = unknown>(req?: FastifyRequest): Promise<{ statusCode: number; data: T }> {
    return this.request<T>('/api/leaderboard/daily', 'get', undefined, req);
  }

  private async request<T>(
    path: string,
    method: 'get' | 'post' | 'delete' | 'put' | 'patch' = 'get',
    body?: unknown,
    req?: FastifyRequest,
    requireUser = false,
  ): Promise<{ statusCode: number; data: T }> {
    const headers = this.buildForwardHeaders(req, requireUser);
    const hasBody = method !== 'get' && method !== 'delete';

    if (req?.headers?.['content-type']) {
      headers['content-type'] = req.headers['content-type'];
    }

    if (hasBody && !headers['content-type']) {
      headers['content-type'] = 'application/json';
    }

    const config = { headers };

    const res = hasBody
      ? await lastValueFrom(this.http[method]<T>(path, body ?? {}, config))
      : await lastValueFrom(this.http[method]<T>(path, config));

    return {
      statusCode: res.status,
      data: res.data,
    };
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
