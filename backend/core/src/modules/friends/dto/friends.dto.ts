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


export class FriendDto {
  id: number;
  username: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
}

export class FriendsSnapshotDto {
  friends: FriendDto[];
  pendingRequests: FriendDto[];
}
