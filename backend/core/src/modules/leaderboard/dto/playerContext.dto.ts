import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export interface PlayerContext {
  id: number | string;
  username: string;
  roles: string[];
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): PlayerContext | undefined => {
    const request = ctx.switchToHttp().getRequest();

    const id = request.headers['x-user-id'];
    const username = request.headers['x-user-username'];
    const roles = request.headers['x-user-roles'];

    if (!id || !username)
      throw new UnauthorizedException();

    const rolesArray = roles ? String(roles).split(',') : [];
    if (rolesArray.includes('guest'))
      throw new UnauthorizedException();

    return {
      id: Number(id),
      username: String(username),
      roles: rolesArray,
    };
  },
);