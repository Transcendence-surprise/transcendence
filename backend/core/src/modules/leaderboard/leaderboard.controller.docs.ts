import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { LeaderboardEntryDto } from './dto/leaderboard.dto';

const LeaderboardControllerDocs = () => ApiTags('leaderboard');

const GetAllTimeLeaderboardDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all-time leaderboard',
      description: 'Retrieve top all-time leaderboard entries',
      operationId: 'getAllTimeLeaderboard',
    }),
    ApiOkResponse({ type: LeaderboardEntryDto, isArray: true }),
  );

export { LeaderboardControllerDocs, GetAllTimeLeaderboardDocs };
