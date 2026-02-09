import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class GameHttpService {
  constructor(private readonly http: HttpService) {}

  async get<T = unknown>(path: string): Promise<T> {
    return this.request<T>('get', path, undefined);
  }

  async post<T = unknown>(path: string, body: unknown): Promise<T> {
    return this.request<T>('post', path, body);
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
