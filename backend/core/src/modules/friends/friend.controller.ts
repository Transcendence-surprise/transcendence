// src/modules/friends/friend.controller.ts

import { Controller, Get, Post, Delete, UnauthorizedException, UseGuards } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendControllerDocs } from './friend.controller.docs';
import { CurrentUser } from './dto/playerContext.dto';
import type { PlayerContext } from './dto/playerContext.dto';
import { Body } from '@nestjs/common';
import { SendFriendRequestDto, FriendActionDto, FriendDto } from './dto/friends.dto';
import { InternalGuard } from 'src/guards/internal.guard';

@Controller('friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get()
  @FriendControllerDocs.getFriends()
  async getFriends(@CurrentUser() user: PlayerContext) : Promise<{ friends: FriendDto[] }> {
    if (!user) throw new UnauthorizedException();
    const friends = await this.friendService.getFriends(Number(user.id));

    return { friends };
  }

  @Get('requests')
  @FriendControllerDocs.getFriendRequests()
  async getFriendRequests(@CurrentUser() user: PlayerContext) : Promise<{ pendingRequests: FriendDto[] }> {
    if (!user) throw new UnauthorizedException();
    const pendingRequests = await this.friendService.getPendingRequests(Number(user.id));
    return { pendingRequests };
  }

  @Post('request')
  @FriendControllerDocs.sendFriendRequest()
  async sendFriendRequest(
    @CurrentUser() user: PlayerContext,
    @Body() dto: SendFriendRequestDto,
  ) {
    if (!user) throw new UnauthorizedException();
    return this.friendService.sendRequest(Number(user.id), Number(dto.targetUserId));
  }

  @Post('accept')
  @FriendControllerDocs.acceptFriendRequest()
  async acceptFriendRequest(
    @CurrentUser() user: PlayerContext,
    @Body() dto: FriendActionDto,
  ) {
    if (!user) throw new UnauthorizedException();
    return this.friendService.acceptRequest(Number(user.id), Number(dto.targetUserId));
  }

  @Post('reject')
  @FriendControllerDocs.rejectFriendRequest()
  async rejectFriendRequest(
    @CurrentUser() user: PlayerContext,
    @Body() dto: FriendActionDto,
  ) {
    if (!user) throw new UnauthorizedException();
    return this.friendService.rejectRequest(Number(user.id), Number(dto.targetUserId));
  }

  @Delete()
  @FriendControllerDocs.removeFriend()
  async removeFriend(
    @CurrentUser() user: PlayerContext,
    @Body() dto: FriendActionDto,
  ) {
    if (!user) throw new UnauthorizedException();
    return this.friendService.removeFriend(Number(user.id), Number(dto.targetUserId));
  }

  @Get('snapshot')
  @FriendControllerDocs.getFriendsSnapshot()
  async getFriendsSnapshot(
    @CurrentUser()
    user: PlayerContext
  ) : Promise<{
    friends: FriendDto[],
    pendingRequests: FriendDto[]
  }> {
    if (!user) throw new UnauthorizedException();
    return this.friendService.getFriendsSnapshot(Number(user.id));
  }
}