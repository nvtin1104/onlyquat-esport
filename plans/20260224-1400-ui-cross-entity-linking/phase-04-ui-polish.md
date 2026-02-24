# Phase 04 -- Modern UI Polish for Detail Pages

**Files:**
- `dashboard/src/pages/teams/detail.tsx`
- `dashboard/src/pages/players/detail.tsx`
- `dashboard/src/pages/organizations/detail.tsx`
**Depends on:** Phases 02, 03 (applies polish on top of the links added there)
**Risk:** very low (CSS-only changes)

---

## Goals

- Consistent hover effects on all clickable cross-entity fields
- Subtle visual indicator distinguishing clickable vs plain-text fields
- Consistent spacing/typography across all three detail pages
- No structural changes -- micro-improvements only

## Implementation Steps

### 1. Standardize link styling

All cross-entity links (added in Phase 02/03) should use a consistent pattern. Define this once:

```
Base: text-text-primary
Hover: text-accent-acid, underline, ArrowUpRight fades in
Transition: transition-colors duration-150
```

Verify all links from Phase 02 and Phase 03 use the same `group` + `group-hover:opacity-100` pattern for the ArrowUpRight icon.

### 2. Add a subtle left-border accent to clickable InfoRow/DetailRow items

For rows that contain a link (not plain text), add a subtle left indicator so users can scan which fields are interactive:

```tsx
// When a row contains a link, add this to the row wrapper:
className="... border-l-2 border-l-transparent has-[a]:border-l-accent-acid/20"
```

Alternative (simpler, no `has-[]` selector): just add `pl-2 border-l-2 border-l-accent-acid/20` to the specific rows that have links. This avoids relying on the CSS `:has()` selector.

### 3. Consistent card hover for team cards in org detail

Team cards (Phase 03) already have `hover:border-accent-acid/30`. Add a subtle shadow on hover:

```
hover:shadow-sm hover:shadow-accent-acid/5
```

### 4. Typography audit

Ensure these are consistent across all three detail pages:

| Element | Style |
|---------|-------|
| Section heading | `font-display font-semibold text-text-primary` |
| Field label | `font-mono text-xs text-text-dim uppercase tracking-wide` |
| Field value (text) | `text-sm text-text-primary` |
| Field value (secondary) | `text-sm text-text-secondary` |
| Timestamps | `text-xs text-text-dim` |

Currently:
- `teams/detail.tsx` `InfoRow` label: `font-mono text-xs text-text-dim uppercase tracking-wide` -- OK
- `players/detail.tsx` `DetailRow` label: `text-xs text-text-dim font-mono uppercase tracking-wide` -- OK (same classes, different order)
- `organizations/detail.tsx` `DetailRow` label: `text-xs text-text-dim font-mono uppercase tracking-wide` -- OK

All consistent. No changes needed.

### 5. Smooth transition on GameBadge hover

In Phase 02, GameBadge gets a `group-hover:ring-1` effect. Ensure it includes `transition-shadow` for smooth animation:

```tsx
<GameBadge game={player.game.shortName} className="group-hover:ring-1 group-hover:ring-accent-acid/30 transition-shadow" />
```

---

## Checklist

- [ ] Verify all cross-entity links use consistent hover pattern (text-accent-acid + ArrowUpRight fade-in)
- [ ] Add subtle left-border indicator on linked InfoRow/DetailRow items
- [ ] Add `hover:shadow-sm` to team cards in org detail
- [ ] Verify typography consistency across all 3 detail pages
- [ ] Ensure `transition-shadow` on GameBadge hover ring
- [ ] Visual QA: test all 3 detail pages in both light and dark mode
- [ ] Visual QA: test on mobile viewport (links should not break layout)
