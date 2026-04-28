// src/modules/chat/chat.controller.ts

import { Body, Controller, Get, Post, UnauthorizedException } from '@nestjs/common';
import { CurrentUser } from '../../decorators/current-user.decorator';
import type { JwtPayload } from '../../decorators/current-user.decorator';
import { ChatService } from './chat.service';
import type { AddChatMessageDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  async getHistory(@CurrentUser() user: JwtPayload) {
    if (!user) {
      throw new UnauthorizedException();
    }

    const messages = await this.chatService.getMessages(100);

    return Array.isArray(messages) ? messages : [];
  }

  @Post('messages')
  async addMessage(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AddChatMessageDto,
  ) {
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.chatService.addMessage({
      userId: user.sub,
      username: user.username,
      content: dto?.content,
      replyTo: dto?.replyTo,
    });
  }
}
