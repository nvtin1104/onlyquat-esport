# NestJS Backend TypeScript/Build Error Report

**Date:** February 20, 2026
**Project:** onlyquat-esport
**Service:** NestJS Backend at `C:\project\onlyquat-esport\serve`

---

## Executive Summary

TypeScript compilation failed with **10 critical errors** across 3 files. Errors stem from schema/type mismatches between:
1. **Auth service** - accessing non-existent user properties (`name`, `status`)
2. **Users service** - role/enum type conflicts and invalid schema updates
3. **Common index** - missing `UserStatus` export from Prisma client

**Build Status:** FAILED - Cannot proceed with build until errors resolved.

---

## Detailed Error Analysis

### File 1: `apps/core/src/auth/auth.service.ts`

**6 Errors**

#### Error 1 (Line 43, Column 20)
```
error TS2339: Property 'name' does not exist on type '{ email: string; password: string; username: string; avatar: string | null; id: string; firstName: string | null; lastName: string | null; role: UserRole; isActive: boolean; createdAt: Date; updatedAt: Date; }'.
```

**Context:** auth.service.ts line 43
```typescript
user: {
  id: user.id,
  email: user.email,
  username: user.username,
  name: user.name,  // <-- ERROR: property doesn't exist
  roles: user.role,
  status: user.status,
},
```

**Root Cause:** User schema mismatch. Auth service expects `name` field but User type shows `firstName` and `lastName` fields instead.

**Impact:** Register endpoint broken.

---

#### Error 2 (Line 44, Column 9)
```
error TS2322: Type 'string' is not assignable to type 'UserRole[]'.
```

**Context:** auth.service.ts line 44
```typescript
roles: user.role,  // <-- ERROR: user.role is UserRole (enum), not UserRole[] (array)
```

**Root Cause:** Field type mismatch. Expected `UserRole[]` but got `UserRole`.

**Impact:** Type safety violated in response DTO.

---

#### Error 3 (Line 45, Column 22)
```
error TS2339: Property 'status' does not exist on type '{ email: string; password: string; username: string; avatar: string | null; id: string; firstName: string | null; lastName: string | null; role: UserRole; isActive: boolean; createdAt: Date; updatedAt: Date; }'.
```

**Context:** auth.service.ts line 45
```typescript
status: user.status,  // <-- ERROR: property doesn't exist
```

**Root Cause:** User schema mismatch. Auth service references `status` field but schema shows `isActive` instead.

**Impact:** Cannot return user status in auth response.

---

#### Error 4 (Line 69, Column 20)
```
error TS2339: Property 'name' does not exist on type '...'
```

**Context:** auth.service.ts line 69 (login method, same issue as Error 1)

**Root Cause:** Same as Error 1 - `name` field mismatch.

**Impact:** Login endpoint broken.

---

#### Error 5 (Line 70, Column 9)
```
error TS2322: Type 'string' is not assignable to type 'UserRole[]'.
```

**Context:** auth.service.ts line 70 (login method, same issue as Error 2)

**Root Cause:** Same as Error 2.

**Impact:** Type safety violated in login response.

---

#### Error 6 (Line 71, Column 22)
```
error TS2339: Property 'status' does not exist on type '...'
```

**Context:** auth.service.ts line 71 (login method, same issue as Error 3)

**Root Cause:** Same as Error 3.

**Impact:** Cannot return status in login response.

---

### File 2: `apps/core/src/users/users.service.ts`

**4 Errors**

#### Error 7 (Line 34, Column 9)
```
error TS2322: Type 'any[]' is not assignable to type 'UserRole | undefined'.
```

**Context:** users.service.ts line 34
```typescript
role: [UserRole.USER],  // <-- ERROR: array assigned to non-array type
```

**Root Cause:** Type mismatch. Code sends `[UserRole.USER]` (array) but schema expects `UserRole` (single enum value).

**Impact:** User creation fails.

---

#### Error 8 (Line 34, Column 25)
```
error TS2339: Property 'USER' does not exist on type '{ readonly player: "player"; readonly organizer: "organizer"; readonly admin: "admin"; }'.
```

**Context:** users.service.ts line 34 (same line as Error 7)
```typescript
role: [UserRole.USER],  // <-- ERROR: UserRole enum doesn't have USER property
```

**Root Cause:** Enum mismatch. Code references `UserRole.USER` but actual UserRole enum has: `ADMIN`, `STAFF`, `ORGANIZER`, `CREATOR`, `PARTNER`, `PLAYER`, `USER`. The import is pulling wrong enum definition.

**Impact:** Cannot reference correct role values.

---

#### Error 9 (Line 100, Column 15)
```
error TS2353: Object literal may only specify known properties, and 'status' does not exist in type '(Without<UserUpdateInput, UserUncheckedUpdateInput> & UserUncheckedUpdateInput) | (Without<...> & UserUpdateInput)'.
```

**Context:** users.service.ts line 100
```typescript
await this.prisma.user.update({
  where: { id: userId },
  data: { status: UserStatus.UNACTIVE },  // <-- ERROR: status not in schema update input
});
```

**Root Cause:** UserStatus enum doesn't exist in generated Prisma types. Schema defines `UserStatus` enum but it's not being generated/exported correctly.

**Impact:** Cannot deactivate users.

---

#### Error 10 (Line 144, Column 15)
```
error TS2322: Type 'UserRole[]' is not assignable to type 'UserRole | EnumUserRoleFieldUpdateOperationsInput | undefined'.
```

**Context:** users.service.ts line 144
```typescript
data: { role: updateRoleDto.roles },  // <-- ERROR: array incompatible with single enum type
```

**Root Cause:** Schema expects single `UserRole` enum value, code sends array `UserRole[]`.

**Impact:** Cannot update user roles.

---

### File 3: `libs/common/src/index.ts`

**1 Error**

#### Error 11 (Line 6, Column 20)
```
error TS2305: Module '"../generated/prisma/client"' has no exported member 'UserStatus'.
```

**Context:** libs/common/src/index.ts line 6
```typescript
export { UserRole, UserStatus, TournamentStatus, MatchStatus, PlayerTier, TeamMemberRole } from '../generated/prisma/client';
```

**Root Cause:** Prisma client generation missing. Generated Prisma client at `libs/common/generated/prisma/client` doesn't export `UserStatus` enum.

**Impact:** Cannot import UserStatus from common module. Blocks all dependent services.

---

## Root Cause Analysis

### Primary Issues:

1. **Schema-Code Mismatch**
   - Prisma schema defines `User.role` as `UserRole[]` (array)
   - Auth service code expects `user.role` as single value
   - Users service sends array but schema expects single value

2. **Missing User Fields**
   - Prisma schema: `name: String?`, `status: UserStatus`
   - Auth service expects: `firstName`, `lastName`, `isActive` (old schema)
   - Clear schema migration incomplete

3. **Prisma Client Not Generated**
   - Generated Prisma client missing `UserStatus` enum export
   - Suggests `prisma generate` not run after schema update
   - Generated directory likely missing or stale

4. **Enum Mismatch**
   - Code references `UserRole.USER` but Prisma has correct enum
   - Import chain broken - wrong enum being imported

---

## TypeScript Compilation Summary

| Metric | Value |
|--------|-------|
| **Total Errors** | 10 |
| **Files with Errors** | 3 |
| **Compilation Status** | FAILED |
| **Build Blocked** | YES |

### Error Distribution:
- `apps/core/src/auth/auth.service.ts`: 6 errors
- `apps/core/src/users/users.service.ts`: 4 errors
- `libs/common/src/index.ts`: 1 error

---

## Required Actions (Priority Order)

### CRITICAL - Must fix before build can proceed:

1. **Generate Prisma Client**
   ```bash
   cd C:/project/onlyquat-esport/serve
   npx prisma generate
   ```
   Verify `libs/common/generated/prisma/client/index.d.ts` exports `UserStatus`.

2. **Fix Role Type Mismatch** (Schema Issue)
   - Prisma schema line 69: `role: UserRole[]` (array type)
   - Decision required: Should role be array or single value?
   - If ARRAY: Update all services to handle arrays
   - If SINGLE: Change schema to `role: UserRole` (not array)

3. **Fix User Field Names in Auth Service**
   Update `apps/core/src/auth/auth.service.ts` lines 43-45 and 69-71:
   - Change `user.name` → correct field from schema
   - Change `user.status` → `user.isActive` (if using schema) OR add `status` field to schema
   - Fix `roles: user.role` → handle as array or single value based on schema decision

4. **Fix User Field Names in Users Service**
   Update `apps/core/src/users/users.service.ts`:
   - Line 34: Fix role assignment (array vs single)
   - Line 100: Change `status: UserStatus.UNACTIVE` to schema-compatible field
   - Line 144: Fix role array assignment

5. **Align Schema Across Services**
   Ensure consistent User model definition:
   - Confirm final field names: `name` vs `firstName`/`lastName`
   - Confirm final status field: `status` (enum) vs `isActive` (boolean)
   - Confirm role type: array vs single value

---

## Missing Migrations/Regenerations

- Prisma client generation: **NOT RUN** after latest schema changes
- TypeScript compilation: **BLOCKED** waiting for Prisma types

---

## Recommendations for Code Quality

1. **Add Type Validation Tests** - Ensure DTOs match schema exports
2. **Run TypeScript Check in Pre-commit** - Catch schema-code mismatches early
3. **Schema Documentation** - Document field requirements for each service
4. **Database Migration Validation** - Verify schema against actual DB state
5. **Automated Type Generation Tests** - Ensure Prisma exports always match schema

---

## Next Steps

1. Run `prisma generate` to fix Error 11
2. Review Prisma schema and decide on role/status field types
3. Update services to match final schema decisions
4. Re-run TypeScript check: `npx tsc --noEmit`
5. Verify all 10 errors resolved before attempting build
6. Run `npm run build` to test full build pipeline

---

**Report Generated:** 2026-02-20
**Analysis Status:** COMPLETE - Action Required
