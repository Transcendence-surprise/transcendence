import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  Redirect,
  BadRequestException,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import {
  AuthControllerDocs,
  LoginDocs,
  SignupDocs,
} from './auth.controller.docs';
import { OAuth42Data } from '../../coommon/oauth42-data.decorator';

@AuthControllerDocs()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
  @Redirect()
  async intra42AuthCallback(@OAuth42Data() params: OAuth42Data) {
    if (!params.code || !params.state) {
      throw new BadRequestException('Invalid code and/or state in query');
    }
    const result = await this.authService.intra42AuthCallback(
      params.code,
      params.state,
    );
    return { url: result.redirect };
  }
}
