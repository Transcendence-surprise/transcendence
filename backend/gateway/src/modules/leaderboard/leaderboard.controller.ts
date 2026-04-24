import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { LeaderboardHttpService } from './leaderboard.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Auth, AuthType } from '../../common/decorator/auth-type.decorator';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardClient: LeaderboardHttpService) {}

  @Get('all-time')
  async getAllTimeLeaderboard(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const result = await this.leaderboardClient.getAllTimeLeaderboard(req);
    return res.status(result.statusCode).send(result.data);
  }

  @Get('user-ranking')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  getUserRanking(@Req() req: FastifyRequest) {
    return this.leaderboardClient.getUserRanking(req);
  }
}
