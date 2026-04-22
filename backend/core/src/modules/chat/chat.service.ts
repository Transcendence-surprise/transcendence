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

  addMessage(input: AddChatMessageInput): ChatMessage {
    const msg: ChatMessage = {
      id: randomUUID(),
      userId: input.userId,
      username: input.username,
      content: input.content,
      timestamp: Date.now(),
      replyTo: input.replyTo,
    };

    this.messages.push(msg);

    if (this.messages.length > MAX_CHAT_MESSAGES) {
      this.messages.shift();
    }

    return msg;
  }

  getMessages(limit = 100) {
    return this.messages.slice(-limit);
  }
}