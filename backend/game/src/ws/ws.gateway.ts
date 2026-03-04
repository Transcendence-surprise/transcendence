import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EngineService } from '../game/services/engine.service.nest';
import jwt, { JwtPayload as JwtVerifyPayload } from 'jsonwebtoken';

interface WsUser {
  sub: number;
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

  constructor(private engine: EngineService) {}

  // JWT stored in 'access_token' cookie
  handleConnection(client: TypedSocket): void {
    try {
      // JWT from cookie
      const cookieHeader = client.handshake.headers.cookie;
      if (cookieHeader) {
        const token = cookieHeader
          .split(';')
          .map(c => c.trim())
          .find(c => c.startsWith('access_token='))
          ?.split('=')[1];

        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtVerifyPayload & {
            sub: number;
            username: string;
            email: string;
            roles: string[];
          };

          client.user = {
            sub: decoded.sub,
            username: decoded.username,
            email: decoded.email,
            roles: decoded.roles,
          };

          console.log('WS connected JWT user', decoded.username);
          return;
        }
      }

      // Guest from headers
      const { guestId, guestUsername } = client.handshake.auth as {
        guestId?: string;
        guestUsername?: string;
      } ?? {};

      if (guestId && guestUsername) {
        client.user = {
          sub: Number(guestId),
          username: guestUsername,
          email: "",
          roles: ["guest"],
        };
        console.log("WS connected guest", guestUsername);
        return;
      }

      console.log('WS auth failed: no valid JWT or guest headers');
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

}

