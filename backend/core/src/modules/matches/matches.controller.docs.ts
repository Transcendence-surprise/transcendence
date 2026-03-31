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

const MatchesControllerDocs = () => ApiTags('matches');

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
      type: Number,
      description: 'Match ID',
      example: 1,
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
      type: Number,
      description: 'Match ID',
      example: 1,
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
      type: Number,
      description: 'Match ID',
      example: 1,
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
      type: Number,
      description: 'Match ID',
      example: 1,
    }),
    ApiOkResponse({ description: 'Match deleted successfully' }),
  );

export {
  MatchesControllerDocs,
  FindAllMatchesDocs,
  FindMatchByIdDocs,
  CreateMatchDocs,
  UpdateMatchDocs,
  PartialUpdateMatchDocs,
  DeleteMatchDocs,
};
