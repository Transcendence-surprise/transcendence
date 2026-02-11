import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiConflictResponse,
  ApiFoundResponse,
  ApiQuery,
  ApiCreatedResponse,
  ApiParam,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserResDto } from './dto/login-user-res.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import { SignupUserResDto } from './dto/signup-user-res.dto';
import { CreateApiKeyResDto } from './dto/create-api-key-res.dto';
import { GetApiKeyResDto } from './dto/get-api-key-res.dto';

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
      type: LoginUserResDto,
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
      type: SignupUserResDto,
    }),
    ApiBadRequestResponse({ description: 'Bad request' }),
    ApiConflictResponse({ description: 'Username or email already exists' }),
  );

const Intra42AuthDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'User authentication with intra42',
      description: 'Redirect user with formed url to intra for authenitcation'
    }),
    ApiFoundResponse({ description: 'Redirection to authentication url' }),
  );

const Intra42AuthCallbackDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Callback for user returned from intra42',
      description: 'Receive code and exchange with intra42 token for user authentication'
    }),
    ApiQuery({
      name: 'code',
      type: String,
    }),
    ApiQuery({
      name: 'state',
      type: String,
      description: 'Code was sent in redirection to intra42 and received to ensure, that redirection was not hacked'
    }),
    ApiFoundResponse({
      description: 'Redirection to application with auth cookie set',
      headers: {
        'Cookie': {
          description: 'Authentication cookie',
          schema: {
            type: 'string',
            example:
              'auth_payload=%7B%22access_token%22%3A%22eyJhb...; HttpOnly; Path=/; Secure; SameSite=None',
          },
        },
      },
    }),
  );

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
  AuthControllerDocs,
  LoginDocs,
  SignupDocs,
  Intra42AuthDocs,
  Intra42AuthCallbackDocs,
  GetApiKeysDocs,
  CreateApiKeyDocs,
  RemoveApiKeyDocs,
  ValidateApiKeyDocs,
};
