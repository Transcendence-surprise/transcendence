import { Controller, Post, Body, Get, Redirect } from '@nestjs/common';
import { AuthHttpService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authClient: AuthHttpService) {}

  @Post('login')
  login(@Body() dto: LoginUserDto) {
    return this.authClient.login(dto);
  }

  @Post('signup')
  signup(@Body() dto: SignupUserDto) {
    return this.authClient.signup(dto);
  }

  @Get('intra42')
  @Redirect()
  async intra42Auth() {
    const res = await this.authClient.intra42AuthRedirect();
    if (res.location) {
      return { url: res.location, statusCode: res.status };
    }
    throw new Error('No redirect from auth-service');
  }
}
