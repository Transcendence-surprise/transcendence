import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

export interface OAuth42Data {
  code?: string;
  state?: string;
}

export const OAuth42Data = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): OAuth42Data => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    const query = request.query as Record<string, string | undefined>;
    return {
      code: query.code,
      state: query.state,
    };
  },
);
