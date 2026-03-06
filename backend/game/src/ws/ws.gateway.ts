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

interface GuestTokenPayload {
  sub: string;
  username: string;
  isGuest: true;
}

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

export class WsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private engine: EngineService,
    private chat: ChatService
  ) {}

  private getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return secret;
  }

  // Auth from cookies - guest_token takes precedence if present
  handleConnection(client: TypedSocket): void {
    try {
      const cookieHeader = client.handshake.headers.cookie;
      if (!cookieHeader) {
        console.log('WS auth failed: no cookies');
        client.disconnect(true);
        return;
      }

      const cookies = Object.fromEntries(
        cookieHeader.split(';').map(c => {
          const [key, ...vals] = c.trim().split('=');
          return [key, vals.join('=')];
        })
      );

      // Check guest_token FIRST - if user is playing as guest, use guest identity
      const guestToken = cookies['guest_token'];
      if (guestToken) {
        const decoded = jwt.verify(guestToken, this.getJwtSecret()) as unknown as GuestTokenPayload;

        if (decoded.isGuest !== true || !decoded.sub || !decoded.username) {
          throw new Error('Invalid guest token payload');
        }

        client.user = {
          sub: decoded.sub,  // Keep as string (UUID) for guests
          username: decoded.username,
          email: '',
          roles: ['guest'],
        };

        console.log("WS connected guest", decoded.username);
        return;
      }

      // Fall back to JWT token for logged-in users
      const jwtToken = cookies['access_token'];
      if (jwtToken) {
        const decoded = jwt.verify(jwtToken, this.getJwtSecret()) as unknown as AccessTokenPayload;

        if (!decoded.sub || !decoded.username) {
          throw new Error('Invalid access token payload');
        }

        client.user = {
          sub: decoded.sub,
          username: decoded.username,
          email: decoded.email ?? '',
          roles: decoded.roles ?? ['user'],
        };

        console.log('WS connected JWT user', decoded.username);
        return;
      }

      console.log('WS auth failed: no valid JWT or guest token');
      client.disconnect(true);

    } catch (error) {
      console.error('WS auth failed', error instanceof Error ? error.message : error);
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
  // Game / Lobby / Play
  // --------------------

  @SubscribeMessage('joinLobby')
  handleJoinLobby(
      @MessageBody() data: { gameId: string },
      @ConnectedSocket() client: TypedSocket,
  ) {
    // Validate user
    const user = client.user;
    if (!user) {
      console.log("!!!WE HAVE NO USER!!!: ");
      return client.disconnect(true);
    }

    const state = this.engine.getGameState(data.gameId);

    console.log("LOBBY_UPDATE_START");
    console.log("LOBBY_USER: ", user.username);
    // console.log("Game state:", JSON.stringify(state, null, 2));

    if (!state) {
      console.log("GAME_NOT_FOUND");
      return client.emit("error", { error: "GAME_NOT_FOUND" });
    }
    if (state.phase !== "LOBBY") {
      console.log("LOBBY_CLOSED");
      return client.emit("error", { error: "LOBBY_CLOSED" });
    }

    const room = `lobby:${data.gameId}`;
    void client.join(room);

      const playersWithNames = state.players.map(p => ({
      id: p.id,
      displayName: p.name, // or username
    }));

    const host = playersWithNames.find(p => p.id === state.hostId);

    console.log('LOBBY_USER:', user.username, user.roles.includes('guest') ? '(guest)' : '');
    console.log("Players: ", playersWithNames);
    console.log("Spectators: ", state.rules.allowSpectators);

    this.server.to(room).emit('lobbyUpdate', {
    gameId: data.gameId,
    host: host?.displayName ?? "Unknown",
    players: playersWithNames,
    rules: state.rules,
    phase: state.phase,
    });
  }

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

  @SubscribeMessage("lobbyMessage")
  handleLobbyMessage(
    @MessageBody()
    payload: { gameId: string; message: string },
    @ConnectedSocket() client: TypedSocket,
  ) {
    const user = client.user;
    if (!user) return client.disconnect(true);

    console.log("CHAT_USER: ", user.username);

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

  @SubscribeMessage('joinPlay')
  handleJoinPlay(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: TypedSocket,
  ) {
    const state = this.engine.getGameState(data.gameId);

    if (!state) {
      return client.emit("error", { error: "GAME_NOT_FOUND" });
    }
    if (state.phase !== "PLAY") {
      return client.emit("error", { error: "GAME_NOT_IN_PLAY" });
    }

    const room = `play:${data.gameId}`;
    void client.join(room);

    // Send initial state immediately
    client.emit("playUpdate", {
      phase: "PLAY",
      board: state.board,
      players: state.players,
      playerProgress: state.playerProgress,
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
}

