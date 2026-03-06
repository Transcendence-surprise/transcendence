import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';
import type { ConfigType } from '@nestjs/config';

import gatewayConfig from '../config/gateway.config';
import { AuthHttpService } from '../../modules/auth/auth.service';
import { AUTH_TYPE_KEY, AuthType } from '../decorator/auth-type.decorator';

interface JwtPayload {
  sub: number | string;
  username: string;
  email: string;
  roles: string[];
}

interface GuestJwtPayload {
  sub: string;
  username: string;
  email?: string;
  roles?: string[];
  isGuest: true;
}

interface RequestWithUser extends FastifyRequest {
  user?: JwtPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(gatewayConfig.KEY)
    private readonly config : ConfigType<typeof gatewayConfig>,
    private readonly jwtService: JwtService,
    private readonly authService: AuthHttpService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean>  {
    const authType = this.reflector.getAllAndOverride<AuthType>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (authType === AuthType.PUBLIC || this.config.auth.isAuthEnabled === 'false') {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();

    switch (authType) {
      case AuthType.JWT:
        return await this.validateJwt(request);
      case AuthType.GUEST:
        return await this.validateGuest(request);
      case AuthType.JWT_OR_GUEST:
        // Check guest FIRST - if user has guest_token, use guest identity
        // This ensures consistent identity when user created game as guest
        try {
          return await this.validateGuest(request);
        } catch (error) {
          if (error instanceof UnauthorizedException) {
            return await this.validateJwt(request);
          }
          throw error;
        }
      case AuthType.API_KEY_ONLY:
        return this.validateApiKey(request);
      case AuthType.JWT_OR_API_KEY:
        return this.validateJwtOrApiKey(request);
      default: {
        console.log('AuthType: Unknown type');
        return false;
      }
    }
  }

  private async validateJwt(request: FastifyRequest): Promise<boolean> {
    const token = this.extractJwtToken(request);

    if (!token) {
      throw new UnauthorizedException('JWT token required in Cookie header');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      (request as RequestWithUser).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid JWT token');
    }
  }

  private async validateApiKey(request: FastifyRequest): Promise<boolean> {
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key required in x-api-key header');
    }
    const isValid = await this.authService.validateApiKey(apiKey);
    if (!isValid) {
      throw new UnauthorizedException('Invalid api key');
    }

    return true;
  }

  private async validateJwtOrApiKey(request: FastifyRequest): Promise<boolean> {
    try {
      return await this.validateJwt(request);
    } catch {
      // JWT failed, continue to API key
    }

    try {
      return await this.validateApiKey(request);
    } catch {
      // ApiKey failed, continue to throwing exception
    }

    throw new UnauthorizedException('Authentication required: provide JWT token or API key');
  }


  private extractJwtToken(request: FastifyRequest): string | undefined {
    const authCookie = request.cookies.access_token;
    return authCookie;
  }

  private extractApiKey(request: FastifyRequest): string | undefined {
    const headerKey = request.headers['x-api-key'];
    if (headerKey)
      return headerKey.toString();
    return undefined;
  }

  private async validateGuest(request: FastifyRequest): Promise<boolean> {
    const token = request.cookies.guest_token;
    if (!token) throw new UnauthorizedException('Guest token missing');

    try {
      const decoded = await this.jwtService.verifyAsync<GuestJwtPayload>(token);

      // Extra type check to satisfy ESLint
      if (decoded.isGuest !== true || !decoded.sub || !decoded.username) {
        throw new UnauthorizedException('Invalid guest token');
      }

      (request as RequestWithUser).user = {
        sub: decoded.sub,       // UUID string
        username: decoded.username,
        email: decoded.email ?? '',
        roles: ['guest'],
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid guest token');
    }
  }
}