# Phase 03 — Esports Microservice: Region & Organization

**Context:** [plan.md](./plan.md)
**Depends on:** [phase-01](./phase-01-prisma-schema.md), [phase-02](./phase-02-permissions-common.md)
**Docs:** `serve/apps/esports/src/`

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-22 |
| Priority | High |
| Status | ⬜ Pending |

Create `region/` and `organization/` feature directories in the esports microservice with service + controller + DTOs. Register them in `app.module.ts`.

---

## Key Insights

- Existing pattern: single `EsportsController` + `EsportsService` with `@MessagePattern`. New features follow same pattern, placed in dedicated subdirs
- Pagination follows `PaginatedResponse<T>` shape: `{ data, meta: { total, page, limit, totalPages } }`
- DTOs live in `apps/esports/src/dtos/` and are barrel-exported from `dtos/index.ts`
- `PrismaService` injected via constructor from `@app/common`
- `OrganizationType` filter on `findAll` uses Prisma `hasSome` since `roles` is a scalar array

---

## Requirements

### DTOs (in `apps/esports/src/dtos/`)

**`create-region.dto.ts`**
```typescript
export class CreateRegionDto {
  name: string;
  code: string;
  logo?: string;
}
```

**`update-region.dto.ts`**
```typescript
export class UpdateRegionDto {
  name?: string;
  code?: string;
  logo?: string;
}
```

**`create-organization.dto.ts`**
```typescript
export class CreateOrganizationDto {
  name: string;
  shortName?: string;
  logo?: string;
  website?: string;
  description?: string;
  mediaLinks?: Array<{ url: string; description?: string; regionId?: string }>;
  roles: OrganizationType[];
  ownerId: string;
  managerId?: string;
  regionId?: string;
}
```

**`update-organization.dto.ts`**
```typescript
export class UpdateOrganizationDto {
  name?: string;
  shortName?: string;
  logo?: string;
  website?: string;
  description?: string;
  mediaLinks?: Array<{ url: string; description?: string; regionId?: string }>;
  roles?: OrganizationType[];
  managerId?: string;
  regionId?: string;
  // ownerId intentionally excluded — ownership transfer is a separate concern
}
```

### Region Service (`region/region.service.ts`)

Methods:
- `findAll(page, limit)` → `PaginatedResponse<Region>`
- `findById(id)` → `Region | null` (include `teams`, `organizations`)
- `create(dto)` → `Region`
- `update(id, dto)` → `Region`
- `delete(id)` → `Region`

### Region Controller (`region/region.controller.ts`)

Message patterns:
- `regions.findAll` — payload `{ page, limit }`
- `regions.findById` — payload `{ id }`
- `regions.create` — payload `CreateRegionDto`
- `regions.update` — payload `{ id, dto: UpdateRegionDto }`
- `regions.delete` — payload `{ id }`

### Organization Service (`organization/organization.service.ts`)

Methods:
- `findAll(page, limit, role?, regionId?)` → `PaginatedResponse<Organization>`
  - Filter: if `role` provided → `where: { roles: { hasSome: [role] } }`
  - Filter: if `regionId` provided → `where: { regionId }`
  - Include: `region`, `owner` (select: id, username, avatar), `manager` (same)
- `findById(id)` → `Organization | null` (include region, owner, manager, teams, tournaments)
- `create(dto)` → `Organization`
- `update(id, dto)` → `Organization`
- `delete(id)` → `Organization`

### Organization Controller (`organization/organization.controller.ts`)

Message patterns:
- `organizations.findAll` — payload `{ page, limit, role?, regionId? }`
- `organizations.findById` — payload `{ id }`
- `organizations.create` — payload `CreateOrganizationDto`
- `organizations.update` — payload `{ id, dto: UpdateOrganizationDto }`
- `organizations.delete` — payload `{ id }`

### App Module Update

Register in `apps/esports/src/app.module.ts`:
- Add `RegionController`, `RegionService`
- Add `OrganizationController`, `OrganizationService`

---

## Architecture

### File Layout

```
apps/esports/src/
├── region/
│   ├── region.controller.ts
│   └── region.service.ts
├── organization/
│   ├── organization.controller.ts
│   └── organization.service.ts
├── dtos/
│   ├── create-tournament.dto.ts  (existing)
│   ├── create-region.dto.ts      (new)
│   ├── update-region.dto.ts      (new)
│   ├── create-organization.dto.ts (new)
│   ├── update-organization.dto.ts (new)
│   └── index.ts                  (update exports)
└── app.module.ts                 (update)
```

### Pagination Helper (inline in each service)

```typescript
private paginate<T>(data: T[], total: number, page: number, limit: number) {
  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}
```

### Region Service Implementation Sketch

```typescript
@Injectable()
export class RegionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.region.findMany({ skip, take: limit, orderBy: { name: 'asc' } }),
      this.prisma.region.count(),
    ]);
    return this.paginate(data, total, page, limit);
  }

  async findById(id: string) {
    return this.prisma.region.findUnique({ where: { id }, include: { organizations: true } });
  }

  async create(dto: CreateRegionDto) {
    return this.prisma.region.create({ data: dto });
  }

  async update(id: string, dto: UpdateRegionDto) {
    return this.prisma.region.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    return this.prisma.region.delete({ where: { id } });
  }
  // ... paginate helper
}
```

### Organization findAll Filter

```typescript
const where: Prisma.OrganizationWhereInput = {};
if (role) where.roles = { hasSome: [role] };
if (regionId) where.regionId = regionId;
```

---

## Related Code Files

- `serve/apps/esports/src/esports.service.ts` — reference pattern
- `serve/apps/esports/src/esports.controller.ts` — reference pattern
- `serve/apps/esports/src/app.module.ts` — **modify**
- `serve/apps/esports/src/dtos/index.ts` — **modify**

---

## Implementation Steps

1. Create `dtos/create-region.dto.ts`, `dtos/update-region.dto.ts`
2. Create `dtos/create-organization.dto.ts`, `dtos/update-organization.dto.ts`
3. Update `dtos/index.ts` to export all 4 new DTOs
4. Create `region/region.service.ts`
5. Create `region/region.controller.ts`
6. Create `organization/organization.service.ts`
7. Create `organization/organization.controller.ts`
8. Update `app.module.ts` — add controllers and providers

---

## Todo

- [ ] `dtos/create-region.dto.ts`
- [ ] `dtos/update-region.dto.ts`
- [ ] `dtos/create-organization.dto.ts`
- [ ] `dtos/update-organization.dto.ts`
- [ ] `dtos/index.ts` — add exports
- [ ] `region/region.service.ts`
- [ ] `region/region.controller.ts`
- [ ] `organization/organization.service.ts`
- [ ] `organization/organization.controller.ts`
- [ ] `app.module.ts` — register RegionController, RegionService, OrganizationController, OrganizationService

---

## Success Criteria

- `pnpm run start:dev:esports` starts without errors
- NATS messages `regions.*` and `organizations.*` are handled
- Pagination response matches `{ data, meta }` shape

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| `hasSome` filter type mismatch | Low | Medium | Import `Prisma` namespace from generated client |
| `mediaLinks` Json serialization | Low | Low | Pass as-is; Prisma handles JSON |

---

## Next Steps

→ Phase 04: Gateway HTTP Controllers
