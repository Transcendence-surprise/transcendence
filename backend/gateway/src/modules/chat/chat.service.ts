// src/modules/chat/chat.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { FastifyRequest } from 'fastify';
import { lastValueFrom } from 'rxjs';
import { ChatGateway } from '../realtime/chat.gateway';

export interface ChatMessage {
  id: string;
  userId: number | string;
  username: string;
  content: string;
  timestamp: number;
  replyTo?: string;
}

interface JwtPayload {
  sub: number | string;
  username: string;
  email: string;
  roles: string[];
}

interface RequestWithUser extends FastifyRequest {
  user?: JwtPayload;
}

@Injectable()
export class ChatHttpService {
  constructor(
    private readonly http: HttpService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async getHistory(req: FastifyRequest): Promise<ChatMessage[]> {
    const headers = this.buildForwardHeaders(req, true);
    return this.request<ChatMessage[]>('get', '/api/chat/history', undefined, req, true);
  }

  async addMessage(body: unknown, req: FastifyRequest) {
    const result = await this.request<any>(
      'post',
      '/api/chat/messages',
      body,
      req,
      true,
    );

    if (result?.ok && result?.message) {
      this.notifyNewMessage(result.message);
    }

    return result;
  }

  private async request<T>(
    method: 'get' | 'post' | 'delete' | 'put' | 'patch',
    path: string,
    body?: unknown,
    req?: FastifyRequest,
    requireUser = false,
  ): Promise<T> {
    const headers = this.buildForwardHeaders(req, requireUser);

    const config = { headers };

    const response =
      method === 'get'
        ? await lastValueFrom(this.http.get<T>(path, config))
        : method === 'delete'
        ? await lastValueFrom(this.http.delete<T>(path, { ...config, data: body ?? {} }))
        : await lastValueFrom(this.http[method]<T>(path, body ?? {}, config));

    return response.data;
  }

  private buildForwardHeaders(
    req?: FastifyRequest,
    requireUser = false,
  ): Record<string, string> {
    const headers: Record<string, string> = {};

    const user = (req as RequestWithUser | undefined)?.user;

    if (user) {
      headers['x-user-id'] = String(user.sub);
      headers['x-user-username'] = user.username;
      headers['x-user-email'] = user.email;
      headers['x-user-roles'] = Array.isArray(user.roles)
        ? user.roles.join(',')
        : String(user.roles);
    } else if (requireUser) {
      throw new UnauthorizedException('Missing authenticated user context');
    }

    const passThrough = [
      'authorization',
      'x-request-id',
      'x-forwarded-for',
      'x-real-ip',
    ];

    for (const key of passThrough) {
      const val = req?.headers?.[key];
      if (typeof val === 'string') headers[key] = val;
    }

    headers['content-type'] ??= 'application/json';

    return headers;
  }

  private notifyNewMessage(message: ChatMessage) {
    if (!this.chatGateway) return;

    this.chatGateway.emitNewMessage(message);
  }
}
