// src/modules/realtime/presence.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  private online = new Set<number>();

  markOnline(userId: number) {
    const wasOnline = this.online.has(userId);
    this.online.add(userId);

    if (!wasOnline) {
      return { userId, isOnline: true };
    }

    return null;
  }

  markOffline(userId: number) {
    const existed = this.online.delete(userId);

    if (existed) {
      return { userId, isOnline: false };
    }
    return null;
  }

  isOnline(userId: number) {
    return this.online.has(userId);
  }
}
