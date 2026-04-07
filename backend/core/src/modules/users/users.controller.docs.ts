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
  ApiExcludeEndpoint,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { ValidateCredDto } from './dto/validate-credentials.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserResDto } from './dto/get-user-res.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPartialDto } from './dto/update-user-partial.dto';

const UsersControllerDocs = () => ApiTags('Users');

const FindAllDocs = () =>
  applyDecorators(
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
    ApiExcludeEndpoint(),
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
    ApiOperation({
      summary: 'Create a new user',
      description: 'Create a new user with the provided data',
      operationId: 'createUser',
    }),
    ApiBody({
      description: 'User data to create',
      type: CreateUserDto,
    }),
    ApiCreatedResponse({ description: 'User created', type: GetUserResDto }),
    ApiBadRequestResponse({ description: 'Validation failed' }),
    ApiConflictResponse({ description: 'User already exists' }),
  );

const GetMeDocs = () =>
  applyDecorators(
    ApiCookieAuth('JWT'),
    ApiOperation({
      summary: 'Get current user',
      description: 'Retrieve the currently authenticated user profile',
      operationId: 'getCurrentUser',
    }),
    ApiOkResponse({
      description: 'Current user data',
      type: GetUserResDto,
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized - JWT token required' }),
  );

const UpdateMeDocs = () =>
  applyDecorators(
    ApiCookieAuth('JWT'),
    ApiOperation({
      summary: 'Update current user',
      description:
        'Update the currently authenticated user profile, including optional avatarImageId to change avatar',
      operationId: 'updateCurrentUser',
    }),
    ApiBody({
      description: 'User data to update',
      type: UpdateMeDto,
    }),
    ApiOkResponse({
      description: 'User updated successfully',
      type: GetUserResDto,
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized - JWT token required' }),
    ApiBadRequestResponse({ description: 'Bad request - Invalid data' }),
  );

const UploadAvatarDocs = () =>
  applyDecorators(
    ApiCookieAuth('JWT'),
    ApiOperation({
      summary: 'Upload avatar for current user',
      description:
        'Upload an avatar image file (multipart/form-data) and assign it to the current user profile',
      operationId: 'uploadCurrentUserAvatar',
    }),
    ApiBody({
      description: 'Avatar file as form-data, field name `file`',
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Avatar uploaded and user updated',
      type: GetUserResDto,
    }),
    ApiBadRequestResponse({ description: 'Missing/invalid image upload' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized - JWT token required' }),
  );

const FindOneByEmailDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get user by email',
      description: 'Retrieve a user by their email address',
      operationId: 'getUserByEmail',
    }),
    ApiParam({
      name: 'email',
      type: 'string',
      description: 'Email address of the user',
      example: 'john@example.com',
    }),
    ApiOkResponse({
      description: 'User data',
      type: GetUserResDto,
    }),
    ApiNotFoundResponse({ description: 'User not found' }),
  );

const UpdateUserDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create or replace user (PUT)',
      description: 'Create user with specified ID if not exists (201), or replace all user data (200). Implements idempotent upsert behavior.',
      operationId: 'updateUser',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'ID of the user to create or update',
      example: 1,
    }),
    ApiBody({
      description: 'Complete user data',
      type: UpdateUserDto,
    }),
    ApiOkResponse({
      description: 'User updated successfully (existing user)',
      type: GetUserResDto,
    }),
    ApiCreatedResponse({
      description: 'User created successfully (new user)',
      type: GetUserResDto,
    }),
    ApiBadRequestResponse({ description: 'Bad request - Invalid data' }),
    ApiConflictResponse({ description: 'Username or email already exists' }),
  );

const UpdateUserPartialDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update user fields (PATCH)',
      description: 'Update specific user fields (partial update)',
      operationId: 'updateUserPartial',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'ID of the user to update',
      example: 1,
    }),
    ApiBody({
      description: 'Fields to update',
      type: UpdateUserPartialDto,
    }),
    ApiOkResponse({
      description: 'User updated successfully',
      type: GetUserResDto,
    }),
    ApiNotFoundResponse({ description: 'User not found' }),
    ApiBadRequestResponse({ description: 'Bad request - Invalid data' }),
    ApiConflictResponse({ description: 'Username or email already exists' }),
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
  GetMeDocs,
  UpdateMeDocs,
  FindOneByEmailDocs,
  UpdateUserDocs,
  UpdateUserPartialDocs,
  UploadAvatarDocs,
};
