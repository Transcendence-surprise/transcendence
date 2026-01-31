import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBody,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { ValidateCredDto } from './dto/validate-credentials.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserResDto } from './dto/get-user-res.dto';

const UsersControllerDocs = () => ApiTags('Users');

const FindAllDocs = () =>
  applyDecorators(
    ApiTags('Public'),
    ApiOperation({
      summary: 'Get all users',
      description: 'Retrieve a list of all users',
      operationId: 'getUsers',
    }),
    ApiOkResponse({
      description: 'List of users',
      type: GetUserResDto,
      isArray: true,
    }),
  );

const ValidateCredentialsDocs = () =>
  applyDecorators(
    ApiTags('Internal'),
    ApiOperation({
      summary: 'Validate user credentials',
      description: 'Validate user credentials for authentication',
      operationId: 'validateUserCredentials',
    }),
    ApiBody({
      type: ValidateCredDto,
      description: 'User credentials to validate',
    }),
    ApiOkResponse({
      description: 'Credentials are valid, user data returned',
      type: GetUserResDto,
    }),
    ApiUnauthorizedResponse({ description: 'Invalid credentials' }),
    ApiBadRequestResponse({ description: 'Bad request' }),
  );

const FindOneByUsernameDocs = () =>
  applyDecorators(
    ApiTags('Public'),
    ApiOperation({
      summary: 'Get user by username',
      description: 'Retrieve a user by their username',
      operationId: 'getUserByUsername',
    }),
    ApiParam({
      name: 'username',
      type: 'string',
      description: 'Username of the user',
      example: 'john_doe',
    }),
    ApiOkResponse({
      description: 'User data',
      type: GetUserResDto,
    }),
    ApiNotFoundResponse({ description: 'User not found' }),
  );

const FindOneByIdDocs = () =>
  applyDecorators(
    ApiTags('Public'),
    ApiOperation({
      summary: 'Get user by ID',
      description: 'Retrieve a user by their ID (authenticated user only)',
      operationId: 'getUserById',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'ID of the user',
      example: 1,
    }),
    ApiOkResponse({
      description: 'User data',
      type: GetUserResDto,
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiNotFoundResponse({ description: 'User not found' }),
  );

const RemoveByUsernameDocs = () =>
  applyDecorators(
    ApiTags('Public'),
    ApiOperation({
      summary: 'Delete user by username',
      description: 'Delete a user by their username',
      operationId: 'deleteUserByUsername',
    }),
    ApiParam({
      name: 'username',
      type: 'string',
      description: 'Username of the user to delete',
      example: 'john_doe',
    }),
    ApiOkResponse({ description: 'User deleted' }),
    ApiNotFoundResponse({ description: 'User not found' }),
  );

const RemoveByIdDocs = () =>
  applyDecorators(
    ApiTags('Public'),
    ApiOperation({
      summary: 'Delete user by ID',
      description: 'Delete a user by their ID',
      operationId: 'deleteUserById',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'ID of the user to delete',
      example: 1,
    }),
    ApiOkResponse({ description: 'User deleted' }),
    ApiNotFoundResponse({ description: 'User not found' }),
  );

const CreateDocs = () =>
  applyDecorators(
    ApiTags('Public'),
    ApiOperation({
      summary: 'Create a new user',
      description: 'Create a new user with the provided data',
      operationId: 'createUser',
    }),
    ApiBody({
      type: CreateUserDto,
      description: 'User data to create',
    }),
    ApiCreatedResponse({ description: 'User created', type: GetUserResDto }),
    ApiBadRequestResponse({ description: 'Validation failed' }),
    ApiConflictResponse({ description: 'User already exists' }),
  );

export {
  UsersControllerDocs,
  FindAllDocs,
  ValidateCredentialsDocs,
  FindOneByUsernameDocs,
  FindOneByIdDocs,
  RemoveByUsernameDocs,
  RemoveByIdDocs,
  CreateDocs,
};
