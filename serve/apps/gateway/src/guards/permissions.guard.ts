import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.permissions) {
      throw new ForbiddenException('errors.NO_PERMISSIONS_IN_TOKEN');
    }

    // ROOT users bypass all permission checks
    if (user.role?.includes('ROOT')) {
      return true;
    }

    const userPerms = new Set<string>(user.permissions);

    // User must have ALL required permissions.
    // module:manage acts as wildcard for its module.
    const hasAll = required.every((perm) => {
      if (userPerms.has(perm)) return true;
      const [module] = perm.split(':');
      return userPerms.has(`${module}:manage`);
    });

    if (!hasAll) {
      throw new ForbiddenException({
        message: 'errors.INSUFFICIENT_PERMISSIONS',
        required,
      });
    }

    return true;
  }
}
