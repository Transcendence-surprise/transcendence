import {
  Controller,
  Post,
  Body,
  Get,
  Redirect,
  Res,
  Delete,
  Param,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { AuthHttpService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import { OAuth42Params } from '../../common/decorator/oauth42-params.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authClient: AuthHttpService) {}

  @Post('login')
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const res = await this.authClient.login(dto);
    this.forwardCookies(reply, res.cookies);
    return res.data;
  }

  @Post('signup')
  async signup(
    @Body() dto: SignupUserDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const res = await this.authClient.signup(dto);
    this.forwardCookies(reply, res.cookies);
    return res.data;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) reply: FastifyReply) {
    const res = await this.authClient.logout();
    this.forwardCookies(reply, res.cookies);
    return res.data;
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
