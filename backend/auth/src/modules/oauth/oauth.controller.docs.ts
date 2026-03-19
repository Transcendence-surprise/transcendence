import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiFoundResponse,
  ApiQuery,
} from '@nestjs/swagger';

const OAuthControllerDocs = () => ApiTags('Authentication');

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
    }),
  );

const Intra42AuthDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'User authentication with intra42',
      description: 'Redirect user with formed url to intra for authentication',
    }),
    ApiFoundResponse({ description: 'Redirection to authentication url' }),
  );

const Intra42AuthCallbackDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Callback for user returned from intra42',
      description: 'Receive code and exchange with intra42 token for user authentication',
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
    }),
  );

export {
  OAuthControllerDocs,
  GoogleAuthDocs,
  GoogleAuthCallbackDocs,
  Intra42AuthDocs,
  Intra42AuthCallbackDocs,
};
