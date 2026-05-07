import { Server } from 'socket.io';
import type { TypedSocket } from '../models/models';

type GameRoomPayload = {
  gameId: string;
};

type ChatPayload = {
  gameId: string;
  message: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toGameRoomPayload(payload: unknown): GameRoomPayload | null {
  if (!isRecord(payload) || typeof payload.gameId !== 'string') return null;
  return { gameId: payload.gameId };
}

function toChatPayload(payload: unknown): ChatPayload | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.gameId !== 'string') return null;
  if (typeof payload.message !== 'string') return null;
  return { gameId: payload.gameId, message: payload.message };
}

export function bindGameEvents(server: Server, client: TypedSocket) {

  client.on('game:join', async (payload: unknown) => {
    const room = toGameRoomPayload(payload);
    if (!room) return client.disconnect(true);
    await client.join(`game:${room.gameId}`);
    await client.join(`lobby:${room.gameId}`);
    await client.join(`play:${room.gameId}`);
  });

  client.on('game:leave', async (payload: unknown) => {
    const room = toGameRoomPayload(payload);
    if (!room) return client.disconnect(true);
    await client.leave(`game:${room.gameId}`);
    await client.leave(`lobby:${room.gameId}`);
    await client.leave(`play:${room.gameId}`);
  });

  client.on('lobbyMessage', (payload: unknown) => {
    if (!client.user) return client.disconnect(true);

    const chat = toChatPayload(payload);
    if (!chat) return client.disconnect(true);

    if (!chat.message.trim()) {
      return server
        .to(`lobby:${chat.gameId}`)
        .emit('error', { error: 'EMPTY_MESSAGE' });
    }

    server.to(`lobby:${chat.gameId}`).emit('lobbyMessage', {
      userName: client.user.username,
      message: chat.message,
      timestamp: Date.now(),
    });
  });

  client.on('playMessage', (payload: unknown) => {
    if (!client.user) return client.disconnect(true);

    const chat = toChatPayload(payload);
    if (!chat) return client.disconnect(true);

    if (!chat.message.trim()) {
      return client.emit('error', { error: 'EMPTY_MESSAGE' });
    }

    server.to(`play:${chat.gameId}`).emit('playMessage', {
      userName: client.user.username,
      message: chat.message,
      timestamp: Date.now(),
    });
  });
}
