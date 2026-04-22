import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

export interface ChatUserContext {
  sub: number | string;
  username: string;
  email: string;
  roles: string[];
}

export interface ChatMessage {
  id: string;
  userId: number | string;
  username: string;
  content: string;
  timestamp: number;
  replyTo?: string;
}

@Injectable()
export class ChatHttpService {
  constructor(private readonly http: HttpService) {}

  async getHistory(user: ChatUserContext): Promise<ChatMessage[]> {
    const headers = this.buildForwardHeaders(user, true);

    const response = await lastValueFrom(
      this.http.get<ChatMessage[]>('/api/chat/history', {
        headers,
      }),
    );

    return response.data;
  }

  async addMessage(
    user: ChatUserContext,
    body: { content: string; replyTo?: string },
  ): Promise<{ ok: boolean; message?: ChatMessage; error?: string }> {
    const headers = this.buildForwardHeaders(user, true);

    const response = await lastValueFrom(
      this.http.post<{ ok: boolean; message?: ChatMessage; error?: string }>(
        '/api/chat/messages',
        body,
        { headers },
      ),
    );

    return response.data;
  }

  private buildForwardHeaders(
    user?: ChatUserContext,
    requireUser = false,
  ): Record<string, string> {
    if (!user) {
      if (requireUser) {
        throw new UnauthorizedException('Missing authenticated user context');
      }
      return {};
    }

    return {
      'x-user-id': String(user.sub),
      'x-user-username': user.username,
      'x-user-email': user.email,
      'x-user-roles': Array.isArray(user.roles)
        ? user.roles.join(',')
        : String(user.roles),
      'content-type': 'application/json',
    };
  }
}
