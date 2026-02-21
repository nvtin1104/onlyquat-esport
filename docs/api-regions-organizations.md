# Regions & Organizations API

Comprehensive API documentation for Region and Organization management modules in the esports platform.

---

## Regions API

Regions represent geographic/logical areas for organizing teams, tournaments, and organizations.

### Database Model

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

### Data Types

```typescript
interface Region {
  id: string;
  name: string;           // e.g., "North America", "Southeast Asia"
  code: string;           // e.g., "NA", "SEA"
  logo?: string;          // URL to logo image
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### Endpoints

#### GET /regions

List all regions with pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 20 | Results per page |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "North America",
      "code": "NA",
      "logo": "https://...",
      "createdAt": "2026-02-21T00:00:00Z",
      "updatedAt": "2026-02-21T00:00:00Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

**Status Codes:** 200 OK

---

#### GET /regions/:id

Fetch a single region with associated teams and organizations.

**Path Parameters:**
| Parameter | Type | Description |
|---|---|---|
| id | string | Region UUID |

**Response:**
```json
{
  "id": "uuid",
  "name": "North America",
  "code": "NA",
  "logo": "https://...",
  "teams": [ { ...team }, ... ],
  "organizations": [ { ...organization }, ... ],
  "createdAt": "2026-02-21T00:00:00Z",
  "updatedAt": "2026-02-21T00:00:00Z"
}
```

**Status Codes:**
- 200 OK
- 404 Not Found

---

#### POST /regions

Create a new region.

**Required Permission:** `region:create`

**Request Body:**
```json
{
  "name": "North America",
  "code": "NA",
  "logo": "https://..."
}
```

**DTO Definition:**
```typescript
export class CreateRegionDto {
  name: string;        // Required, unique
  code: string;        // Required, unique
  logo?: string;       // Optional URL
}
```

**Response:** (201 Created)
```json
{
  "id": "uuid",
  "name": "North America",
  "code": "NA",
  "logo": "https://...",
  "createdAt": "2026-02-21T00:00:00Z",
  "updatedAt": "2026-02-21T00:00:00Z"
}
```

**Status Codes:**
- 201 Created
- 400 Bad Request (duplicate name or code)
- 403 Forbidden (insufficient permissions)

---

#### PATCH /regions/:id

Update a region's information.

**Required Permission:** `region:update`

**Path Parameters:**
| Parameter | Type | Description |
|---|---|---|
| id | string | Region UUID |

**Request Body:**
```json
{
  "name": "North America",
  "code": "NA",
  "logo": "https://..."
}
```

**DTO Definition:**
```typescript
export class UpdateRegionDto {
  name?: string;       // Optional, must be unique if provided
  code?: string;       // Optional, must be unique if provided
  logo?: string;       // Optional URL
}
```

**Response:** (200 OK)
```json
{
  "id": "uuid",
  "name": "North America",
  "code": "NA",
  "logo": "https://...",
  "createdAt": "2026-02-21T00:00:00Z",
  "updatedAt": "2026-02-21T00:00:00Z"
}
```

**Status Codes:**
- 200 OK
- 400 Bad Request (duplicate name or code)
- 403 Forbidden (insufficient permissions)
- 404 Not Found

---

#### DELETE /regions/:id

Delete a region. Associated teams and organizations must be reassigned first.

**Required Permission:** `region:delete`

**Path Parameters:**
| Parameter | Type | Description |
|---|---|---|
| id | string | Region UUID |

**Response:** (200 OK)
```json
{
  "id": "uuid",
  "name": "North America",
  "code": "NA",
  "logo": "https://...",
  "createdAt": "2026-02-21T00:00:00Z",
  "updatedAt": "2026-02-21T00:00:00Z"
}
```

**Status Codes:**
- 200 OK
- 403 Forbidden (insufficient permissions)
- 404 Not Found
- 409 Conflict (teams/organizations still linked)

---

## Organizations API

Organizations represent entities like tournament organizers, sponsors, team owners, or talent agencies.

### Database Model

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
  CLUB      // Team/Club owner
  AGENCY    // Talent agency/representative
}
```

### Data Types

```typescript
interface Organization {
  id: string;
  name: string;                      // Unique
  shortName?: string;
  logo?: string;                     // URL
  website?: string;
  description?: string;
  mediaLinks: Array<{
    url: string;
    description?: string;
  }>;
  roles: OrganizationType[];         // ORGANIZER | SPONSOR | CLUB | AGENCY
  ownerId: string;                   // User UUID
  owner: User;
  managerId?: string;                // User UUID
  manager?: User;
  regionId?: string;                 // Region UUID
  region?: Region;
  teams: Team[];
  tournaments: Tournament[];
  sponsoredMatches: Match[];
  createdAt: DateTime;
  updatedAt: DateTime;
}

type OrganizationType = "ORGANIZER" | "SPONSOR" | "CLUB" | "AGENCY";
```

### Endpoints

#### GET /organizations

List organizations with optional filtering.

**Query Parameters:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 20 | Results per page |
| role | string | — | Filter by role (ORGANIZER, SPONSOR, CLUB, AGENCY) |
| regionId | string | — | Filter by region UUID |

**Examples:**
- `GET /organizations?role=SPONSOR` — List all sponsors
- `GET /organizations?regionId=uuid` — List organizations in a region
- `GET /organizations?role=CLUB&regionId=uuid&page=2` — Paginated filtered results

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "ESports Masters",
      "shortName": "EM",
      "logo": "https://...",
      "website": "https://example.com",
      "description": "...",
      "mediaLinks": [ { "url": "https://", "description": "..." } ],
      "roles": ["ORGANIZER"],
      "ownerId": "uuid",
      "owner": { "id": "uuid", "username": "user1", "avatar": "https://..." },
      "managerId": "uuid",
      "manager": { "id": "uuid", "username": "user2", "avatar": "https://..." },
      "regionId": "uuid",
      "region": { "id": "uuid", "name": "North America", "code": "NA" },
      "createdAt": "2026-02-21T00:00:00Z",
      "updatedAt": "2026-02-21T00:00:00Z"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

**Status Codes:** 200 OK

---

#### GET /organizations/:id

Fetch a single organization with all relations.

**Path Parameters:**
| Parameter | Type | Description |
|---|---|---|
| id | string | Organization UUID |

**Response:**
```json
{
  "id": "uuid",
  "name": "ESports Masters",
  "shortName": "EM",
  "logo": "https://...",
  "website": "https://example.com",
  "description": "...",
  "mediaLinks": [ { "url": "https://", "description": "..." } ],
  "roles": ["ORGANIZER"],
  "ownerId": "uuid",
  "owner": { "id": "uuid", "username": "user1", "avatar": "https://..." },
  "managerId": "uuid",
  "manager": { "id": "uuid", "username": "user2", "avatar": "https://..." },
  "regionId": "uuid",
  "region": { "id": "uuid", "name": "North America", "code": "NA" },
  "teams": [ { ...team }, ... ],
  "tournaments": [ { ...tournament }, ... ],
  "sponsoredMatches": [ { ...match }, ... ],
  "createdAt": "2026-02-21T00:00:00Z",
  "updatedAt": "2026-02-21T00:00:00Z"
}
```

**Status Codes:**
- 200 OK
- 404 Not Found

---

#### POST /organizations

Create a new organization. The authenticated user becomes the owner.

**Required Authentication:** JWT token

**Note:** The `ownerId` is automatically set from the authenticated user's ID. Any `ownerId` in the request body is ignored.

**Request Body:**
```json
{
  "name": "ESports Masters",
  "shortName": "EM",
  "logo": "https://...",
  "website": "https://example.com",
  "description": "A leading esports organization",
  "mediaLinks": [
    { "url": "https://twitter.com/...", "description": "Twitter" }
  ],
  "roles": ["ORGANIZER"],
  "managerId": "uuid",
  "regionId": "uuid"
}
```

**DTO Definition:**
```typescript
export class CreateOrganizationDto {
  name: string;                                              // Required, unique
  shortName?: string;
  logo?: string;                                             // URL
  website?: string;
  description?: string;
  mediaLinks?: Array<{ url: string; description?: string }>;
  roles: OrganizationType[];                                 // Required
  ownerId: string;                                           // Ignored — set from JWT
  managerId?: string;
  regionId?: string;
}
```

**Response:** (201 Created)
```json
{
  "id": "uuid",
  "name": "ESports Masters",
  "shortName": "EM",
  "logo": "https://...",
  "website": "https://example.com",
  "description": "A leading esports organization",
  "mediaLinks": [ { "url": "https://twitter.com/...", "description": "Twitter" } ],
  "roles": ["ORGANIZER"],
  "ownerId": "uuid",
  "owner": { "id": "uuid", "username": "auth_user", "avatar": "https://..." },
  "managerId": "uuid",
  "manager": { "id": "uuid", "username": "manager_user", "avatar": "https://..." },
  "regionId": "uuid",
  "region": { "id": "uuid", "name": "North America", "code": "NA" },
  "createdAt": "2026-02-21T00:00:00Z",
  "updatedAt": "2026-02-21T00:00:00Z"
}
```

**Status Codes:**
- 201 Created
- 400 Bad Request (duplicate name, invalid role, missing required fields)
- 401 Unauthorized (no JWT token)
- 404 Not Found (manager/region doesn't exist)

---

#### PATCH /organizations/:id

Update an organization's information.

**Required Permission:** `organization:update`

**Path Parameters:**
| Parameter | Type | Description |
|---|---|---|
| id | string | Organization UUID |

**Request Body:**
```json
{
  "name": "ESports Masters",
  "shortName": "EM",
  "logo": "https://...",
  "website": "https://example.com",
  "description": "Updated description",
  "mediaLinks": [ { "url": "https://...", "description": "..." } ],
  "roles": ["ORGANIZER", "SPONSOR"],
  "managerId": "uuid",
  "regionId": "uuid"
}
```

**DTO Definition:**
```typescript
export class UpdateOrganizationDto {
  name?: string;                                             // Optional, must be unique if provided
  shortName?: string;
  logo?: string;                                             // URL
  website?: string;
  description?: string;
  mediaLinks?: Array<{ url: string; description?: string }>;
  roles?: OrganizationType[];
  managerId?: string;                                        // Can be null to remove
  regionId?: string;                                         // Can be null to unlink
  // ownerId intentionally excluded — ownership transfer requires separate process
}
```

**Response:** (200 OK)
```json
{
  "id": "uuid",
  "name": "ESports Masters",
  "shortName": "EM",
  "logo": "https://...",
  "website": "https://example.com",
  "description": "Updated description",
  "mediaLinks": [ { "url": "https://...", "description": "..." } ],
  "roles": ["ORGANIZER", "SPONSOR"],
  "ownerId": "uuid",
  "owner": { "id": "uuid", "username": "user1", "avatar": "https://..." },
  "managerId": "uuid",
  "manager": { "id": "uuid", "username": "user2", "avatar": "https://..." },
  "regionId": "uuid",
  "region": { "id": "uuid", "name": "North America", "code": "NA" },
  "createdAt": "2026-02-21T00:00:00Z",
  "updatedAt": "2026-02-21T00:00:00Z"
}
```

**Status Codes:**
- 200 OK
- 400 Bad Request (duplicate name, invalid role)
- 403 Forbidden (insufficient permissions)
- 404 Not Found (organization, manager, or region doesn't exist)

---

#### DELETE /organizations/:id

Delete an organization. Associated teams and tournaments must be reassigned first.

**Required Permission:** `organization:delete`

**Path Parameters:**
| Parameter | Type | Description |
|---|---|---|
| id | string | Organization UUID |

**Response:** (200 OK)
```json
{
  "id": "uuid",
  "name": "ESports Masters",
  "shortName": "EM",
  "logo": "https://...",
  "website": "https://example.com",
  "description": "...",
  "mediaLinks": [ { "url": "https://...", "description": "..." } ],
  "roles": ["ORGANIZER"],
  "ownerId": "uuid",
  "owner": { "id": "uuid", "username": "user1", "avatar": "https://..." },
  "managerId": "uuid",
  "manager": { "id": "uuid", "username": "user2", "avatar": "https://..." },
  "regionId": "uuid",
  "region": { "id": "uuid", "name": "North America", "code": "NA" },
  "createdAt": "2026-02-21T00:00:00Z",
  "updatedAt": "2026-02-21T00:00:00Z"
}
```

**Status Codes:**
- 200 OK
- 403 Forbidden (insufficient permissions)
- 404 Not Found
- 409 Conflict (teams/tournaments still linked)

---

## Permission Codes

All permission codes follow the pattern `{module}:{action}`.

### Region Permissions

| Code | Description |
|---|---|
| `region:view` | View list and details of regions |
| `region:create` | Create new regions |
| `region:update` | Update existing regions |
| `region:delete` | Delete regions |
| `region:manage` | Full region management (wildcard) |

### Organization Permissions

| Code | Description |
|---|---|
| `organization:view` | View list and details of organizations |
| `organization:create` | Create new organizations |
| `organization:update` | Update existing organizations |
| `organization:delete` | Delete organizations |
| `organization:manage` | Full organization management (wildcard) |

---

## Architecture Notes

### Microservice Communication

Both Region and Organization endpoints are exposed through the **gateway** (`apps/gateway`), which forwards requests to the **esports microservice** (`apps/esports`) via NATS message patterns:

| Endpoint | NATS Pattern | Service |
|---|---|---|
| GET /regions | regions.findAll | esports |
| GET /regions/:id | regions.findById | esports |
| POST /regions | regions.create | esports |
| PATCH /regions/:id | regions.update | esports |
| DELETE /regions/:id | regions.delete | esports |
| GET /organizations | organizations.findAll | esports |
| GET /organizations/:id | organizations.findById | esports |
| POST /organizations | organizations.create | esports |
| PATCH /organizations/:id | organizations.update | esports |
| DELETE /organizations/:id | organizations.delete | esports |

### Request/Response Flow

```
HTTP Client → Gateway (validation, auth) → NATS → Esports Microservice → Prisma → PostgreSQL
```

### Pagination Implementation

Both services follow the standard `PaginatedResponse<T>` pattern:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;      // Total records in database
    page: number;       // Current page (1-indexed)
    limit: number;      // Records per page
    totalPages: number; // ceil(total / limit)
  };
}
```

### Authentication & Authorization

- **Region endpoints:** `GET` operations are public; `POST/PATCH/DELETE` require permission checks
- **Organization endpoints:**
  - `GET` operations are public
  - `POST` requires JWT authentication (authenticates ownership)
  - `PATCH/DELETE` require `organization:update`/`organization:delete` permissions
  - Owner is automatically set from authenticated user during creation

---

## Error Handling

### Standard Error Response

```json
{
  "statusCode": 400,
  "message": "Descriptive error message",
  "error": "ErrorType"
}
```

### Common Errors

| Status | Error | Cause |
|---|---|---|
| 400 | Bad Request | Missing required fields, invalid data type |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Unique constraint violation (duplicate name/code) or data integrity issue |

---

## Usage Examples

### Create a Region

```bash
curl -X POST http://localhost:3333/regions \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "South America",
    "code": "SA",
    "logo": "https://example.com/sa-logo.png"
  }'
```

### List Sponsors in North America

```bash
curl -X GET "http://localhost:3333/organizations?role=SPONSOR&regionId=na-uuid"
```

### Create an Organization

```bash
curl -X POST http://localhost:3333/organizations \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Esports Inc",
    "shortName": "TEI",
    "roles": ["ORGANIZER", "SPONSOR"],
    "website": "https://techesp.com",
    "regionId": "na-uuid"
  }'
```

### Update Organization

```bash
curl -X PATCH http://localhost:3333/organizations/org-uuid \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated company description",
    "managerId": "new-manager-uuid"
  }'
```

---

## Related Documentation

- [Database Schema](./database-schema.md)
- [Permissions System](./permissions.md)
- [Authentication & JWT](./auth.md)
