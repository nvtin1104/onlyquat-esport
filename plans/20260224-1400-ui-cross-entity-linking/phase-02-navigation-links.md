# Phase 02 -- Clickable Navigation Links on Detail Pages

**Files:**
- `dashboard/src/pages/teams/detail.tsx`
- `dashboard/src/pages/players/detail.tsx`
**Depends on:** nothing (independent of Phase 01)
**Risk:** low

---

## Summary

Make cross-entity references clickable in **view mode only**. Each link navigates to the referenced entity's detail page.

## Links to Add

| Page | Field | Target Route | Data Available |
|------|-------|-------------|----------------|
| Team detail | Organization name | `/organizations/${team.organization.id}` | `team.organization?.id` |
| Player detail | Game badge | `/games/${player.game.id}` | `player.game?.id` |
| Player detail | Team name | `/teams/${player.team.id}` | `player.team?.id` |

**NOT linked:** Region (no detail page worth linking), Owner/Manager on org (user system, skip per requirements).

## Implementation Steps

### 1. Create an `EntityLink` helper (inline, not a new file)

Add a small helper inside each detail file (or a shared one in `components/shared/EntityLink.tsx` if preferred). Simplest approach: just use `Link` from react-router-dom with consistent styling.

Shared styling pattern:
```tsx
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

// Inline usage:
<Link
  to={`/organizations/${team.organization.id}`}
  className="text-sm text-text-primary hover:text-accent-acid hover:underline inline-flex items-center gap-1 transition-colors group"
>
  {team.organization.name}
  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
</Link>
```

### 2. Team Detail -- Organization link

**File:** `dashboard/src/pages/teams/detail.tsx`

Current (line 296):
```tsx
<InfoRow label="To chuc" value={team.organization?.name ?? '---'} />
```

Change `InfoRow` to accept `children` OR create an alternate row. Simplest: modify the Organization row to use JSX instead of the `value` prop.

Option A -- Replace that single InfoRow with inline JSX:
```tsx
<div className="flex items-start justify-between gap-4 py-2 border-b border-border-subtle/50">
  <span className="font-mono text-xs text-text-dim uppercase tracking-wide shrink-0">To chuc</span>
  <div className="text-right">
    {team.organization ? (
      <Link
        to={`/organizations/${team.organization.id}`}
        className="text-sm text-text-primary hover:text-accent-acid hover:underline inline-flex items-center gap-1 transition-colors group"
      >
        {team.organization.name}
        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    ) : (
      <span className="text-sm text-text-primary">---</span>
    )}
  </div>
</div>
```

Option B (cleaner) -- Refactor `InfoRow` to accept `children`:
```tsx
function InfoRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border-subtle/50 last:border-0">
      <span className="font-mono text-xs text-text-dim uppercase tracking-wide shrink-0">{label}</span>
      {children ? (
        <div className="text-right">{children}</div>
      ) : (
        <span className="text-sm text-text-primary text-right">{value}</span>
      )}
    </div>
  );
}
```

Then:
```tsx
<InfoRow label="To chuc">
  {team.organization ? (
    <Link to={`/organizations/${team.organization.id}`} className="...">
      {team.organization.name}
      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  ) : (
    <span className="text-sm text-text-primary">---</span>
  )}
</InfoRow>
```

**Recommendation:** Option B -- refactor `InfoRow` to accept children. Cleaner, reusable.

### 3. Player Detail -- Game badge link

**File:** `dashboard/src/pages/players/detail.tsx`

Current (line 541-546):
```tsx
<DetailRow label="Game">
  {player.game ? (
    <GameBadge game={player.game.shortName} />
  ) : (
    <span className="text-sm text-text-dim">---</span>
  )}
</DetailRow>
```

Change to:
```tsx
<DetailRow label="Game">
  {player.game ? (
    <Link to={`/games/${player.game.id}`} className="inline-flex items-center gap-1 group">
      <GameBadge game={player.game.shortName} className="group-hover:ring-1 group-hover:ring-accent-acid/30 transition-shadow" />
      <ArrowUpRight className="w-3 h-3 text-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  ) : (
    <span className="text-sm text-text-dim">---</span>
  )}
</DetailRow>
```

### 4. Player Detail -- Team name link

Current (line 548-555):
```tsx
<DetailRow label="Doi tuyen">
  {player.team ? (
    <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-bg-elevated text-text-secondary border border-border-subtle">
      {player.team.name}
    </span>
  ) : (
    <span className="text-sm text-text-dim">---</span>
  )}
</DetailRow>
```

Change to:
```tsx
<DetailRow label="Doi tuyen">
  {player.team ? (
    <Link
      to={`/teams/${player.team.id}`}
      className="inline-flex items-center gap-1 group"
    >
      <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-bg-elevated text-text-secondary border border-border-subtle group-hover:border-accent-acid/30 group-hover:text-accent-acid transition-colors">
        {player.team.name}
      </span>
      <ArrowUpRight className="w-3 h-3 text-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  ) : (
    <span className="text-sm text-text-dim">---</span>
  )}
</DetailRow>
```

### 5. Add imports

Both files need:
```tsx
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
```

`ArrowUpRight` -- add to existing lucide-react import destructure.

---

## Checklist

- [ ] Refactor `InfoRow` in `teams/detail.tsx` to accept optional `children`
- [ ] Add `Link` + `ArrowUpRight` imports to `teams/detail.tsx`
- [ ] Replace organization InfoRow with clickable Link
- [ ] Add `Link` + `ArrowUpRight` imports to `players/detail.tsx`
- [ ] Wrap GameBadge in Link to `/games/:id`
- [ ] Wrap team name span in Link to `/teams/:id`
- [ ] Test: team detail -- click org name -- navigates to org detail
- [ ] Test: player detail -- click game badge -- navigates to game detail
- [ ] Test: player detail -- click team name -- navigates to team detail
- [ ] Test: entities with null org/game/team show "---" (no broken link)
