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
  ApiExtraModels,
  getSchemaPath,
  ApiResponse,
} from '@nestjs/swagger';
import { LoginUserDto } from './dto/login/login-user.dto';
import { LoginUserResDto } from './dto/login/login-user-res.dto';
import { SignupUserDto } from './dto/signup/signup-user.dto';
import { SignupUserResDto } from './dto/signup/signup-user-res.dto';
import { LoginWith2FADto } from './dto/login/login-with-2fa.dto';
import { LogoutResDto } from './dto/logout-res.dto';
import { CreatePasswordResetDto } from './dto/password-reset/create-password-reset.dto';
import { PasswordResetRequestResDto } from './dto/password-reset/password-reset-request-res.dto';
import { TwoFactorRequiredResDto } from './dto/login/two-factor-required-res.dto';

const AuthControllerDocs = () => ApiTags('Authentication');

const LoginDocs = () =>
  applyDecorators(
    ApiExtraModels(LoginUserResDto, TwoFactorRequiredResDto),
    ApiOperation({
      summary: 'User login',
      description: 'Authenticate user with credentials. Returns JWT cookie and user data if 2FA is disabled, or 2FA challenge if enabled.',
    }),
    ApiBody({
      description: 'User credentials',
      type: LoginUserDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Login successful - returns user data (if 2FA disabled) OR 2FA challenge (if 2FA enabled)',
      content: {
        'application/json': {
          schema: {
            oneOf: [
              { $ref: getSchemaPath(LoginUserResDto) },
              { $ref: getSchemaPath(TwoFactorRequiredResDto) },
            ],
          },
          examples: {
            'Without 2FA': {
              summary: '2FA disabled - user returned with JWT cookie',
              value: {
                user: {
                  id: 21,
                  username: 'john_doe',
                  email: 'john@example.com',
                  roles: ['user'],
                  isTwoFactorEnabled: false,
                  createdAt: '2026-03-01T12:00:00.000Z',
                  updatedAt: '2026-03-01T12:00:00.000Z',
                },
              },
            },
            'With 2FA': {
              summary: '2FA enabled - verification code sent to email',
              value: {
                twoFactorRequired: true,
                email: 'john@example.com',
                message: '2FA code sent to your email',
              },
            },
          },
        },
      },
      headers: {
        'Set-Cookie': {
          description: 'JWT access token as HttpOnly cookie (only set when 2FA is disabled)',
          schema: {
            type: 'string',
            example: 'access_token=eyJhbGciOi...; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400',
          },
        },
      },
    }),
    ApiBadRequestResponse({ description: 'Bad request' }),
    ApiUnauthorizedResponse({ description: 'Invalid credentials' }),
  );

const SignupDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'User signup',
      description: 'Register new user and set JWT access token as HttpOnly cookie',
    }),
    ApiBody({
      type: SignupUserDto,
      description: 'User credentials',
    }),
    ApiOkResponse({
      description: 'Signup successful, user returned and JWT set as HttpOnly cookie',
      type: SignupUserResDto,
      headers: {
        'Set-Cookie': {
          description: 'JWT access token as HttpOnly cookie',
          schema: {
            type: 'string',
            example: 'access_token=eyJhbGciOi...; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400',
          },
        },
      },
    }),
    ApiBadRequestResponse({ description: 'Bad request' }),
    ApiConflictResponse({ description: 'Username or email already exists' }),
  );

const LoginWith2FADocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'User login with 2FA',
      description: 'Complete two-factor authentication and set JWT access token as HttpOnly cookie',
    }),
    ApiBody({
      description: 'User email and 2FA verification code',
      type: LoginWith2FADto,
    }),
    ApiOkResponse({
      description: 'Login successful, user returned and JWT set as HttpOnly cookie',
      type: LoginUserResDto,
      headers: {
        'Set-Cookie': {
          description: 'JWT access token as HttpOnly cookie',
          schema: {
            type: 'string',
            example: 'access_token=eyJhbGciOi...; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400',
          },
        },
      },
    }),
    ApiBadRequestResponse({ description: 'Bad request' }),
    ApiUnauthorizedResponse({ description: 'Invalid code or email' }),
  );

const LogoutDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'User logout',
      description: 'Clear authentication cookie and logout user',
    }),
    ApiOkResponse({
      description: 'Logout successful',
      type: LogoutResDto,
    }),
  );

const PasswordResetDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Request password reset',
      description: 'Generate a one-time password reset token and send it to the user email',
    }),
    ApiBody({
      description: 'Email for the user that wants to reset their password',
      type: CreatePasswordResetDto,
    }),
    ApiOkResponse({
      description: 'Password reset request accepted',
      type: PasswordResetRequestResDto,
    }),
  );

const GoogleAuthDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'User authentication with Google',
      description: 'Redirect user to Google for authentication',
    }),
    ApiFoundResponse({ description: 'Redirection to Google authentication url' }),
  );

const GoogleAuthCallbackDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Callback for user returned from Google',
      description: 'Receive code and exchange with Google token for user authentication',
    }),
    ApiQuery({
      name: 'code',
      type: String,
      description: 'Authorization code from Google',
    }),
    ApiFoundResponse({
      description: 'Redirection to application with JWT set as HttpOnly cookie',
      headers: {
        'Set-Cookie': {
          description: 'JWT access token as HttpOnly cookie',
          schema: {
            type: 'string',
            example: 'access_token=eyJhbGciOi...; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400',
          },
        },
      },
    }),
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
      description: 'Authorization code from intra42',
    }),
    ApiQuery({
      name: 'state',
      type: String,
      description: 'State parameter to prevent CSRF attacks',
    }),
    ApiFoundResponse({
      description: 'Redirection to application with JWT set as HttpOnly cookie',
      headers: {
        'Set-Cookie': {
          description: 'JWT access token as HttpOnly cookie',
          schema: {
            type: 'string',
            example: 'access_token=eyJhbGciOi...; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400',
          },
        },
      },
    }),
  );

export {
  AuthControllerDocs,
  LoginDocs,
  LoginWith2FADocs,
  SignupDocs,
  LogoutDocs,
  PasswordResetDocs,
  GoogleAuthDocs,
  GoogleAuthCallbackDocs,
  Intra42AuthDocs,
  Intra42AuthCallbackDocs,
};
