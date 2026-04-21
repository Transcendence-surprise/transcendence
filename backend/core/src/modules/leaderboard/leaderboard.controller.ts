import { Controller, Get, Param } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardEntryDto } from './dto/leaderboard.dto';
import {
  LeaderboardControllerDocs,
  GetAllTimeLeaderboardDocs,
} from './leaderboard.controller.docs';
import { CurrentUser } from './dto/playerContext.dto';
import type { PlayerContext } from './dto/playerContext.dto';

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
    @CurrentUser() user: PlayerContext,
  ): Promise<number | null> {
    return this.leaderboardService.getUserRanking(Number(user.id));
  }
}
