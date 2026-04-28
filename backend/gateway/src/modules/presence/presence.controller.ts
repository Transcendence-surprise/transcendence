// src/modules/presence/presence.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { PresenceHTTPService } from './presence.service';

@Controller('presence')
export class PresenceController {
  constructor(private readonly presenceClient: PresenceHTTPService) {}

  @Post('statuses')
  async getStatuses(@Body() body: { userIds: number[] }) {
    return this.presenceClient.getStatuses(body.userIds);
  }

  @Post('online')
  async markOnline(@Body() body: { userId: number }) {
    return this.presenceClient.markOnline(body.userId);
  }

  @Post('offline')
  async markOffline(@Body() body: { userId: number }) {
    return this.presenceClient.markOffline(body.userId);
  }
}