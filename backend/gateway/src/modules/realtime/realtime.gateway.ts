import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import type { TypedSocket } from './models/models';
import { WsAuthService } from '../auth/ws-auth.service';
import { PresenceHTTPService } from '../presence/presence.service';

import { bindGameEvents } from './events/game.events';
import { bindChatEvents } from './events/chat.events';
import { bindPresenceEvents } from './events/presence.events';
import { RealtimeEmitter } from './realtime.emitter';
import { OnGatewayInit } from '@nestjs/websockets';

@WebSocketGateway({
  path: '/rt/socket.io/',
  cors: { origin: true, credentials: true },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  public emitter: RealtimeEmitter;

  constructor(
    private readonly wsAuth: WsAuthService,
    private readonly presenceClient: PresenceHTTPService,
  ) {
    console.log('RealtimeGateway CREATED');
  }

  afterInit(server: Server) {
    this.server = server;
    this.emitter = new RealtimeEmitter(server);
  }

  async handleConnection(client: TypedSocket) {
    try {
      const user = await this.wsAuth.authenticate(client);
      client.user = user;

      const userId = Number(user.sub);

      await client.join(`user:${userId}`);
      await client.join('chat:global');

      const result = await this.presenceClient.markOnline(userId);
      if (result) this.emitter.emitPlayerAvailabilityUpdated(String(userId));

      bindGameEvents(this.server, client);
      bindChatEvents(this.server, client);
      bindPresenceEvents(this.server, client);

    } catch {
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: TypedSocket) {
    const userId = Number(client.user?.sub);
    if (!userId) return;

    const result = await this.presenceClient.markOffline(userId);
    if (result) this.emitter.emitPlayerAvailabilityUpdated(String(userId));
  }
}
