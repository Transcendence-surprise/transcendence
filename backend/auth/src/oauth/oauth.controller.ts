import { Controller, Get, Query, Redirect, Res, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import type { ConfigType } from '@nestjs/config';

import authConfig from '../config/auth.config';
import { OAuthService } from './oauth.service';
import { AuthTokenResponseDto } from '../auth/dto/auth-token-response.dto';

interface OAuth42CallbackParams {
  code: string;
  state: string;
}
import {
  OAuthControllerDocs,
  GoogleAuthDocs,
  GoogleAuthCallbackDocs,
  Intra42AuthDocs,
  Intra42AuthCallbackDocs,
} from './oauth.controller.docs';
import { OAuth42Data } from '../common/decorators/oauth42-data.decorator';

@OAuthControllerDocs()
@Controller('auth')
export class OAuthController {
  constructor(
    private oauthService: OAuthService,
    @Inject(authConfig.KEY)
    private config: ConfigType<typeof authConfig>,
  ) {}

  @Get('google')
  @GoogleAuthDocs()
  @HttpCode(HttpStatus.FOUND)
  @Redirect()
  googleAuth() {
    return { url: this.oauthService.getGoogleAuthUrl() };
  }

  @Get('google/callback')
  @GoogleAuthCallbackDocs()
  async googleAuthCallback(@Query('code') code: string, @Res() reply: FastifyReply) {
    const result = await this.oauthService.googleAuthCallback(code) as AuthTokenResponseDto;
    this.setAccessTokenCookie(reply, result.access_token);
    return reply.redirect(this.config.frontend.url, HttpStatus.FOUND);
  }

  @Get('intra42')
  @Intra42AuthDocs()
  @HttpCode(HttpStatus.FOUND)
  @Redirect()
  intra42Auth() {
    return { url: this.oauthService.getIntraAuthUrl() };
  }

  @Get('intra42/callback')
  @Intra42AuthCallbackDocs()
  async intra42AuthCallback(@OAuth42Data() params: OAuth42CallbackParams, @Res() reply: FastifyReply) {
    const result = await this.oauthService.intra42AuthCallback(params.code, params.state) as AuthTokenResponseDto;
    this.setAccessTokenCookie(reply, result.access_token);
    return reply.redirect(this.config.frontend.url, HttpStatus.FOUND);
  }

  private setAccessTokenCookie(reply: FastifyReply, token: string) {
    reply.setCookie('access_token', token, {
      httpOnly: true,
      secure: this.config.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60,
    });
  }
}
