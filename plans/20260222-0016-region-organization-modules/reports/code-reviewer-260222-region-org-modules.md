# Code Review: Region & Organization Modules

**Date:** 2026-02-22
**Reviewer:** code-reviewer
**Plan:** `plans/20260222-0016-region-organization-modules/plan.md`

---

## Scope

- **Files reviewed:** 11 files (services, controllers, DTOs, schema, permissions, index)
- **Lines analyzed:** ~550
- **Review focus:** Security, YAGNI/KISS/DRY, architecture alignment

---

## Overall Assessment

Implementation is clean and consistent with existing patterns. Architecture alignment is good. Two **critical** security issues exist in the gateway layer that must be fixed before this ships.

---

## Critical Issues

### 1. Unauthenticated write access on `PATCH /organizations/:id`

**File:** `serve/apps/gateway/src/organizations/organizations.controller.ts`, line 62–66

```ts
@Patch(':id')
@JwtAuth()   // JWT only — no ownership check, no permission check
async update(@Param('id') id: string, @Body() dto: any) {
```

`@JwtAuth()` means **any authenticated user** can update any organization. There is no:
- ownership check (is `req.user.userId === org.ownerId`?)
- permission check (`PERMISSIONS.ORGANIZATION_UPDATE`)

Any logged-in user can rename/modify an organization they don't own. The microservice layer has no authorization logic either — it accepts whatever the gateway sends.

**Fix:** Add `@Auth(PERMISSIONS.ORGANIZATION_UPDATE)` minimum; ideally also verify ownership server-side (either in gateway via a pre-fetch or in the esports service).

---

### 2. No DTO validation — raw `any` bodies passed to microservice

**Files:**
- `serve/apps/gateway/src/regions/regions.controller.ts`, lines 48, 55
- `serve/apps/gateway/src/organizations/organizations.controller.ts`, lines 53, 65

```ts
async create(@Body() dto: any, ...)
async update(@Param('id') id: string, @Body() dto: any)
```

`@Body() dto: any` bypasses NestJS's global `ValidationPipe`. This means:
- Arbitrary fields are accepted and forwarded to the microservice.
- For `organizations.create`, `ownerId` is overridable from the request body **before** the fallback to `req.user.userId` is applied (line 57: `dto.ownerId ?? req.user.userId`). An authenticated user can supply any `ownerId` and claim to create an org on behalf of any other user.

**Fix:** Replace `any` with the proper DTOs (`CreateRegionDto`, `UpdateRegionDto`, `CreateOrganizationDto`, `UpdateOrganizationDto`) and add class-validator decorators to the DTO classes, or strip `ownerId` from the incoming body entirely and always use `req.user.userId`.

---

## High Priority Findings

### 3. DTOs lack class-validator decorators

**Files:** All four DTO files (`create-region.dto.ts`, `update-region.dto.ts`, `create-organization.dto.ts`, `update-organization.dto.ts`)

Plain class properties with no `@IsString()`, `@IsNotEmpty()`, `@IsUrl()`, `@IsEnum()`, etc. Even if the gateway's `ValidationPipe` is configured globally, it has nothing to validate against — input is passed through unchecked to the microservice and directly into Prisma.

The existing `create-tournament.dto.ts` likely has the same gap (not added in this PR), but the new DTOs should establish better practice.

---

### 4. `findById` on Region always includes `organizations` — unbounded include

**File:** `serve/apps/esports/src/region/region.service.ts`, line 24–28

```ts
async findById(id: string): Promise<Region | null> {
  return this.prisma.region.findUnique({
    where: { id },
    include: { organizations: true },  // includes all nested organizations, no limit
  });
}
```

A region with many organizations will return the full organization graph. This is a potential DoS vector for large datasets. At minimum, add pagination or select only id/name. Same applies to `OrganizationService.findById` which includes `teams` and `tournaments` without limit.

---

## Medium Priority Improvements

### 5. Duplicated `paginate()` helper — DRY violation

**Files:**
- `serve/apps/esports/src/region/region.service.ts`, lines 42–47
- `serve/apps/esports/src/organization/organization.service.ts`, lines 84–89

Identical private `paginate<T>()` method copied verbatim. A shared `paginate()` utility in `libs/common/src/` (or a base service class) would eliminate this duplication. The pattern will keep spreading as more services are added.

---

### 6. `GET /regions` and `GET /organizations` are fully public (no auth)

**Files:** Both gateway controllers, `@Get()` handlers

This is likely intentional for a public esports platform, but it means the paginated list endpoints are open to unauthenticated scraping with no rate limiting in place. Flag for intentional decision.

---

### 7. `@Get(':id')` on regions returns `null` instead of 404

**File:** `serve/apps/gateway/src/regions/regions.controller.ts`, lines 39–42

When `regionService.findById()` returns `null`, the gateway forwards `null` to the client with HTTP 200. The same pattern exists across all `findById` handlers. The existing pattern in `users.controller.ts` has the same issue. Not new here, but worth tracking.

---

### 8. Legacy `regionTag` field on `Team` model

**File:** `serve/libs/common/prisma/schema.prisma`, line 213

```prisma
regionTag String? @map("region") // legacy string field — use regionId FK for new code
```

The comment says use `regionId` for new code, but `regionTag` still exists and is writable. No migration guard or deprecation path is defined. This is technical debt carried forward — the old field should have a timeline for removal.

---

### 9. `mediaLinks` field on `CreateOrganizationDto` has undocumented shape

**File:** `serve/apps/esports/src/dtos/create-organization.dto.ts`, line 9

```ts
mediaLinks?: Array<{ url: string; description?: string; regionId?: string }>;
```

The `regionId` property inside a media link is semantically odd — a media link (social URL etc.) should not carry a `regionId`. This may be a copy-paste artifact. The schema stores this as `Json @default("[]")` with no validation, so any shape will be accepted silently.

---

## Low Priority Suggestions

- `Inject` is imported in `regions.controller.ts` (line 10) from `@nestjs/common` — consistent with org controller, fine.
- `import { Prisma } from '@app/common/../generated/prisma/client'` in `organization.service.ts` line 4 is a path hack; cleaner to re-export `Prisma` namespace from `@app/common/index.ts`.
- `OrganizationService.findAll` filter parameter is named `role` internally but represents `roles` (plural array). Minor naming inconsistency.

---

## Positive Observations

- NATS message pattern naming is consistent (`resource.action`) and matches existing conventions.
- `$transaction([findMany, count])` for pagination is correct and efficient.
- Ownership-transfer protection in `UpdateOrganizationDto` (excluding `ownerId`) is a deliberate and good design decision, documented in code.
- `managerId: null` disconnect pattern in `update()` is handled correctly.
- Permission constants follow the established `MODULE_ACTION` naming convention.
- `OWNER_SELECT` constant for user projection avoids leaking password/sensitive fields.
- Schema indexes on `regionId`, `ownerId`, `sponsorId` are appropriate.

---

## Recommended Actions

1. **[Critical]** Replace `@JwtAuth()` on `PATCH /organizations/:id` with `@Auth(PERMISSIONS.ORGANIZATION_UPDATE)` and strip or enforce `ownerId` server-side in the create path.
2. **[Critical]** Replace `@Body() dto: any` in both gateway controllers with typed DTOs and add class-validator decorators to DTO classes.
3. **[High]** Add `take` limit to `findById` includes (organizations, teams, tournaments) or return only IDs.
4. **[Medium]** Extract `paginate<T>()` to `libs/common/src/utils/paginate.ts` and import it.
5. **[Medium]** Clarify `regionId` inside `mediaLinks` — remove if unintentional.
6. **[Low]** Re-export `Prisma` namespace from `@app/common` to avoid the `../generated/prisma/client` import path in service files.

---

## Plan Status Update

All four implementation phases are **complete**. The critical security issues above are **not blocking completeness** of the feature — they are bugs to fix before production use.

| Phase | Status |
|-------|--------|
| 01: Prisma Schema | DONE |
| 02: Permissions & Common | DONE |
| 03: Esports Microservice | DONE |
| 04: Gateway HTTP Controllers | DONE (with security issues noted above) |

---

## Metrics

- **Linting Issues:** 0 structural, 2 critical security gaps, 1 DRY violation
- **Type Coverage:** DTOs untyped at gateway layer (`any`); microservice layer typed correctly
- **Test Coverage:** Not assessed (no test files in scope)
