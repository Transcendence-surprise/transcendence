import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  Redirect,
  BadRequestException,
  Res,
  Inject,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import type { ConfigType } from '@nestjs/config';

import authConfig from 'src/config/auth.config';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import {
  AuthControllerDocs,
  LoginDocs,
  SignupDocs,
} from './auth.controller.docs';
import { OAuth42Data } from '../coommon/oauth42-data.decorator';

@AuthControllerDocs()
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(authConfig.KEY)
    private config: ConfigType<typeof authConfig>,
    private authService: AuthService
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @LoginDocs()
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('signup')
  @SignupDocs()
  signup(@Body() signupUserDto: SignupUserDto) {
    return this.authService.signup(signupUserDto);
  }

  @Get('intra42')
  @Redirect()
  intra42Auth() {
    const location = this.authService.getIntraAuthUrl();
    return { url: location };
  }

  @Get('intra42/callback')
  async intra42AuthCallback(
    @OAuth42Data() params: OAuth42Data,
    @Res() reply: FastifyReply,
  ) {
    if (!params.code || !params.state) {
      throw new BadRequestException('Invalid code and/or state in query');
    }
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

    return reply.redirect(result.redirect, 302);
  }
}
