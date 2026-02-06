import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';

import { randomUUID } from 'node:crypto';

import { LoginUserDto } from './dto/login-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import { OAuth42ResDto } from './dto/oauth42-res.dto';
import { Profile42ResDto } from './dto/profile42-res.dto';
import { GetUserResDto } from './dto/get-user-res.dto';
import authConfig from '../config/auth.config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(authConfig.KEY)
    private config: ConfigType<typeof authConfig>,
    private httpService: HttpService,
    private jwtService: JwtService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const response = await this.httpService.axiosRef.post<GetUserResDto>(
      `${this.config.backend.url}/api/users/validate-credentials`,
      loginUserDto,
    );
    return this.generateAuthResponse(response.data);
  }

  async signup(signupUserDto: SignupUserDto) {
    const response = await this.httpService.axiosRef.post<GetUserResDto>(
      `${this.config.backend.url}/api/users`,
      signupUserDto,
    );
    return this.generateAuthResponse(response.data);
  }

  getIntraAuthUrl() {
    const { clientId, redirectUri, authUrl } = this.config.intra42;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'public',
      state: randomUUID(),
      response_type: 'code',
    });

    return `${authUrl}?${params.toString()}`;
  }

  async intra42AuthCallback(code: string, state: string) {
    const { userUrl } = this.config.intra42;

    const token = await this.exchangeCodeForToken(code, state);
    const profile = await this.fetchProfile(userUrl, token.access_token);

    let user = await this.findUserByEmail(profile.email);
    if (!user) {
      user = await this.createUserFromProfile(profile);
    }

    const authResponse = await this.generateAuthResponse(user);

    return {
      access_token: authResponse.access_token,
      user: authResponse.user,
      redirect: this.config.frontend.url,
    };
  }

  private async exchangeCodeForToken(
    code: string, state: string
  ): Promise<OAuth42ResDto> {
    const { clientId, tokenUrl, redirectUri, secret } = this.config.intra42;


    const oauthParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: secret,
      code: code,
      redirect_uri: redirectUri,
      state: state,
    });

    const tokenResponse = await this.httpService.axiosRef.post<OAuth42ResDto>(
      tokenUrl,
      oauthParams.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    const data = tokenResponse.data;
    const token: OAuth42ResDto = {
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      refresh_token: data.refresh_token,
      scope: data.scope,
      created_at: data.created_at,
      secret_valid_until: data.secret_valid_until,
    };

    return token;
  }

  private async fetchProfile(userUrl: string, accessToken: string): Promise<Profile42ResDto> {
    const profileResponse = await this.httpService.axiosRef.get<Profile42ResDto>(userUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return profileResponse.data;
  }

  private async findUserByEmail(email: string): Promise<GetUserResDto | null> {
    try {
      const response = await this.httpService.axiosRef.get<GetUserResDto>(
        `${this.config.backend.url}/api/users/by-email/${email}`,
      );
      return response.data;
    } catch {
      return null;
    }
  }

  private async createUserFromProfile(profile: Profile42ResDto): Promise<GetUserResDto> {
    const timestamp = Math.floor(Date.now() / 1000);
    const username = `${profile.login}_${timestamp}`;

    const createUserDto: SignupUserDto = {
      username,
      email: profile.email,
      password: '123',
    };

    const response = await this.httpService.axiosRef.post<GetUserResDto>(
      `${this.config.backend.url}/api/users`,
      createUserDto,
    );
    return response.data;
  }

  private async generateAuthResponse(user: GetUserResDto) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user,
    };
  }
}
