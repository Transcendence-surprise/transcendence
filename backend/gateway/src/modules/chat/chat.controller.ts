// src/modules/chat/chat.controller.ts

import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Auth, AuthType } from '../../common/decorator/auth-type.decorator';
import { ChatHttpService } from './chat.service';

@Controller('chat')
@Auth(AuthType.JWT)
@UseGuards(AuthGuard)
export class ChatController {
  constructor(
    private readonly chatClient: ChatHttpService,
  ) {}

  @Get('history')
  getHistory(@Req() req: FastifyRequest) {
    return this.chatClient.getHistory(req);
  }

  @Post('messages')
  async addMessage(@Req() req: FastifyRequest, @Body() body: unknown) {
    const result = await this.chatClient.addMessage(body, req);
    return result;
  }
}
