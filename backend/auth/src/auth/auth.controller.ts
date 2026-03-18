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
import { LoginWith2FADto } from './dto/login-with-2fa.dto';
import { CreatePasswordResetDto } from './dto/create-password-reset.dto';
import { AuthTokenResponseDto } from './dto/auth-token-response.dto';
import { CreateGuestTokenDto } from './dto/create-guest-token.dto';
import {
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

    const { access_token, ...response } = result as AuthTokenResponseDto;
    this.setAccessTokenCookie(reply, access_token);
    return response;
  }

  @Post('login/2fa')
  @LoginWith2FADocs()
  @HttpCode(HttpStatus.OK)
  async loginWith2FA(
    @Body() loginWith2FADto: LoginWith2FADto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.authService.loginWith2FA(
      loginWith2FADto.email,
      loginWith2FADto.code,
    ) as AuthTokenResponseDto;
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
    const result = await this.authService.signup(signupUserDto) as AuthTokenResponseDto;
    const { access_token, ...response } = result;
    this.setAccessTokenCookie(reply, access_token);
    return response;
  }

  @Post('password-reset')
  @PasswordResetDocs()
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() createPasswordResetDto: CreatePasswordResetDto,
  ) {
    await this.authService.createPasswordResetToken(createPasswordResetDto.email);
    return { ok: true };
  }

  @Post('logout')
  @LogoutDocs()
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) reply: FastifyReply) {
    reply.clearCookie('access_token');
    return { ok: true };
  }

  @Get('google')
  @GoogleAuthDocs()
  @HttpCode(HttpStatus.FOUND)
  @Redirect()
  GoogleAuth() {
    const location = this.authService.getGoogleAuthUrl();
    return { url: location };
  }

  @Get('google/callback')
  @GoogleAuthCallbackDocs()
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

  @Post('guest-token')
  async createGuestToken(
    @Body() body: CreateGuestTokenDto,
    @Res({ passthrough: true }) reply: FastifyReply
  ) {
    const token = await this.authService.createGuestToken(body.nickname);
    reply.setCookie('guest_token', token, {
      httpOnly: true,
      secure: this.config.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60,
    });
    return { ok: true };
  }

}
