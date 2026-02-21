import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from './permissions.decorator';
import { PermissionCode } from '@app/common';

/**
 * Combined decorator: JWT auth + permission check + Swagger auth docs.
 *
 * @example
 * @Auth('tournament:create')
 * @Post()
 * create() {}
 */
export function Auth(...permissions: PermissionCode[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, PermissionsGuard),
    RequirePermissions(...permissions),
    ApiBearerAuth('access-token'),
    ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' }),
    ApiForbiddenResponse({
      description: `Required: ${permissions.length ? permissions.join(', ') : 'authenticated'}`,
    }),
  );
}

/** JWT only — no permission check */
export function JwtAuth() {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    ApiBearerAuth('access-token'),
    ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' }),
  );
}
