# Phase 03 -- Organization Detail: Affiliated Teams Section

**File:** `dashboard/src/pages/organizations/detail.tsx`
**Depends on:** nothing (independent)
**Risk:** low

---

## Current State

Organization detail page shows org info + edit form. No section for teams belonging to this organization.

## Target State

Below the details card, add a section showing all teams affiliated with this organization. Fetched via `getTeams({ organizationId })`.

## Implementation Steps

### 1. Add state + fetch for affiliated teams

```tsx
import { getTeams } from '@/lib/teams.api';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import type { AdminTeam } from '@/types/admin';

// Inside component:
const [affiliatedTeams, setAffiliatedTeams] = useState<AdminTeam[]>([]);
const [teamsLoading, setTeamsLoading] = useState(false);
const [teamsTotal, setTeamsTotal] = useState(0);
```

### 2. Fetch teams when org loads

Add to the existing `useEffect` that fetches the org:

```tsx
useEffect(() => {
  if (id) {
    fetchOrgById(id);
    // Fetch affiliated teams
    setTeamsLoading(true);
    getTeams({ organizationId: id, limit: 20 })
      .then((res) => {
        setAffiliatedTeams(res.data);
        setTeamsTotal(res.meta.total);
      })
      .catch(() => {})
      .finally(() => setTeamsLoading(false));
  }
  getRegions({ limit: 100 }).then(res => setRegions(res.data)).catch(() => {});
  return () => clearSelectedOrg();
}, [id]);
```

### 3. Add the affiliated teams section JSX

Place after the closing `</div>` of `flex flex-col gap-6` (after the details card), inside the main return.

```tsx
{/* Affiliated Teams */}
<div className="mt-6 bg-bg-surface border border-border-subtle rounded-sm p-6">
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="font-display font-semibold text-text-primary">
        Doi tuyen truc thuoc
      </h2>
      <p className="text-xs text-text-dim mt-0.5">
        {teamsTotal} doi tuyen thuoc to chuc nay
      </p>
    </div>
  </div>

  {teamsLoading ? (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-5 h-5 animate-spin text-text-dim" />
    </div>
  ) : affiliatedTeams.length === 0 ? (
    <div className="text-center py-8">
      <Users className="w-8 h-8 mx-auto text-text-dim mb-2" />
      <p className="text-sm text-text-dim">Chua co doi tuyen nao.</p>
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {affiliatedTeams.map((team) => (
        <Link
          key={team.id}
          to={`/teams/${team.id}`}
          className="flex items-center gap-3 p-3 rounded-sm border border-border-subtle hover:border-accent-acid/30 bg-bg-elevated hover:bg-bg-elevated/80 transition-colors group"
        >
          <div className="w-10 h-10 rounded-sm bg-bg-surface overflow-hidden flex items-center justify-center shrink-0">
            {team.logo ? (
              <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-display font-bold text-sm text-text-dim">
                {team.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent-acid transition-colors">
              {team.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {team.tag && (
                <span className="font-mono text-[10px] text-text-dim">[{team.tag}]</span>
              )}
              {team.region && (
                <Badge variant="info" className="text-[10px] py-0">{team.region.code}</Badge>
              )}
            </div>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-text-dim opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </Link>
      ))}
    </div>
  )}
</div>
```

### 4. Add imports

Add to existing imports:
- `Link` from `react-router-dom`
- `Users` to lucide-react destructure
- `getTeams` from `@/lib/teams.api`
- `ArrowUpRight` to lucide-react destructure
- `Badge` -- already imported
- `Loader2` -- already imported

---

## Checklist

- [ ] Add `affiliatedTeams`, `teamsLoading`, `teamsTotal` state
- [ ] Fetch teams with `getTeams({ organizationId: id })` in useEffect
- [ ] Add imports: `Link`, `Users`, `ArrowUpRight`, `getTeams`, `AdminTeam`
- [ ] Add affiliated teams section after details card
- [ ] Team cards: logo, name, tag, region badge
- [ ] Each card links to `/teams/:id`
- [ ] Empty state with icon when no teams
- [ ] Loading spinner while fetching
- [ ] Test: org with teams -- shows team cards
- [ ] Test: org with no teams -- shows empty state
- [ ] Test: click team card -- navigates to team detail
