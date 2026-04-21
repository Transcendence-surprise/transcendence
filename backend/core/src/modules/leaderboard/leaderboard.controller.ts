import { Controller, Get, Param } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardEntryDto } from './dto/leaderboard.dto';
import {
  LeaderboardControllerDocs,
  GetAllTimeLeaderboardDocs,
} from './leaderboard.controller.docs';

@LeaderboardControllerDocs()
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('all-time')
  @GetAllTimeLeaderboardDocs()
  async getAllTimeLeaderboard(): Promise<LeaderboardEntryDto[]> {
    return this.leaderboardService.getAllTimeLeaderboard(10);
  }

  @Get('user-ranking/:userId')    // AUTH // GATEWAY
  async getUserRanking(@Param('userId') userId: number): Promise<number | null> {
    return this.leaderboardService.getUserRanking(userId);
  }
}
