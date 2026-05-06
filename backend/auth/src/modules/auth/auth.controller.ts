import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  Inject,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import type { ConfigType } from '@nestjs/config';

import authConfig from '../../config/auth.config';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login/login-user.dto';
import { SignupUserDto } from './dto/signup/signup-user.dto';
import { LoginWith2FADto } from './dto/login/login-with-2fa.dto';
import { CreatePasswordResetDto } from './dto/password-reset/create-password-reset.dto';
import { ConfirmPasswordResetDto } from './dto/password-reset/confirm-password-reset.dto';
import { AuthTokenResponseDto } from './dto/auth-token-response.dto';
import { CreateGuestTokenDto } from './dto/guest/create-guest-token.dto';
import {
  AuthControllerDocs,
  LoginDocs,
  LoginWith2FADocs,
  SignupDocs,
  LogoutDocs,
  PasswordResetDocs,
  PasswordResetConfirmDocs,
} from './auth.controller.docs';

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

  @Post('password-reset/confirm')
  @PasswordResetConfirmDocs()
  @HttpCode(HttpStatus.OK)
  async confirmPasswordReset(
    @Body() confirmPasswordResetDto: ConfirmPasswordResetDto,
  ) {
    await this.authService.confirmPasswordReset(
      confirmPasswordResetDto.token,
      confirmPasswordResetDto.password,
    );

    return { ok: true };
  }

  @Post('logout')
  @LogoutDocs()
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) reply: FastifyReply) {
    reply.clearCookie('access_token');
    return { ok: true };
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
    this.setAccessTokenCookie(reply, token);
    return { ok: true };
  }
}
