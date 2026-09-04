import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../../common/decorators/permissions.decorator';

import type { RequestWithUser } from '../../models/request-with-user.interface';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.some((role) => user.roles?.includes(role));
      if (!hasRole) {
        throw new ForbiddenException(
          'Acesso negado. Papéis (roles) insuficientes.',
        );
      }
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every((perm) => {
        if (user.permissions?.includes(perm)) {
          return true;
        }

        if (
          perm === 'dashboard:user:read' ||
          perm === 'dashboard:user:update'
        ) {
          if (request.params?.id && request.params.id === user.sub) {
            return true;
          }
        }

        if (
          perm === 'dashboard:profile:read' ||
          perm === 'dashboard:profile:update'
        ) {
          if (request.url?.includes('/me')) {
            return true;
          }
        }

        return false;
      });

      if (!hasAllPermissions) {
        throw new ForbiddenException(
          'Acesso negado. Permissões insuficientes.',
        );
      }
    }

    return true;
  }
}
