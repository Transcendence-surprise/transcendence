import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

export interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  roles: string[];
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();

    console.log(request.headers);

    const sub = Number(request.headers['x-user-id']);
    const username = request.headers['x-user-username']?.toString();
    const email = request.headers['x-user-email']?.toString();
    const roles = request.headers['x-user-roles'] as string[];

    if (isNaN(sub) || !username || !email || !roles) {
      throw new BadRequestException('Invalid payload in headers');
    }

    const user : JwtPayload = {
      sub : sub,
      username : username,
      email : email,
      roles : roles,
    };

    return user;
  },
);
