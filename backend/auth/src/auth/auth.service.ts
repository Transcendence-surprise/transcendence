import { Injectable, Inject, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { randomUUID, randomBytes, createHmac, randomInt } from 'node:crypto';

import { LoginUserDto } from './dto/login-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import { OAuth42ResDto } from './dto/oauth42-res.dto';
import { Profile42ResDto } from './dto/profile42-res.dto';
import { GetUserResDto } from './dto/get-user-res.dto';
import { CreateApiKeyResDto } from './dto/create-api-key-res.dto';
import { CreateUserDto } from './dto/create-user.dto';
import authConfig from '../config/auth.config';
import { ApiKey } from '@transcendence/db-entities';
import { AxiosError } from 'axios';

interface TwoFactorCode {
  code: string;
  expiresAt: Date;
  userId: number;
}

@Injectable()
export class AuthService {
  private codeStore = new Map<string, TwoFactorCode>();
  private readonly CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

  constructor(
    @Inject(authConfig.KEY)
    private config: ConfigType<typeof authConfig>,
    private httpService: HttpService,
    private jwtService: JwtService,
    @InjectRepository(ApiKey)
    private apiKeyRepo: Repository<ApiKey>,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const response = await this.httpService.axiosRef.post<GetUserResDto>(
      `${this.config.core.url}/api/users/validate-credentials`,
      loginUserDto,
    );

    const user = response.data;

    if (user.twoFactorEnabled) {
      await this.sendTwoFactorCode(user.email, user.id);

      return {
        twoFactorRequired: true,
        email: user.email,
        message: 'A verification code has been sent to your email',
      };
    }

    return this.generateJwtToken(user);
  }

  async loginWith2FA(email: string, code: string) {
    const valid = this.verifyTwoFactorCode(email, code);

    if (!valid) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateJwtToken(user);
  }

  async signup(signupUserDto: SignupUserDto) {
    const response = await this.httpService.axiosRef.post<GetUserResDto>(
      `${this.config.core.url}/api/users`,
      signupUserDto,
    );
    return this.generateJwtToken(response.data);
  }

  private getAuthClient(): OAuth2Client {
    const authClient = new OAuth2Client(
      this.config.google.clientId,
      this.config.google.secret,
      this.config.google.redirectUri,
    );

    return authClient;
  }

  getGoogleAuthUrl() {
    const authClient = this.getAuthClient();

    const authorizeUrl = authClient.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      prompt: 'consent',
    })

    return authorizeUrl;
  }

  async googleAuthCallback(code: string) {
    const authClient = this.getAuthClient();
    const tokenData = await authClient.getToken(code);
    const tokens = tokenData.tokens;

    authClient.setCredentials(tokens);

    const googleAuth = google.oauth2({
      version: 'v2',
      auth: authClient
    });

    const userInfo = await googleAuth.userinfo.get();
    const { email, given_name } = userInfo.data;

    if (!email || !given_name) {
      throw new BadRequestException('google did not provide required email and/or name');
    }

    let user = await this.findUserByEmail(email);
    if (!user) {
      user = await this.createUserFromInfo(given_name, email);
    }

    const authResponse = await this.generateJwtToken(user);

    return {
      access_token: authResponse.access_token,
      redirect: this.config.frontend.url,
    };
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
      user = await this.createUserFromInfo(profile.login, profile.email);
    }

    const authResponse = await this.generateJwtToken(user);

    return {
      access_token: authResponse.access_token,
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
        `${this.config.core.url}/api/users/by-email/${email}`,
      );
      return response.data;
    } catch {
      return null;
    }
  }

  private async createUserFromInfo(name: string, email: string): Promise<GetUserResDto> {
    const baseUsername = name;
    let username = baseUsername;
    const maxAttempts = 10;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const createUserDto: CreateUserDto = {
          username,
          email: email,
        };

        const response = await this.httpService.axiosRef.post<GetUserResDto>(
          `${this.config.core.url}/api/users`,
          createUserDto,
        );

        return response.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 409 && attempt < maxAttempts - 1) {
            const suffix = randomBytes(6).toString('hex');
            username = `${baseUsername}_${suffix}`;
            continue;
          }
        }

        throw error;
      }
    }

    throw new Error(
      `Failed to create user after ${maxAttempts} attempts due to username conflicts`
    );
  }

  async getAllApiKeys() {
    return await this.apiKeyRepo.find();
  }

  async createApiKey() {
    const token = randomBytes(32).toString('hex');
    const prefixedToken = `tr_${token}`;

    const hash = createHmac('sha256', this.config.apiKey.secret)
      .update(prefixedToken)
      .digest('hex');

    const expiresAt = new Date(Date.now() + Number(this.config.apiKey.expirySeconds) * 1000);

    const apiKey = this.apiKeyRepo.create({
      hash,
      expiresAt,
    })

    await this.apiKeyRepo.save(apiKey);

    const apiKeyRes : CreateApiKeyResDto = {
      id: apiKey.id,
      token: prefixedToken,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
    }

    return apiKeyRes;
  }

  async validateApiKey(token: string): Promise<boolean> {
    const hash = createHmac('sha256', this.config.apiKey.secret)
      .update(token)
      .digest('hex');

    const apiKey = await this.apiKeyRepo.findOne({
      where: { hash }
    });

    if (!apiKey)
      return false;

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  async removeApiKeyById(id: string) {
    const res = await this.apiKeyRepo.delete({ id });
    if (!res.affected)
      throw new NotFoundException(`Api-key ${id} not found`);
    return { deleted: true, id }
  }

  private async generateJwtToken(user: GetUserResDto) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user,
    };
  }


  private async sendTwoFactorCode(email: string, userId: number): Promise<void> {
    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + this.CODE_EXPIRY_MS);

    this.codeStore.set(email, { code, expiresAt, userId });

    const subject = 'Your Two-Factor Authentication Code';
    const text = `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`;
    const html = `<p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`;

    await this.httpService.axiosRef.post(
      `${this.config.core.url}/api/mail`,
      { to: email, subject, text, html }
    );

    this.cleanupExpiredCodes();
  }

  private verifyTwoFactorCode(email: string, code: string): boolean {
    const stored = this.codeStore.get(email);

    if (!stored) {
      return false;
    }

    if (stored.expiresAt < new Date()) {
      this.codeStore.delete(email);
      return false;
    }

    if (stored.code !== code) {
      return false;
    }

    this.codeStore.delete(email);
    return true;
  }

  private cleanupExpiredCodes(): void {
    const now = new Date();
    for (const [email, data] of this.codeStore.entries()) {
      if (data.expiresAt < now) {
        this.codeStore.delete(email);
      }
    }
  }
}
