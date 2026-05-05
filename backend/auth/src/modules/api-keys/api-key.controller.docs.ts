import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiNotFoundResponse,
  ApiExcludeEndpoint,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { CreateApiKeyResDto } from './dto/api-key/create-api-key-res.dto';
import { GetApiKeyResDto } from './dto/api-key/get-api-key-res.dto';

const ApiKeyControllerDocs = () => ApiTags('API Keys');

const GetApiKeysDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all API keys',
      description: 'Retrieve a list of all API keys',
    }),
    ApiOkResponse({
      description: 'List of API keys',
      type: GetApiKeyResDto,
      isArray: true,
    }),
  );

const CreateApiKeyDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create API key',
      description: 'Generate a new API key and return its token and metadata',
    }),
    ApiCreatedResponse({
      description: 'API key created',
      type: CreateApiKeyResDto,
    }),
    ApiBadRequestResponse({ description: 'Bad request' }),
  );

const RemoveApiKeyDocs = () =>
  applyDecorators(
    ApiSecurity('Api Key'),
    ApiOperation({
      summary: 'Delete API key',
      description: 'Remove an API key by id',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'ID of the API key to remove',
    }),
    ApiOkResponse({ description: 'API key deleted' }),
    ApiNotFoundResponse({ description: 'API key not found' }),
  );

const ValidateApiKeyDocs = () =>
  applyDecorators(
    ApiExcludeEndpoint(),
    ApiOperation({
      summary: 'Validate API key',
      description: 'Validate an API key token and return boolean result',
    }),
    ApiQuery({
      name: 'token',
      type: String,
      description: 'API key token to validate',
    }),
    ApiOkResponse({
      description: 'Validation passed',
      schema: { type: 'boolean' },
      example: true,
    }),
    ApiBadRequestResponse({
      description: 'Validation failed',
      schema: { type: 'boolean' },
      example: false,
    }),
  );

export {
  ApiKeyControllerDocs,
  GetApiKeysDocs,
  CreateApiKeyDocs,
  RemoveApiKeyDocs,
  ValidateApiKeyDocs,
};
