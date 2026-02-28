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
import { LoginUserResDto } from './dto/login-user-res.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import { LoginWith2FADto } from './dto/login-with-2fa.dto';
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
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.authService.login(loginUserDto);

    if ('twoFactorRequired' in result && result.twoFactorRequired) {
      return result;
    }

    const { access_token, ...response } = result as LoginUserResDto;
    this.setAccessTokenCookie(reply, access_token);
    return response;
  }

  @Post('login/2fa')
  @HttpCode(HttpStatus.OK)
  async loginWith2FA(
    @Body() loginWith2FADto: LoginWith2FADto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.authService.loginWith2FA(
      loginWith2FADto.email,
      loginWith2FADto.code,
    );
    const { access_token, ...response } = result;
    this.setAccessTokenCookie(reply, access_token);
    return response;
  }

  @Post('signup')
  @SignupDocs()
  async signup(
    @Body() signupUserDto: SignupUserDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.authService.signup(signupUserDto);
    const { access_token, ...response } = result;
    this.setAccessTokenCookie(reply, access_token);
    return response;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) reply: FastifyReply) {
    reply.clearCookie('access_token');
    return { ok: true };
  }

  @Get('google')
  @HttpCode(HttpStatus.FOUND)
  @Redirect()
  GoogleAuth() {
    const location = this.authService.getGoogleAuthUrl();
    return { url: location };
  }

  @Get('google/callback')
  async googleAuthCallback(
    @Query('code') code: string,
    @Res() reply: FastifyReply,
  ) {
    const result = await this.authService.googleAuthCallback(code);

    this.setAccessTokenCookie(reply, result.access_token);

    return reply.redirect(result.redirect, HttpStatus.FOUND);
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

    this.setAccessTokenCookie(reply, result.access_token);

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
