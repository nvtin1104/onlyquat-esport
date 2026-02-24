# Dashboard UI Codebase Scout Report
**Date:** 2026-02-24
**Focus:** Pages, components, stores, routing, cross-entity relationships

## 1. ROUTING ARCHITECTURE

File: C:/project/onlyquat-esport/dashboard/src/App.tsx

React Router DOM structure:
- Public: /login
- Protected: / with nested routes
  - /players (list, create, detail)
  - /teams (list, create, detail)
  - /games (list, create, detail)
  - /organizations (list, create, detail)
  - /regions, /matches, /ratings, /points, /users, /uploads, /settings

## 2. PAGE FILES STRUCTURE

Location: C:/project/onlyquat-esport/dashboard/src/pages/

Core entity pages:
- teams/: list.tsx, create.tsx, detail.tsx, components/TeamsTable.tsx, TeamRosterSheet.tsx
- players/: list.tsx, form.tsx, detail.tsx, components/PlayersTable.tsx
- games/: list.tsx, create.tsx, detail.tsx, components/GamesTable.tsx
- organizations/: list.tsx, create.tsx, detail.tsx, components/OrganizationsTable.tsx
- regions/: list.tsx, create.tsx, detail.tsx, components/RegionsTable.tsx

Other pages:
- matches/list.tsx, components with dialogs
- ratings/list.tsx, RejectDialog
- points/list.tsx, GiftPointsDialog
- users/: list.tsx, create.tsx, detail.tsx, permissions.tsx, permission-detail.tsx
- uploads/list.tsx
- settings/index.tsx
