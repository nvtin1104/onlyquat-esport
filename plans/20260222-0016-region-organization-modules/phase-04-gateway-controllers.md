# Phase 04 — Gateway HTTP Controllers

**Context:** [plan.md](./plan.md)
**Depends on:** [phase-02](./phase-02-permissions-common.md), [phase-03](./phase-03-esports-service.md)
**Docs:** `serve/apps/gateway/src/`

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-22 |
| Priority | High |
| Status | ⬜ Pending |

Expose `Region` and `Organization` CRUD via REST endpoints in the gateway, forwarding to `ESPORTS_SERVICE` via NATS.

---

## Key Insights

- Gateway controllers inject `@Inject('ESPORTS_SERVICE') private readonly esportsClient: ClientProxy`
- All NATS calls use `firstValueFrom(this.esportsClient.send(pattern, payload))`
- Public reads need no auth decorator; writes use `@JwtAuth()` or `@Auth(PERMISSIONS.X)`
- API tags via `@ApiTags()` and `@ApiOperation()` for Swagger
- Existing pattern in `users.controller.ts` and `admin/permissions.controller.ts` — follow exactly

---

## Requirements

### Regions Controller (`regions/regions.controller.ts`)

| Method | Route | Auth | NATS Pattern |
|--------|-------|------|--------------|
| GET | `/regions` | Public | `regions.findAll` |
| GET | `/regions/:id` | Public | `regions.findById` |
| POST | `/regions` | `REGION_CREATE` | `regions.create` |
| PATCH | `/regions/:id` | `REGION_UPDATE` | `regions.update` |
| DELETE | `/regions/:id` | `REGION_DELETE` | `regions.delete` |

Query params for GET list: `?page=1&limit=20`

### Organizations Controller (`organizations/organizations.controller.ts`)

| Method | Route | Auth | NATS Pattern |
|--------|-------|------|--------------|
| GET | `/organizations` | Public | `organizations.findAll` |
| GET | `/organizations/:id` | Public | `organizations.findById` |
| POST | `/organizations` | `@JwtAuth()` | `organizations.create` |
| PATCH | `/organizations/:id` | `@JwtAuth()` | `organizations.update` |
| DELETE | `/organizations/:id` | `ORGANIZATION_DELETE` | `organizations.delete` |

Query params for GET list: `?page=1&limit=20&role=ORGANIZER&regionId=xxx`

> POST/PATCH use `@JwtAuth()` (not `@Auth`) because any authenticated user with the right user-role can create/manage their org. DELETE is admin-only hence `@Auth(PERMISSIONS.ORGANIZATION_DELETE)`.

### App Module Update (`gateway/src/app.module.ts`)

Add `RegionsController` and `OrganizationsController` to controllers array.

---

## Architecture

### File Layout

```
apps/gateway/src/
├── regions/
│   └── regions.controller.ts    (new)
├── organizations/
│   └── organizations.controller.ts (new)
└── app.module.ts                (modify — add 2 controllers)
```

### Regions Controller Sketch

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Auth, JwtAuth } from '../decorators/auth.decorator';
import { PERMISSIONS } from '@app/common';

@ApiTags('Regions')
@Controller('regions')
export class RegionsController {
  constructor(
    @Inject('ESPORTS_SERVICE') private readonly esportsClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List regions' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return firstValueFrom(
      this.esportsClient.send('regions.findAll', {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get region by ID' })
  async findById(@Param('id') id: string) {
    return firstValueFrom(this.esportsClient.send('regions.findById', { id }));
  }

  @Post()
  @Auth(PERMISSIONS.REGION_CREATE)
  @ApiOperation({ summary: 'Create region — requires region:create' })
  async create(@Body() dto: any) {
    return firstValueFrom(this.esportsClient.send('regions.create', dto));
  }

  @Patch(':id')
  @Auth(PERMISSIONS.REGION_UPDATE)
  @ApiOperation({ summary: 'Update region — requires region:update' })
  async update(@Param('id') id: string, @Body() dto: any) {
    return firstValueFrom(this.esportsClient.send('regions.update', { id, dto }));
  }

  @Delete(':id')
  @Auth(PERMISSIONS.REGION_DELETE)
  @ApiOperation({ summary: 'Delete region — requires region:delete' })
  async delete(@Param('id') id: string) {
    return firstValueFrom(this.esportsClient.send('regions.delete', { id }));
  }
}
```

### Organizations Controller Sketch

```typescript
@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(
    @Inject('ESPORTS_SERVICE') private readonly esportsClient: ClientProxy,
  ) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('regionId') regionId?: string,
  ) {
    return firstValueFrom(
      this.esportsClient.send('organizations.findAll', {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        role,
        regionId,
      }),
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return firstValueFrom(this.esportsClient.send('organizations.findById', { id }));
  }

  @Post()
  @JwtAuth()
  async create(@Body() dto: any, @Req() req: any) {
    // Inject requester as ownerId if not provided
    return firstValueFrom(
      this.esportsClient.send('organizations.create', {
        ...dto,
        ownerId: dto.ownerId ?? req.user.userId,
      }),
    );
  }

  @Patch(':id')
  @JwtAuth()
  async update(@Param('id') id: string, @Body() dto: any) {
    return firstValueFrom(this.esportsClient.send('organizations.update', { id, dto }));
  }

  @Delete(':id')
  @Auth(PERMISSIONS.ORGANIZATION_DELETE)
  async delete(@Param('id') id: string) {
    return firstValueFrom(this.esportsClient.send('organizations.delete', { id }));
  }
}
```

---

## Related Code Files

- `serve/apps/gateway/src/users/users.controller.ts` — reference pattern
- `serve/apps/gateway/src/decorators/auth.decorator.ts` — `@Auth`, `@JwtAuth`
- `serve/apps/gateway/src/app.module.ts` — **modify**

---

## Implementation Steps

1. Create `regions/regions.controller.ts`
2. Create `organizations/organizations.controller.ts`
3. Update `app.module.ts` — import and register both controllers in `controllers: []` array

---

## Todo

- [ ] Create `regions/regions.controller.ts`
- [ ] Create `organizations/organizations.controller.ts`
- [ ] Update `app.module.ts` — add `RegionsController`, `OrganizationsController`

---

## Success Criteria

- `pnpm run start:dev:gateway` starts without errors
- `GET /regions` returns `{ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }`
- `GET /organizations` returns paginated results
- `POST /regions` returns 401 without auth token
- `DELETE /organizations/:id` returns 403 without permission

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| NATS timeout if esports service not running | Low | Low | Expected dev behavior |
| `ownerId` injection on POST organization | Low | Medium | Default to `req.user.userId` if `ownerId` not in body |

---

## Security Considerations

- Public GET endpoints expose no sensitive data (org contact info is intentionally public)
- POST organization auto-assigns `ownerId` from JWT — prevents spoofing owner
- DELETE requires explicit `organization:delete` permission — not granted to normal users

---

## Unresolved Questions

1. Should `PATCH /organizations/:id` verify that the requester is the `ownerId` or `managerId`? Currently any authenticated user can PATCH any org. Consider adding ownership check in the service layer.
2. Should `POST /organizations` be permission-gated (`ORGANIZATION_CREATE`) rather than just `@JwtAuth()`? The task spec says `@JwtAuth()` — keeping it but noting the trade-off.

---

## Next Steps

All phases complete → run full integration smoke test:
1. `docker-compose up -d` (postgres, nats, redis)
2. `pnpm run prisma:migrate && pnpm run prisma:generate`
3. `pnpm run start:all`
4. `curl http://localhost:3333/regions` → expect `{ data: [], meta: {...} }`
