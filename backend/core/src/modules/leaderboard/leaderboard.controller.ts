import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardEntryDto } from './leaderboard.dto';

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('daily')
  @ApiOkResponse({ type: LeaderboardEntryDto, isArray: true })
  async getDailyLeaderboard(): Promise<LeaderboardEntryDto[]> {
    return this.leaderboardService.getDailyLeaderboard(10);
  }
}
