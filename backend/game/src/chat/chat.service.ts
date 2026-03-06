import { Injectable } from '@nestjs/common';

export interface ChatMessage {
  id: string;
  userId: number | string;
  username: string;
  content: string;
  timestamp: number;
  replyTo?: string;
}

const MAX_CHAT_MESSAGES = 1000;

@Injectable()
export class ChatService {
  private messages: ChatMessage[] = [];

  addMessage(msg: ChatMessage) {
    this.messages.push(msg);

    if (this.messages.length > MAX_CHAT_MESSAGES) {
      this.messages.shift();
    }
  }

  getMessages(limit = 100) {
    return this.messages.slice(-limit);
  }
}