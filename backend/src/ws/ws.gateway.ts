import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EngineService } from '../ game/services/engine.service.nest';

@WebSocketGateway({ cors: { origin: '*' } })

export class WsGateway {
  @WebSocketServer()
  server: Server;

// Dont touch!!!

  constructor(private engine: EngineService) {}

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
        @MessageBody() data: { gameId: string; userId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const room = `lobby:${data.gameId}`;
        client.join(room);

        const state = this.engine.getGameState(data.gameId);

        this.server.to(room).emit('lobbyUpdate', {
        gameId: data.gameId,
        host: state.hostId,
        players: state.players,
        maxPlayers: state.rules.maxPlayers,
        phase: state.phase,
        });
    }
}

