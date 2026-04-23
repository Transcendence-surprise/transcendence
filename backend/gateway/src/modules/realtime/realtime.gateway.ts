import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { FastifyRequest } from 'fastify';
import { Server, Socket } from 'socket.io';
import { BadgeHttpService } from '../badges/badge.service';
import { ChatHttpService } from '../chat/chat.service';
import { GameHttpService } from '../game/game.service';

interface JwtPayload {
  sub: number | string;
  username: string;
  email: string;
  roles: string[];
}

interface WsUser {
  sub: number | string;
  username: string;
  email: string;
  roles: string[];
}

interface GameStatePayload {
  ok?: boolean;
  error?: string;
  state?: {
    phase?: string;
    board?: unknown;
    players?: Array<{ id: string | number; name?: string; username?: string; displayName?: string }>;
    rules?: unknown;
    hostId?: string | number;
    playerProgress?: unknown;
    playerProgressById?: Record<string, unknown>;
    currentPlayerId?: string | number;
    gameStartedAt?: number;
    moveStartedAt?: number;
    moveLimitPerTurnSec?: number;
    boardActionsPending?: unknown;
    gameResult?: { winnerIds?: Array<string | number>; winnerId?: string | number };
    endReason?: string | null;
    spectators?: Array<{ id: string | number }>;
  };
  gameId?: string;
  phase?: string;
  board?: unknown;
  players?: Array<{ id: string | number; name?: string; username?: string; displayName?: string }>;
  rules?: unknown;
  hostId?: string | number;
  playerProgress?: unknown;
  playerProgressById?: Record<string, unknown>;
  currentPlayerId?: string | number;
  gameStartedAt?: number;
  moveStartedAt?: number;
  moveLimitPerTurnSec?: number;
  boardActionsPending?: unknown;
  gameResult?: { winnerIds?: Array<string | number>; winnerId?: string | number };
  endReason?: string | null;
  spectators?: Array<{ id: string | number }>;
}

interface ResolvedGameState {
  phase?: string;
  board?: unknown;
  players?: Array<{ id: string | number; name?: string; username?: string; displayName?: string }>;
  rules?: any;
  hostId?: string | number;
  playerProgress?: unknown;
  playerProgressById?: Record<string, unknown>;
  currentPlayerId?: string | number;
  gameStartedAt?: number;
  moveStartedAt?: number;
  moveLimitPerTurnSec?: number;
  boardActionsPending?: unknown;
  gameResult?: { winnerIds?: Array<string | number>; winnerId?: string | number };
  endReason?: string | null;
  spectators?: Array<{ id: string | number }>;
}

type TypedSocket = Socket & { user?: WsUser };

@Injectable()
@WebSocketGateway({
  path: '/rt/socket.io/',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private readonly userSockets = new Map<number, Set<string>>();
  private readonly playRoomContext = new Map<string, FastifyRequest>();
  private readonly finishedGameBadgeUpdates = new Set<string>();
  private playTicker?: NodeJS.Timeout;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatHttpService,
    private readonly gameService: GameHttpService,
    private readonly badgeService: BadgeHttpService,
  ) {}

  private normalizePresenceUserId(userId: number | string): number | null {
    const normalized = Number(userId);
    if (!Number.isInteger(normalized) || normalized <= 0) {
      return null;
    }
    return normalized;
  }

  private parseCookie(cookieHeader?: string): Record<string, string> {
    if (!cookieHeader) return {};

    return Object.fromEntries(
      cookieHeader
        .split(';')
        .map((chunk) => chunk.trim())
        .filter((chunk) => chunk.includes('='))
        .map((chunk) => {
          const [key, ...valueParts] = chunk.split('=');
          return [key, decodeURIComponent(valueParts.join('='))];
        }),
    );
  }

  private async authenticate(client: TypedSocket): Promise<WsUser> {
    const cookieHeader = client.handshake.headers.cookie;
    const cookies = this.parseCookie(cookieHeader);
    const token = cookies['access_token'];

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    const decoded = await this.jwtService.verifyAsync<JwtPayload>(token);

    const hasValidSub =
      decoded?.sub !== undefined &&
      decoded?.sub !== null &&
      String(decoded.sub).trim().length > 0;

    if (!hasValidSub || !decoded?.username) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const normalizedNumericId = this.normalizePresenceUserId(decoded.sub);
    const isGuest = Array.isArray(decoded.roles) && decoded.roles.includes('guest');
    const finalUserId = isGuest ? String(decoded.sub) : (normalizedNumericId ?? Number(decoded.sub));

    return {
      sub: finalUserId,
      username: decoded.username,
      email: decoded.email ?? '',
      roles: Array.isArray(decoded.roles) ? decoded.roles : [],
    };
  }

  private markUserConnected(userId: number, socketId: string): void {
    const sockets = this.userSockets.get(userId);
    const wasOnline = Boolean(sockets && sockets.size > 0);

    if (!sockets) {
      this.userSockets.set(userId, new Set([socketId]));
    } else {
      sockets.add(socketId);
    }

    if (!wasOnline) {
      this.server.to(`presence:user:${userId}`).emit('presence:update', {
        userId,
        isOnline: true,
      });
    }
  }

  private markUserDisconnected(userId: number, socketId: string): void {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;

    sockets.delete(socketId);

    if (sockets.size === 0) {
      this.userSockets.delete(userId);
      this.server.to(`presence:user:${userId}`).emit('presence:update', {
        userId,
        isOnline: false,
      });
    }
  }

  private getPresenceStatuses(userIds: number[]) {
    return userIds.map((userId) => ({
      userId,
      isOnline: this.userSockets.has(userId),
    }));
  }

  private buildRequestFromUser(user: WsUser): FastifyRequest {
    return {
      headers: {
        'x-user-id': String(user.sub),
        'x-user-username': user.username,
        'x-user-email': user.email,
        'x-user-roles': Array.isArray(user.roles) ? user.roles.join(',') : String(user.roles),
      },
      user,
    } as unknown as FastifyRequest;
  }

  private buildRequestFromSocket(client: TypedSocket): FastifyRequest {
    if (!client.user) {
      throw new UnauthorizedException('Missing authenticated user context');
    }

    return this.buildRequestFromUser(client.user);
  }

  sendToRoom(room: string, event: string, payload: unknown) {
    this.server.to(room).emit(event, payload);
  }

  onModuleInit(): void {
    this.playTicker = setInterval(async () => {
      try {
        const roomNames = Array.from(this.server.sockets.adapter.rooms.keys()).filter((room) =>
          room.startsWith('play:'),
        );

        const activeGameIds = new Set<string>();

        for (const roomName of roomNames) {
          const room = this.server.sockets.adapter.rooms.get(roomName);
          if (!room || room.size === 0) continue;

          const gameId = roomName.slice('play:'.length);
          if (!gameId) continue;
          activeGameIds.add(gameId);

          await this.sendPlayUpdate(gameId);
        }

        for (const trackedGameId of Array.from(this.playRoomContext.keys())) {
          if (!activeGameIds.has(trackedGameId)) {
            this.playRoomContext.delete(trackedGameId);
          }
        }
      } catch (error) {
        this.logger.warn(
          `Realtime play ticker failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }, 1000);
  }

  onModuleDestroy(): void {
    if (this.playTicker) {
      clearInterval(this.playTicker);
    }
  }

  async handleConnection(client: TypedSocket): Promise<void> {
    try {
      const user = await this.authenticate(client);
      client.user = user;

      void client.join(`user:${user.sub}`);
      const presenceUserId = this.normalizePresenceUserId(user.sub);
      if (presenceUserId !== null) {
        this.markUserConnected(presenceUserId, client.id);
      }
    } catch (error) {
      this.logger.warn(
        `Realtime WS auth failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: TypedSocket): void {
    const userId = client.user?.sub;
    if (userId === undefined || userId === null) return;

    const presenceUserId = this.normalizePresenceUserId(userId);
    if (presenceUserId !== null) {
      this.markUserDisconnected(presenceUserId, client.id);
    }
  }

  @SubscribeMessage('presence:subscribe')
  handlePresenceSubscribe(
    @MessageBody() data: { userIds?: Array<number | string> },
    @ConnectedSocket() client: TypedSocket,
  ) {
    if (!client.user) return client.disconnect(true);

    const normalizedIds = Array.from(
      new Set(
        (data?.userIds ?? [])
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0),
      ),
    );

    normalizedIds.forEach((userId) => {
      void client.join(`presence:user:${userId}`);
    });

    client.emit('presence:snapshot', {
      statuses: this.getPresenceStatuses(normalizedIds),
    });
  }

  @SubscribeMessage('presence:unsubscribe')
  handlePresenceUnsubscribe(
    @MessageBody() data: { userIds?: Array<number | string> },
    @ConnectedSocket() client: TypedSocket,
  ) {
    const normalizedIds = Array.from(
      new Set(
        (data?.userIds ?? [])
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0),
      ),
    );

    normalizedIds.forEach((userId) => {
      void client.leave(`presence:user:${userId}`);
    });
  }

  emitFriendsUpdateMany(userIds: Array<number | string>) {
    const normalizedIds = Array.from(
      new Set(
        userIds
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0),
      ),
    );

    normalizedIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit('friends:update', {
        userId,
        updatedAt: Date.now(),
      });
    });
  }

  async sendMultiplayerListUpdate() {
    const games = await this.gameService.getMultiplayerGames();
    this.server.to('multiplayer:list').emit('multiplayerListUpdate', {
      games,
    });
  }

  async sendLobbyUpdate(gameId: string, req?: FastifyRequest) {
    const state = await this.resolveGameStateForRealtime(gameId, req);
    if (!state) {
      this.sendGameDeleted(gameId);
      this.playRoomContext.delete(gameId);
      return;
    }

    const playersWithNames = (state.players ?? []).map((player) => ({
      id: player.id,
      displayName: player.displayName ?? player.name ?? player.username ?? String(player.id),
    }));

    const host = playersWithNames.find((player) => String(player.id) === String(state.hostId));

    this.sendToRoom(`lobby:${gameId}`, 'lobbyUpdate', {
      gameId,
      host: host?.displayName ?? 'Unknown',
      hostId: state.hostId,
      players: playersWithNames,
      rules: state.rules,
      phase: state.phase,
    });
  }

  async sendPlayUpdate(gameId: string, req?: FastifyRequest) {
    const state = await this.resolveGameStateForRealtime(gameId);
    if (!state) {
      this.sendGameDeleted(gameId);
      this.playRoomContext.delete(gameId);
      this.finishedGameBadgeUpdates.delete(gameId);
      return;
    }

    this.sendToRoom(`play:${gameId}`, 'playUpdate', {
      phase: state.phase,
      board: state.board,
      players: state.players,
      playerProgress: state.playerProgress,
      playerProgressById: state.playerProgressById,
      currentPlayerId: state.currentPlayerId,
      gameStartedAt: state.gameStartedAt,
      moveStartedAt: state.moveStartedAt,
      moveLimitPerTurnSec: state.moveLimitPerTurnSec,
      boardActionsPending: state.boardActionsPending,
      gameResult: state.gameResult
        ? { winnerIds: state.gameResult.winnerIds ?? [state.gameResult.winnerId] }
        : undefined,
      endReason: state.endReason,
    });

    if (state.phase === 'FINISHED') {
      await this.handleGameFinished(gameId, state);
    }
  }

  private async handleGameFinished(gameId: string, state: ResolvedGameState): Promise<void> {
    if (this.finishedGameBadgeUpdates.has(gameId)) {
      return;
    }

    this.finishedGameBadgeUpdates.add(gameId);

    try {
      const participantIds = Array.from(
        new Set(
          (state.players ?? [])
            .map((player) => this.normalizePresenceUserId(player.id))
            .filter((id): id is number => id !== null),
        ),
      );

      if (!participantIds.length) {
        return;
      }

      const winnerSource = state.gameResult?.winnerIds ?? (state.gameResult?.winnerId !== undefined
        ? [state.gameResult.winnerId]
        : []);
      const winnerIds = new Set(
        winnerSource
          .map((winnerId) => this.normalizePresenceUserId(winnerId))
          .filter((id): id is number => id !== null),
      );

      await Promise.all(
        participantIds.map((userId) =>
          this.badgeService.unlockByKey({ userId, key: 'first-game' }),
        ),
      );

      const winnerPromises = participantIds
        .filter((userId) => winnerIds.has(userId))
        .map((userId) => this.badgeService.increment({ userId, type: 'games', value: 1 }));

      if (winnerPromises.length) {
        await Promise.all(winnerPromises);
      }
    } catch (error) {
      this.finishedGameBadgeUpdates.delete(gameId);
      this.logger.warn(
        `Failed to process game finished badges for game ${gameId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async sendPlayerStatusUpdate(userId: string | number, req?: FastifyRequest) {
    const result = await this.gameService.checkPlayerAvailability(req);
    this.server.to(`user:${userId.toString()}`).emit('playerStatus', {
      ok: (result as any)?.ok,
      gameId: (result as any)?.gameId,
      phase: (result as any)?.phase || 'LOBBY',
    });
  }

  sendGameDeleted(gameId: string) {
    this.sendToRoom(`lobby:${gameId}`, 'lobbyDeleted', { gameId });
    this.sendToRoom(`play:${gameId}`, 'gameDeleted', { gameId });
    this.finishedGameBadgeUpdates.delete(gameId);
  }

  private async resolveGameStateForRealtime(
    gameId: string,
    req?: FastifyRequest,
  ): Promise<ResolvedGameState | null> {
    if (req) {
      try {
        const privateResult = await this.gameService.getGameState<GameStatePayload>(gameId, req);
        const privateState = privateResult?.state;
        if (privateState) {
          return privateState;
        }
      } catch {
        // fall through to internal state endpoint
      }
    }

    try {
      const internalResult = await this.gameService.getGameStateInternal<GameStatePayload>(gameId);
      if ((internalResult as any)?.ok === false && (internalResult as any)?.error === 'GAME_NOT_FOUND') {
        return null;
      }

      const internalState = internalResult?.state ?? internalResult;
      if (!internalState || !(internalState as any).phase) {
        return null;
      }

      return internalState as ResolvedGameState;
    } catch {
      return null;
    }
  }

  @SubscribeMessage('joinMultiplayerList')
  async handleJoinMultiplayerList(@ConnectedSocket() client: TypedSocket) {
    if (!client.user) return client.disconnect(true);
    void client.join('multiplayer:list');
    const games = await this.gameService.getMultiplayerGames(this.buildRequestFromSocket(client));
    this.server.to(client.id).emit('multiplayerListUpdate', { games });
  }

  @SubscribeMessage('joinLobby')
  async handleJoinLobby(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: TypedSocket,
  ) {
    const user = client.user;
    if (!user) return client.disconnect(true);

    const result = await this.gameService.getGameState<GameStatePayload>(data.gameId, this.buildRequestFromSocket(client));
    const state = result?.state ?? result;
    if (!state) return client.emit('error', { error: 'GAME_NOT_FOUND' });
    if (state.phase !== 'LOBBY') return client.emit('error', { error: 'LOBBY_CLOSED' });

    void client.join(`lobby:${data.gameId}`);
    await this.sendLobbyUpdate(data.gameId, this.buildRequestFromSocket(client));
  }

  @SubscribeMessage('joinPlay')
  async handleJoinPlay(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: TypedSocket,
  ) {
    const user = client.user;
    if (!user) return client.disconnect(true);

    void client.join(`play:${data.gameId}`);
    this.playRoomContext.set(data.gameId, this.buildRequestFromSocket(client));
    await this.sendPlayUpdate(data.gameId, this.buildRequestFromSocket(client));
  }

  @SubscribeMessage('lobbyMessage')
  async handleLobbyMessage(
    @MessageBody() payload: { gameId: string; message: string },
    @ConnectedSocket() client: TypedSocket,
  ) {
    const user = client.user;
    if (!user) return client.disconnect(true);

    const result = await this.gameService.getGameState<GameStatePayload>(payload.gameId, this.buildRequestFromSocket(client));
    const state = result?.state ?? result;
    if (!state) return client.emit('error', { error: 'GAME_NOT_FOUND' });

    const isInLobby =
      (state.players ?? []).some((player) => player.id === user.sub) ||
      (state.spectators ?? []).some((spectator) => spectator.id === user.sub);

    if (!isInLobby) {
      return this.server.to(`lobby:${payload.gameId}`).emit('error', { error: 'NOT_IN_LOBBY' });
    }

    if (!payload.message.trim()) {
      return this.server.to(`lobby:${payload.gameId}`).emit('error', { error: 'EMPTY_MESSAGE' });
    }

    this.server.to(`lobby:${payload.gameId}`).emit('lobbyMessage', {
      userName: user.username,
      message: payload.message,
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage('playMessage')
  async handlePlayMessage(
    @MessageBody() payload: { gameId: string; message: string },
    @ConnectedSocket() client: TypedSocket,
  ) {
    const user = client.user;
    if (!user) return client.disconnect(true);

    const result = await this.gameService.getGameState<GameStatePayload>(payload.gameId, this.buildRequestFromSocket(client));
    const state = result?.state ?? result;
    if (!state) return client.emit('error', { error: 'GAME_NOT_FOUND' });

    const isInGame =
      (state.players ?? []).some((player) => player.id === user.sub) ||
      (state.spectators ?? []).some((spectator) => spectator.id === user.sub);

    if (!isInGame) {
      return client.emit('error', { error: 'NOT_IN_GAME' });
    }

    if (!payload.message.trim()) {
      return client.emit('error', { error: 'EMPTY_MESSAGE' });
    }

    this.server.to(`play:${payload.gameId}`).emit('playMessage', {
      userName: user.username,
      message: payload.message,
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage('checkPlayerStatus')
  async handleCheckPlayerStatus(@ConnectedSocket() client: TypedSocket) {
    const user = client.user;
    if (!user) return client.disconnect(true);

    try {
      const result = await this.gameService.checkPlayerAvailability(this.buildRequestFromSocket(client));
      client.emit('playerStatus', {
        ok: (result as any).ok,
        gameId: (result as any).gameId,
        phase: (result as any).phase || 'LOBBY',
      });
    } catch (error) {
      this.logger.error(
        `Player status check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      client.emit('playerStatus', { ok: false, phase: 'LOBBY' });
    }
  }

  @SubscribeMessage('joinGlobalChat')
  async handleJoinGlobalChat(@ConnectedSocket() client: TypedSocket) {
    const user = client.user;
    if (!user) return client.disconnect(true);

    const room = 'chat:global';
    void client.join(room);

    try {
      const history = await this.chatService.getHistory(user);
      client.emit('chatHistory', history);
    } catch (error) {
      this.logger.warn(
        `Failed to load global chat history: ${error instanceof Error ? error.message : String(error)}`,
      );
      client.emit('chatHistory', []);
    }
  }

  @SubscribeMessage('chatMessage')
  async handleChatMessage(
    @MessageBody() payload: { content: string; replyTo?: string },
    @ConnectedSocket() client: TypedSocket,
  ) {
    const user = client.user;
    if (!user) return client.disconnect(true);

    if (typeof payload?.content !== 'string') {
      client.emit('error', { message: 'Invalid message format: content must be a string' });
      return;
    }

    const content = payload.content.trim();
    if (!content) return;

    if (payload.replyTo !== undefined && typeof payload.replyTo !== 'string') {
      client.emit('error', { message: 'Invalid message format: replyTo must be a string' });
      return;
    }

    try {
      const result = await this.chatService.addMessage(user, {
        content,
        replyTo: payload.replyTo,
      });

      if (!result.ok || !result.message) {
        client.emit('error', { message: result.error ?? 'Failed to send message' });
        return;
      }

      this.server.to('chat:global').emit('chatMessage', result.message);
    } catch (error) {
      this.logger.warn(
        `Failed to persist global chat message: ${error instanceof Error ? error.message : String(error)}`,
      );
      client.emit('error', { message: 'Failed to send message' });
    }
  }
}
