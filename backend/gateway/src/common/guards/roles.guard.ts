import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { FastifyRequest } from 'fastify';

import { Roles } from "../decorator/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndMerge<string[]>(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<FastifyRequest>();

    if (!requiredRoles || !request.headers['x-user-id']) {
      return true;
    }

    // mock roles
    // const userRoles = request.headers['x-user-roles'];
    const userRoles = ['user'];

    const isAllowed = requiredRoles.some((role: string) => userRoles.includes(role));
    return isAllowed;
  }
}
