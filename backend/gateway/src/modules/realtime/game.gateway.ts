import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameStatePayload } from './models/models';
import type { TypedSocket } from './models/models';

@WebSocketGateway({
  path: '/rt/socket.io/',
  cors: { origin: true, credentials: true },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;


  @SubscribeMessage('game:join')
  handleJoinGame(
    @MessageBody() { gameId }: { gameId: string },
    @ConnectedSocket() client: TypedSocket
  ) {
    client.join(`game:${gameId}`);
    client.join(`lobby:${gameId}`);
    client.join(`play:${gameId}`);
  }

  @SubscribeMessage('game:leave')
  handleLeaveGame(
    @MessageBody() { gameId }: { gameId: string },
    @ConnectedSocket() client: TypedSocket
  ) {
    client.leave(`game:${gameId}`);
    client.leave(`lobby:${gameId}`);
    client.leave(`play:${gameId}`);
  }

  emitGameUpdated(gameId: string) {

    console.log(`Emitting game:updated for gameId ${gameId}`);
    this.server.to(`game:${gameId}`).emit('game:updated', { gameId });
  }

  emitLobbyUpdated(gameId: string) {
    console.log(`Emitting lobby:updated for gameId ${gameId}`);
    this.server.to(`lobby:${gameId}`).emit('lobby:updated', { gameId });
  }

  emitPlayerAvailabilityUpdated() {
    console.log(`playerAvailability:updated`);
    this.server.emit('playerAvailability:updated');
  }

  emitMultiplayerGamesListUpdated() {
    console.log(`multiplayerGamesList:updated`);
    this.server.emit('multiplayerGamesList:updated');
  }

  @SubscribeMessage('lobbyMessage')
  async handleLobbyMessage(
    @MessageBody() payload: { gameId: string; message: string },
    @ConnectedSocket() client: TypedSocket,
  ) {
    const user = client.user;
    if (!user) return client.disconnect(true);

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

     if (!payload.message.trim()) {
      return client.emit('error', { error: 'EMPTY_MESSAGE' });
    }

    this.server.to(`play:${payload.gameId}`).emit('playMessage', {
      userName: user.username,
      message: payload.message,
      timestamp: Date.now(),
    });
  }
}