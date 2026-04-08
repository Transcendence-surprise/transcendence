import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { randomUUID } from 'node:crypto';
import { EngineService } from '../game/services/engine.service.nest';
import { ChatMessage, ChatService } from '../chat/chat.service';
import jwt from 'jsonwebtoken';
import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';

interface AccessTokenPayload {
  sub: number;
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

type TypedSocket = Socket & { user?: WsUser };

@WebSocketGateway({
    cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})

export class WsGateway implements OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  server: Server;

  private timeoutTicker?: NodeJS.Timeout;

  constructor(
    private engine: EngineService,
    private chat: ChatService
  ) {}

  onModuleInit(): void {
    this.timeoutTicker = setInterval(() => {
      const endedGames = this.engine.evaluateSinglePlayerTimeouts();
      const multiTimeoutEvents = this.engine.evaluateMultiPlayerTimeouts();
      for (const game of endedGames) {
        this.sendPlayUpdate(game.gameId);
        game.playerIds.forEach((id) => this.sendPlayerStatusUpdate(id));
        game.spectatorIds.forEach((id) => this.sendPlayerStatusUpdate(id));
      }

      for (const event of multiTimeoutEvents) {
        if (event.type === "PLAY_UPDATE") {
          this.sendPlayUpdate(event.gameId);
          continue;
        }

        if (event.deleteGame) {
          event.playerIds.forEach((id) => this.sendPlayerStatusUpdate(id));
          event.spectatorIds.forEach((id) => this.sendPlayerStatusUpdate(id));
          this.sendGameDeleted(event.gameId);
          continue;
        }

        event.removedPlayerIds.forEach((id) => this.sendPlayerStatusUpdate(id));
        this.sendPlayUpdate(event.gameId);
      }
    }, 1000);
  }

  onModuleDestroy(): void {
    if (this.timeoutTicker) {
      clearInterval(this.timeoutTicker);
    }
  }

  private getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return secret;
  }

  // Auth from cookies - guest and user flows share access_token
  handleConnection(client: TypedSocket): void {
    try {
      const cookieHeader = client.handshake.headers.cookie;
      if (!cookieHeader) {
        // console.log('WS auth failed: no cookies');
        client.disconnect(true);
        return;
      }

      const cookies = Object.fromEntries(
        cookieHeader.split(';').map(c => {
          const [key, ...vals] = c.trim().split('=');
          return [key, vals.join('=')];
        })
      );

      let user: WsUser | null = null;

      // Check access_token FIRST - logged-in users take precedence over guest
      const jwtToken = cookies['access_token'];
      if (!jwtToken) {
        // console.log('WS auth failed: no access_token');
        client.disconnect(true);
        return;
      }

      const decoded = jwt.verify(jwtToken, this.getJwtSecret()) as unknown as AccessTokenPayload;

      if (!decoded.sub || !decoded.username) {
        throw new Error('Invalid access token payload');
      }

      user = {
        sub: decoded.sub,
        username: decoded.username,
        email: decoded.email ?? '',
        roles: decoded.roles ?? ['user'],
      };

      // console.log('WS connected user', decoded.username);

      // Attach the user to the client
      client.user = user;
      // Join per-user room for playerStatus updates
      void client.join(`user:${user.sub.toString()}`);
      // console.log(`User ${user.username} joined room: user:${user.sub.toString()}`);

    } catch (error) {
      // console.error('WS auth failed', error instanceof Error ? error.message : error);
      client.disconnect(true);
    }

  }

  // // --------------------
  // // Generic room control
  // // --------------------

  @SubscribeMessage('joinRoom') // Lets the frontend decide which room to join
  handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: TypedSocket,
  ) {
    void client.join(data.room);
    client.emit('joinedRoom', data.room);
  }

  // Leave room
  @SubscribeMessage('leaveRoom') // Cleanly removes a socket from a room
  handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: TypedSocket,
  ) {
    void client.leave(data.room);
  }

  // Send message to room
  sendToRoom(room: string, event: string, payload: unknown) {
    this.server.to(room).emit(event, payload);
  }

  // --------------------
  // JOIN LOBBY
  // --------------------

  @SubscribeMessage('joinLobby')
  handleJoinLobby(
      @MessageBody() data: { gameId: string },
      @ConnectedSocket() client: TypedSocket,
  ) {
    // Validate user
    const user = client.user;
    if (!user) {
      // console.log("!!!WE HAVE NO USER!!!: ");
      return client.disconnect(true);
    }

    // Validate game existence and phase before joining lobby
    const state = this.engine.getGameState(data.gameId);
    if (!state) {
      // console.log("GAME_NOT_FOUND");
      return client.emit("error", { error: "GAME_NOT_FOUND" });
    }
    if (state.phase !== "LOBBY") {
      // console.log("LOBBY_CLOSED");
      return client.emit("error", { error: "LOBBY_CLOSED" });
    }

    const room = `lobby:${data.gameId}`;
    void client.join(room);

    this.sendLobbyUpdate(data.gameId);
  }

  sendLobbyUpdate(gameId: string) {
    const state = this.engine.getGameState(gameId);
    if (!state) return;

    const playersWithNames = state.players.map(p => ({
      id: p.id,
      displayName: p.name,
    }));

    // Normalize both sides to string to ensure correct host resolution.
    const host = playersWithNames.find(p => String(p.id) === String(state.hostId));

    // Emit to the lobby room
    this.sendToRoom(`lobby:${gameId}`, 'lobbyUpdate', {
      gameId,
      host: host?.displayName ?? "Unknown",
      players: playersWithNames,
      rules: state.rules,
      phase: state.phase,
    });
  }

// GAME DELETED - notify clients in lobby that game was deleted (host left)

  sendGameDeleted(gameId: string) {
    // Emit to the lobby room so everyone sees it
    this.sendToRoom(`lobby:${gameId}`, "lobbyDeleted", { gameId });
    this.sendToRoom(`play:${gameId}`, "gameDeleted", { gameId });
    // console.log(`Game ${gameId} deleted, all clients notified`);
  }

// MULTIPLAYER GAMES TABLE

  @SubscribeMessage('joinMultiplayerList')
  handleJoinMultiplayerList(
    @ConnectedSocket() client: TypedSocket,
  ) {
    void client.join('multiplayer:list');
      this.server.to(client.id).emit("multiplayerListUpdate", {
      games: this.engine.getMultiGames(),
      });
  }

  sendMultiplayerListUpdate() {
    const games = this.engine.getMultiGames();
    this.server.to("multiplayer:list").emit("multiplayerListUpdate", {
      games,
    });
  }

// LOBBY CHAT

  @SubscribeMessage("lobbyMessage")
  handleLobbyMessage(
    @MessageBody()
    payload: { gameId: string; message: string },
    @ConnectedSocket() client: TypedSocket,
  ) {
    const user = client.user;
    if (!user) return client.disconnect(true);

    // console.log("CHAT_USER: ", user.username);

    const state = this.engine.getGameState(payload.gameId);

    if (!state) {
      return client.emit("error", { error: "GAME_NOT_FOUND" });
    }

    const isInLobby =
      state.players.some(p => p.id === user.sub) ||
      state.spectators.some(s => s.id === user.sub);

    if (!isInLobby) {
      return this.server
        .to(`lobby:${payload.gameId}`)
        .emit("error", { error: "NOT_IN_LOBBY" });
    }

    if (!payload.message.trim()) {
      return this.server
        .to(`lobby:${payload.gameId}`)
        .emit("error", { error: "EMPTY_MESSAGE" });
    }

    const chatMessage = {
      userName: user.username,
      message: payload.message,
      timestamp: Date.now(),
    };

    this.server
      .to(`lobby:${payload.gameId}`)
      .emit("lobbyMessage", chatMessage);
  }

// START GAME - send initial game state to all players in the play room

  @SubscribeMessage('joinPlay')
  handleJoinPlay(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: TypedSocket,
  ) {
    const room = `play:${data.gameId}`;
    void client.join(room);

    

    // Send initial state immediately
    this.sendPlayUpdate(data.gameId);
  }

  sendPlayUpdate(gameId: string) {
    const state = this.engine.getGameState(gameId);
    if (!state) return;

    this.sendToRoom(`play:${gameId}`, "playUpdate", {
      phase: state.phase,
      board: state.board,
      players: state.players,
      playerProgress: state.playerProgress,
      currentPlayerId: state.currentPlayerId,
      gameStartedAt: state.gameStartedAt,
      moveStartedAt: state.moveStartedAt,
      moveLimitPerTurnSec: state.rules.moveLimitPerTurnSec,
      boardActionsPending: state.boardActionsPending,
      gameResult: state.gameResult ? { winnerIds: [state.gameResult.winnerId] } : undefined,
      endReason: state.endReason,
    });
  }

  //GLOBAL CHAT

  @SubscribeMessage("joinGlobalChat")
  handleJoinGlobalChat(@ConnectedSocket() client: TypedSocket) {
    const user = client.user;
    if (!user) return client.disconnect(true);

    const room = "chat:global";
    void client.join(room);

    const history = this.chat.getMessages(100);

    // send history
    client.emit("chatHistory", history);
  }

  @SubscribeMessage("chatMessage")
  handleChatMessage(
  @MessageBody() payload: { content: string; replyTo?: string },
  @ConnectedSocket() client: TypedSocket,
  ) {
    const user = client.user;
    if (!user) return client.disconnect(true);

    // Validate payload shape before processing
    if (typeof payload?.content !== 'string') {
      client.emit('error', { message: 'Invalid message format: content must be a string' });
      return;
    }

    const content = payload.content.trim();
    if (!content) return;                    // ignore empty messages

    // Validate replyTo if provided
    if (payload.replyTo !== undefined && typeof payload.replyTo !== 'string') {
      client.emit('error', { message: 'Invalid message format: replyTo must be a string' });
      return;
    }

    const message: ChatMessage = {
      id: randomUUID(),
      userId: user.sub,
      username: user.username,
      content,
      timestamp: Date.now(),
      replyTo: payload.replyTo,
    };

    this.chat.addMessage(message);
    this.server.to("chat:global").emit("chatMessage", message);
  }

  // PLAYER STATUS CHECK (for game entry/lobby and status dot)

  @SubscribeMessage("checkPlayerStatus")
  handleCheckPlayerStatus(@ConnectedSocket() client: TypedSocket) {
    const user = client.user;
    // console.log(`Checking player status for user: ${user?.username}`);
    if (!user) return client.disconnect(true);
    // console.log(`Second try Checking player status for user: ${user.username}`);
    try {
      const result = this.engine.checkPlayerAvailability(user.sub);
      // console.log(`Player status for ${user.username}:`, result);
      client.emit("playerStatus", {
        ok: result.ok,
        gameId: result.gameId,
        phase: result.phase || "LOBBY",
      });
    } catch (err) {
      console.error("Player status check failed:", err);
      client.emit("playerStatus", { ok: false, phase: "LOBBY" });
    }
  }

  sendPlayerStatusUpdate(playerId: string | number) {
    const result = this.engine.checkPlayerAvailability(playerId);

    // 🔹 Emit to per-user room instead of using sockets.get()
    this.server.to(`user:${playerId.toString()}`).emit("playerStatus", {
      ok: result.ok,
      gameId: result.gameId,
      phase: result.phase || "LOBBY",
    });

    // console.log(`Sent playerStatus update to user:${playerId}`, {
    //   ok: result.ok,
    //   gameId: result.gameId,
    //   phase: result.phase,
    // });
  }
}