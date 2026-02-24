# Dashboard UI Codebase Scout Report
**Date:** 2026-02-24
**Focus:** Pages, components, stores, routing, cross-entity relationships

## 1. ROUTING & ARCHITECTURE

File: C:/project/onlyquat-esport/dashboard/src/App.tsx

React Router structure:
- Public: /login
- Protected: / with nested routes (players, teams, games, organizations, regions, etc.)
- Protected wrapper: AuthInitializer > ProtectedRoute > DashboardLayout

## 2. PAGE FILES & COMPONENTS

Location: C:/project/onlyquat-esport/dashboard/src/pages/

Entity pages structure (teams, players, games, organizations, regions):
- list.tsx - paginated table with filters, search, sort
- create.tsx - form to create new entity
- detail.tsx - view/edit entity with related data
- components/ - Table, Toolbar components

Core components:
- TeamsTable.tsx, TeamsToolbar.tsx, TeamRosterSheet.tsx (uses MOCK DATA)
- PlayersTable.tsx, PlayersToolbar.tsx, PlayerForm.tsx, BulkActionsBar.tsx
- GamesTable.tsx, GamesToolbar.tsx
- OrganizationsTable.tsx

## 3. SHARED UI COMPONENT LIBRARY

Location: components/ui/ and components/shared/

Base UI: Button, Input, Textarea, Badge, Avatar, Select, Dialog, Sheet, Table, Pagination, etc.

Feature Components:
- TierBadge, RatingNumber, GameBadge, StatusBadge (entity displays)
- PageHeader, SearchInput, EmptyState
- RichTextEditor, ImageUpload, AvatarPicker, UserPicker
- ConfirmDialog, AddHistoryModal, HistoryTimeline
- Layout: DashboardLayout, Sidebar, UserMenu, ProtectedRoute

## 4. ZUSTAND STORES

Location: stores/

Per-entity stores: playersStore, teamsStore, gamesStore, organizationsStore, regionsStore, usersStore, uploadsStore

Common pattern: items[], selectedItem, total, page, limit, search, filters, sortBy, sortOrder, isLoading, isSubmitting, error
Common actions: fetchAll, fetchById, create, update, remove, setPage, setSearch, clearError

## 5. API LIBRARY

Location: lib/

Entity APIs (teams.api.ts, players.api.ts, games.api.ts, organizations.api.ts):
- getEntity(params) with pagination, search, filters, sort
- getEntityById(id)
- createEntity(dto), updateEntity(id, dto), deleteEntity(id)

History endpoints (teams, players):
- getTeamHistory(teamId, page, limit)
- addTeamHistory(teamId, dto)
- deleteTeamHistory(teamId, historyId)
- Similar for players

Other: api.ts (axios), tokenManager.ts, permissions.api.ts, users.api.ts, uploads.api.ts, utils.ts, schemas/

## 6. TYPE DEFINITIONS

File: types/admin.ts

AdminPlayer:
- Core: id, slug, displayName, realName, nationality, imageUrl, stats
- Stats: mechanics, tactics, composure, teamwork, consistency, rating, totalRatings, tier, rank
- Flags: isPro, isActive
- RELATIONSHIPS:
  * gameId (required) -> game?: {id, name, shortName, logo}
  * teamId? -> team?: {id, name, slug, logo}

AdminTeam:
- Core: id, name, tag, slug, logo, website, description
- RELATIONSHIPS:
  * organizationId? -> organization?: {id, name, logo}
  * regionId? -> region?: {id, name, code, logo}

AdminGame:
- Core: id, name, shortName, logo, website, roles[], mediaLinks
- RELATIONSHIP:
  * organizationId? -> organization?: {id, name, logo} (optional, read-only)

AdminOrganization:
- Core: id, name, shortName, logo, website, description, descriptionI18n (en, vi), roles, mediaLinks
- Roles: (ORGANIZER | SPONSOR | CLUB | AGENCY)[]
- RELATIONSHIPS:
  * ownerId (required) -> owner?: {id, username, avatar}
  * managerId? -> manager?: {id, username, avatar}
  * regionId? -> region?: AdminRegion

AdminRegion: id, name, code, logo?

## 7. CROSS-ENTITY DISPLAY PATTERNS

Teams Detail (pages/teams/detail.tsx):
- Organization: team.organization?.name ?? "—" (text, not clickable)
  * Edit: <select> dropdown of organizations
  * Fetch: getOrganizations({limit: 100})
- Region: team.region?.name (${code}) (text, not clickable)
  * Edit: <select> dropdown
  * Fetch: getRegions({limit: 100})
- History: <HistoryTimeline> from /teams/:id/history

Players Detail (pages/players/detail.tsx):
- Game: <GameBadge> (badge, not clickable)
  * Required field
  * Edit: <select> dropdown
  * Fetch: useGamesStore().fetchGames({limit: 100})
- Team: styled span (tag, not clickable)
  * Optional field
  * Edit: <select> dropdown with "TAG - NAME" format
  * Fetch: useTeamsStore().fetchTeams({limit: 100})
- History: <HistoryTimeline> from /players/:slug/history

Organizations Detail (pages/organizations/detail.tsx):
- Region: org.region?.name (text, not clickable)
  * Edit: <select> dropdown
- Owner (User): org.owner?.username (text, not clickable)
  * Required field
  * Edit: <UserPicker> async search
- Manager (User): org.manager?.username (text, not clickable)
  * Optional field
  * Edit: <UserPicker>

Games Detail (pages/games/detail.tsx):
- Organization: game.organization?.name ?? "—" (text, read-only)
  * NO edit capability implemented
  * NOT clickable

## 8. LIST TABLES: CROSS-ENTITY COLUMNS

Teams List (TeamsTable.tsx):
- Org column: team.organization?.name ?? "—" (not clickable)
- Region column: <Badge variant="info">{team.region.name}</Badge> (not clickable)
- Row click: navigate to /teams/:id

Players List (PlayersTable.tsx, @tanstack/react-table):
- Game column: <GameBadge game={g.shortName} /> (not clickable)
- Team column: styled span with team.name (not clickable)
- Actions: "Xem" -> /players/:slug, "Sửa" -> edit, "Xoá" -> delete
- Features: bulk select (checkbox), pagination

Organizations List (OrganizationsTable.tsx):
- Region column: org.region?.name (not clickable)
- Owner column: org.owner?.username (not clickable)
- Roles column: Multiple colored badges (ORGANIZER=purple, SPONSOR=yellow, CLUB=teal, AGENCY=orange)
- Row click: navigate to /organizations/:id

## 9. TEAM ROSTER SHEET ISSUE

File: pages/teams/components/TeamRosterSheet.tsx

CRITICAL: Uses MOCK DATA instead of real API
  const players = team ? mockPlayers.filter((p) => p.teamId === team.id) : []

Displays: Team header, team info (org, region), member list
Should fetch from real /teams/:id/players API instead

## 10. UI PATTERNS

Navigation: No direct clickable links between entity pages (display-only)
Display patterns: Badges, tags, text (not clickable)
Form patterns: Dropdowns, checkboxes, UserPicker, validation with zod + react-hook-form
History pattern: Timeline with pagination, add/delete modals

## 11. MISSING IMPLEMENTATIONS

1. Teams > Players: Mock data in TeamRosterSheet
2. Players > Teams: No clickable link to team detail
3. Games > Organization: Read-only, no edit
4. Organizations > Teams: No affiliated teams list
5. Organizations > Games: No affiliated games list

## 12. KEY FILES

C:/project/onlyquat-esport/dashboard/src/
- App.tsx (router)
- pages/teams/detail.tsx, list.tsx, components/TeamsTable.tsx, TeamRosterSheet.tsx
- pages/players/detail.tsx, list.tsx, components/PlayersTable.tsx
- pages/games/detail.tsx, list.tsx
- pages/organizations/detail.tsx, list.tsx, components/OrganizationsTable.tsx
- components/shared/ (PageHeader, TierBadge, GameBadge, UserPicker, HistoryTimeline)
- stores/ (teamsStore.ts, playersStore.ts, gamesStore.ts, organizationsStore.ts)
- lib/ (teams.api.ts, players.api.ts, games.api.ts, organizations.api.ts)
- types/admin.ts (all entity types with relationships)

## SUMMARY

Architecture: React Router + Zustand + axios + react-hook-form + @tanstack/react-table + TailwindCSS

Current state: Cross-entity relationships are display-only (no navigation links)

Enhancements: Add links, replace mock data, enable game-org assignment, add org team/game lists
