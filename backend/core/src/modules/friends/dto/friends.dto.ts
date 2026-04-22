// src/modules/friends/dto/friends.dto.ts

import { IsNumber } from 'class-validator';

export class SendFriendRequestDto {
  @IsNumber()
  targetUserId: number;
}

export class FriendActionDto {
  @IsNumber()
  targetUserId: number;
}

