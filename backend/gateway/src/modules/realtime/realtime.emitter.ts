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

  emitPlayerAvailabilityUpdated() {
    console.log(`playerAvailability:updated`);
    this.server.emit('playerAvailability:updated');
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