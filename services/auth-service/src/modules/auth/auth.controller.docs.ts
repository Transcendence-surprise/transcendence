import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserResponseDto } from './dto/login-user-response.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import { SignupUserResponseDto } from './dto/signup-user-response.dto';

const AuthControllerDocs = () => ApiTags('Authentication');

const LoginDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'User login',
      description: 'Authenticate user and return JWT access token',
    }),
    ApiBody({
      description: 'User credentials',
      type: LoginUserDto,
    }),
    ApiOkResponse({
      description: 'Login successful, JWT token and user returned',
      type: LoginUserResponseDto,
    }),
    ApiBadRequestResponse({ description: 'Bad request' }),
    ApiUnauthorizedResponse({ description: 'Invalid credentials' }),
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
    ApiOkResponse({
      description: 'Signup successful, JWT token and user returned',
      type: SignupUserResponseDto,
    }),
    ApiBadRequestResponse({ description: 'Bad request' }),
    ApiConflictResponse({ description: 'Username or email already exists' }),
  );

export { AuthControllerDocs, LoginDocs, SignupDocs };
