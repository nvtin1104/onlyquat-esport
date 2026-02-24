# Phase 02 — Backend: Esports Microservice
Date: 2026-02-24 | Priority: High | Status: Pending

## Context
- Esports microservice: `serve/apps/esports/src/`
- AppModule: `serve/apps/esports/src/app.module.ts`

## New Files

### `serve/apps/esports/src/dtos/create-team-history.dto.ts`
```ts
export class CreateTeamHistoryDto {
  teamId: string;
  eventType: TeamHistoryEventType;
  metadata?: Record<string, any>;
  note?: string;
  happenedAt?: string; // ISO date, optional override
  playerId?: string;
}
```

### `serve/apps/esports/src/dtos/create-player-history.dto.ts`
```ts
export class CreatePlayerHistoryDto {
  playerId: string;
  eventType: PlayerHistoryEventType;
  metadata?: Record<string, any>;
  note?: string;
  happenedAt?: string; // ISO date, optional
  teamId?: string;
}
```

### `serve/apps/esports/src/team/team-history.service.ts`
Methods:
- `findByTeamId(teamId, page, limit)` → PaginatedResponse<TeamHistory>
- `create(dto: CreateTeamHistoryDto)` → TeamHistory
- `delete(id)` → TeamHistory

### `serve/apps/esports/src/player/player-history.service.ts`
Methods:
- `findByPlayerId(playerId, page, limit)` → PaginatedResponse<PlayerHistory>
- `findBySlug(slug, page, limit)` → PaginatedResponse<PlayerHistory>
- `create(dto: CreatePlayerHistoryDto)` → PlayerHistory
- `delete(id)` → PlayerHistory

### `serve/apps/esports/src/team/team-history.controller.ts`
NATS patterns:
- `teams.history.findByTeamId`
- `teams.history.create`
- `teams.history.delete`

### `serve/apps/esports/src/player/player-history.controller.ts`
NATS patterns:
- `players.history.findByPlayerId`
- `players.history.findBySlug`
- `players.history.create`
- `players.history.delete`

## Modified Files

### `serve/apps/esports/src/team/team.service.ts`
Inject `PrismaService` (already done). In `update()`:
- Compare old name vs new name → if changed, create `TeamHistory { NAME_CHANGE }`
- Compare old logo vs new logo → if changed, create `TeamHistory { LOGO_CHANGE }`
- Wrap in `$transaction` with the update

### `serve/apps/esports/src/player/player.service.ts`
In `update()`:
- Compare old displayName vs new → create `PlayerHistory { DISPLAY_NAME_CHANGE }`
- Compare old teamId vs new teamId:
  - If teamId changed:
    1. Close old `TeamMember` record (set leftAt = now) if exists
    2. Create new `TeamMember` record if new teamId set
    3. Create `PlayerHistory { TEAM_TRANSFER/TEAM_JOIN/TEAM_LEAVE }`
    4. Create `TeamHistory { PLAYER_LEAVE }` on old team (if had old team)
    5. Create `TeamHistory { PLAYER_JOIN }` on new team (if has new team)
  - All in a `$transaction`

### `serve/apps/esports/src/dtos/index.ts`
Export new DTOs.

### `serve/apps/esports/src/app.module.ts`
Register: `TeamHistoryController`, `TeamHistoryService`, `PlayerHistoryController`, `PlayerHistoryService`

## Steps
- [ ] Create `create-team-history.dto.ts`
- [ ] Create `create-player-history.dto.ts`
- [ ] Export from `dtos/index.ts`
- [ ] Create `team/team-history.service.ts`
- [ ] Create `player/player-history.service.ts`
- [ ] Create `team/team-history.controller.ts`
- [ ] Create `player/player-history.controller.ts`
- [ ] Modify `team/team.service.ts` (auto-history on update)
- [ ] Modify `player/player.service.ts` (auto-history + TeamMember on team change)
- [ ] Update `app.module.ts`
