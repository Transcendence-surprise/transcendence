import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchDto } from './dto/match.dto';
import { LatestGamesDto } from './dto/latest-games.dto';

const MatchesControllerDocs = () => ApiTags('Matches');

const FindAllMatchesDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all matches',
      description: 'Retrieve a list of all recorded matches',
      operationId: 'getMatches',
    }),
    ApiOkResponse({ type: MatchDto, isArray: true }),
  );

const FindMatchByIdDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get match by id',
      description: 'Retrieve a match by its id',
      operationId: 'getMatchById',
    }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'Match ID',
      example: 'match-uuid',
    }),
    ApiOkResponse({ type: MatchDto }),
  );

const CreateMatchDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a match',
      description: 'Create a new match record',
      operationId: 'createMatch',
    }),
    ApiBody({ type: CreateMatchDto }),
    ApiCreatedResponse({ type: MatchDto }),
  );

const UpdateMatchDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update a match',
      description: 'Update an existing match by id',
      operationId: 'updateMatch',
    }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'Match ID',
      example: 'match-uuid',
    }),
    ApiBody({ type: UpdateMatchDto }),
    ApiOkResponse({ type: MatchDto }),
  );

const PartialUpdateMatchDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Partial update a match',
      description: 'Partially update an existing match by id',
      operationId: 'partialUpdateMatch',
    }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'Match ID',
      example: 'match-uuid',
    }),
    ApiBody({ type: UpdateMatchDto }),
    ApiOkResponse({ type: MatchDto }),
  );

const DeleteMatchDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete a match',
      description: 'Delete a match by its id',
      operationId: 'deleteMatch',
    }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'Match ID',
      example: 'match-uuid',
    }),
    ApiOkResponse({ description: 'Match deleted successfully' }),
  );

const LatestMatchesDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get user latest matches',
      description: 'Retrieve the latest matches of the authenticated user',
      operationId: 'getUserLatestMatches',
    }),
    ApiOkResponse({ type: LatestGamesDto, isArray: true }),
  );


export {
  MatchesControllerDocs,
  FindAllMatchesDocs,
  FindMatchByIdDocs,
  CreateMatchDocs,
  UpdateMatchDocs,
  PartialUpdateMatchDocs,
  DeleteMatchDocs,
  LatestMatchesDocs,
};
