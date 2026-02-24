# Scout Report: Game & Team Models — Backend & Frontend

**Date:** 2026-02-23  
**Status:** Complete

## Summary

Comprehensive file inventory for Game and Team models across backend (NestJS microservices) and frontend (React dashboard).

## Database Schema

**File:** `/c/project/onlyquat-esport/serve/libs/common/prisma/schema.prisma`

- Game: Simple model with id, name, shortName, iconUrl, roles array
- Team: Complex model with slug, name, tag, logoUrl, regionTag, wins/losses/draws
- TeamMember: Junction table for Team-Player many-to-many
- Team relations: Organization, Region, Player (via TeamMember), Tournament (via TournamentTeam), Match (3 relations)

## Backend Services

### Esports Microservice (`serve/apps/esports/`)

**Services:**
- `/c/project/onlyquat-esport/serve/apps/esports/src/esports.service.ts` - Tournament CRUD
- `/c/project/onlyquat-esport/serve/apps/esports/src/organization/organization.service.ts` - Org CRUD with pagination
- `/c/project/onlyquat-esport/serve/apps/esports/src/region/region.service.ts` - Region CRUD with pagination

**Controllers:**
- `/c/project/onlyquat-esport/serve/apps/esports/src/esports.controller.ts` - Tournament handlers
- `/c/project/onlyquat-esport/serve/apps/esports/src/organization/organization.controller.ts` - Org handlers
- `/c/project/onlyquat-esport/serve/apps/esports/src/region/region.controller.ts` - Region handlers

**DTOs:**
- `/c/project/onlyquat-esport/serve/apps/esports/src/dtos/create-tournament.dto.ts`
- `/c/project/onlyquat-esport/serve/apps/esports/src/dtos/create-organization.dto.ts`
- `/c/project/onlyquat-esport/serve/apps/esports/src/dtos/update-organization.dto.ts`
- `/c/project/onlyquat-esport/serve/apps/esports/src/dtos/create-region.dto.ts`
- `/c/project/onlyquat-esport/serve/apps/esports/src/dtos/update-region.dto.ts`
- `/c/project/onlyquat-esport/serve/apps/esports/src/dtos/index.ts`

**Module:**
- `/c/project/onlyquat-esport/serve/apps/esports/src/app.module.ts`

### API Gateway (`serve/apps/gateway/`)

**Controllers:**
- `/c/project/onlyquat-esport/serve/apps/gateway/src/app.controller.ts` - Tournament/Match/Player/Team/Rating endpoints
- `/c/project/onlyquat-esport/serve/apps/gateway/src/regions/regions.controller.ts` - Region CRUD HTTP endpoints
- `/c/project/onlyquat-esport/serve/apps/gateway/src/organizations/organizations.controller.ts` - Org CRUD HTTP endpoints

**Module:**
- `/c/project/onlyquat-esport/serve/apps/gateway/src/app.module.ts`

### Common Library

- `/c/project/onlyquat-esport/serve/libs/common/src/index.ts` - Exports Prisma types & enums
- `/c/project/onlyquat-esport/serve/libs/common/src/constants/permissions.ts` - Team/Game/Org/Region permission codes
- `/c/project/onlyquat-esport/serve/libs/common/src/types/pagination.ts` - PaginatedResponse type

## Frontend — Dashboard

### Pages

**Teams Management:**
- `/c/project/onlyquat-esport/dashboard/src/pages/teams/list.tsx` - Main teams page with search/filter
- `/c/project/onlyquat-esport/dashboard/src/pages/teams/components/TeamsTable.tsx` - Table display component
- `/c/project/onlyquat-esport/dashboard/src/pages/teams/components/TeamRosterSheet.tsx` - Roster panel

### Types

- `/c/project/onlyquat-esport/dashboard/src/types/admin.ts` - AdminTeam, AdminPlayer, AdminMatch, AdminRating interfaces

## Key Gaps

**Backend:**
1. No Game service/controller - Game CRUD not exposed
2. No Team service/controller - Only GET /teams in gateway
3. No team endpoints: POST/PATCH/DELETE

**Frontend:**
1. No games.api.ts - Missing game API client
2. No teams.api.ts - Missing team API client
3. Teams page uses mock data, not real API
4. No team create/edit page

**Permissions:**
- TEAM_VIEW, TEAM_CREATE, TEAM_UPDATE, TEAM_DELETE, TEAM_MANAGE defined in permissions.ts but not yet implemented on endpoints
