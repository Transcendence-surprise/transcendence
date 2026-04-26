// src/modules/friends/friend.controller.docs.ts

import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SendFriendRequestDto, FriendActionDto } from './dto/friends.dto';

export const FriendControllerDocs = {
  getFriends: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get user friends list' }),
      ApiResponse({ status: 200, description: 'Friends list returned' }),
    ),

  getFriendRequests: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get incoming friend requests' }),
      ApiResponse({ status: 200, description: 'Requests returned' }),
    ),

  sendFriendRequest: () =>
    applyDecorators(
      ApiOperation({ summary: 'Send friend request' }),
      ApiBody({ type: SendFriendRequestDto }),
      ApiResponse({ status: 201 }),
    ),

  acceptFriendRequest: () =>
    applyDecorators(
      ApiOperation({ summary: 'Accept friend request' }),
      ApiBody({ type: FriendActionDto }),
      ApiResponse({ status: 200 }),
    ),

  rejectFriendRequest: () =>
    applyDecorators(
      ApiOperation({ summary: 'Reject friend request' }),
      ApiBody({ type: FriendActionDto }),
      ApiResponse({ status: 200 }),
    ),

  removeFriend: () =>
    applyDecorators(
      ApiOperation({ summary: 'Remove friend' }),
      ApiBody({ type: FriendActionDto }),
      ApiResponse({ status: 200 }),
    ),

  getFriendsSnapshot: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get friends snapshot' }),
      ApiResponse({ status: 200, description: 'Friends snapshot returned' }),
    ),
};