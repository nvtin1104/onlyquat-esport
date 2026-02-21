# Permission Flow Refactoring - Implementation Summary

**Date**: 2026-02-21  
**Status**: Code Changes Complete - Manual Steps Required

---

## ✅ Completed Changes

### 1. Database Schema (`schema.prisma`)
- ✅ Removed `Permission`, `RolePermission`, `UserPermissionItem` models
- ✅ Added `GroupPermission` model (stores permission groups with `String[]` permissions)
- ✅ Updated `UserPermission` model (added `additionalPermissions` field)
- ✅ Added `UserGroupPermission` junction table (many-to-many relationship)

### 2. Constants & Types (`permissions.ts`)
- ✅ Added `PermissionDefinition` interface with metadata
- ✅ Created `PERMISSION_METADATA` array with all permission details
- ✅ Added helper functions:
  - `getAllPermissionCodes()` - Get all valid permission codes
  - `isValidPermissionCode()` - Validate a permission code exists
  - `getPermissionMetadata()` - Get metadata for a specific permission
  - `getModulePermissions()` - Get all permissions for a module

### 3. Common Library Exports (`index.ts`)
- ✅ Updated exports to include new Prisma types:
  - `GroupPermission`
  - `UserPermission`
  - `UserGroupPermission`
- ✅ Removed old types: `Permission`, `RolePermission`, `UserPermissionItem`

### 4. Permissions Service (`permissions.service.ts`)
- ✅ Completely refactored `buildUserPermissions()`:
  - ROOT users get all permissions automatically
  - Regular users get permissions from their groups + additional permissions
  - No more database Permission table lookups
- ✅ Updated `getCachedPermissions()` to work with new schema
- ✅ Refactored `grantCustom()` - adds to `additionalPermissions` array
- ✅ Refactored `revokeCustom()` - removes from `additionalPermissions` array
- ✅ Added new methods:
  - `createGroupPermission()` - Create a new permission group
  - `updateGroupPermission()` - Update an existing group
  - `deleteGroupPermission()` - Delete non-system groups
  - `assignGroupToUser()` - Assign a group to a user
  - `removeGroupFromUser()` - Remove a group from a user
- ✅ Updated `findAll()` - now lists GroupPermissions instead of Permissions
- ✅ Updated `getRoleDefaults()` - returns system groups
- ✅ Updated `getUserPermissions()` - returns groups + additional permissions

### 5. Permission Guard (`permissions.guard.ts`)
- ✅ Added ROOT role bypass check
- ✅ ROOT users skip all permission checks automatically
- ✅ Existing permission logic remains for non-ROOT users

### 6. Users Service (`users.service.ts`)
- ✅ Added `validateRoleAccountType()` private method
- ✅ Validation enforces: ROOT/ADMIN/STAFF must have `accountType = 0`
- ✅ Validation called in `updateRole()` method
- ✅ Throws `BadRequestException` if validation fails

---

## ⏳ Pending Manual Steps

### STEP 1: Install PowerShell 6+ (if needed)
See `MANUAL_EXECUTION_STEPS.md` for details.

### STEP 2: Generate Prisma Client & Run Migration
```powershell
cd C:\project\onlyquat-esport\serve
pnpm run prisma:generate
pnpm run prisma:migrate
```
**Migration name**: `permission_flow_refactor`

⚠️ **WARNING**: This will DROP the old permission tables and data!

### STEP 3: Create New Seed Files (TODO)
Need to create:
- `serve/libs/common/prisma/seeds/permissions.seed.ts` - Update to create GroupPermissions
- `serve/libs/common/prisma/seeds/migrate-permissions.seed.ts` - Optional migration seed

### STEP 4: Update Seed Data (TODO)
Convert `ROLE_DEFAULTS` to `GROUP_PERMISSION_SEED` structure.

### STEP 5: Run Seed
```powershell
cd C:\project\onlyquat-esport\serve
pnpm run prisma:seed
```

### STEP 6: Test Application
```powershell
cd C:\project\onlyquat-esport\serve
pnpm run start:all
```

---

## 🔄 Migration Strategy

### Old Schema → New Schema Mapping

**Old:**
```
Permission (table)
  ├─ code, module, action, name, description
  └─ RolePermission (junction with roles)
       └─ UserPermissionItem (custom user overrides)
```

**New:**
```
permissions.ts (config only)
  └─ PERMISSION_METADATA (all permission definitions)

GroupPermission (table)
  └─ name, permissions: String[]

UserGroupPermission (junction)
  ├─ userId
  └─ groupPermissionId

UserPermission
  ├─ additionalPermissions: String[]
  └─ cachedCodes: String[] (computed)
```

### Key Changes:
1. **No more Permission table** - permissions are config-only in `permissions.ts`
2. **GroupPermission replaces RolePermission** - reusable permission groups
3. **Multiple groups per user** - via `UserGroupPermission` junction table
4. **Add-on permissions** - stored directly in `UserPermission.additionalPermissions`
5. **ROOT bypass** - ROOT users skip permission checks entirely

---

## 🎯 New Permission Flow

### 1. For ROOT Users:
```typescript
if (user.role.includes('ROOT')) {
  return getAllPermissionCodes(); // All permissions
}
```

### 2. For Regular Users:
```typescript
effectivePermissions = 
  (GroupPermission1.permissions) 
  + (GroupPermission2.permissions) 
  + (UserPermission.additionalPermissions)
  → deduplicate & sort
  → cache in UserPermission.cachedCodes
```

### 3. Permission Check (Guard):
```typescript
if (user.role.includes('ROOT')) return true; // Bypass

// Check if user has required permissions
userPerms.has(requiredPerm) || userPerms.has(`${module}:manage`)
```

### 4. AccountType Validation:
```typescript
if (roles.includes(ROOT|ADMIN|STAFF) && accountType !== 0) {
  throw BadRequestException();
}
```

---

## 📝 TODO: Remaining Work

### Phase 3: Create Migration Seed (Optional)
- [ ] Create `migrate-permissions.seed.ts`
- [ ] Read existing `RolePermission` data (if migrating existing DB)
- [ ] Create default `GroupPermission` for each role
- [ ] Assign users to their role's default group
- [ ] Migrate `UserPermissionItem` to `additionalPermissions`

### Phase 7: Update Seed Data (Required)
- [ ] Update `permissions.seed.ts`:
  - Remove `PERMISSION_SEED` array (no longer needed)
  - Convert `ROLE_DEFAULTS` to `GROUP_PERMISSION_SEED`
  - Create GroupPermissions instead of Permissions
  - Assign test users to default groups
  - Ensure ROOT users have `accountType = 0`

### Phase 8: Update API Endpoints (If Applicable)
- [ ] Check for permission management endpoints in gateway
- [ ] Update DTOs to work with GroupPermission
- [ ] Update controllers
- [ ] Update Swagger docs

### Phase 9: Testing
- [ ] Reset database and seed
- [ ] Test ROOT user bypass
- [ ] Test GroupPermissions
- [ ] Test additional permissions
- [ ] Test accountType validation
- [ ] Run existing tests

### Phase 10: Documentation
- [ ] Update `AGENTS.md`
- [ ] Update `CLAUDE.md`
- [ ] Add inline comments
- [ ] Update API docs

---

## 🚨 Important Notes

### Permission Validation
All permission codes are now validated against `PERMISSION_METADATA`:
- Invalid codes will throw `BadRequestException`
- Use helper functions: `isValidPermissionCode()`, `getPermissionMetadata()`

### ROOT Role Behavior
- ROOT users receive ALL permissions from `getAllPermissionCodes()`
- Permission guard returns `true` immediately for ROOT users
- Still useful to assign them a group for auditing/visibility

### AccountType Enforcement
- ROOT, ADMIN, STAFF roles REQUIRE `accountType = 0`
- Validation occurs at role assignment time
- Regular roles (ORGANIZER, CREATOR, etc.) can be any accountType

### Cache Management
- `cachedCodes` is rebuilt whenever:
  - Groups are assigned/removed from user
  - Additional permissions are granted/revoked
  - `buildUserPermissions()` is called
- Consider invalidating cache when GroupPermission.permissions changes

---

## 🔍 Files Modified

1. `serve/libs/common/prisma/schema.prisma`
2. `serve/libs/common/src/constants/permissions.ts`
3. `serve/libs/common/src/index.ts`
4. `serve/apps/core/src/permissions/permissions.service.ts`
5. `serve/apps/gateway/src/guards/permissions.guard.ts`
6. `serve/apps/core/src/users/users.service.ts`

## 📋 Files To Create/Update

1. `serve/libs/common/prisma/seeds/permissions.seed.ts` (update)
2. `serve/libs/common/prisma/seeds/migrate-permissions.seed.ts` (optional)
3. Any permission-related DTOs (if needed)
4. Any permission-related controllers (if needed)

---

## ✅ Next Steps

1. **Install PowerShell 6+** (if not already installed)
2. **Run Prisma generate & migrate** (see MANUAL_EXECUTION_STEPS.md)
3. **Update seed files** (convert to GROUP_PERMISSION_SEED)
4. **Test thoroughly** (ROOT bypass, groups, validation)
5. **Update documentation** (AGENTS.md, CLAUDE.md)

---

**For detailed step-by-step instructions, see**: `MANUAL_EXECUTION_STEPS.md`
