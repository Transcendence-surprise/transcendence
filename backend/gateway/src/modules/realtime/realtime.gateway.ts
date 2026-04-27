// src/modules/realtime/realtime.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import type { TypedSocket } from './models/models';
import { PresenceHTTPService } from '../presence/presence.service';
import { WsAuthService } from '../auth/ws-auth.service';

@WebSocketGateway({
  path: '/rt/socket.io/',
  cors: { origin: true, credentials: true },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly wsAuth: WsAuthService,
    private readonly presenceClient: PresenceHTTPService,
  ) {}

  async handleConnection(client: TypedSocket) {
    try {
      const user = await this.wsAuth.authenticate(client);
      client.user = user;

      const userId = Number(user.sub);

      client.join(`user:${userId}`);
      client.join('chat:global');

      console.log(`User ${userId} connected to realtime gateway`);
      const result = await this.presenceClient.markOnline(userId);
      console.log(`User ${userId} marked online`, result);
      if (result) {
        this.server.emit('presence:update', result);
      }
    } catch {
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: TypedSocket) {
    const userId = Number(client.user?.sub);
    if (!userId) return;

    try {
      const result = await this.presenceClient.markOffline(userId);
      console.log(`User ${userId} marked offline`, result);
      if (result) {
        this.server.emit('presence:update', result);
      }
    } catch (e) {
      console.error('presence offline failed', e.message);
    }
  }

  @SubscribeMessage('presence:subscribe')
  handlePresenceSubscribe(
    @MessageBody() data: { userIds?: number[] },
    @ConnectedSocket() client: TypedSocket,
  ) {
    const userIds = this.normalize(data.userIds);

    userIds.forEach((id) => client.join(`presence:user:${id}`));
  }

  private normalize(input?: number[]): number[] {
    return Array.from(
      new Set(
        (input ?? [])
          .map(Number)
          .filter((n) => Number.isInteger(n) && n > 0),
      ),
    );
  }
}