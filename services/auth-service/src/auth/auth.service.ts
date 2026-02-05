import {
  Injectable,
  UnauthorizedException,
  HttpStatus,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';

import axios from 'axios';
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
    try {
      const response = await this.httpService.axiosRef.post<GetUserResDto>(
        `${this.config.backend.url}/api/users/validate-credentials`,
        loginUserDto,
      );
      return this.generateAuthResponse(response.data);
    } catch {
      throw new UnauthorizedException('Invalid username or password');
    }
  }

  async signup(signupUserDto: SignupUserDto) {
    try {
      const response = await this.httpService.axiosRef.post<GetUserResDto>(
        `${this.config.backend.url}/api/users`,
        signupUserDto,
      );
      return this.generateAuthResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === HttpStatus.CONFLICT) {
          throw new ConflictException('Username or email already exists');
        } else if (status === HttpStatus.BAD_REQUEST) {
          throw new BadRequestException('Validation failed');
        }
      }
      throw new InternalServerErrorException();
    }
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
    const { clientId, tokenUrl, redirectUri, secret, userUrl } =
      this.config.intra42;

    try {
      const aouthParams = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: secret,
        code: code,
        redirect_uri: redirectUri,
        state: state,
      });

      const tokenResponse = await this.httpService.axiosRef.post<OAuth42ResDto>(
        tokenUrl,
        aouthParams.toString(),
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

      const profileResponse = await this.httpService.axiosRef.get<Profile42ResDto>(
        userUrl,
        {
          headers: { Authorization: `Bearer ${token.access_token}` },
        },
      );

      const profile: Profile42ResDto = profileResponse.data;

      let user: GetUserResDto | null = null;
      try {
        const response = await this.httpService.axiosRef.get<GetUserResDto>(
          `${this.config.backend.url}/api/users/by-email/${profile.email}`,
        );
        user = response.data;
      } catch {
        /* empty */
      }

      if (!user) {
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
        user = response.data;
      }

      const authResponse = await this.generateAuthResponse(user);

      return {
        access_token: authResponse.access_token,
        user: authResponse.user,
        redirect: this.config.frontend.url,
      };
    } catch (error) {
      console.error(
        'Intra42 OAuth error:',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.response?.data || error.message,
      );
      throw new UnauthorizedException('Failed to authenticate with 42');
    }
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
