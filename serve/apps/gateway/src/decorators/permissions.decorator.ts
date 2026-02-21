import { SetMetadata } from '@nestjs/common';
import { PermissionCode } from '@app/common';

export const PERMISSIONS_KEY = 'required_permissions';

export const RequirePermissions = (...permissions: PermissionCode[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
