import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';

const AuthControllerDocs = () => ApiTags('Authentication');

const LoginDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'User login',
      description: 'Authenticate user and return JWT access token',
    }),
    ApiBody({
      type: LoginUserDto,
      description: 'User credentials',
    }),
    ApiResponse({
      status: 200,
      description: 'Login successful, JWT token and user returned',
      schema: {
        type: 'object',
        properties: {
          access_token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          user: {
            type: 'object',
            example: {
              id: 74,
              username: 'test',
              email: 'test@gmail.com',
            },
          },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Invalid credentials' }),
    ApiResponse({
      status: 400,
      description: 'Bad request - validation failed',
    }),
  );

const SignupDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'User signup',
      description: 'Signup user and return JWT access token',
    }),
    ApiBody({
      type: SignupUserDto,
      description: 'User credentials',
    }),
    ApiResponse({
      status: 200,
      description: 'Signup successful, JWT token and user returned',
      schema: {
        type: 'object',
        properties: {
          access_token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          user: {
            type: 'object',
            example: {
              id: 74,
              username: 'test',
              email: 'test@gmail.com',
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Username or email already exists',
    }),
    ApiResponse({
      status: 400,
      description: 'Validation failed',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
    }),
  );

export { AuthControllerDocs, LoginDocs, SignupDocs };
