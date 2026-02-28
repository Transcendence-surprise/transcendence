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
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { AuthHttpService } from './auth.service';
import { OAuth42Params } from '../../common/decorator/oauth42-params.decorator';

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
    console.log('gateway before res, code', code);
    const res = await this.authClient.googleAuthCallback(code);
    console.log('gateway after res');

    this.forwardCookies(reply, res.cookies);

    if (res.location) {
      return reply.redirect(res.location, res.status);
    }
    throw new Error('No redirect from auth');
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
    throw new Error('No redirect from auth');
  }

  @Get('api-keys')
  async getAllApiKeys() {
    return this.authClient.getAllApiKeys();
  }

  @Post('api-keys')
  async createApiKey() {
    return this.authClient.createApiKey();
  }

  @Delete('api-keys')
  async removeApiKeyById(@Param('id') id: string) {
    return this.authClient.removeApiKeyById(Number(id));
  }

  private forwardCookies(reply: FastifyReply, cookies?: string[]) {
    if (cookies?.length) {
      reply.header('set-cookie', cookies);
    }
  }
}
