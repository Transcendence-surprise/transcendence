import { Server } from 'socket.io';
import type { TypedSocket } from '../models/models';

export function bindGameEvents(server: Server, client: TypedSocket) {

  client.on('game:join', ({ gameId }) => {
    client.join(`game:${gameId}`);
    client.join(`lobby:${gameId}`);
    client.join(`play:${gameId}`);
  });

  client.on('game:leave', ({ gameId }) => {
    client.leave(`game:${gameId}`);
    client.leave(`lobby:${gameId}`);
    client.leave(`play:${gameId}`);
  });

  client.on('lobbyMessage', (payload) => {
    if (!client.user) return client.disconnect(true);

    if (!payload.message.trim()) {
      return server
        .to(`lobby:${payload.gameId}`)
        .emit('error', { error: 'EMPTY_MESSAGE' });
    }

    server.to(`lobby:${payload.gameId}`).emit('lobbyMessage', {
      userName: client.user.username,
      message: payload.message,
      timestamp: Date.now(),
    });
  });

  client.on('playMessage', (payload) => {
    if (!client.user) return client.disconnect(true);

    if (!payload.message.trim()) {
      return client.emit('error', { error: 'EMPTY_MESSAGE' });
    }

    server.to(`play:${payload.gameId}`).emit('playMessage', {
      userName: client.user.username,
      message: payload.message,
      timestamp: Date.now(),
    });
  });
}