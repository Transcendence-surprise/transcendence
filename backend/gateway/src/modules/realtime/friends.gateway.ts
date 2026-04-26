// src/modules/realtime/friends.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  path: '/rt/socket.io/',
  cors: { origin: true, credentials: true },
})
export class FriendsGateway {
  @WebSocketServer()
  server: Server;

  emitFriendsUpdate(userIds: number[]) {
    console.log('Emitting to:', userIds);
    for (const userId of userIds) {
      this.server
        .to(`user:${userId}`)
        .emit('friends:update', {
          userId,
          updatedAt: Date.now(),
        });
    }
  }
}