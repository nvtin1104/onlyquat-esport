# Phase 04 — Dashboard UI
Date: 2026-02-24 | Priority: High | Status: Pending

## Context
- Teams detail: `dashboard/src/pages/teams/detail.tsx`
- Players detail: `dashboard/src/pages/players/detail.tsx`
- Teams API: `dashboard/src/lib/teams.api.ts`
- Players API: `dashboard/src/lib/players.api.ts`

## New Files

### `dashboard/src/lib/teams.api.ts` (extend)
Add:
- `getTeamHistory(teamId, page, limit)` → `PaginatedResponse<TeamHistoryItem>`
- `addTeamHistory(teamId, dto)` → `TeamHistoryItem`
- `deleteTeamHistory(teamId, historyId)` → void

### `dashboard/src/lib/players.api.ts` (extend)
Add:
- `getPlayerHistory(slug, page, limit)` → `PaginatedResponse<PlayerHistoryItem>`
- `addPlayerHistory(slug, dto)` → `PlayerHistoryItem`
- `deletePlayerHistory(slug, historyId)` → void

### `dashboard/src/types/history.ts` (new)
Types: `TeamHistoryItem`, `PlayerHistoryItem`, `TeamHistoryEventType`, `PlayerHistoryEventType`

### `dashboard/src/components/shared/HistoryTimeline.tsx` (new)
Shared timeline component showing events ordered by happenedAt desc.
- Each item: icon (by eventType) + label + metadata summary + date + optional delete button
- Pagination controls at bottom (reuse `Pagination` component)

### `dashboard/src/components/shared/AddHistoryModal.tsx` (new)
Modal dialog to manually add history (achievement, etc.).
- Fields: eventType (select), title/description (for ACHIEVEMENT), happenedAt (date), note
- Submit → call API, refresh history list

## Modified Files

### `dashboard/src/pages/teams/detail.tsx`
Add history section below the 2-column detail grid:
- Section header "Lịch sử đội tuyển" with "Thêm" button
- `<HistoryTimeline>` component showing team history
- Local state: `history, historyPage, historyTotal, historyLoading`
- `AddHistoryModal` for manual achievement/event entry

### `dashboard/src/pages/players/detail.tsx`
Add history section below the hero + details cards:
- Section header "Lịch sử tuyển thủ" with "Thêm" button
- `<HistoryTimeline>` component showing player history
- Same local state pattern

## Event type → icon + label mapping

| Event | Icon | Label |
|-------|------|-------|
| NAME_CHANGE | Pencil | Đổi tên |
| LOGO_CHANGE | Image | Đổi logo |
| ACHIEVEMENT | Trophy | Thành tích |
| PLAYER_JOIN | UserPlus | Tuyển thủ gia nhập |
| PLAYER_LEAVE | UserMinus | Tuyển thủ rời đội |
| ORG_CHANGE | Building | Đổi tổ chức |
| DISPLAY_NAME_CHANGE | Pencil | Đổi tên hiệu |
| TEAM_JOIN | UserPlus | Gia nhập đội |
| TEAM_LEAVE | UserMinus | Rời đội |
| TEAM_TRANSFER | ArrowRightLeft | Chuyển nhượng |
| ACHIEVEMENT | Trophy | Thành tích |
| TIER_CHANGE | TrendingUp | Thay đổi hạng |

## Steps
- [ ] Create `dashboard/src/types/history.ts`
- [ ] Extend `teams.api.ts` with history functions
- [ ] Extend `players.api.ts` with history functions
- [ ] Create `HistoryTimeline.tsx` shared component
- [ ] Create `AddHistoryModal.tsx` shared component
- [ ] Extend `teams/detail.tsx` with history section
- [ ] Extend `players/detail.tsx` with history section
