import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

export interface JwtPayload {
  sub: number | string;
  username: string;
  email: string;
  roles: string[];
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();

    const rawSub = request.headers['x-user-id']?.toString();
    const username = request.headers['x-user-username']?.toString();
    const email = request.headers['x-user-email']?.toString();
    const rolesHeader = request.headers['x-user-roles'];
    const roles = typeof rolesHeader === 'string'
      ? rolesHeader.split(',')
      : rolesHeader as string[];

    if (!rawSub || !username || !roles) {
      throw new BadRequestException('Invalid payload in headers');
    }

    const isGuest = roles.includes('guest');
    const sub: number | string = isGuest ? rawSub : Number(rawSub);

    if (!isGuest && isNaN(sub as number)) {
      throw new BadRequestException('Invalid user ID');
    }

    if (!isGuest && !email) {
      throw new BadRequestException('Invalid payload in headers');
    }

    const user: JwtPayload = {
      sub,
      username,
      email: email ?? '',
      roles,
    };

    return user;
  },
);
