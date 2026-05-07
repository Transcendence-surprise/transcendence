import { Server } from 'socket.io';

export class RealtimeEmitter {
  constructor(private readonly server: Server) {}

  emitGameUpdated(gameId: string) {
    console.log(`Emitting game:updated for gameId ${gameId}`);
    this.server.to(`game:${gameId}`).emit('game:updated', { gameId });
  }

  emitLobbyUpdated(gameId: string) {
    console.log(`Emitting lobby:updated for gameId ${gameId}`);
    this.server.to(`lobby:${gameId}`).emit('lobby:updated', { gameId });
  }

  emitPlayerAvailabilityUpdated(userId: string | number) {
    console.log(`playerAvailability:updated for userId ${userId}`);
    this.server.to(`user:${userId}`).emit('playerAvailability:updated', { userId });
  }

  emitPresenceUpdated(userId: string | number, isOnline: boolean) {
    console.log(`presence:updated for userId ${userId}`);
    this.server.to(`user:${userId}`).emit('presence:updated', { userId, isOnline });
    this.server.to(`presence:user:${userId}`).emit('presence:updated', { userId, isOnline });
  }

  emitMultiplayerGamesListUpdated() {
    console.log(`multiplayerGamesList:updated`);
    this.server.emit('multiplayerGamesList:updated');
  }

  emitNewMessage(message: any) {
    if (!this.server) return;
    console.log('Emitting new chat message to clients:', message);
    this.server.to('chat:global').emit('chat:newMessage', message);
  }

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
