import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import type { FastifyRequest } from 'fastify';

@Injectable()
export class MatchesHttpService {
  constructor(private readonly http: HttpService) {}

  async findAll<T = unknown>(req?: FastifyRequest): Promise<T> {
    return this.request<T>('get', '/api/matches', undefined, req);
  }

  async findOne<T = unknown>(id: number, req?: FastifyRequest): Promise<T> {
    return this.request<T>('get', `/api/matches/${id}`, undefined, req);
  }

  async create<T = unknown>(body: unknown, req?: FastifyRequest): Promise<T> {
    return this.request<T>('post', '/api/matches', body, req);
  }

  async update<T = unknown>(id: number, body: unknown, req?: FastifyRequest): Promise<T> {
    return this.request<T>('put', `/api/matches/${id}`, body, req);
  }

  async partialUpdate<T = unknown>(id: number, body: unknown, req?: FastifyRequest): Promise<T> {
    return this.request<T>('patch', `/api/matches/${id}`, body, req);
  }

  async remove<T = unknown>(id: number, req?: FastifyRequest): Promise<T> {
    return this.request<T>('delete', `/api/matches/${id}`, undefined, req);
  }

  private async request<T>(
    method: 'get' | 'post' | 'delete' | 'put' | 'patch',
    path: string,
    body?: unknown,
    req?: FastifyRequest,
  ): Promise<T> {
    const headers = req?.headers ? { ...req.headers } as Record<string, string> : {};
    const config = Object.keys(headers).length ? { headers } : undefined;

    const response = method === 'get' || method === 'delete'
      ? await lastValueFrom(this.http[method]<T>(path, config))
      : await lastValueFrom(this.http[method]<T>(path, body, config));

    return response.data;
  }
}
