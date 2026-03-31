import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { LeaderboardEntryDto } from './dto/leaderboard.dto';

const LeaderboardControllerDocs = () => ApiTags('leaderboard');

const GetDailyLeaderboardDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get daily leaderboard',
      description: 'Retrieve top daily leaderboard entries',
      operationId: 'getDailyLeaderboard',
    }),
    ApiOkResponse({ type: LeaderboardEntryDto, isArray: true }),
  );

export { LeaderboardControllerDocs, GetDailyLeaderboardDocs };
