// src/modules/realtime/chat.gateway.ts

import {
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatHttpService } from '../chat/chat.service';
import type { TypedSocket } from './models/models';
import { Server } from 'socket.io';

@WebSocketGateway({
  path: '/rt/socket.io/',
  cors: { origin: true, credentials: true },
})
export class ChatGateway {
  afterInit(server: Server) {
    this.server = server;
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('chat:subscribe')
  handleSubscribe(@ConnectedSocket() client: TypedSocket) {
    if (!client.user) return client.disconnect(true);
    console.log(`Client ${client.user.username} subscribed to chat updates`);
    client.join('chat:global');
  }

  @SubscribeMessage('chat:unsubscribe')
  handleUnsubscribe(@ConnectedSocket() client: TypedSocket) {
    console.log(`Client ${client.user?.username} unsubscribed from chat updates`);
    client.leave('chat:global');
  }

  emitNewMessage(message: any) {
    if (!this.server) return;
    console.log('Emitting new chat message to clients:', message);
    this.server.to('chat:global').emit('chat:newMessage', message);
  }
}