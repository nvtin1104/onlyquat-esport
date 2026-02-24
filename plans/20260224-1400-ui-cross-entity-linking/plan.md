# UI Cross-Entity Linking + Modern UI Update

**Date:** 2026-02-24
**Scope:** `dashboard/src/` (React+Vite admin dashboard)
**Effort:** ~4-6 hours across 4 phases

---

## Problem

Cross-entity fields on detail pages are display-only text. Users cannot click through from a team to its organization, a player to their game/team, etc. Additionally, `TeamRosterSheet` uses **mock data** instead of real API calls, and the organization detail page has no "affiliated teams" section.

## Solution

4 incremental phases, each independently shippable:

| Phase | File | Summary | Status |
|-------|------|---------|--------|
| 01 | [phase-01-roster-real-api.md](./phase-01-roster-real-api.md) | Replace mock data in TeamRosterSheet with real `getPlayers({ teamId })` API | ✅ Done |
| 02 | [phase-02-navigation-links.md](./phase-02-navigation-links.md) | Make cross-entity fields clickable links on detail pages | ✅ Done |
| 03 | [phase-03-org-teams-section.md](./phase-03-org-teams-section.md) | Add "Affiliated Teams" section to organization detail | ✅ Done |
| 04 | [phase-04-ui-polish.md](./phase-04-ui-polish.md) | Hover effects, subtle indicators for clickable fields | ✅ Done |

## Key Routes (confirmed from `App.tsx`)

- `/teams/:id` -- TeamDetailPage
- `/players/:id` -- PlayerDetailPage (param is slug)
- `/games/:id` -- GameDetailPage
- `/organizations/:id` -- OrganizationDetailPage

## Existing API Support

- `getPlayers({ teamId })` -- already supports `teamId` filter
- `getTeams({ organizationId })` -- already supports `organizationId` filter
- Both return `PaginatedResponse<T>` with `data` + `meta`

## Types Available (from `admin.ts`)

- `AdminPlayer.team` has `{ id, name, slug, logo }` -- enough for linking
- `AdminPlayer.game` has `{ id, name, shortName, logo }` -- enough for linking
- `AdminTeam.organization` has `{ id, name, logo }` -- enough for linking

## Design Principles

- No new shared components needed; reuse `GameBadge`, `Badge`, `Avatar`
- Create one small reusable `EntityLink` inline component (or just use `<Link>` with consistent styling)
- Links only appear in **view mode**, never in edit mode
- Keep changes minimal per CLAUDE.md rules

## Risks

- Player route uses `:id` param but `fetchPlayerBySlug` expects slug. The `AdminPlayer.team` type includes `slug` field -- no issue.
- TeamRosterSheet remove-player button currently does `console.log`. Out of scope -- leave as-is.
