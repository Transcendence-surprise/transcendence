// src/modules/presence/presence.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { UseGuards } from '@nestjs/common';
import { InternalGuard } from '../../guards/internal.guard';

@Controller('presence')
@UseGuards(InternalGuard)
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Post('online')
  online(@Body() dto: { userId: number }) {
    return this.presenceService.markOnline(dto.userId);
  }

  @Post('offline')
  offline(@Body() dto: { userId: number }) {
    return this.presenceService.markOffline(dto.userId);
  }

  @Post('statuses')
  statuses(@Body() dto: { userIds: number[] }) {
    return dto.userIds.map((userId) => ({
      userId,
      isOnline: this.presenceService.isOnline(userId),
    }));
  }
}