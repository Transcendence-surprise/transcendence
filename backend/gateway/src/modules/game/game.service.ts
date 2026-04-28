import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import type { FastifyRequest } from 'fastify';
import { GameGateway } from '../realtime/game.gateway';
import { CreateGameResponseDto } from './dto/create-game.dto';
import { JoinGameDto } from './dto/join-game.dto';
import { LeaveGameDto } from './dto/leave-game.dto';
import { PlayerMoveDto } from './dto/player-move.dto';
import { BoardMoveDto } from './dto/board-move.dto';
import { StartGameDto } from './dto/start-game.dto';

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
  constructor(
    private readonly http: HttpService,
    private readonly gameGateway: GameGateway
  ) {}

  async createGame(body: unknown, req?: FastifyRequest): Promise<CreateGameResponseDto> {
    const result = await this.request<CreateGameResponseDto>('post', '/api/game/create', body, req);
    if (result?.gameId) {
      this.gameGateway.emitMultiplayerGamesListUpdated();
      this.gameGateway.emitPlayerAvailabilityUpdated();
    }
    return result;
  }

  async joinGame<T = unknown>(body: JoinGameDto, req?: FastifyRequest): Promise<T> {
    const result = await this.request<T>('post', '/api/game/join', body, req);
    if (body?.gameId) {
      this.gameGateway.emitLobbyUpdated(body?.gameId);
      this.gameGateway.emitPlayerAvailabilityUpdated();
      this.gameGateway.emitMultiplayerGamesListUpdated();
    }
    return result;
  }

  async leaveGame<T = unknown>(body: LeaveGameDto, req?: FastifyRequest): Promise<T> {
    const result = await this.request<T>('post', '/api/game/leave', body, req);
    if (body?.gameId) {
      this.gameGateway.emitLobbyUpdated(body.gameId);
      this.gameGateway.emitGameUpdated(body.gameId);
      this.gameGateway.emitPlayerAvailabilityUpdated();
      this.gameGateway.emitMultiplayerGamesListUpdated();
    }
    return result;
  }

  async startGame<T = unknown>(body: StartGameDto, req?: FastifyRequest): Promise<T> {

    const result = await this.request<T>('post', '/api/game/start', body, req);
    this.gameGateway.emitMultiplayerGamesListUpdated();
    this.gameGateway.emitLobbyUpdated(body.gameId);
    return result;
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

  async checkPlayerAvailability<T = unknown>(req?: FastifyRequest): Promise<T> {
    return this.request<T>('get', `/api/game/check-player`, undefined, req);
  }

  async boardMove<T = unknown>(body: BoardMoveDto, req?: FastifyRequest): Promise<T> {
    const result = await  this.request<T>('post', '/api/game/boardmove', body, req);
    if (body.gameId) {
      this.gameGateway.emitGameUpdated(body.gameId);
    }
    return result;
  }

  async playerMove<T = unknown>(body: PlayerMoveDto, req?: FastifyRequest): Promise<T> {
    const result = await this.request<T>('post', '/api/game/playermove', body, req);
    if (body.gameId) {
      this.gameGateway.emitGameUpdated(body.gameId);
    }
    return result;
  }

  private buildHeaders(req?: FastifyRequest): Record<string, string> {
    const headers: Record<string, string> = {};

    const user = (req as RequestWithUser | undefined)?.user;

    if (user) {
      headers['x-user-id'] = String(user.sub);
      headers['x-user-username'] = user.username;
      headers['x-user-email'] = user.email;
      headers['x-user-roles'] = user.roles.join(',');
    }

    const allowedPassThrough = [
      'authorization',
      'x-request-id',
    ];

    for (const key of allowedPassThrough) {
      const value = req?.headers?.[key];
      if (typeof value === 'string') {
        headers[key] = value;
      }
    }

    return headers;
  }

  private async request<T>(
    method: 'get' | 'post' | 'delete' | 'put',
    path: string,
    body?: any,
    req?: FastifyRequest,
  ): Promise<T> {

    const headers = this.buildHeaders(req);
    const config = { headers };

    const res =
      method === 'get' || method === 'delete'
        ? await lastValueFrom(this.http[method]<T>(path, config))
        : await lastValueFrom(this.http[method]<T>(path, body, config));

    return res.data;
  }
}
