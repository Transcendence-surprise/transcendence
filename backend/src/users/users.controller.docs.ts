import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ValidateCredDto } from './dto/validate-credentials.dto';
import { CreateUserDto } from './dto/create-user.dto';

const UsersControllerDocs = () => ApiTags('Users');

const FindAllDocs = () =>
  applyDecorators(
    ApiTags('Public'),
    ApiOperation({
      summary: 'Get all users',
      description: 'Retrieve a list of all users',
    }),
    ApiResponse({
      status: 200,
      description: 'List of users',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            username: { type: 'string', example: 'john_doe' },
            email: { type: 'string', example: 'john@example.com' },
            userType: { type: 'string', example: 'registered' },
            createdAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
          },
        },
      },
    }),
  );

const ValidateCredentialsDocs = () =>
  applyDecorators(
    ApiTags('Internal'),
    ApiOperation({
      summary: 'Validate user credentials',
      description: 'Validate user credentials for authentication',
    }),
    ApiBody({
      type: ValidateCredDto,
      description: 'User credentials to validate',
    }),
    ApiResponse({
      status: 200,
      description: 'Credentials are valid, user data returned',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          username: { type: 'string', example: 'john_doe' },
          email: { type: 'string', example: 'john@example.com' },
          userType: { type: 'string', example: 'registered' },
          createdAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
          updatedAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Invalid credentials' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
  );

const FindOneByUsernameDocs = () =>
  applyDecorators(
    ApiTags('Public'),
    ApiOperation({
      summary: 'Get user by username',
      description: 'Retrieve a user by their username',
    }),
    ApiParam({
      name: 'username',
      type: 'string',
      description: 'Username of the user',
      example: 'john_doe',
    }),
    ApiResponse({
      status: 200,
      description: 'User data',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          username: { type: 'string', example: 'john_doe' },
          email: { type: 'string', example: 'john@example.com' },
          userType: { type: 'string', example: 'registered' },
          createdAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
          updatedAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
        },
      },
    }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );

const FindOneByIdDocs = () =>
  applyDecorators(
    ApiTags('Public'),
    ApiOperation({
      summary: 'Get user by ID',
      description: 'Retrieve a user by their ID (authenticated user only)',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'ID of the user',
      example: 1,
    }),
    ApiResponse({
      status: 200,
      description: 'User data',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          username: { type: 'string', example: 'john_doe' },
          email: { type: 'string', example: 'john@example.com' },
          userType: { type: 'string', example: 'registered' },
          createdAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
          updatedAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );

const RemoveByUsernameDocs = () =>
  applyDecorators(
    ApiTags('Public'),
    ApiOperation({
      summary: 'Delete user by username',
      description: 'Delete a user by their username',
    }),
    ApiParam({
      name: 'username',
      type: 'string',
      description: 'Username of the user to delete',
      example: 'john_doe',
    }),
    ApiResponse({ status: 200, description: 'User deleted' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );

const RemoveByIdDocs = () =>
  applyDecorators(
    ApiTags('Public'),
    ApiOperation({
      summary: 'Delete user by ID',
      description: 'Delete a user by their ID',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'ID of the user to delete',
      example: 1,
    }),
    ApiResponse({ status: 200, description: 'User deleted' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );

const CreateDocs = () =>
  applyDecorators(
    ApiTags('Public'),
    ApiOperation({
      summary: 'Create a new user',
      description: 'Create a new user with the provided data',
    }),
    ApiBody({
      type: CreateUserDto,
      description: 'User data to create',
    }),
    ApiResponse({
      status: 201,
      description: 'User created',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          username: { type: 'string', example: 'john_doe' },
          email: { type: 'string', example: 'john@example.com' },
          userType: { type: 'string', example: 'registered' },
          createdAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
          updatedAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Validation failed' }),
    ApiResponse({ status: 409, description: 'User already exists' }),
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
