import { Body, Controller, Get, Post, UnauthorizedException } from '@nestjs/common';
import { CurrentUser } from '../../decorators/current-user.decorator';
import type { JwtPayload } from '../../decorators/current-user.decorator';
import { ChatService } from './chat.service';
import type { AddChatMessageDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  getHistory(@CurrentUser() user: JwtPayload) {
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.chatService.getMessages(100);
  }

  @Post('messages')
  addMessage(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AddChatMessageDto,
  ) {
    if (!user) {
      throw new UnauthorizedException();
    }

    const content = String(dto?.content ?? '').trim();
    if (!content) {
      return { ok: false, error: 'EMPTY_MESSAGE' };
    }

    if (dto?.replyTo !== undefined && typeof dto.replyTo !== 'string') {
      return { ok: false, error: 'INVALID_REPLY_TO' };
    }

    const message = this.chatService.addMessage({
      userId: user.sub,
      username: user.username,
      content,
      replyTo: dto?.replyTo,
    });

    return { ok: true, message };
  }
}
