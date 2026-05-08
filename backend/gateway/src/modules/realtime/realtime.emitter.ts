import { Server } from 'socket.io';

export class RealtimeEmitter {
  constructor(private readonly server: Server) {}

  emitGameUpdated(gameId: string) {
    this.server.to(`game:${gameId}`).emit('game:updated', { gameId });
  }

  emitLobbyUpdated(gameId: string) {
    this.server.to(`lobby:${gameId}`).emit('lobby:updated', { gameId });
  }

  emitPlayerAvailabilityUpdated(userId: string | number) {
    this.server.to(`user:${userId}`).emit('playerAvailability:updated', { userId });
  }

  emitPresenceUpdated(userId: string | number, isOnline: boolean) {
    this.server.to(`user:${userId}`).emit('presence:updated', { userId, isOnline });
    this.server.to(`presence:user:${userId}`).emit('presence:updated', { userId, isOnline });
  }

  emitMultiplayerGamesListUpdated() {
    this.server.emit('multiplayerGamesList:updated');
  }

  emitNewMessage(message: any) {
    if (!this.server) return;
    this.server.to('chat:global').emit('chat:newMessage', message);
  }

  emitFriendsUpdate(userIds: number[]) {
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
