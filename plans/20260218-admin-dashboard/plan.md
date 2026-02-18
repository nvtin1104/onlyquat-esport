# Arcade Arena Admin Dashboard - Implementation Plan

## Overview
Build complete admin dashboard for e-sports platform within existing Next.js 16 app.
All admin routes under `/admin/*`. Custom UI components (no shadcn/ui - extend existing pattern).

## Phases

| # | Phase | Status | Details |
|---|-------|--------|---------|
| 1 | Foundation | pending | phase-01-foundation.md |
| 2 | Overview Dashboard | pending | phase-02-overview.md |
| 3 | Players Management | pending | phase-03-players.md |
| 4 | Teams + Matches | pending | phase-04-teams-matches.md |
| 5 | Ratings + Points + Users | pending | phase-05-moderation-points-users.md |

## Key Decisions
1. No shadcn/ui - build admin UI components following existing custom pattern
2. All mock data centralized in `client/src/data/mock-data.ts`
3. Admin types in `client/src/types/admin.ts`
4. Vietnamese text throughout
5. Reuse existing: Badge, StatBar, RatingNumber, cn(), TIER_COLORS
