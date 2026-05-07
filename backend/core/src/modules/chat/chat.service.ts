import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export interface ChatMessage {
  id: string;
  userId: number | string;
  username: string;
  content: string;
  timestamp: number;
  replyTo?: string;
}

export interface AddChatMessageInput {
  userId: number | string;
  username: string;
  content: string;
  replyTo?: string;
}

const MAX_CHAT_MESSAGES = 1000;

@Injectable()
export class ChatService {
  private messages: ChatMessage[] = [];

  addMessage(input: AddChatMessageInput): {
  ok: boolean;
  message?: ChatMessage;
  error?: string;
  } {
    const content = String(input.content ?? '').trim();

    if (!content) {
      return { ok: false, error: 'EMPTY_MESSAGE' };
    }

    if (content.length > 500) {
      return { ok: false, error: 'MESSAGE_TOO_LONG' };
    }

    if (input.replyTo) {
      const exists = this.messages.some(m => m.id === input.replyTo);
      if (!exists) {
        return { ok: false, error: 'INVALID_REPLY_TO' };
      }
    }

    const msg: ChatMessage = {
      id: randomUUID(),
      userId: input.userId,
      username: input.username,
      content,
      timestamp: Date.now(),
      replyTo: input.replyTo,
    };

    this.messages.push(msg);

    if (this.messages.length > MAX_CHAT_MESSAGES) {
      this.messages.splice(0, this.messages.length - MAX_CHAT_MESSAGES);
    }

    return { ok: true, message: msg };
  }

  getMessages(limit = 100) {
    return this.messages.slice(-limit);
  }
}
