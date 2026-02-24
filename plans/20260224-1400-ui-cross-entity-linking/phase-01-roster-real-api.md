# Phase 01 -- Fix TeamRosterSheet (Mock -> Real API)

**File:** `dashboard/src/pages/teams/components/TeamRosterSheet.tsx`
**Depends on:** nothing
**Risk:** low

---

## Current State

- Imports `mockPlayers` from `@/data/mock-data`
- Filters locally: `mockPlayers.filter((p) => p.teamId === team.id)`
- No loading state, no error handling, no real API call

## Target State

- Fetch from `getPlayers({ teamId: team.id, limit: 50 })` when sheet opens
- Show loading spinner while fetching
- Player rows clickable -- navigate to `/players/${player.slug}`
- Remove `mockPlayers` import entirely

## Implementation Steps

### 1. Add state + effect for real data

Replace the mock filter with `useState` + `useEffect`:

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlayers } from '@/lib/players.api';
import { Loader2 } from 'lucide-react';
import type { AdminPlayer } from '@/types/admin';

// Inside component:
const navigate = useNavigate();
const [players, setPlayers] = useState<AdminPlayer[]>([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  if (!team || !open) return;
  setLoading(true);
  getPlayers({ teamId: team.id, limit: 50 })
    .then((res) => setPlayers(res.data))
    .catch(() => setPlayers([]))
    .finally(() => setLoading(false));
}, [team?.id, open]);
```

### 2. Remove mock import

Delete:
```tsx
import { mockPlayers } from '@/data/mock-data';
```

Remove the `const players = team ? mockPlayers.filter(...)` line.

### 3. Add loading state in the players list area

Before the player list, add:
```tsx
{loading ? (
  <div className="flex items-center justify-center py-8">
    <Loader2 className="w-5 h-5 animate-spin text-text-dim" />
  </div>
) : players.length === 0 ? (
  // existing empty state
) : (
  // existing players list
)}
```

### 4. Make player rows clickable

Wrap each player row `<div>` with `onClick` + cursor:

```tsx
<div
  key={player.id}
  onClick={() => navigate(`/players/${player.slug}`)}
  className="flex items-center gap-3 py-3 border-b border-border-subtle last:border-b-0 cursor-pointer hover:bg-bg-elevated/50 transition-colors"
>
```

### 5. Adapt field access to AdminPlayer type

Current mock uses `player.imageUrl`, `player.displayName`, `player.game?.shortName`, `player.rating`, `player.tier` -- all exist on `AdminPlayer` type. No changes needed.

---

## Checklist

- [ ] Remove `mockPlayers` import
- [ ] Add `useState<AdminPlayer[]>` + `useEffect` with `getPlayers({ teamId })`
- [ ] Add `useNavigate` hook
- [ ] Add loading spinner
- [ ] Make player rows clickable with `navigate(`/players/${player.slug}`)`
- [ ] Add `hover:bg-bg-elevated/50` + `cursor-pointer` to player rows
- [ ] Test: open roster sheet on a team with players -- verify real data loads
- [ ] Test: click player row -- navigates to player detail
- [ ] Test: team with no players -- shows empty state
