import { Injectable, Inject, BadRequestException, ConflictException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { ConfigType } from '@nestjs/config';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { randomUUID, randomBytes } from 'node:crypto';

import authConfig from '../../config/auth.config';
import { AuthService } from '../auth/auth.service';
import { OAuth42ResDto } from './dto/oauth42-res.dto';
import { Profile42ResDto } from './dto/profile42-res.dto';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { GetUserResDto } from '../auth/dto/get-user-res.dto';
import { AxiosError } from 'axios';

@Injectable()
export class OAuthService {
  constructor(
    @Inject(authConfig.KEY)
    private config: ConfigType<typeof authConfig>,
    private httpService: HttpService,
    private authService: AuthService,
  ) {}

  private getAuthClient(): OAuth2Client {
    return new OAuth2Client(
      this.config.google.clientId,
      this.config.google.secret,
      this.config.google.redirectUri,
    );
  }

  getGoogleAuthUrl(): string {
    const authClient = this.getAuthClient();
    return authClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
      prompt: 'consent',
    });
  }

  async googleAuthCallback(code: string) {
    const authClient = this.getAuthClient();
    const tokenData = await authClient.getToken(code);
    authClient.setCredentials(tokenData.tokens);
    const googleAuth = google.oauth2({ version: 'v2', auth: authClient });
    const userInfo = await googleAuth.userinfo.get();
    const { email, given_name } = userInfo.data;

    if (!email || !given_name) {
      throw new BadRequestException('google did not provide required email and/or name');
    }

    let user = await this.findUserByEmail(email);
    if (!user) {
      user = await this.createUserFromInfo(given_name, email);
    }

    return this.authService.generateJwtToken(user);
  }

  getIntraAuthUrl(): string {
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
      user = await this.createUserFromInfo(profile.login, profile.email);
    }

    return this.authService.generateJwtToken(user);
  }

  private async exchangeCodeForToken(code: string, state: string): Promise<OAuth42ResDto> {
    const { clientId, tokenUrl, redirectUri, secret } = this.config.intra42;
    const oauthParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: secret,
      code,
      redirect_uri: redirectUri,
      state,
    });

    const tokenResponse = await this.httpService.axiosRef.post<OAuth42ResDto>(tokenUrl, oauthParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return tokenResponse.data;
  }

  private async fetchProfile(userUrl: string, accessToken: string): Promise<Profile42ResDto> {
    const profileResponse = await this.httpService.axiosRef.get<Profile42ResDto>(userUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return profileResponse.data;
  }

  private async findUserByEmail(email: string): Promise<GetUserResDto | null> {
    try {
      const response = await this.httpService.axiosRef.get<GetUserResDto>(`${this.config.core.url}/api/users/by-email/${email}`);
      return response.data;
    } catch {
      return null;
    }
  }

  private async createUserFromInfo(name: string, email: string): Promise<GetUserResDto> {
    const baseUsername = name;
    let username = baseUsername;
    const maxAttempts = 10;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const createUserDto: CreateUserDto = { username, email };
        const response = await this.httpService.axiosRef.post<GetUserResDto>(`${this.config.core.url}/api/users`, createUserDto);
        return response.data;
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 409 && attempt < maxAttempts - 1) {
          const suffix = randomBytes(6).toString('hex');
          username = `${baseUsername}_${suffix}`;
          continue;
        }
        throw error;
      }
    }

    throw new ConflictException(`Username already exists`);
  }
}
