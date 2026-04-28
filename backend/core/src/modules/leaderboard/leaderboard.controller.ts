import { Controller, Get, Param } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardEntryDto } from './dto/leaderboard.dto';
import {
  LeaderboardControllerDocs,
  GetAllTimeLeaderboardDocs,
} from './leaderboard.controller.docs';
import { CurrentUser } from '../../decorators/current-user.decorator';
import type { JwtPayload } from '../../decorators/current-user.decorator';

@LeaderboardControllerDocs()
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('all-time')
  @GetAllTimeLeaderboardDocs()
  async getAllTimeLeaderboard(): Promise<LeaderboardEntryDto[]> {
    return this.leaderboardService.getAllTimeLeaderboard(10);
  }

  @Get('user-ranking')
  async getUserRanking(
    @CurrentUser() user: JwtPayload,
  ): Promise<number | null> {
    return this.leaderboardService.getUserRanking(Number(user.sub));
  }
}
