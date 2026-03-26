import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import { randomUUID, randomBytes, createHmac, randomInt } from 'node:crypto';

import { LoginUserDto } from './dto/login/login-user.dto';
import { SignupUserDto } from './dto/signup/signup-user.dto';
import { GetUserResDto } from './dto/get-user-res.dto';
import authConfig from '../../config/auth.config';

interface TwoFactorCode {
  code: string;
  expiresAt: Date;
  userId: number;
}

interface PasswordResetToken {
  userId: number;
  expiresAt: Date;
}

@Injectable()
export class AuthService {
  private codeStore = new Map<string, TwoFactorCode>();
  private passwordResetStore = new Map<string, PasswordResetToken>();
  private readonly CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
  private readonly PASSWORD_RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

  constructor(
    @Inject(authConfig.KEY)
    private config: ConfigType<typeof authConfig>,
    private httpService: HttpService,
    private jwtService: JwtService,
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

  async createPasswordResetToken(email: string): Promise<void> {
    const user = await this.findUserByEmail(email);

    if (!user) {
      return;
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.PASSWORD_RESET_TOKEN_EXPIRY_MS);

    const hash = this.hashPasswordResetToken(token);

    this.passwordResetStore.set(hash, { userId: user.id, expiresAt });

    const resetUrl = new URL('/reset-password', this.config.frontend.url);
    resetUrl.searchParams.set('token', token);

    const subject = 'Reset your Transcendence password';
    const text = `You requested a password reset. Here is the token: ${token}.

    Use the following URL to reset your password:
    ${resetUrl.toString()}

    This link expires in 1 hour. If you did not request this, you can ignore this email.`;
        const html = `
          <p>You requested a password reset.</p>
          <p>Your token is: <strong>${token}</strong></p>
          <p>Click <a href="${resetUrl.toString()}">here</a> to reset your password.</p>
          <p>
            Or copy this URL into your browser:
            <a href="${resetUrl.toString()}">${resetUrl.toString()}</a>
          </p>
          <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    `;
    await this.httpService.axiosRef.post(
      `${this.config.core.url}/api/mail`,
      { to: user.email, subject, text, html },
    );

    this.cleanupExpiredPasswordResetTokens();
  }

  private hashPasswordResetToken(token: string): string {
    return createHmac('sha256', this.config.jwt.secret)
      .update(token)
      .digest('hex');
  }

  async confirmPasswordReset(token: string, password: string): Promise<void> {
    const hash = this.hashPasswordResetToken(token);
    const record = this.passwordResetStore.get(hash);

    if (!record || record.expiresAt < new Date()) {
      this.passwordResetStore.delete(hash);
      throw new UnauthorizedException('Invalid or expired password reset token');
    }

    const { userId } = record;

    await this.httpService.axiosRef.patch(`${this.config.core.url}/api/users/id/${userId}`, {
      password,
    });

    this.passwordResetStore.delete(hash);
    this.cleanupExpiredPasswordResetTokens();
  }

  private cleanupExpiredPasswordResetTokens(): void {
    const now = new Date();
    for (const [key, data] of this.passwordResetStore.entries()) {
      if (data.expiresAt < now) {
        this.passwordResetStore.delete(key);
      }
    }
  }

  async generateJwtToken(user: GetUserResDto) {
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

  createGuestToken(nickname: string): Promise<string> {
    const guestId = randomUUID();

    const guestUser = {
      sub: guestId,
      username: nickname,
      roles: ['guest'],
      isGuest: true,
    };

    const token = this.jwtService.sign(guestUser);

    return Promise.resolve(token);
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
