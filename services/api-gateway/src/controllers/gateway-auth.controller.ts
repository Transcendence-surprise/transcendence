import { Controller, Post, Body } from '@nestjs/common';
import { AuthHttpService } from '../http-clients/auth-http.service';
import { LoginUserDto } from '../interfaces/auth/dto/login-user.dto';
import { SignupUserDto } from '../interfaces/auth/dto/signup-user.dto';
import { AuthLoginResponse } from '../interfaces/auth/service-auth-login-response';
import { AuthSignupResponse } from '../interfaces/auth/service-auth-signup-response';

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
