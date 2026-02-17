import { Injectable } from '@nestjs/common';
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
export class GameHttpService {
  constructor(private readonly http: HttpService) {}

  async createGame<T = unknown>(body: unknown, req?: FastifyRequest): Promise<T> {
    return this.request<T>('post', '/api/game/create', body, req);
  }

  async startGame<T = unknown>(body: unknown, req?: FastifyRequest): Promise<T> {
    return this.request<T>('post', '/api/game/start', body, req);
  }

  async joinGame<T = unknown>(body: unknown, req?: FastifyRequest): Promise<T> {
    return this.request<T>('post', '/api/game/join', body, req);
  }

  async leaveGame<T = unknown>(body: unknown, req?: FastifyRequest): Promise<T> {
    return this.request<T>('post', '/api/game/leave', body, req);
  }

  async getGameState<T = unknown>(gameId: string, req?: FastifyRequest): Promise<T> {
    return this.request<T>('get', `/api/game/${gameId}`, undefined, req);
  }

  async getSinglePlayerLevels<T = unknown>(req?: FastifyRequest): Promise<T> {
    return this.request<T>('get', '/api/game/single/levels', undefined, req);
  }

  async getMultiplayerGames<T = unknown>(req?: FastifyRequest): Promise<T> {
    return this.request<T>('get', '/api/game/multi/games', undefined, req);
  }

  async checkPlayerAvailability<T = unknown>(playerId: string, req?: FastifyRequest): Promise<T> {
    return this.request<T>('get', `/api/game/check-player/${playerId}`, undefined, req);
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
