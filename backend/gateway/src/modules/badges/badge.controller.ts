import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Auth, AuthType } from 'src/common/decorator/auth-type.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { BadgeHttpService } from './badge.service';

@Controller('badges')
export class BadgeController {
	constructor(private readonly badgeClient: BadgeHttpService) {}

	@Get()
	async getBadges(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
		const result = await this.badgeClient.getBadges(req);
		return res.status(result.statusCode).send(result.data);
	}

	@Get('unlocked')
	@Auth(AuthType.JWT)
	@UseGuards(AuthGuard)
	getUserBadges(@Req() req: FastifyRequest) {
		return this.badgeClient.getUserBadges(req);
	}
}



