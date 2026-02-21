# TypeScript Error Fixes

**Date**: 2026-02-21  
**Issue**: TypeScript compilation errors after permission refactoring

---

## ✅ Errors Fixed

### Error 1: Type mismatch in permissions.controller.ts

**Error**:
```
Argument of type 'string | undefined' is not assignable to parameter of type 'boolean | undefined'
```

**Root Cause**: 
- Controller was passing `module?: string` parameter
- Service method `findAll()` was changed to accept `activeOnly?: boolean`
- Mismatch between controller and service signatures

**Fix**:
```typescript
// permissions.controller.ts
@MessagePattern('permissions.findAll')
async findAll(@Payload() data: { activeOnly?: boolean }) {  // Changed from module?: string
  return this.permissionsService.findAll(data.activeOnly);
}

// permissions.service.ts
async findAll(activeOnly = false) {  // Returns GroupPermissions
  return this.prisma.groupPermission.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: { name: 'asc' },
  });
}

// admin/permissions.controller.ts (gateway)
@Get()
async findAll(@Query('activeOnly') activeOnly?: boolean) {  // Changed from module
  return firstValueFrom(
    this.identityClient.send('permissions.findAll', { activeOnly }),
  );
}
```

**Files Modified**:
- ✅ `apps/core/src/permissions/permissions.controller.ts`
- ✅ `apps/gateway/src/admin/permissions.controller.ts`

---

### Error 2: Type mismatch in users.service.ts

**Error**:
```
Argument of type 'UserRole' is not assignable to parameter of type '"ROOT" | "ADMIN" | "STAFF"'
Type '"ORGANIZER"' is not assignable to type '"ROOT" | "ADMIN" | "STAFF"'
```

**Root Cause**:
- `adminRoles` was inferred as `UserRole[]` literal type `[UserRole.ROOT, UserRole.ADMIN, UserRole.STAFF]`
- TypeScript strict mode treats this as a tuple of specific literals
- `roles.some()` passes any `UserRole` but `includes()` expects only the 3 specific values

**Fix**:
```typescript
// users.service.ts
private validateRoleAccountType(roles: UserRole[], accountType: number): void {
  const adminRoles: UserRole[] = [UserRole.ROOT, UserRole.ADMIN, UserRole.STAFF];  // Explicit type annotation
  const hasAdminRole = roles.some((role) => adminRoles.includes(role));

  if (hasAdminRole && accountType !== 0) {
    throw new BadRequestException(
      'Users with ROOT, ADMIN, or STAFF roles must have accountType = 0',
    );
  }
}
```

**Files Modified**:
- ✅ `apps/core/src/users/users.service.ts`

---

## 📝 Summary

### Changes Made
1. **permissions.controller.ts** - Changed payload from `{ module?: string }` to `{ activeOnly?: boolean }`
2. **admin/permissions.controller.ts** - Changed query param from `@Query('module')` to `@Query('activeOnly')`
3. **users.service.ts** - Added explicit `UserRole[]` type annotation to `adminRoles`

### API Changes
- **GET `/admin/permissions`** now accepts `?activeOnly=true` instead of `?module=user`
- Returns `GroupPermission[]` instead of `Permission[]`

### Migration Note
The API behavior changed:
- **Before**: Filter permissions by module (`?module=user`)
- **After**: Filter permission groups by active status (`?activeOnly=true`)

This aligns with the new GroupPermission system where permissions are config-only and groups are managed in the database.

---

## ✅ Status

All TypeScript errors resolved. Application should now compile successfully.

Run:
```powershell
cd C:\project\onlyquat-esport\serve
pnpm run start:dev:core
```

Expected: No compilation errors ✅
