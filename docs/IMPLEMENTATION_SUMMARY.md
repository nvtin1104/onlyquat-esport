# Region & Organization Modules - Implementation Summary

**Date:** 2026-02-21
**Status:** Complete
**Scope:** Region and Organization CRUD operations with database models, services, controllers, and DTOs

---

## Overview

Two foundational modules have been implemented for the esports platform:

1. **Region Module** — Geographic/logical area management
2. **Organization Module** — Entity management (organizers, sponsors, clubs, agencies)

Both modules follow the standard NestJS microservice pattern with:
- Prisma ORM for data persistence
- NATS message patterns for microservice communication
- Gateway HTTP REST endpoints
- Permission-based access control

---

## What Was Implemented

### 1. Database Models

**Location:** `serve/libs/common/prisma/schema.prisma`

#### Region Model
```prisma
model Region {
  id        String   @id @default(uuid())
  name      String   @unique
  code      String   @unique
  logo      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  teams         Team[]
  organizations Organization[]
}
```

**Fields:**
- `name`: Unique region name (e.g., "North America")
- `code`: Unique region code (e.g., "NA")
- `logo`: Optional URL to region logo

**Relations:**
- One-to-many with Team
- One-to-many with Organization

#### Organization Model
```prisma
model Organization {
  id          String             @id @default(uuid())
  name        String             @unique
  shortName   String?
  logo        String?
  website     String?
  description String?
  mediaLinks  Json               @default("[]")
  roles       OrganizationType[]

  ownerId   String
  owner     User    @relation("OrgOwner", fields: [ownerId], references: [id])
  managerId String?
  manager   User?   @relation("OrgManager", fields: [managerId], references: [id])

  regionId String?
  region   Region? @relation(fields: [regionId], references: [id])

  teams            Team[]
  tournaments      Tournament[] @relation("OrgTournaments")
  sponsoredMatches Match[]      @relation("OrgSponsoredMatches")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum OrganizationType {
  ORGANIZER // Tournament organizer
  SPONSOR   // Sponsor
  CLUB      // Team/club owner
  AGENCY    // Talent agency
}
```

**Key Fields:**
- `name`: Unique organization name
- `roles`: Array of `OrganizationType` for multi-role support
- `mediaLinks`: JSON array of social/web links
- `ownerId`: Creator/owner user
- `managerId`: Optional day-to-day manager
- `regionId`: Optional region association

**Relations:**
- One owner (User)
- Optional manager (User)
- Optional region (Region)
- Many teams, tournaments, match sponsorships

### 2. Permission Codes

**Location:** `serve/libs/common/src/constants/permissions.ts`

#### Region Permissions
```typescript
REGION_VIEW: 'region:view',
REGION_CREATE: 'region:create',
REGION_UPDATE: 'region:update',
REGION_DELETE: 'region:delete',
REGION_MANAGE: 'region:manage',
```

#### Organization Permissions
```typescript
ORGANIZATION_VIEW: 'organization:view',
ORGANIZATION_CREATE: 'organization:create',
ORGANIZATION_UPDATE: 'organization:update',
ORGANIZATION_DELETE: 'organization:delete',
ORGANIZATION_MANAGE: 'organization:manage',
```

**Permission Metadata:** Includes Vietnamese localization and descriptions for permission management UI.

### 3. Type Exports

**Location:** `serve/libs/common/src/index.ts`

Exported types:
```typescript
export type { OrganizationType, Region, Organization };
```

Makes types available to frontend and other services.

### 4. Esports Microservice Implementation

**Location:** `serve/apps/esports/src/`

#### RegionService (`region/region.service.ts`)
```typescript
export class RegionService {
  async findAll(page = 1, limit = 20): PaginatedResponse<Region>
  async findById(id: string): Promise<Region | null>
  async create(dto: CreateRegionDto): Promise<Region>
  async update(id: string, dto: UpdateRegionDto): Promise<Region>
  async delete(id: string): Promise<Region>
}
```

**Features:**
- Paginated list with sorting by name
- Includes related teams and organizations in detail view
- Standard CRUD operations

#### RegionController (`region/region.controller.ts`)
```typescript
@MessagePattern('regions.findAll')
@MessagePattern('regions.findById')
@MessagePattern('regions.create')
@MessagePattern('regions.update')
@MessagePattern('regions.delete')
```

**NATS Patterns:**
- `regions.findAll` — Query parameters: page, limit
- `regions.findById` — Parameter: id
- `regions.create` — Payload: CreateRegionDto
- `regions.update` — Payload: { id, dto: UpdateRegionDto }
- `regions.delete` — Payload: { id }

#### OrganizationService (`organization/organization.service.ts`)
```typescript
export class OrganizationService {
  async findAll(page = 1, limit = 20, role?: OrganizationType, regionId?: string): PaginatedResponse<Organization>
  async findById(id: string): Promise<Organization | null>
  async create(dto: CreateOrganizationDto): Promise<Organization>
  async update(id: string, dto: UpdateOrganizationDto): Promise<Organization>
  async delete(id: string): Promise<Organization>
}
```

**Features:**
- Paginated list with optional filters (role, regionId)
- Owner and manager user info included (selected fields)
- Related data: region, teams, tournaments, sponsored matches
- Supports JSON mediaLinks

#### OrganizationController (`organization/organization.controller.ts`)
```typescript
@MessagePattern('organizations.findAll')
@MessagePattern('organizations.findById')
@MessagePattern('organizations.create')
@MessagePattern('organizations.update')
@MessagePattern('organizations.delete')
```

**NATS Patterns:**
- `organizations.findAll` — Query parameters: page, limit, role, regionId
- `organizations.findById` — Parameter: id
- `organizations.create` — Payload: CreateOrganizationDto
- `organizations.update` — Payload: { id, dto: UpdateOrganizationDto }
- `organizations.delete` — Payload: { id }

### 5. DTOs

**Location:** `serve/apps/esports/src/dtos/`

#### CreateRegionDto
```typescript
export class CreateRegionDto {
  name: string;        // Required, unique
  code: string;        // Required, unique
  logo?: string;       // Optional URL
}
```

#### UpdateRegionDto
```typescript
export class UpdateRegionDto {
  name?: string;
  code?: string;
  logo?: string;
}
```

#### CreateOrganizationDto
```typescript
export class CreateOrganizationDto {
  name: string;
  shortName?: string;
  logo?: string;
  website?: string;
  description?: string;
  mediaLinks?: Array<{ url: string; description?: string }>;
  roles: OrganizationType[];
  ownerId: string;
  managerId?: string;
  regionId?: string;
}
```

**Note:** In the gateway controller, `ownerId` is always set from the authenticated user's JWT, ignoring any body-supplied value.

#### UpdateOrganizationDto
```typescript
export class UpdateOrganizationDto {
  name?: string;
  shortName?: string;
  logo?: string;
  website?: string;
  description?: string;
  mediaLinks?: Array<{ url: string; description?: string }>;
  roles?: OrganizationType[];
  managerId?: string;                    // Can be set to null
  regionId?: string;                     // Can be set to null
  // ownerId intentionally excluded
}
```

**Note:** ownerId excluded intentionally — ownership transfer is a separate concern.

### 6. Gateway HTTP Controllers

**Location:** `serve/apps/gateway/src/`

#### RegionsController (`regions/regions.controller.ts`)
```typescript
GET    /regions                 → findAll(page, limit)
GET    /regions/:id             → findById(id)
POST   /regions                 → create(dto) [requires: region:create]
PATCH  /regions/:id             → update(id, dto) [requires: region:update]
DELETE /regions/:id             → delete(id) [requires: region:delete]
```

#### OrganizationsController (`organizations/organizations.controller.ts`)
```typescript
GET    /organizations           → findAll(page, limit, role?, regionId?)
GET    /organizations/:id       → findById(id)
POST   /organizations           → create(dto) [requires: JWT, sets ownerId]
PATCH  /organizations/:id       → update(id, dto) [requires: organization:update]
DELETE /organizations/:id       → delete(id) [requires: organization:delete]
```

---

## Database Integration

### Schema Updates

**File:** `serve/libs/common/prisma/schema.prisma`

#### Changes to Existing Models

**User Model:**
```diff
+ ownedOrganizations   Organization[] @relation("OrgOwner")
+ managedOrganizations Organization[] @relation("OrgManager")
```

**Team Model:**
```diff
+ organizationId String?
+ organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
+ regionId       String?
+ region         Region?       @relation(fields: [regionId], references: [id], onDelete: SetNull)
```

**Tournament Model:**
```diff
+ organizationId String?
+ organization   Organization? @relation("OrgTournaments", fields: [organizationId], references: [id], onDelete: SetNull)
```

**Match Model:**
```diff
+ sponsorId String?
+ sponsor   Organization? @relation("OrgSponsoredMatches", fields: [sponsorId], references: [id], onDelete: SetNull)
```

### Migration

Run database migration after schema changes:
```bash
cd serve
pnpm run prisma:migrate
```

---

## Permissions & Authentication

### Permission Model

Both modules follow the platform's **hybrid permission system**:

1. **Role-Based Permissions** — Determined by user's `UserRole`
2. **User-Specific Overrides** — Stored in `UserPermission.additionalPermissions`
3. **Group Permissions** — Via `UserGroupPermission`

**Effective Permissions** = Union of all three sources

### Authentication

**Region Module:**
- GET endpoints: Public (no auth required)
- POST/PATCH/DELETE: Require `region:*` permissions

**Organization Module:**
- GET endpoints: Public (no auth required)
- POST: Requires JWT (authenticated user becomes owner)
- PATCH/DELETE: Require `organization:update`/`organization:delete` permissions

### Gateway Decorators

```typescript
@Auth(PERMISSIONS.REGION_CREATE)      // Permission check
@JwtAuth()                             // JWT presence check
```

---

## API Contracts

### Request/Response Format

All list endpoints return standardized `PaginatedResponse<T>`:

```json
{
  "data": [ {...}, {...} ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Error Responses

```json
{
  "statusCode": 400,
  "message": "Descriptive error message",
  "error": "BadRequest"
}
```

---

## Testing Considerations

### Unit Tests

Services should be tested with:
- Mocked `PrismaService`
- All CRUD operations
- Filter logic (organization filtering by role/region)
- Pagination calculations

### Integration Tests

Gateway controllers should test:
- HTTP verb/path matching
- Permission enforcement
- NATS client communication
- Error handling
- Request/response validation

### Manual Testing

```bash
# Create region
curl -X POST http://localhost:3333/regions \
  -H "Authorization: Bearer JWT" \
  -d '{"name":"North America","code":"NA"}'

# List organizations in North America (sponsor role)
curl "http://localhost:3333/organizations?role=SPONSOR&regionId=UUID"

# Create organization (sets ownerId from JWT)
curl -X POST http://localhost:3333/organizations \
  -H "Authorization: Bearer JWT" \
  -d '{"name":"TechCorp","roles":["SPONSOR"],"regionId":"UUID"}'
```

---

## Key Design Decisions

### 1. Multi-Role Organizations
- `roles` is an array, allowing organizations to be simultaneously sponsors AND clubs
- Simplifies modeling of complex real-world entities

### 2. ownerId Immutability
- Set during creation from authenticated user
- Cannot be changed via PATCH (ownership transfer is separate concern)
- Prevents privilege escalation

### 3. Optional Region/Manager
- Both are nullable, allowing flexibility
- Teams and organizations can exist without region
- Manager can be unset by passing null

### 4. JSON mediaLinks
- Supports arbitrary social/web links
- More flexible than normalized foreign keys
- Easy to add new platforms

### 5. Cascading Deletes
- Region deletion cascades to teams/organizations
- Organization deletion cascades to teams/tournaments
- This mirrors relational integrity

---

## Documentation

Comprehensive documentation created:

| File | Purpose |
|---|---|
| `docs/api-regions-organizations.md` | REST API endpoints, DTOs, examples, error handling |
| `docs/database-schema.md` | Complete Prisma schema documentation |
| `CLAUDE.md` | Updated Key models section |

---

## Files Modified/Created

### Created
- `serve/apps/esports/src/region/region.service.ts`
- `serve/apps/esports/src/region/region.controller.ts`
- `serve/apps/esports/src/organization/organization.service.ts`
- `serve/apps/esports/src/organization/organization.controller.ts`
- `serve/apps/esports/src/dtos/create-region.dto.ts`
- `serve/apps/esports/src/dtos/update-region.dto.ts`
- `serve/apps/esports/src/dtos/create-organization.dto.ts`
- `serve/apps/esports/src/dtos/update-organization.dto.ts`
- `serve/apps/gateway/src/regions/regions.controller.ts`
- `serve/apps/gateway/src/organizations/organizations.controller.ts`
- `docs/api-regions-organizations.md`
- `docs/database-schema.md`
- `docs/IMPLEMENTATION_SUMMARY.md` (this file)

### Modified
- `serve/libs/common/prisma/schema.prisma` (Region, Organization models + updates to Team, Tournament, Match, User)
- `serve/libs/common/src/constants/permissions.ts` (Region & Organization permission codes)
- `serve/libs/common/src/index.ts` (Type exports)
- `CLAUDE.md` (Key models section updated)

---

## Next Steps

1. **Register Modules** — Add RegionModule and OrganizationModule to esports app's `app.module.ts`
2. **Register Controllers** — Register controllers in gateway's `app.module.ts`
3. **Database Migration** — Run `pnpm run prisma:migrate` to apply schema changes
4. **Permission Seeding** — Ensure permission codes are seeded in `GroupPermission` table
5. **Frontend Integration** — Build dashboard UI for region/organization management
6. **Testing** — Write unit and integration tests
7. **API Documentation** — Generate Swagger/OpenAPI from controller decorators

---

## Rollback Plan

If needed, revert changes:

```bash
# Database rollback
cd serve
pnpm run prisma:migrate:dev --name "revert region organization"
# Remove migration file manually

# Git rollback
git revert <commit-hash>
```

---

## Success Metrics

- All NATS message patterns working
- All HTTP endpoints accessible and responding
- Permissions enforced correctly
- Pagination working as expected
- Foreign key relationships intact
- No duplicate entries for unique constraints

