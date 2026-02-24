# Player Model Scout Report
Date: 2026-02-23
Scope: Complete Player model implementation across backend, gateway, and dashboard

---

## 1. PRISMA SCHEMA (Source of Truth)

File: /c/project/onlyquat-esport/serve/libs/common/prisma/schema.prisma

Player Model (lines 246-284):
- Required: id, slug, displayName, gameId
- Optional: realName, nationality, imageUrl, bannerUrl, role
- Rating fields: rating, aim, gameIq, clutch, teamplay, consistency, totalRatings, tier, rank
- Status: isActive, createdAt, updatedAt
- Relations: User (optional), Game (required), Team (optional), TeamMember[], Rating[], MatchEvent[]
- Indexes on: rating (desc), tier, gameId, teamId

---

## 2. BACKEND SERVICES - ESPORTS MICROSERVICE

Status: NOT YET IMPLEMENTED

Directory: /c/project/onlyquat-esport/serve/apps/esports/src/

Missing items:
- serve/apps/esports/src/player/ directory
- player.service.ts with CRUD + pagination
- player.controller.ts with MessagePattern handlers
- create-player.dto.ts
- update-player.dto.ts
- Export from dtos/index.ts
- Register PlayerService and PlayerController in app.module.ts

Reference: TeamService pattern at serve/apps/esports/src/team/team.service.ts

---

## 3. GATEWAY HTTP API

File: /c/project/onlyquat-esport/serve/apps/gateway/src/app.controller.ts

Routes Already Defined (lines 78-112):
- GET /players: players.findAll
- POST /players: players.create (requires PLAYER_CREATE)
- PATCH /players/:slug: players.update (requires PLAYER_UPDATE)
- POST /ratings/:playerSlug: ratings.create (requires RATING_CREATE)

Note: Uses slug as identifier (matches Prisma unique constraint)

TODO:
- Create serve/apps/gateway/src/players/ directory
- Migrate routes from AppController to dedicated PlayersController
- Update app.module.ts to register PlayersController

---

## 4. DASHBOARD - React + Vite

Pages and Components (COMPLETE):

List Page: /c/project/onlyquat-esport/dashboard/src/pages/players/list.tsx
- Filters: search, game, role, tier, status
- Bulk selection and actions
- Delete operations

Form Page: /c/project/onlyquat-esport/dashboard/src/pages/players/form.tsx
- Routes: /players/new (create), /players/:id/edit (update)

PlayerForm Component: Full Zod validation
- Basic info section: displayName, realName, slug, nationality, bio
- Competitive info: game, role, team
- Images: avatar (200x200) and banner
- Status: isActive toggle + read-only stats

PlayersTable Component: TanStack React Table
- 11 columns: select, rank, player, game, role, team, rating, tier, totalRatings, status, actions
- Sortable: rating and totalRatings
- Pagination: 20 rows per page
- Default sort: rating descending

PlayersToolbar Component:
- Search input
- Filters: game (resets role on change), role, tier, status tabs

BulkActionsBar Component:
- Fixed bottom bar with bulk operations
- Delete, toggle status, clear selection

Types (COMPLETE):
File: dashboard/src/types/admin.ts (lines 3-21)
AdminPlayer interface with all player fields and TierKey type

Mock Data (COMPLETE):
File: dashboard/src/data/mock-data.ts (lines 4-13)
- 8 sample players with realistic stats
- Game role mappings for: LoL, Valorant, Dota2, CS2

Dashboard TODO:
- Create dashboard/src/stores/playersStore.ts (Zustand store)
- Create dashboard/src/lib/players.api.ts (API client)
- Update components to use real API instead of mock data
- Add error handling and loading states

---

## 5. KEY FILE LOCATIONS

Prisma Model: /c/project/onlyquat-esport/serve/libs/common/prisma/schema.prisma (lines 246-284)

Admin Type: /c/project/onlyquat-esport/dashboard/src/types/admin.ts (lines 3-21)

Mock Data: /c/project/onlyquat-esport/dashboard/src/data/mock-data.ts (lines 4-13)

List Page: /c/project/onlyquat-esport/dashboard/src/pages/players/list.tsx

Form Component: /c/project/onlyquat-esport/dashboard/src/pages/players/components/PlayerForm.tsx

Table Component: /c/project/onlyquat-esport/dashboard/src/pages/players/components/PlayersTable.tsx

Toolbar: /c/project/onlyquat-esport/dashboard/src/pages/players/components/PlayersToolbar.tsx

Bulk Actions: /c/project/onlyquat-esport/dashboard/src/pages/players/components/BulkActionsBar.tsx

Gateway Routes: /c/project/onlyquat-esport/serve/apps/gateway/src/app.controller.ts (lines 78-112)

Team Service Pattern: /c/project/onlyquat-esport/serve/apps/esports/src/team/team.service.ts

---

## 6. KEY FINDINGS

1. Prisma model complete with all relationships
2. Dashboard UI 100% complete (pages, components, types, mock data)
3. Gateway routes already defined in AppController
4. Backend microservice NOT implemented (service, controller, DTOs missing)
5. Update endpoint uses slug as identifier (not id)
6. Dashboard store and API client missing

---

## 7. IMPLEMENTATION ORDER RECOMMENDED

1. Backend service and controller with DTOs (esports microservice)
2. Gateway controller migration (routes from AppController to PlayersController)
3. Dashboard Zustand store (playersStore.ts)
4. Dashboard API client (players.api.ts)
5. Hook up real API in components
6. Remove mock data usage

---

## UNRESOLVED QUESTIONS

1. Nationality field: Required in form validation but optional in Prisma schema. Decision needed.
2. Tier field: Should this be auto-calculated from rating or user-editable?
3. Rating attributes (aim, gameIq, etc.): Expected range is 0-100 based on SmallInt type?
4. Database performance: Consider adding indexes on userId and isActive fields for faster queries.
5. Slug generation: Currently manual in form, should be auto-generated on create (like teams)?

