# Filter/Search/Sort Patterns — Scout Report 260223

## Executive Summary

Codebase implements INCONSISTENT filtering/search/sorting:
- Players: gameId, teamId, isPro, isActive filters (backend) + client-side search, tier, status
- Teams: organizationId, regionId (backend only)
- Games: PAGINATION ONLY (no filters)
- Organizations: role, regionId
- Regions: PAGINATION ONLY (no filters)
- Users: search (backend), role, status

GAPS:
- Games lacks backend filtering
- Regions lacks backend filtering
- No standardized sort params (sortBy/sortOrder)
- Client-side filtering in players list (not scalable)
- Teams/Games missing toolbar UI

---

## Query Params by Module

### Players
GET /players?page=1&limit=20&gameId=xxx&teamId=yyy&isPro=true&isActive=true
- Backend filters: gameId, teamId, isPro, isActive
- Default sort: rating DESC, displayName ASC
- Client filters: search, tier, status (IN-MEMORY only on current page)

### Teams
GET /teams?page=1&limit=20&organizationId=xxx&regionId=yyy
- Backend filters: organizationId, regionId
- Default sort: name ASC
- NO UI toolbar (store supports filters but not used)

### Games
GET /games?page=1&limit=20
- ISSUE: NO FILTERING (despite having organizationId relation)
- Default sort: name ASC

### Organizations
GET /organizations?page=1&limit=20&role=GAME_PUBLISHER&regionId=xxx
- Backend filters: role (array contains), regionId
- Default sort: name ASC

### Regions
GET /regions?page=1&limit=20
- ISSUE: NO FILTERING
- Default sort: name ASC

### Users
GET /users?page=1&limit=20&search=text&role=admin&status=active
- Backend filters: role, status
- Backend search: search (400ms debounce)

---

## Frontend Stores (Zustand)

### usePlayersStore
```
gameFilter, teamFilter in state
setGameFilter, setTeamFilter actions → immediate API call
```

### useTeamsStore
```
organizationFilter, regionFilter in state
setOrganizationFilter, setRegionFilter actions → immediate API call
```

### useGamesStore
```
NO FILTER STATE (only pagination)
```

### useOrganizationsStore
```
roleFilter, regionFilter in state
setRoleFilter, setRegionFilter actions → immediate API call
```

### useUsersStore
```
search (DEBOUNCED 400ms), roleFilter, statusFilter
setSearch debounced, others immediate
```

---

## Pagination Format (All Modules)

Response:
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}

---

## Files Scanned

Backend Controllers:
- serve/apps/gateway/src/players/players.controller.ts
- serve/apps/gateway/src/teams/teams.controller.ts
- serve/apps/gateway/src/games/games.controller.ts
- serve/apps/gateway/src/organizations/organizations.controller.ts
- serve/apps/gateway/src/regions/regions.controller.ts

Backend Services:
- serve/apps/esports/src/player/player.service.ts
- serve/apps/esports/src/team/team.service.ts
- serve/apps/esports/src/game/game.service.ts
- serve/apps/esports/src/organization/organization.service.ts
- serve/apps/esports/src/region/region.service.ts

Dashboard API:
- dashboard/src/lib/players.api.ts
- dashboard/src/lib/teams.api.ts
- dashboard/src/lib/games.api.ts
- dashboard/src/lib/organizations.api.ts
- dashboard/src/lib/regions.api.ts
- dashboard/src/lib/users.api.ts

Dashboard Stores:
- dashboard/src/stores/playersStore.ts
- dashboard/src/stores/teamsStore.ts
- dashboard/src/stores/gamesStore.ts
- dashboard/src/stores/organizationsStore.ts
- dashboard/src/stores/usersStore.ts

Dashboard Pages:
- dashboard/src/pages/players/list.tsx
- dashboard/src/pages/players/components/PlayersToolbar.tsx
- dashboard/src/pages/teams/list.tsx
- dashboard/src/pages/games/list.tsx

DTOs:
- serve/apps/esports/src/dtos/create-player.dto.ts
- serve/apps/esports/src/dtos/update-player.dto.ts
- serve/apps/esports/src/dtos/create-team.dto.ts
- serve/apps/esports/src/dtos/update-team.dto.ts
- serve/apps/esports/src/dtos/create-game.dto.ts
- serve/apps/esports/src/dtos/update-game.dto.ts

