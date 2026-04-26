// src/modules/realtime/ws-auth.service.ts

import { Injectable } from "@nestjs/common/decorators/core";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload, TypedSocket, WsUser } from "../realtime/models/models";
import { UnauthorizedException } from "@nestjs/common/exceptions/unauthorized.exception";

@Injectable()
export class WsAuthService {
  constructor(private readonly jwtService: JwtService) {}

  async authenticate(client: TypedSocket): Promise<WsUser> {
    const cookies = this.parseCookie(client.handshake.headers.cookie);
    const token = cookies['access_token'];

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    const decoded = await this.jwtService.verifyAsync<JwtPayload>(token);

    if (!this.isValid(decoded)) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const normalized = this.normalizeUser(decoded);

    return {
      sub: normalized,
      username: decoded.username,
      email: decoded.email ?? '',
      roles: Array.isArray(decoded.roles) ? decoded.roles : [],
    };
  }

  private parseCookie(cookieHeader?: string): Record<string, string> {
    if (!cookieHeader) return {};

    return Object.fromEntries(
      cookieHeader
        .split(';')
        .map((c) => c.trim())
        .filter((c) => c.includes('='))
        .map((c) => {
          const [k, ...v] = c.split('=');
          return [k, decodeURIComponent(v.join('='))];
        }),
    );
  }

  private isValid(decoded: JwtPayload): boolean {
    return (
      decoded?.sub !== undefined &&
      decoded?.sub !== null &&
      String(decoded.sub).trim().length > 0 &&
      !!decoded?.username
    );
  }

  private normalizeUser(decoded: JwtPayload): string | number {
    const numericId = Number(decoded.sub);
    const isGuest =
      Array.isArray(decoded.roles) && decoded.roles.includes('guest');

    if (isGuest) return String(decoded.sub);
    if (Number.isInteger(numericId) && numericId > 0) return numericId;

    return Number(decoded.sub);
  }
}