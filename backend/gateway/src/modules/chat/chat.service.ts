// src/modules/chat/chat.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { FastifyRequest } from 'fastify';
import { lastValueFrom } from 'rxjs';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import type { AxiosResponse } from 'axios';

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
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async getHistory(req: FastifyRequest): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>('get', '/api/chat/history', undefined, req, true);
  }

  async addMessage(body: unknown, req: FastifyRequest): Promise<unknown> {
    const result = await this.request<unknown>(
      'post',
      '/api/chat/messages',
      body,
      req,
      true,
    );

    if (isChatMessageResult(result)) {
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
    let response: AxiosResponse<T> | undefined;

    switch (method) {
      case 'get':
        response = await lastValueFrom(this.http.get<T>(path, config));
        break;
      case 'delete':
        response = await lastValueFrom(
          this.http.delete<T>(path, { ...config, data: body ?? {} }),
        );
        break;
      case 'post':
        response = await lastValueFrom(this.http.post<T>(path, body ?? {}, config));
        break;
      case 'put':
        response = await lastValueFrom(this.http.put<T>(path, body ?? {}, config));
        break;
      case 'patch':
        response = await lastValueFrom(this.http.patch<T>(path, body ?? {}, config));
        break;
      default:
        throw new Error(`Unsupported method`);
    }

    if (!response) {
      throw new Error('No response from chat service');
    }

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
    if (!this.realtimeGateway.emitter) return;

    this.realtimeGateway.emitter.emitNewMessage(message);
  }
}

type ChatMessageResult = {
  ok: true;
  message: ChatMessage;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!isRecord(value)) return false;
  return (
    (typeof value.id === 'string' || typeof value.id === 'number') &&
    (typeof value.userId === 'string' || typeof value.userId === 'number') &&
    typeof value.username === 'string' &&
    typeof value.content === 'string' &&
    typeof value.timestamp === 'number'
  );
}

function isChatMessageResult(value: unknown): value is ChatMessageResult {
  if (!isRecord(value)) return false;
  if (value.ok !== true) return false;
  return isChatMessage(value.message);
}
