// src/modules/friends/friend.controller.ts

import { Controller, Get, Post, Delete, UnauthorizedException } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendControllerDocs } from './friend.controller.docs';
import { CurrentUser } from '../../decorators/current-user.decorator';
import type { JwtPayload } from '../../decorators/current-user.decorator';
import { Body } from '@nestjs/common';
import { SendFriendRequestDto, FriendActionDto, FriendDto } from './dto/friends.dto';

@Controller('friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get()
  @FriendControllerDocs.getFriends()
  async getFriends(@CurrentUser() user: JwtPayload) : Promise<{ friends: FriendDto[] }> {
    if (!user) throw new UnauthorizedException();
    const friends = await this.friendService.getFriends(Number(user.sub));

    return { friends };
  }

  @Get('requests')
  @FriendControllerDocs.getFriendRequests()
  async getFriendRequests(@CurrentUser() user: JwtPayload) : Promise<{ pendingRequests: FriendDto[] }> {
    if (!user) throw new UnauthorizedException();
    const pendingRequests = await this.friendService.getPendingRequests(Number(user.sub));
    return { pendingRequests };
  }

  @Post('request')
  @FriendControllerDocs.sendFriendRequest()
  async sendFriendRequest(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SendFriendRequestDto,
  ) {
    if (!user) throw new UnauthorizedException();
    return this.friendService.sendRequest(Number(user.sub), Number(dto.targetUserId));
  }

  @Post('accept')
  @FriendControllerDocs.acceptFriendRequest()
  async acceptFriendRequest(
    @CurrentUser() user: JwtPayload,
    @Body() dto: FriendActionDto,
  ) {
    if (!user) throw new UnauthorizedException();
    return this.friendService.acceptRequest(Number(user.sub), Number(dto.targetUserId));
  }

  @Post('reject')
  @FriendControllerDocs.rejectFriendRequest()
  async rejectFriendRequest(
    @CurrentUser() user: JwtPayload,
    @Body() dto: FriendActionDto,
  ) {
    if (!user) throw new UnauthorizedException();
    return this.friendService.rejectRequest(Number(user.sub), Number(dto.targetUserId));
  }

  @Delete()
  @FriendControllerDocs.removeFriend()
  async removeFriend(
    @CurrentUser() user: JwtPayload,
    @Body() dto: FriendActionDto,
  ) {
    if (!user) throw new UnauthorizedException();
    return this.friendService.removeFriend(Number(user.sub), Number(dto.targetUserId));
  }

  @Get('snapshot')
  @FriendControllerDocs.getFriendsSnapshot()
  async getFriendsSnapshot(
    @CurrentUser()
    user: JwtPayload
  ) : Promise<{
    friends: FriendDto[],
    pendingRequests: FriendDto[]
  }> {
    if (!user) throw new UnauthorizedException();
    return this.friendService.getFriendsSnapshot(Number(user.sub));
  }
}
