# Phase 02 — Permissions & Common Library

**Context:** [plan.md](./plan.md)
**Depends on:** [phase-01-prisma-schema.md](./phase-01-prisma-schema.md)
**Docs:** `serve/libs/common/src/constants/permissions.ts`, `serve/libs/common/src/index.ts`

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-22 |
| Priority | High |
| Status | ⬜ Pending |

Add `REGION` and `ORGANIZATION` permission codes to the shared constants, add metadata entries, and export the new Prisma types from `@app/common`.

---

## Key Insights

- `PERMISSIONS` object in `permissions.ts` uses `module:action` format (e.g. `'region:create'`)
- `PERMISSION_METADATA` array must be updated in parallel — it drives validation and display
- `@app/common` `index.ts` re-exports Prisma types; after schema migration+generate, `Region` and `Organization` types exist in `../generated/prisma/client` and need to be exported
- `OrganizationType` enum also needs to be exported from `index.ts`

---

## Requirements

1. Add to `PERMISSIONS` constant:
   - `REGION_CREATE`, `REGION_UPDATE`, `REGION_DELETE`, `REGION_MANAGE`
   - `ORGANIZATION_VIEW`, `ORGANIZATION_CREATE`, `ORGANIZATION_UPDATE`, `ORGANIZATION_DELETE`, `ORGANIZATION_MANAGE`
2. Add matching entries to `PERMISSION_METADATA` array
3. Update `serve/libs/common/src/index.ts`:
   - Export `OrganizationType` enum
   - Export `Region` and `Organization` types

---

## Architecture

### permissions.ts additions

```typescript
// REGION
REGION_VIEW: 'region:view',
REGION_CREATE: 'region:create',
REGION_UPDATE: 'region:update',
REGION_DELETE: 'region:delete',
REGION_MANAGE: 'region:manage',

// ORGANIZATION
ORGANIZATION_VIEW: 'organization:view',
ORGANIZATION_CREATE: 'organization:create',
ORGANIZATION_UPDATE: 'organization:update',
ORGANIZATION_DELETE: 'organization:delete',
ORGANIZATION_MANAGE: 'organization:manage',
```

### PERMISSION_METADATA additions

```typescript
// REGION
{ code: 'region:view',   module: 'region', action: 'view',   name: 'Xem khu vực',       description: 'Xem danh sách khu vực' },
{ code: 'region:create', module: 'region', action: 'create', name: 'Tạo khu vực',        description: 'Tạo khu vực mới' },
{ code: 'region:update', module: 'region', action: 'update', name: 'Sửa khu vực',        description: 'Chỉnh sửa khu vực' },
{ code: 'region:delete', module: 'region', action: 'delete', name: 'Xoá khu vực',        description: 'Xoá khu vực' },
{ code: 'region:manage', module: 'region', action: 'manage', name: 'Quản lý khu vực (Full)', description: 'Toàn quyền khu vực' },

// ORGANIZATION
{ code: 'organization:view',   module: 'organization', action: 'view',   name: 'Xem tổ chức',           description: 'Xem danh sách tổ chức' },
{ code: 'organization:create', module: 'organization', action: 'create', name: 'Tạo tổ chức',            description: 'Tạo tổ chức mới' },
{ code: 'organization:update', module: 'organization', action: 'update', name: 'Sửa tổ chức',            description: 'Chỉnh sửa thông tin tổ chức' },
{ code: 'organization:delete', module: 'organization', action: 'delete', name: 'Xoá tổ chức',            description: 'Xoá tổ chức' },
{ code: 'organization:manage', module: 'organization', action: 'manage', name: 'Quản lý tổ chức (Full)', description: 'Toàn quyền tổ chức' },
```

### index.ts additions

```typescript
// Add to enum exports line:
export { UserRole, UserStatus, TournamentStatus, MatchStatus, PlayerTier, TeamMemberRole, OrganizationType } from '../generated/prisma/client';

// Add to type exports:
export type { Region, Organization, ... } from '../generated/prisma/client';
```

---

## Related Code Files

- `serve/libs/common/src/constants/permissions.ts` — **modify**
- `serve/libs/common/src/index.ts` — **modify**

---

## Implementation Steps

1. Edit `permissions.ts` — add REGION and ORGANIZATION blocks to `PERMISSIONS` constant
2. Edit `permissions.ts` — add matching entries to `PERMISSION_METADATA` array
3. Edit `index.ts` — add `OrganizationType` to enum export line
4. Edit `index.ts` — add `Region`, `Organization` to type export block

---

## Todo

- [ ] Add `REGION_*` permission codes to `PERMISSIONS`
- [ ] Add `ORGANIZATION_*` permission codes to `PERMISSIONS`
- [ ] Add metadata entries for both modules
- [ ] Export `OrganizationType` enum from `@app/common`
- [ ] Export `Region`, `Organization` types from `@app/common`

---

## Success Criteria

- `PERMISSIONS.REGION_CREATE` etc. are accessible
- `import { Region, Organization, OrganizationType } from '@app/common'` works
- No TypeScript errors in permissions file

---

## Next Steps

→ Phase 03: Esports Microservice — Region & Organization
