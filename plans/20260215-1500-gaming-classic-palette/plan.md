# Gaming Classic Color Palette Implementation

**Created:** 2026-02-15
**Status:** Planning
**Type:** Design System Overhaul

## Summary

Replace hardcoded dark-only color system with CSS custom properties supporting Light/Dark theme modes. Apply Gaming Classic palette (Blue #0EA5E9, Red #EF4444, Gold #FFD700). Remove excessive outlines & blur effects. Add theme toggle.

## Phases

| # | Phase | Files | Status |
|---|-------|-------|--------|
| 01 | [Core Infrastructure](./phase-01-core-infrastructure.md) | 4 files (globals.css, tailwind.config, ThemeProvider, layout) | Pending |
| 02 | [Component Updates](./phase-02-component-updates.md) | 25 files (all components + pages) | Pending |

## Color Mapping Reference

### Old → New Tailwind Classes
| Old | New |
|-----|-----|
| `bg-bg` | `bg-bg-primary` |
| `bg-bg-surface` | `bg-bg-secondary` |
| `bg-bg-card` | `bg-bg-card` |
| `text-white` (as primary) | `text-text-primary` |
| `text-accent-cyan` | `text-accent-blue` |
| `border-white/10` | `border-border` |
| `border-white/20` | `border-border` |
| `bg-white/5` | `bg-bg-secondary` |
| `#00d4ff` | `#0EA5E9` |
| `rgba(0,212,255,*)` | `rgba(14,165,233,*)` |
| `hover:border-accent-cyan/*` | `hover:border-accent-blue/*` |
| `bg-accent-cyan/*` | `bg-accent-blue/*` |

### Theme Defaults
- Default theme: **dark** (preserve current feel)
- Storage: `localStorage` key `theme`
- Attribute: `data-theme` on `<html>`

## Architecture Decision
- CSS variables in `:root` (light) + `[data-theme="dark"]` (dark)
- Tailwind colors reference `var(--*)` — enables runtime theme switching
- ThemeProvider: React context + localStorage + system preference detection
- No flash: script in `<head>` reads localStorage before paint
