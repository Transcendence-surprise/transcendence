// src/modules/friends/dto/friends.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsBoolean, IsString } from 'class-validator';

export class SendFriendRequestDto {
  @ApiProperty({ type: Number, example: 42, description: 'Target user id' })
  @IsNumber()
  targetUserId: number;
}

export class FriendActionDto {
  @ApiProperty({ type: Number, example: 42, description: 'Target user id' })
  @IsNumber()
  targetUserId: number;
}


export class FriendDto {
  @ApiProperty({ type: Number, example: 7 })
  id: number;

  @ApiProperty({ type: String, example: 'mira' })
  @IsString()
  username: string;

  @ApiProperty({ type: Boolean, example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;
}

export class FriendsSnapshotDto {
  @ApiProperty({ type: [FriendDto] })
  friends: FriendDto[];

  @ApiProperty({ type: [FriendDto] })
  pendingRequests: FriendDto[];
}

export class FriendsListDto {
  @ApiProperty({ type: [FriendDto] })
  friends: FriendDto[];
}

export class FriendRequestsDto {
  @ApiProperty({ type: [FriendDto] })
  pendingRequests: FriendDto[];
}
