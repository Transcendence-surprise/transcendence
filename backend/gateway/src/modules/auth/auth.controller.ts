import {
  Controller,
  Post,
  Body,
  Get,
  Redirect,
  Res,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { AuthHttpService } from './auth.service';
import { OAuth42Params } from '../../common/decorator/oauth42-params.decorator';
import { CreateGuestTokenDto } from './dto/create-guest-token.dto';
import { Auth, AuthType } from '../../common/decorator/auth-type.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authClient: AuthHttpService) {}

  @Post('login')
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const res = await this.authClient.login(body);
    this.forwardCookies(reply, res.cookies);
    return res.data;
  }

  @Post('login/2fa')
  async loginWith2FA(
    @Body() body: unknown,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const res = await this.authClient.loginWith2FA(body);
    this.forwardCookies(reply, res.cookies);
    return res.data;
  }

  @Post('signup')
  async signup(
    @Body() body: unknown,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const res = await this.authClient.signup(body);
    this.forwardCookies(reply, res.cookies);
    return res.data;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) reply: FastifyReply) {
    const res = await this.authClient.logout();
    this.forwardCookies(reply, res.cookies);
    return res.data;
  }

  @Post('password-reset')
  async requestPasswordReset(@Body() body: unknown) {
    return this.authClient.requestPasswordReset(body);
  }

  @Post('password-reset/confirm')
  async confirmPasswordReset(@Body() body: unknown) {
    return this.authClient.confirmPasswordReset(body);
  }

  @Get('google')
  @Redirect()
  async googleAuth() {
    const res = await this.authClient.googleAuthRedirect();
    if (res.location) {
      return { url: res.location, statusCode: res.status };
    }
    throw new Error('No redirect from auth');
  }

  @Get('google/callback')
  async googleAuthCallback(
    @Query('code') code: string,
    @Res() reply: FastifyReply,
  ) {
    const res = await this.authClient.googleAuthCallback(code);

    this.forwardCookies(reply, res.cookies);

    if (res.location) {
      return reply.redirect(res.location, res.status);
    }
    return reply.status(res.status).send(res.data ?? { message: 'Auth error' });
  }

  @Get('intra42')
  @Redirect()
  async intra42Auth() {
    const res = await this.authClient.intra42AuthRedirect();
    if (res.location) {
      return { url: res.location, statusCode: res.status };
    }
    throw new Error('No redirect from auth');
  }

  @Get('intra42/callback')
  async intra42AuthCallback(
    @OAuth42Params() params: OAuth42Params,
    @Res() reply: FastifyReply,
  ) {
    const res = await this.authClient.intra42AuthCallback(
      params.code,
      params.state,
    );

    this.forwardCookies(reply, res.cookies);

    if (res.location) {
      return reply.redirect(res.location, res.status);
    }
    return reply.status(res.status).send(res.data ?? { message: 'Auth error' });
  }

  @Get('api-keys')
  async getAllApiKeys() {
    return this.authClient.getAllApiKeys();
  }

  @Post('api-keys')
  async createApiKey() {
    return this.authClient.createApiKey();
  }

  @Delete('api-keys/:id')
  @Auth(AuthType.JWT_OR_API_KEY)
  @UseGuards(AuthGuard)
  async removeApiKeyById(@Param('id') id: string) {
    return this.authClient.removeApiKeyById(id);
  }

  @Post('guest-token')
  async createGuestToken(
    @Body() body: CreateGuestTokenDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const res = await this.authClient.createGuestToken(body.nickname);
    this.forwardCookies(reply, res.cookies);
    return { ok: res.ok };
  }

  private forwardCookies(reply: FastifyReply, cookies?: string[]) {
    if (cookies?.length) {
      reply.header('set-cookie', cookies);
    }
  }
}
