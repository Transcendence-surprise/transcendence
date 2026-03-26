import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import type { FastifyRequest } from 'fastify';

@Injectable()
export class ImagesHttpService {
  constructor(private readonly http: HttpService) {}

  async findAll<T = unknown>(): Promise<{ statusCode: number; data: T }> {
    return this.request<T>('/api/images', 'get');
  }

  async findOne<T = unknown>(id: number): Promise<{ statusCode: number; data: T }> {
    return this.request<T>(`/api/images/${id}`, 'get');
  }

  async create<T = unknown>(body: unknown, req?: FastifyRequest): Promise<{ statusCode: number; data: T }> {
    const contentType = req?.headers?.['content-type'];
    if (contentType && contentType.includes('multipart/form-data')) {
      return this.upload<T>(req);
    }
    return this.request<T>('/api/images', 'post', body, req);
  }

  async upload<T = unknown>(req: FastifyRequest): Promise<{ statusCode: number; data: T }> {
    const headers: Record<string, string> = {};
    Object.entries(req.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });

    const response = await lastValueFrom(this.http.post<T>('/api/images', req.raw, { headers }));

    return {
      statusCode: response.status,
      data: response.data,
    };
  }

  async update<T = unknown>(id: number, body: unknown, req?: FastifyRequest): Promise<{ statusCode: number; data: T }> {
    return this.request<T>(`/api/images/${id}`, 'patch', body, req);
  }

  async remove<T = unknown>(id: number): Promise<{ statusCode: number; data: T }> {
    return this.request<T>(`/api/images/${id}`, 'delete');
  }

  private async request<T>(
    path: string,
    method: 'get' | 'post' | 'delete' | 'put' | 'patch' = 'get',
    body?: unknown,
    req?: FastifyRequest,
  ): Promise<{ statusCode: number; data: T }> {
    const headers: Record<string, string> = {};
    const hasBody = method !== 'get' && method !== 'delete';

    if (req?.headers?.['content-type']) {
      headers['content-type'] = req.headers['content-type'];
    }

    if (hasBody && !headers['content-type']) {
      headers['content-type'] = 'application/json';
    }

    const config = { headers };

    const response = hasBody
      ? await lastValueFrom(this.http[method]<T>(path, body ?? {}, config))
      : await lastValueFrom(this.http[method]<T>(path, config));

    if (!response) {
      throw new NotFoundException('No response from core image API');
    }

    return {
      statusCode: response.status,
      data: response.data,
    };
  }
}
