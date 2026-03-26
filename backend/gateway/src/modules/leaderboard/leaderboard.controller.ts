import { Controller, Get, Req, Res } from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { LeaderboardHttpService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardClient: LeaderboardHttpService) {}

  @Get('daily')
  async getDailyLeaderboard(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const result = await this.leaderboardClient.getDailyLeaderboard(req);
    return res.status(result.statusCode).send(result.data);
  }
}
