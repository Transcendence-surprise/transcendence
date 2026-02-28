import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EngineService } from '../game/services/engine.service.nest';
import jwt from 'jsonwebtoken';

type LobbyMessage = {
  userId: string;
  message: string;
  timestamp: number;
};


@WebSocketGateway({
    cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class WsGateway {
  @WebSocketServer()
  server: Server;

// Dont touch!!!

  constructor(private engine: EngineService) {}

  // JWT stored in 'access_token' cookie
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.cookie
        ?.split(';')
        .map(c => c.trim())
        .find(c => c.startsWith('access_token='))
        ?.split('=')[1];

      if (!token) {
        client.disconnect(true);
        return;
      }

      const user = jwt.verify(token, process.env.JWT_SECRET!);
      (client as any).user = user;
      console.log('WS connected for user', user);
    } catch (err) {
      console.log('WS auth failed', err);
      client.disconnect(true);
    }
  }

  // --------------------
  // Generic room control
  // --------------------

  @SubscribeMessage('joinRoom') // Lets the frontend decide which room to join
  handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.room);
    client.emit('joinedRoom', data.room);
  }

  // Leave room
  @SubscribeMessage('leaveRoom') // Cleanly removes a socket from a room
  handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.room);
  }

  // Send message to room
  sendToRoom(room: string, event: string, payload: any) { // Avoid repeating this.server.to(...).emit(...)
    this.server.to(room).emit(event, payload);
  }

  // --------------------
  // Game / Lobby logic
  // --------------------

  @SubscribeMessage('joinLobby')
  handleJoinLobby(
      @MessageBody() data: { gameId: string },
      @ConnectedSocket() client: Socket,
  ) {
    // Validate user
    const user = (client as any).user;
      if (!user) return client.disconnect(true);

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
      client.join(room);

        const playersWithNames = state.players.map(p => ({
        id: p.id,
        displayName: p.name, // or username
      }));

      const host = playersWithNames.find(p => p.id === state.hostId);

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
    @ConnectedSocket() client: Socket,
  ) {
    client.join('multiplayer:list');
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
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
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
        .to(`lobby:${user.gameId}`)
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
    @MessageBody() data: { gameId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const state = this.engine.getGameState(data.gameId);

    if (!state) {
      return client.emit("error", { error: "GAME_NOT_FOUND" });
    }
    if (state.phase !== "PLAY") {
      return client.emit("error", { error: "GAME_NOT_IN_PLAY" });
    }

    const room = `play:${data.gameId}`;
    client.join(room);

    // Send initial state immediately
    client.emit("playUpdate", {
      phase: "PLAY",
      board: state.board,
      players: state.players,
      playerProgress: state.playerProgress,
    });
  }

  // --------------------
  // Something else
  // --------------------

}

