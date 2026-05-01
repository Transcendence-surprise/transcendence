import { Server } from 'socket.io';
import type { TypedSocket } from '../models/models';

export function bindGameEvents(server: Server, client: TypedSocket) {

  client.on('game:join', async ({ gameId }) => {
    await client.join(`game:${gameId}`);
    await client.join(`lobby:${gameId}`);
    await client.join(`play:${gameId}`);
  });

  client.on('game:leave', async ({ gameId }) => {
    await client.leave(`game:${gameId}`);
    await client.leave(`lobby:${gameId}`);
    await client.leave(`play:${gameId}`);
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
