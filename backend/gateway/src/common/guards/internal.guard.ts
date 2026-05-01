// src/common/guards/internal.guard.ts

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify'

@Injectable()
export class InternalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<FastifyRequest>();

    const key = req.headers['x-internal-key'];
    const expected = process.env.INTERNAL_SERVICE_KEY;

    if (!key || key !== expected) {
      throw new UnauthorizedException('Invalid internal key');
    }

    return true;
  }
}
