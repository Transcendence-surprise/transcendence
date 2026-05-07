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

const GetUserRankingDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get user ranking',
      description: 'Retrieve the authenticated user\'s current rank on the all-time leaderboard',
      operationId: 'getUserRanking',
    }),
    ApiOkResponse({
      description: 'User ranking position or null if the user is not ranked',
      schema: {
        type: 'integer',
        nullable: true,
        example: 42,
      },
    }),
  );

export { LeaderboardControllerDocs, GetAllTimeLeaderboardDocs, GetUserRankingDocs };
