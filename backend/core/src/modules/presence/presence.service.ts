// src/modules/realtime/presence.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  private online = new Set<number>();

  markOnline(userId: number) {
    const wasOnline = this.online.has(userId);
    this.online.add(userId);

    if (!wasOnline) {
      console.log(`User ${userId} marked online in PresenceService`);
      return { userId, isOnline: true };
    }

    return null;
  }

  markOffline(userId: number) {
    const existed = this.online.delete(userId);

    if (existed) {
      console.log(`User ${userId} marked offline in PresenceService`);
      return { userId, isOnline: false };
    }
    return null;
  }

  isOnline(userId: number) {
    return this.online.has(userId);
  }
}