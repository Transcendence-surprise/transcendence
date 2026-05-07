// src/modules/friends/friend.controller.docs.ts

import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiOkResponse, ApiCreatedResponse, ApiSecurity } from '@nestjs/swagger';
import {
  SendFriendRequestDto,
  FriendActionDto,
  FriendsListDto,
  FriendRequestsDto,
  FriendsSnapshotDto,
} from './dto/friends.dto';

export const FriendControllerDocs = {
  getFriends: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get user friends list' }),
      ApiSecurity('JWT'),
      ApiOkResponse({ type: FriendsListDto, description: 'Friends list returned' }),
    ),

  getFriendRequests: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get incoming friend requests' }),
      ApiSecurity('JWT'),
      ApiOkResponse({ type: FriendRequestsDto, description: 'Requests returned' }),
    ),

  sendFriendRequest: () =>
    applyDecorators(
      ApiOperation({ summary: 'Send friend request' }),
      ApiSecurity('JWT'),
      ApiBody({ type: SendFriendRequestDto }),
      ApiCreatedResponse({ description: 'Friend request created' }),
    ),

  acceptFriendRequest: () =>
    applyDecorators(
      ApiOperation({ summary: 'Accept friend request' }),
      ApiSecurity('JWT'),
      ApiBody({ type: FriendActionDto }),
      ApiOkResponse({ description: 'Friend request accepted' }),
    ),

  rejectFriendRequest: () =>
    applyDecorators(
      ApiOperation({ summary: 'Reject friend request' }),
      ApiSecurity('JWT'),
      ApiBody({ type: FriendActionDto }),
      ApiOkResponse({ description: 'Friend request rejected' }),
    ),

  removeFriend: () =>
    applyDecorators(
      ApiOperation({ summary: 'Remove friend' }),
      ApiSecurity('JWT'),
      ApiBody({ type: FriendActionDto }),
      ApiOkResponse({ description: 'Friend removed' }),
    ),

  getFriendsSnapshot: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get friends snapshot' }),
      ApiSecurity('JWT'),
      ApiOkResponse({ type: FriendsSnapshotDto, description: 'Friends snapshot returned' }),
    ),
};
