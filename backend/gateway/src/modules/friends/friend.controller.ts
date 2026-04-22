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
import { RealtimeGateway } from '../realtime/realtime.gateway';

interface JwtPayload {
	sub: number | string;
}

interface RequestWithUser extends FastifyRequest {
	user?: JwtPayload;
}

interface FriendActionBody {
	targetUserId?: number | string;
}

@Controller('friends')
@Auth(AuthType.JWT)
@UseGuards(AuthGuard)
export class FriendController {
	constructor(
		private readonly friendClient: FriendHttpService,
		private readonly realtimeGateway: RealtimeGateway,
	) {}

	private extractTargetUserId(body: unknown): number | null {
		if (!body || typeof body !== 'object') return null;
		const target = (body as FriendActionBody).targetUserId;
		if (target === undefined || target === null) return null;

		const userId = Number(target);
		if (!Number.isInteger(userId) || userId <= 0) return null;

		return userId;
	}

	private async notifyFriendsChanged(req: FastifyRequest, targetUserId?: number | null) {
		const reqWithUser = req as RequestWithUser;
		const actorUserId = Number(reqWithUser.user?.sub);

		if (!Number.isInteger(actorUserId) || actorUserId <= 0) {
			return;
		}

		const userIds =
			targetUserId && Number.isInteger(targetUserId) && targetUserId > 0
				? [actorUserId, targetUserId]
				: [];

		if (userIds.length === 0) {
			this.realtimeGateway.emitFriendsUpdateMany([actorUserId]);
			return;
		}

		this.realtimeGateway.emitFriendsUpdateMany(userIds);
	}

	@Get()
	async getFriends(@Req() req: FastifyRequest) {
		return this.friendClient.getFriends(req);
	}

	@Get('requests')
	async getFriendRequests(@Req() req: FastifyRequest) {
		return this.friendClient.getFriendRequests(req);
	}

	@Post('request')
	async sendFriendRequest(@Body() body: unknown, @Req() req: FastifyRequest) {
		const result = await this.friendClient.sendFriendRequest(body, req);
		await this.notifyFriendsChanged(req, this.extractTargetUserId(body));
		return result;
	}

	@Post('accept')
	async acceptFriendRequest(@Body() body: unknown, @Req() req: FastifyRequest) {
		const result = await this.friendClient.acceptFriendRequest(body, req);
		await this.notifyFriendsChanged(req, this.extractTargetUserId(body));
		return result;
	}

	@Post('reject')
	async rejectFriendRequest(@Body() body: unknown, @Req() req: FastifyRequest) {
		const result = await this.friendClient.rejectFriendRequest(body, req);
		await this.notifyFriendsChanged(req, this.extractTargetUserId(body));
		return result;
	}

	@Delete()
	async removeFriend(@Body() body: unknown, @Req() req: FastifyRequest) {
		const result = await this.friendClient.removeFriend(body, req);
		await this.notifyFriendsChanged(req, this.extractTargetUserId(body));
		return result;
	}
}
