# Phase 02: Component Updates

**Parent:** [plan.md](./plan.md)
**Dependencies:** [Phase 01](./phase-01-core-infrastructure.md)
**Priority:** High

## Overview

- **Date:** 2026-02-15
- **Description:** Update all 25 component/page files to use new color tokens, remove excessive outlines & blur
- **Implementation Status:** Pending
- **Review Status:** Pending

## Key Insights

- All changes are mechanical find-and-replace following the mapping table
- Most files use same patterns: `bg-bg-card`, `border-white/10`, `text-white`, `text-accent-cyan`
- Glow/shadow effects using `rgba(0,212,255,*)` need updating to `rgba(14,165,233,*)`
- `text-white` used as primary text should become `text-text-primary` — but `text-white` used on colored backgrounds (buttons) stays `text-white`
- `.glass` usage in HeroSection replaced by updated `.glass` utility from Phase 01
- `neon-cyan` class → `neon-blue` (renamed in Phase 01)

## Requirements

1. Replace all hardcoded color classes per mapping table
2. Remove excessive `border-white/10` — use `border-border`
3. Reduce `backdrop-blur-md` usage — keep only where essential (Header scroll, MobileMenu)
4. Update glow rgba values from cyan (#00d4ff) to blue (#0EA5E9)
5. Replace `text-white` with `text-text-primary` where it's used as default text color
6. Keep `text-white` where it's used on colored backgrounds (badge text, button text)

## Related Code Files

### UI Components (4 files)
| File | Key Changes |
|------|-------------|
| `Button.tsx` | `accent-cyan` → `accent-blue`, glow rgba update |
| `Card.tsx` | `bg-bg-card` stays, `border-white/10` → `border-border`, glow rgba update, remove `backdrop-blur-sm` |
| `Badge.tsx` | `accent-cyan` → `accent-blue`, keep red/warning as-is |
| `Tabs.tsx` | `bg-bg-surface` → `bg-bg-secondary`, `border-white/10` → `border-border`, `accent-cyan` → `accent-blue` |

### Layout Components (4 files)
| File | Key Changes |
|------|-------------|
| `Header.tsx` | Add theme toggle (Sun/Moon icon), `bg-bg/80` → `bg-bg-primary/80`, `border-white/10` → `border-border`, `text-white` → `text-text-primary`, `accent-cyan` → `accent-blue`, keep backdrop-blur |
| `Footer.tsx` | `bg-bg-surface` → `bg-bg-secondary`, `border-white/10` → `border-border`, `text-white` → `text-text-primary`, `accent-cyan` → `accent-blue` |
| `LanguageSwitcher.tsx` | `bg-bg-surface` → `bg-bg-secondary`, `border-white/10` → `border-border`, `accent-cyan` → `accent-blue` |
| `MobileMenu.tsx` | `bg-bg/95` → `bg-bg-primary/95`, keep backdrop-blur, `accent-cyan` → `accent-blue`, `text-white` → `text-text-primary` |

### Shared Components (3 files)
| File | Key Changes |
|------|-------------|
| `MatchCard.tsx` | `bg-bg-card` stays, `border-white/10` → `border-border`, `text-white` → `text-text-primary` |
| `ArticleCard.tsx` | `bg-bg-card` stays, `border-white/10` → `border-border`, `accent-cyan` → `accent-blue`, `accent-purple` stays |
| `TeamLogo.tsx` | `bg-bg-surface` → `bg-bg-secondary`, `accent-cyan` → `accent-blue` |

### Page Components (2 files)
| File | Key Changes |
|------|-------------|
| `NewsFilterClient.tsx` | No direct color changes (uses child components) |
| `TournamentsFilterClient.tsx` | `accent-cyan` → `accent-blue`, `text-white` → `text-text-primary`, `bg-bg-surface` → `bg-bg-secondary` |

### Home Sections (7 files)
| File | Key Changes |
|------|-------------|
| `HeroSection.tsx` | Hardcoded gradient hex → use CSS var bg, `accent-cyan` → `accent-blue`, `neon-cyan` → `neon-blue`, glow rgba update, `text-white` → `text-text-primary` where applicable |
| `MatchHistorySection.tsx` | `text-white` → `text-text-primary`, `accent-cyan` → `accent-blue` |
| `MinigamesSection.tsx` | `bg-bg-surface` → `bg-bg-secondary`, `bg-bg-card` stays, `border-white/10` → `border-border`, `accent-cyan` → `accent-blue`, glow rgba |
| `NewsSection.tsx` | `text-white` → `text-text-primary`, `accent-cyan` → `accent-blue` |
| `ScoringsSection.tsx` | `bg-bg-surface` → `bg-bg-secondary`, `border-white/10` → `border-border`, `text-white` → `text-text-primary`, `accent-cyan` → `accent-blue` |
| `TeamsSection.tsx` | `bg-bg-surface` → `bg-bg-secondary`, `bg-bg-card` stays, `border-white/10` → `border-border`, `accent-cyan` → `accent-blue`, glow rgba |
| `TournamentsSection.tsx` | `bg-bg-surface` → `bg-bg-secondary`, `accent-cyan` → `accent-blue`, glow rgba, `text-white` → `text-text-primary` |

### Page Files (4 files)
| File | Key Changes |
|------|-------------|
| `teams/page.tsx` | `text-white` → `text-text-primary`, `bg-bg-card` stays, `border-white/10` → `border-border`, `accent-cyan` → `accent-blue`, glow rgba |
| `teams/[id]/page.tsx` | Same pattern, `border-white/10` → `border-border`, `text-white` → `text-text-primary`, `accent-cyan` → `accent-blue`, `accent-purple` stays |
| `news/[id]/page.tsx` | `accent-cyan` → `accent-blue`, `border-white/10` → `border-border`, `bg-bg-card` stays, `text-white` → `text-text-primary` |
| `minigames/page.tsx` | `text-white` → `text-text-primary`, `bg-bg-card` stays, `border-white/10` → `border-border`, glow rgba |

## Implementation Steps

### Global Find-Replace Pattern (apply to ALL files):
1. `accent-cyan` → `accent-blue` (covers text-, bg-, border- prefixes + opacity modifiers)
2. `border-white/10` → `border-border`
3. `border-white/20` → `border-border`
4. `hover:border-white/20` → `hover:border-border`
5. `hover:border-white/30` → `hover:border-border`
6. `bg-white/5` → `bg-bg-secondary`
7. `bg-bg-surface` → `bg-bg-secondary`
8. `bg-bg/80` → `bg-bg-primary/80`
9. `bg-bg/95` → `bg-bg-primary/95`
10. `bg-bg/60` → `bg-bg-primary/60`
11. `hover:bg-white/5` → `hover:bg-bg-secondary`
12. `hover:text-white` → `hover:text-text-primary`
13. `rgba(0,212,255,` → `rgba(14,165,233,`
14. `rgba(0, 212, 255,` → `rgba(14, 165, 233,`
15. `neon-cyan` → `neon-blue`
16. `bg-white/10` → `bg-border/20`

### Per-file `text-white` handling (MANUAL — context-dependent):
- `text-white` as **heading/body text** → `text-text-primary`
- `text-white` as **text on colored background** (buttons, badges) → keep `text-white`

### Header.tsx — Theme Toggle Addition:
```tsx
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
// In the right actions div, before LanguageSwitcher:
<button onClick={toggle} className="text-text-secondary hover:text-text-primary transition-colors">
  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
</button>
```

### HeroSection.tsx — Special Handling:
- Gradient background: `from-[#0a0e17] via-[#0d1520] to-[#0a0e17]` → `from-bg-primary via-bg-secondary to-bg-primary`
- Orb decorations: `bg-accent-cyan/5` → `bg-accent-blue/5`
- `bg-accent-purple/[0.08]` → stays

## Todo

- [ ] Apply global find-replace across all 25 files
- [ ] Manual text-white → text-text-primary review per file
- [ ] Add theme toggle to Header.tsx
- [ ] Update HeroSection gradient
- [ ] Update MinigamesPage whileHover boxShadow rgba
- [ ] Remove backdrop-blur-sm from Card.tsx
- [ ] Test light mode renders correctly
- [ ] Test dark mode preserves current look
- [ ] Verify all hover/glow effects work in both themes

## Success Criteria

- All components render correctly in both light and dark themes
- No hardcoded `#00d4ff`, `#0a0e17`, or `border-white/10` remains in source
- Theme toggle in header switches between modes
- `npm run build` passes with zero errors
- Visual consistency: dark mode looks like current site (just cleaner), light mode is clean & readable

## Risk Assessment

- **Low:** Mechanical replacements — patterns are consistent
- **Medium:** `text-white` context sensitivity — wrong replacement breaks contrast on colored backgrounds
- **Low:** HeroSection gradient — may need fine-tuning for light mode appearance

## Security Considerations

- No security implications — purely CSS/styling changes
