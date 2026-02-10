import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

export interface OAuth42Params {
  code: string;
  state: string;
}

export const OAuth42Params = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): OAuth42Params => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    const query = request.query as Record<string, string | undefined>;
    if (!query.code || !query.state) {
      throw new BadRequestException('Invalid code and/or state in query');
    }
    return {
      code: query.code,
      state: query.state,
    };
  },
);
