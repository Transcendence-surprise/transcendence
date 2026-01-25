import { Controller, Post, Body } from '@nestjs/common';
import { AuthHttpService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import { AuthLoginResponse } from './interfaces/service-auth-login-response';
import { AuthSignupResponse } from './interfaces/service-auth-signup-response';

@Controller('auth')
export class GatewayAuthController {
  constructor(private readonly authClient: AuthHttpService) {}

  @Post('login')
  async login(@Body() dto: LoginUserDto): Promise<AuthLoginResponse> {
    return this.authClient.login(dto);
  }

  @Post('signup')
  async signup(@Body() dto: SignupUserDto): Promise<AuthSignupResponse> {
    return this.authClient.signup(dto);
  }
}
