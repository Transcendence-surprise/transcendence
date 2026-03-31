import { Controller, Get } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardEntryDto } from './dto/leaderboard.dto';
import {
  LeaderboardControllerDocs,
  GetDailyLeaderboardDocs,
} from './leaderboard.controller.docs';

@LeaderboardControllerDocs()
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('daily')
  @GetDailyLeaderboardDocs()
  async getDailyLeaderboard(): Promise<LeaderboardEntryDto[]> {
    return this.leaderboardService.getDailyLeaderboard(10);
  }
}
