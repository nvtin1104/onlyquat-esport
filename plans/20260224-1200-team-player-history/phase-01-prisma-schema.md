# Phase 01 — Prisma Schema + Migration
Date: 2026-02-24 | Priority: High | Status: Pending

## Context
Schema: `serve/libs/common/prisma/schema.prisma`
Migration cmd: `cd serve && pnpm run prisma:migrate`

## New Enums

```prisma
enum TeamHistoryEventType {
  NAME_CHANGE    // team renamed
  LOGO_CHANGE    // logo changed
  ACHIEVEMENT    // manual achievement record
  PLAYER_JOIN    // player joined team
  PLAYER_LEAVE   // player left team
  ORG_CHANGE     // organization changed
}

enum PlayerHistoryEventType {
  DISPLAY_NAME_CHANGE  // displayName renamed
  TEAM_JOIN            // joined a team
  TEAM_LEAVE           // left a team
  TEAM_TRANSFER        // moved from one team to another
  ACHIEVEMENT          // manual achievement
  TIER_CHANGE          // tier changed
}
```

## New Models

```prisma
model TeamHistory {
  id         String               @id @default(uuid())
  eventType  TeamHistoryEventType
  metadata   Json                 @default("{}")
  note       String?
  happenedAt DateTime             @default(now())
  createdAt  DateTime             @default(now())

  teamId   String
  team     Team    @relation(fields: [teamId], references: [id], onDelete: Cascade)
  playerId String?
  player   Player? @relation("TeamHistoryPlayer", fields: [playerId], references: [id], onDelete: SetNull)

  @@index([teamId, happenedAt(sort: Desc)])
  @@map("team_histories")
}

model PlayerHistory {
  id         String                @id @default(uuid())
  eventType  PlayerHistoryEventType
  metadata   Json                  @default("{}")
  note       String?
  happenedAt DateTime              @default(now())
  createdAt  DateTime              @default(now())

  playerId String
  player   Player  @relation(fields: [playerId], references: [id], onDelete: Cascade)
  teamId   String?
  team     Team?   @relation("PlayerHistoryTeam", fields: [teamId], references: [id], onDelete: SetNull)

  @@index([playerId, happenedAt(sort: Desc)])
  @@map("player_histories")
}
```

## Relations to add to Team model
```prisma
  teamHistories   TeamHistory[]
  playerHistories PlayerHistory[] @relation("PlayerHistoryTeam")
```

## Relations to add to Player model
```prisma
  teamHistories   TeamHistory[]   @relation("TeamHistoryPlayer")
  playerHistories PlayerHistory[]
```

## metadata JSON shapes per eventType

| Event | JSON keys |
|-------|-----------|
| NAME_CHANGE | `{ oldName, newName }` |
| LOGO_CHANGE | `{ oldLogo, newLogo }` |
| ACHIEVEMENT | `{ title, description?, placement?, prize?, tournamentName? }` |
| PLAYER_JOIN | `{ playerName, playerSlug, role }` |
| PLAYER_LEAVE | `{ playerName, playerSlug, role }` |
| ORG_CHANGE | `{ oldOrgName?, newOrgName? }` |
| DISPLAY_NAME_CHANGE | `{ oldName, newName }` |
| TEAM_JOIN | `{ teamName, teamSlug, role }` |
| TEAM_LEAVE | `{ teamName, teamSlug }` |
| TEAM_TRANSFER | `{ fromTeamName?, fromTeamSlug?, toTeamName?, toTeamSlug?, role }` |
| ACHIEVEMENT | `{ title, description?, placement?, prize?, tournamentName? }` |
| TIER_CHANGE | `{ oldTier, newTier }` |

## Steps
- [ ] Add enums to schema.prisma
- [ ] Add models to schema.prisma
- [ ] Add relations to Team and Player models
- [ ] Run `pnpm run prisma:migrate` with name `add_team_player_history`
- [ ] Run `pnpm run prisma:generate`
