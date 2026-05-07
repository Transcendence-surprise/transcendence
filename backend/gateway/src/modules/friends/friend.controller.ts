import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { Auth, AuthType } from '../../common/decorator/auth-type.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { FriendHttpService } from './friend.service';


@Controller('friends')
@Auth(AuthType.JWT)
@UseGuards(AuthGuard)
export class FriendController {
	constructor(
		private readonly friendClient: FriendHttpService,
	) {}

  @Get()
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  getFriends(@Req() req: FastifyRequest) {
    return this.friendClient.getFriends(req);
  }

  @Get('requests')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  getFriendRequests(@Req() req: FastifyRequest) {
    return this.friendClient.getFriendRequests(req);
  }

  @Get('snapshot')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  getFriendsSnapshot(@Req() req: FastifyRequest) {
    return this.friendClient.getFriendsSnapshot(req);
  }

  @Post('request')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  async sendFriendRequest(
    @Body() body: unknown,
    @Req() req: FastifyRequest,
  ) {
    const result = await this.friendClient.sendFriendRequest(body, req);
    return result;
  }

  @Post('accept')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  async acceptFriendRequest(
    @Body() body: unknown,
    @Req() req: FastifyRequest,
  ) {
    const result = await this.friendClient.acceptFriendRequest(body, req);
    return result;
  }

  @Post('reject')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  async rejectFriendRequest(
    @Body() body: unknown,
    @Req() req: FastifyRequest,
  ) {
    const result = await this.friendClient.rejectFriendRequest(body, req);
    return result;
  }

  @Delete()
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  async removeFriend(@Body() body: unknown, @Req() req: FastifyRequest) {
    const result = await this.friendClient.removeFriend(body, req);
    return result;
  }
}
