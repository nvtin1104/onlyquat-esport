# Phase 03 — Backend: Gateway Endpoints
Date: 2026-02-24 | Priority: High | Status: Pending

## Context
- Gateway: `serve/apps/gateway/src/`
- Teams controller: `serve/apps/gateway/src/teams/teams.controller.ts`
- Players controller: `serve/apps/gateway/src/players/players.controller.ts`

## New Endpoints

### Teams History
```
GET    /teams/:id/history              public (no auth)
POST   /teams/:id/history              requires TEAM_UPDATE
DELETE /teams/:id/history/:historyId   requires TEAM_UPDATE
```

### Players History
```
GET    /players/:slug/history               public
POST   /players/:slug/history               requires PLAYER_UPDATE
DELETE /players/:slug/history/:historyId    requires PLAYER_UPDATE
```

## Modified Files

### `serve/apps/gateway/src/teams/teams.controller.ts`
Add 3 new methods (history CRUD):
```ts
@Get(':id/history')
async getHistory(@Param('id') id, @Query() query) { ... }

@Post(':id/history')
@Auth(PERMISSIONS.TEAM_UPDATE)
async addHistory(@Param('id') id, @Body() dto) { ... }

@Delete(':id/history/:historyId')
@Auth(PERMISSIONS.TEAM_UPDATE)
async deleteHistory(@Param('id') id, @Param('historyId') historyId) { ... }
```

### `serve/apps/gateway/src/players/players.controller.ts`
Add 3 new methods:
```ts
@Get(':slug/history')
async getHistory(@Param('slug') slug, @Query() query) { ... }

@Post(':slug/history')
@Auth(PERMISSIONS.PLAYER_UPDATE)
async addHistory(@Param('slug') slug, @Body() dto) { ... }

@Delete(':slug/history/:historyId')
@Auth(PERMISSIONS.PLAYER_UPDATE)
async deleteHistory(@Param('slug') slug, @Param('historyId') historyId) { ... }
```

## NATS messages sent
- `teams.history.findByTeamId` → `{ teamId, page, limit }`
- `teams.history.create` → `{ teamId, eventType, metadata, note, happenedAt, playerId }`
- `teams.history.delete` → `{ id }`
- `players.history.findBySlug` → `{ slug, page, limit }`
- `players.history.create` → `{ slug, eventType, metadata, note, happenedAt, teamId }`
- `players.history.delete` → `{ id }`

## Steps
- [ ] Add history endpoints to `teams/teams.controller.ts`
- [ ] Add history endpoints to `players/players.controller.ts`
