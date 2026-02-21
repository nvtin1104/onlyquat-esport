# Permission Flow Refactoring Plan

**Date**: 2026-02-21
**Status**: In Progress

## Problem Statement
The current permission system uses a database table (`Permission`) to store permission definitions and `RolePermission` to map roles to permissions. This requires database migrations when adding new permissions and creates unnecessary complexity.

## Proposed Solution
Simplify the permission system by:
1. Making permissions config-only (defined in `permissions.ts`)
2. Converting `RolePermission` to `GroupPermission` (reusable permission groups)
3. Allowing users to have multiple groups + additional custom permissions
4. Implementing ROOT role bypass for all permission checks
5. Enforcing accountType = 0 for admin/root/staff roles

## Design Decisions (Confirmed with User)
- ✅ GroupPermission stores permission codes as `String[]` (e.g., `["user:view", "tournament:create"]`)
- ✅ Users can be assigned multiple GroupPermissions
- ✅ UserPermission has an add-on array field for extra permissions beyond groups
- ✅ ROOT users skip all permission checks in the guard
- ✅ AccountType validation enforced at role assignment/update time
- ✅ Migrate existing RolePermission data into default GroupPermissions

---

## Implementation Workplan

### Phase 1: Database Schema Changes
- [ ] Update `schema.prisma`:
  - [ ] Remove `Permission` model
  - [ ] Remove `RolePermission` model
  - [ ] Remove `UserPermissionItem` model
  - [ ] Create new `GroupPermission` model with fields:
    - `id`, `name`, `description?`, `isSystem`, `isActive`, `permissions String[]`
  - [ ] Update `UserPermission` model:
    - Remove `customItems` relation
    - Rename `cachedCodes` to `effectivePermissions` (or keep as is)
    - Add `groupIds String[]` (stores GroupPermission IDs)
    - Add `additionalPermissions String[]` (custom add-ons)
  - [ ] Create `UserGroupPermission` junction table (many-to-many):
    - `userId`, `groupPermissionId`, `createdAt`
- [ ] Generate Prisma client: `pnpm run prisma:generate`
- [ ] Create migration: `pnpm run prisma:migrate`

### Phase 2: Update Constants & Types
- [ ] Enhance `serve\libs\common\src\constants\permissions.ts`:
  - [ ] Add metadata structure with `module`, `action`, `name`, `description` for each permission
  - [ ] Export permission list as structured array for validation
  - [ ] Add helper function to validate permission code exists
- [ ] Export new types from `@app/common`:
  - [ ] `GroupPermission`, `UserPermission`, `UserGroupPermission` Prisma types
  - [ ] Update `PermissionCode` type to reference constants

### Phase 3: Create Migration Seed
- [ ] Create new seed file: `serve\libs\common\prisma\seeds\migrate-permissions.seed.ts`
  - [ ] Read existing `RolePermission` data grouped by role
  - [ ] Create one `GroupPermission` per role (e.g., "Admin Default", "Staff Default")
  - [ ] Set `isSystem: true` for these default groups
  - [ ] For each user:
    - [ ] Assign them to GroupPermission(s) matching their roles
    - [ ] Migrate any custom `UserPermissionItem` data to `additionalPermissions` array
    - [ ] Rebuild `effectivePermissions` (group perms + additional)
  - [ ] Log migration statistics
- [ ] Update main seed file to call migration seed
- [ ] Test migration on development database

### Phase 4: Update PermissionsService
- [ ] Refactor `serve\apps\core\src\permissions\permissions.service.ts`:
  - [ ] Remove `Permission` model references
  - [ ] Update `buildUserPermissions()`:
    - [ ] Check if user has ROOT role → return early with all permissions or bypass flag
    - [ ] Fetch user's `GroupPermission`s via junction table
    - [ ] Merge all `permissions` arrays from groups
    - [ ] Add `additionalPermissions` from UserPermission
    - [ ] Deduplicate and sort
    - [ ] Cache in `effectivePermissions`
  - [ ] Update `getCachedPermissions()` to use new field
  - [ ] Refactor `grantCustom()` to add to `additionalPermissions` array
  - [ ] Refactor `revokeCustom()` to remove from `additionalPermissions` array (or add negation syntax)
  - [ ] Remove `deletePermission()` (no longer needed - permissions are code only)
  - [ ] Add `createGroupPermission()` method
  - [ ] Add `assignGroupToUser()` method
  - [ ] Add `removeGroupFromUser()` method
  - [ ] Update `findAll()` to list GroupPermissions instead
  - [ ] Update `getRoleDefaults()` to return default groups
  - [ ] Update `getUserPermissions()` to show groups + add-ons

### Phase 5: Update Permission Guard
- [ ] Update `serve\apps\gateway\src\guards\permissions.guard.ts`:
  - [ ] Add ROOT role bypass check:
    ```typescript
    if (user.roles?.includes('ROOT')) return true;
    ```
  - [ ] Keep existing permission check logic (works with new structure)

### Phase 6: Add AccountType Validation
- [ ] Update `serve\apps\core\src\users\users.service.ts`:
  - [ ] Add validation method: `validateRoleAccountType(roles: UserRole[], accountType: number)`
    - If roles include ROOT, ADMIN, or STAFF → require accountType === 0
    - Throw error if validation fails
  - [ ] Call validation in user creation
  - [ ] Call validation in user role update
- [ ] Update `serve\apps\core\src\auth\auth.service.ts`:
  - [ ] Add same validation when registering users with special roles (if applicable)

### Phase 7: Update Seed Data
- [ ] Update `serve\libs\common\prisma\seeds\permissions.seed.ts`:
  - [ ] Remove `PERMISSION_SEED` array (permissions now config-only)
  - [ ] Convert `ROLE_DEFAULTS` to `GROUP_PERMISSION_SEED`:
    ```typescript
    {
      name: 'Admin Default',
      description: 'Default permissions for Admin role',
      isSystem: true,
      permissions: ['*'] // or full list
    }
    ```
  - [ ] Create GroupPermissions instead of Permission + RolePermission
  - [ ] Update test users to be assigned to default groups
  - [ ] Ensure ROOT users have accountType = 0

### Phase 8: Update API Endpoints (if needed)
- [ ] Check for any permission management endpoints in gateway:
  - [ ] Update DTOs to work with GroupPermission instead of Permission
  - [ ] Update controllers to call new service methods
  - [ ] Update Swagger documentation
- [ ] Verify JWT token still includes `permissions` array correctly

### Phase 9: Testing & Validation
- [ ] Run database reset and seed: `pnpm run prisma:reset`
- [ ] Test permission checks:
  - [ ] ROOT user bypasses all permission checks
  - [ ] Users with GroupPermissions get correct effective permissions
  - [ ] Additional permissions work correctly
  - [ ] Permission guard denies access when permissions missing
- [ ] Test accountType validation:
  - [ ] Cannot assign ROOT/ADMIN/STAFF to accountType = 1 users
  - [ ] Can assign other roles freely
- [ ] Test CRUD operations on GroupPermissions
- [ ] Run all existing tests: `pnpm test`
- [ ] Manual testing with dashboard/client if applicable

### Phase 10: Documentation & Cleanup
- [ ] Update `AGENTS.md` with new permission system architecture
- [ ] Update `CLAUDE.md` with GroupPermission patterns
- [ ] Add inline code comments explaining new flow
- [ ] Remove old permission-related code/comments
- [ ] Update API documentation (if any exists)

---

## Notes & Considerations

### Permission Code Validation
Since permissions are now config-only, we should validate permission codes at runtime to prevent typos. The constants file should export a validation helper.

### Backward Compatibility
The migration seed will preserve existing user permissions by converting them to the new structure. No data loss expected.

### ROOT Role Special Handling
ROOT users bypass permission checks entirely. This means:
- They don't need GroupPermissions or additionalPermissions
- The guard returns `true` immediately
- Still useful to assign them a group for visibility/auditing

### Future Enhancements (Out of Scope)
- Permission negation syntax (e.g., `["-user:delete"]` to explicitly deny)
- Time-based permission grants (expiration)
- Permission templates/inheritance
- Audit log for permission changes

### Risk Areas
- **Migration complexity**: Need to carefully test the data migration seed
- **JWT token size**: If effectivePermissions array gets large, token may bloat
- **Caching strategy**: Need to rebuild cache when groups or add-ons change

---

## Testing Checklist

- [ ] Fresh database seed works without errors
- [ ] Migration from old schema preserves all permissions
- [ ] ROOT users can access all endpoints
- [ ] ADMIN users with default group work correctly
- [ ] STAFF users with default group work correctly
- [ ] Custom add-on permissions work
- [ ] Multiple groups merge correctly
- [ ] AccountType validation throws errors appropriately
- [ ] Permission guard denies access when permissions missing
- [ ] All existing tests pass
