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
    console.log(`User requested chat history`);
    return this.chatClient.getHistory(req);
  }

  @Post('messages')
  async addMessage(@Req() req: FastifyRequest, @Body() body: unknown) {
    const result = await this.chatClient.addMessage(body, req);

    if (isOkMessageResult(result)) {
      console.log('User added a chat message');
    }

    return result;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isOkMessageResult(value: unknown): value is { ok: true; message: unknown } {
  if (!isRecord(value)) return false;
  return value.ok === true && 'message' in value;
}