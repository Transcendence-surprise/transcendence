import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  Redirect,
  Res,
  Inject,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import type { ConfigType } from '@nestjs/config';

import authConfig from '../config/auth.config';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import {
  AuthControllerDocs,
  LoginDocs,
  SignupDocs,
  Intra42AuthDocs,
  Intra42AuthCallbackDocs,
  GetApiKeysDocs,
  CreateApiKeyDocs,
  RemoveApiKeyDocs,
  ValidateApiKeyDocs,
} from './auth.controller.docs';
import { OAuth42Data } from '../common/decorators/oauth42-data.decorator';

@AuthControllerDocs()
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(authConfig.KEY)
    private config: ConfigType<typeof authConfig>,
    private authService: AuthService
  ) {}

  @Post('login')
  @LoginDocs()
  @HttpCode(HttpStatus.OK)
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('signup')
  @SignupDocs()
  signup(@Body() signupUserDto: SignupUserDto) {
    return this.authService.signup(signupUserDto);
  }

  @Get('intra42')
  @HttpCode(HttpStatus.FOUND)
  @Intra42AuthDocs()
  @Redirect()
  intra42Auth() {
    const location = this.authService.getIntraAuthUrl();
    return { url: location };
  }

  @Get('intra42/callback')
  @Intra42AuthCallbackDocs()
  async intra42AuthCallback(
    @OAuth42Data() params: OAuth42Data,
    @Res() reply: FastifyReply,
  ) {
    const result = await this.authService.intra42AuthCallback(
      params.code,
      params.state,
    );

    reply.setCookie(
      'auth_payload',
      JSON.stringify({
        access_token: result.access_token,
        user: result.user,
      }),
      {
        httpOnly: true,
        secure: this.config.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60,
      },
    );

    return reply.redirect(result.redirect, HttpStatus.FOUND);
  }

  @Get('api-keys')
  @GetApiKeysDocs()
  getAllApiKeys() {
    return this.authService.getAllApiKeys();
  }

  @Post('api-keys')
  @CreateApiKeyDocs()
  createApiKey() {
    return this.authService.createApiKey();
  }

  @Delete('api-keys')
  @RemoveApiKeyDocs()
  removeApiKeyById(@Param('id') id: string) {
    return this.authService.removeApiKeyById(id);
  }

  @Get('api-keys/validate')
  @ValidateApiKeyDocs()
  validateApiKey(@Query('token') token: string) {
    return this.authService.validateApiKey(token);
  }
}
