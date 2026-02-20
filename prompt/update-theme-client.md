# 🎨 ARCADE ARENA — Light/Dark Theme Update Prompt (v2)

## Converting from Dark-only → Dual Theme (Light default + Dark toggle)

### Uses `next-themes` for zero-FOUC, auto-persistence, system preference detection

---

### CURRENT CONTEXT

```
Stack:         Next.js 16 + React 19 + Tailwind CSS v4 (@theme inline)
UI Library:    NONE — all components hand-crafted (Badge, Button, Card, Input, StatBar...)
State:         Zustand
Fonts:         Chakra Petch (display) + Be Vietnam Pro (body) + JetBrains Mono (mono)
Current Theme: Dark only — hardcoded CSS variables in :root
Tailwind v4:   Uses @theme inline instead of tailwind.config.ts
```

### GOALS

1. **Light theme as default** (first visit = light)
2. **Dark theme preserved** — keep existing gaming aesthetic intact
3. Toggle switch in Header (Sun/Moon icon)
4. Persist preference in `localStorage` (automatic via next-themes)
5. Respect `prefers-color-scheme` when no stored preference exists
6. **No flash** (FOUC) on page load (handled by next-themes)
7. Support `system` as a third option (auto-detect OS preference)

### NEW DEPENDENCY

```bash
pnpm add next-themes
```

---

## STEP 1: Root Layout — ThemeProvider (`src/app/layout.tsx`)

Replace the entire current layout. `next-themes` handles anti-FOUC script injection, localStorage persistence, and system preference detection automatically.

```tsx
// src/app/layout.tsx
import { ThemeProvider } from 'next-themes';

export const metadata = {
  title: 'Arcade Arena — E-sports Rating Platform',
  description: 'Rate, analyze, and compare E-sports players',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-bg-base text-text-primary antialiased transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange={false}
          storageKey="arcade-arena-theme"
          themes={['light', 'dark']}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**What `next-themes` does here automatically:**
- Injects anti-FOUC `<script>` before paint (no white/dark flash)
- Reads/writes `localStorage` key `arcade-arena-theme`
- Listens to `prefers-color-scheme` media query when theme = "system"
- Adds/removes `class="dark"` on `<html>` element
- Handles SSR hydration mismatch

**What you do NOT need anymore:**
- ~~Custom `dangerouslySetInnerHTML` anti-flash script~~
- ~~Zustand theme store (`src/stores/themeStore.ts`)~~
- ~~Manual `localStorage.getItem/setItem` logic~~
- ~~Manual `document.documentElement.classList.toggle`~~

---

## STEP 2: CSS Variables — Dual Theme (`src/app/globals.css`)

Replace the entire current `:root` block. Keep `@theme inline` for Tailwind v4 compatibility.

```css
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

/* ═══════════════════════════════════════════
   LIGHT THEME (default)
   ═══════════════════════════════════════════ */
:root {
  /* Background */
  --bg-base: #F5F5F5;
  --bg-elevated: #FFFFFF;
  --bg-surface: #FAFAFA;
  --bg-overlay: rgba(0, 0, 0, 0.4);
  --bg-card: #FFFFFF;

  /* Border */
  --border-subtle: #E5E5E5;
  --border-hover: #D1D1D1;

  /* Accent — darker acid green for light backgrounds (WCAG AA) */
  --accent-acid: #7AB800;
  --accent-lava: #E04400;
  --accent-acid-dim: rgba(122, 184, 0, 0.08);
  --accent-acid-glow: rgba(122, 184, 0, 0.25);
  --accent-lava-dim: rgba(224, 68, 0, 0.08);
  --accent-lava-glow: rgba(224, 68, 0, 0.25);

  /* Text */
  --text-primary: #1A1A1A;
  --text-secondary: #6B6B6B;
  --text-dim: #A0A0A0;

  /* Tier Colors — darker for light backgrounds, ensuring contrast */
  --tier-s: #6B9E00;
  --tier-a: #00B35F;
  --tier-b: #0088CC;
  --tier-c: #CC9200;
  --tier-d: #CC3D00;
  --tier-f: #CC3333;

  /* Semantic */
  --success: #00B35F;
  --warning: #CC9200;
  --danger: #CC3333;
  --info: #0088CC;

  /* Shadows — real box-shadow for light mode */
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-acid-glow: 0 0 20px rgba(122, 184, 0, 0.15);

  /* Noise overlay — disabled in light mode */
  --noise-opacity: 0;

  /* Scrollbar */
  --scrollbar-thumb: #D1D1D1;
  --scrollbar-track: #F5F5F5;

  /* Selection */
  --selection-bg: #7AB800;
  --selection-text: #FFFFFF;
}

/* ═══════════════════════════════════════════
   DARK THEME (.dark class set by next-themes)
   ═══════════════════════════════════════════ */
.dark {
  /* Background */
  --bg-base: #121212;
  --bg-elevated: #1A1A1B;
  --bg-surface: #000000;
  --bg-overlay: rgba(0, 0, 0, 0.85);
  --bg-card: #0A0A0A;

  /* Border */
  --border-subtle: #2A2A2B;
  --border-hover: #3A3A3B;

  /* Accent — bright neon for dark backgrounds */
  --accent-acid: #CCFF00;
  --accent-lava: #FF4D00;
  --accent-acid-dim: rgba(204, 255, 0, 0.12);
  --accent-acid-glow: rgba(204, 255, 0, 0.4);
  --accent-lava-dim: rgba(255, 77, 0, 0.12);
  --accent-lava-glow: rgba(255, 77, 0, 0.4);

  /* Text */
  --text-primary: #E8E8E8;
  --text-secondary: #888888;
  --text-dim: #555555;

  /* Tier Colors — bright neon on dark backgrounds */
  --tier-s: #CCFF00;
  --tier-a: #00FF88;
  --tier-b: #00AAFF;
  --tier-c: #FFB800;
  --tier-d: #FF4D00;
  --tier-f: #FF4444;

  /* Semantic */
  --success: #00FF88;
  --warning: #FFB800;
  --danger: #FF4444;
  --info: #00AAFF;

  /* Shadows — glow effects for dark mode */
  --shadow-card: none;
  --shadow-card-hover: 0 0 40px rgba(204, 255, 0, 0.15);
  --shadow-acid-glow: 0 0 40px rgba(204, 255, 0, 0.15);

  /* Noise overlay — enabled in dark mode */
  --noise-opacity: 0.025;

  /* Scrollbar */
  --scrollbar-thumb: #2A2A2B;
  --scrollbar-track: #121212;

  /* Selection */
  --selection-bg: #CCFF00;
  --selection-text: #121212;
}

/* ═══════════════════════════════════════════
   TAILWIND v4 THEME TOKENS
   ═══════════════════════════════════════════ */
@theme inline {
  --color-bg-base: var(--bg-base);
  --color-bg-elevated: var(--bg-elevated);
  --color-bg-surface: var(--bg-surface);
  --color-bg-overlay: var(--bg-overlay);
  --color-bg-card: var(--bg-card);

  --color-border-subtle: var(--border-subtle);
  --color-border-hover: var(--border-hover);

  --color-accent-acid: var(--accent-acid);
  --color-accent-lava: var(--accent-lava);
  --color-accent-acid-dim: var(--accent-acid-dim);
  --color-accent-acid-glow: var(--accent-acid-glow);
  --color-accent-lava-dim: var(--accent-lava-dim);
  --color-accent-lava-glow: var(--accent-lava-glow);

  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-dim: var(--text-dim);

  --color-tier-s: var(--tier-s);
  --color-tier-a: var(--tier-a);
  --color-tier-b: var(--tier-b);
  --color-tier-c: var(--tier-c);
  --color-tier-d: var(--tier-d);
  --color-tier-f: var(--tier-f);

  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);
  --color-info: var(--info);

  --shadow-card: var(--shadow-card);
  --shadow-card-hover: var(--shadow-card-hover);
  --shadow-acid-glow: var(--shadow-acid-glow);

  --font-display: 'Chakra Petch', sans-serif;
  --font-body: 'Be Vietnam Pro', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

/* ═══════════════════════════════════════════
   GLOBAL STYLES
   ═══════════════════════════════════════════ */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
}

::selection {
  background: var(--selection-bg);
  color: var(--selection-text);
}

body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: 'Be Vietnam Pro', sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Noise texture — only visible in dark mode via --noise-opacity */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  opacity: var(--noise-opacity);
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
}
```

---

## STEP 3: Theme Toggle Component (`src/components/ui/ThemeToggle.tsx`)

Uses `useTheme` from `next-themes` — no Zustand needed.

```tsx
'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render after mount
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Skeleton placeholder to prevent layout shift
    return (
      <div className="w-10 h-10 rounded-lg bg-bg-elevated border border-border-subtle animate-pulse" />
    );
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="
        relative flex items-center justify-center
        w-10 h-10 rounded-lg
        bg-bg-elevated border border-border-subtle
        hover:border-border-hover
        transition-all duration-300
        cursor-pointer group
      "
      aria-label={resolvedTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <AnimatePresence mode="wait">
        {resolvedTheme === 'light' ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <Sun size={18} className="text-text-secondary group-hover:text-accent-acid transition-colors" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <Moon size={18} className="text-text-secondary group-hover:text-accent-acid transition-colors" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
```

### Optional: 3-State Toggle (Light / System / Dark)

If you want users to explicitly choose "System" as an option:

```tsx
'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle3() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-10 w-[132px] rounded-lg bg-bg-elevated border border-border-subtle animate-pulse" />;

  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'system', icon: Monitor, label: 'System' },
    { value: 'dark', icon: Moon, label: 'Dark' },
  ] as const;

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-bg-elevated border border-border-subtle">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono
            transition-all duration-200 cursor-pointer
            ${theme === value
              ? 'bg-accent-acid text-black font-bold'
              : 'text-text-dim hover:text-text-secondary'
            }
          `}
          aria-label={`Set theme to ${label}`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}
```

---

## STEP 4: Add ThemeToggle to Header (`src/components/layout/Header.tsx`)

```tsx
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Inside Header JSX, right side alongside nav:
<div className="flex items-center gap-3">
  <ThemeToggle />
  {/* ...existing nav links, CTA button... */}
</div>
```

---

## STEP 5: Update Utilities (`src/lib/utils.ts`)

Replace hardcoded hex colors with CSS variable references:

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type TierKey = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// For inline styles (Recharts, Framer Motion, etc.)
export const TIER_COLORS: Record<TierKey, string> = {
  S: 'var(--tier-s)',
  A: 'var(--tier-a)',
  B: 'var(--tier-b)',
  C: 'var(--tier-c)',
  D: 'var(--tier-d)',
  F: 'var(--tier-f)',
};

// For Tailwind className usage
export const TIER_TEXT_CLASS: Record<TierKey, string> = {
  S: 'text-tier-s',
  A: 'text-tier-a',
  B: 'text-tier-b',
  C: 'text-tier-c',
  D: 'text-tier-d',
  F: 'text-tier-f',
};

export const TIER_BG_CLASS: Record<TierKey, string> = {
  S: 'bg-tier-s/10 text-tier-s border border-tier-s/30',
  A: 'bg-tier-a/10 text-tier-a border border-tier-a/30',
  B: 'bg-tier-b/10 text-tier-b border border-tier-b/30',
  C: 'bg-tier-c/10 text-tier-c border border-tier-c/30',
  D: 'bg-tier-d/10 text-tier-d border border-tier-d/30',
  F: 'bg-tier-f/10 text-tier-f border border-tier-f/30',
};

export function getTierFromRating(rating: number): TierKey {
  if (rating >= 9.0) return 'S';
  if (rating >= 8.0) return 'A';
  if (rating >= 7.0) return 'B';
  if (rating >= 6.0) return 'C';
  if (rating >= 5.0) return 'D';
  return 'F';
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}
```

---

## STEP 6: Update Animations (`src/lib/animations.ts`)

Use CSS variables for shadows so they auto-switch with theme:

```typescript
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

export const fadeUpItem = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
};

export const cardHover = {
  rest: {
    y: 0,
    boxShadow: 'var(--shadow-card)',
  },
  hover: {
    y: -8,
    boxShadow: 'var(--shadow-card-hover)',
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};

export const slideUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
  },
};
```

---

## STEP 7: Recharts Theme Hook (`src/hooks/useChartTheme.ts`)

Uses `next-themes` instead of Zustand:

```typescript
'use client';

import { useTheme } from 'next-themes';

export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return {
    grid:     isDark ? '#2A2A2B' : '#E5E5E5',
    axis:     isDark ? '#555555' : '#A0A0A0',
    tooltip: {
      bg:     isDark ? '#0A0A0A' : '#FFFFFF',
      border: isDark ? '#2A2A2B' : '#E5E5E5',
      text:   isDark ? '#E8E8E8' : '#1A1A1A',
    },
    accent:   isDark ? '#CCFF00' : '#7AB800',
    lava:     isDark ? '#FF4D00' : '#E04400',
    areaFill: isDark ? 'rgba(204,255,0,0.08)' : 'rgba(122,184,0,0.06)',
    tierColors: isDark
      ? { S: '#CCFF00', A: '#00FF88', B: '#00AAFF', C: '#FFB800', D: '#FF4D00', F: '#FF4444' }
      : { S: '#6B9E00', A: '#00B35F', B: '#0088CC', C: '#CC9200', D: '#CC3D00', F: '#CC3333' },
  };
}
```

Usage in Recharts components:

```tsx
// Example in RadarChart.tsx
'use client';

import { useChartTheme } from '@/hooks/useChartTheme';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from 'recharts';

export function PlayerRadarChart({ stats }: { stats: Record<string, number>[] }) {
  const ct = useChartTheme();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={stats}>
        <PolarGrid stroke={ct.grid} />
        <PolarAngleAxis tick={{ fill: ct.axis, fontSize: 11, fontFamily: 'JetBrains Mono' }} />
        <Radar
          dataKey="value"
          fill={ct.accent}
          fillOpacity={0.3}
          stroke={ct.accent}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: ct.tooltip.bg,
            border: `1px solid ${ct.tooltip.border}`,
            color: ct.tooltip.text,
            borderRadius: '4px',
            fontFamily: 'Be Vietnam Pro',
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
```

---

## STEP 8: Component Updates — Find & Replace

All current components using hardcoded dark colors need to be migrated to token-based classes:

### Find & Replace Patterns (regex)

```
FIND:                                REPLACE WITH:
─────────────────────────────────────────────────────────
bg-\[#121212\]                   →   bg-bg-base
bg-\[#1A1A1B\]                   →   bg-bg-elevated
bg-\[#000000?\]  or  bg-black    →   bg-bg-surface
bg-\[#0A0A0A\]                   →   bg-bg-card
border-\[#2A2A2B\]               →   border-border-subtle
border-\[#3A3A3B\]               →   border-border-hover
text-\[#E8E8E8\]                 →   text-text-primary
text-\[#888888?\]                →   text-text-secondary
text-\[#555555?\]                →   text-text-dim
bg-\[#CCFF00\]                   →   bg-accent-acid
text-\[#CCFF00\]                 →   text-accent-acid
bg-\[#FF4D00\]                   →   bg-accent-lava
text-\[#FF4D00\]                 →   text-accent-lava
```

### Per-Component Changes

```
┌──────────────────────────┬───────────────────────────────────────────────┐
│ Component                │ Required Changes                             │
├──────────────────────────┼───────────────────────────────────────────────┤
│ ui/Card.tsx              │ bg-[#0A0A0A] → bg-bg-card                    │
│                          │ border-[#2A2A2B] → border-border-subtle      │
│                          │ hover shadow → shadow-card-hover             │
│                          │                                               │
│ ui/Badge.tsx             │ Tier colors: hardcoded hex → TIER_BG_CLASS   │
│                          │                                               │
│ ui/Button.tsx            │ bg-[#CCFF00] → bg-accent-acid               │
│                          │ text-[#000] → text-black (stays black both)  │
│                          │                                               │
│ ui/Input.tsx             │ bg → bg-bg-card                               │
│                          │ border → border-border-subtle                 │
│                          │ focus ring → ring-accent-acid                 │
│                          │                                               │
│ ui/StatBar.tsx           │ Track bg → bg-border-subtle                   │
│                          │ Fill bg → bg-accent-acid                      │
│                          │ Glow → shadow-acid-glow (on hover)           │
│                          │                                               │
│ ui/RatingNumber.tsx      │ Color → TIER_TEXT_CLASS[tier]                 │
│                          │ Glow shadow → dark mode only: dark:shadow-*  │
│                          │                                               │
│ ui/Skeleton.tsx          │ Shimmer bg → bg-bg-elevated                   │
│                          │ Shimmer highlight → bg-border-subtle          │
│                          │                                               │
│ ui/SectionHeader.tsx     │ Text colors → text-text-primary/secondary    │
│                          │                                               │
│ layout/Header.tsx        │ bg-[#000]/80 → bg-bg-surface/80             │
│                          │ backdrop-blur: unchanged                      │
│                          │ ADD: <ThemeToggle />                          │
│                          │                                               │
│ layout/Footer.tsx        │ bg → bg-bg-surface                            │
│                          │ border → border-border-subtle                 │
│                          │                                               │
│ landing/HeroSection.tsx  │ Gradient overlays → use bg-bg-base            │
│                          │ Floating stat cards → bg-bg-card              │
│                          │                                               │
│ landing/StatsRibbon.tsx  │ bg → bg-bg-surface                            │
│                          │ Numbers → text-text-primary                   │
│                          │                                               │
│ landing/FeaturesGrid.tsx │ Cell bg → bg-bg-card                          │
│                          │ Hover top-border → border-accent-acid         │
│                          │                                               │
│ landing/TopPlayers.tsx   │ PlayerCard → use Card tokens                 │
│                          │                                               │
│ landing/CTABanner.tsx    │ Gradient border → accent-acid → accent-lava  │
│                          │ bg → bg-bg-card                               │
│                          │                                               │
│ player/PlayerCard.tsx    │ Image grayscale → dark mode only:             │
│                          │   grayscale-0 dark:grayscale-[50%]            │
│                          │   hover: grayscale-0 (both themes)            │
│                          │ Border glow → var(--shadow-acid-glow)         │
│                          │                                               │
│ charts/ (all Recharts)   │ Use useChartTheme() hook for all values      │
│                          │ Grid stroke, axis fill, tooltip, line color   │
└──────────────────────────┴───────────────────────────────────────────────┘
```

---

## STEP 9: Light Theme Design Philosophy

```
┌────────────────────────────────────────────────────────────┐
│              LIGHT THEME DESIGN PHILOSOPHY                 │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 1. BACKGROUND: Warm grey (#F5F5F5) instead of pure white   │
│    → Easier on the eyes, less glare, still professional    │
│                                                            │
│ 2. CARDS: White (#FFFFFF) with subtle box-shadow           │
│    → Stand out against grey bg, replacing dark mode glow   │
│                                                            │
│ 3. ACCENT: Darker acid green (#7AB800 vs #CCFF00)          │
│    → WCAG AA contrast on white background (3.8:1 ratio)    │
│    → Dark mode keeps neon #CCFF00 (works on black)         │
│                                                            │
│ 4. TIER COLORS: 30–40% darker versions                    │
│    → Readable on light backgrounds                         │
│    → Dark mode keeps neon colors for "gaming" feel         │
│                                                            │
│ 5. SHADOWS: Light = real box-shadow, Dark = glow effects   │
│    → Same CSS variable, different values per theme         │
│                                                            │
│ 6. NOISE TEXTURE: Disabled in light (opacity: 0)           │
│    → Enabled in dark (opacity: 0.025) for gritty feel      │
│                                                            │
│ 7. PLAYER IMAGE GRAYSCALE: Dark mode only                  │
│    → Light: full-color images by default                   │
│    → Dark: grayscale → color on hover (keeps effect)       │
│                                                            │
│ 8. TRANSITION: 300ms ease on all color changes             │
│    → Smooth toggle, no jarring flickers                    │
│                                                            │
│ 9. OVERALL FEEL:                                           │
│    Light = Clean, professional, daytime-friendly            │
│    Dark = Gaming, immersive, acid neon, night-mode          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## FILE SUMMARY

```
INSTALL:
  pnpm add next-themes

CREATE NEW:
  src/components/ui/ThemeToggle.tsx    ← Sun/Moon toggle (uses next-themes)
  src/hooks/useChartTheme.ts           ← Recharts theme values (uses next-themes)

MODIFY:
  src/app/layout.tsx                   ← Wrap with <ThemeProvider>
  src/app/globals.css                  ← Dual :root (light) + .dark variables
  src/components/layout/Header.tsx     ← Add <ThemeToggle />
  src/lib/utils.ts                     ← TIER_COLORS using CSS var()
  src/lib/animations.ts                ← cardHover shadow using CSS var()

DELETE (no longer needed):
  src/stores/themeStore.ts             ← Replaced by next-themes

AUDIT (find & replace hardcoded hex → Tailwind tokens):
  src/components/ui/*.tsx              ← All UI primitives
  src/components/layout/*.tsx          ← Header, Footer
  src/components/landing/*.tsx         ← Hero, Stats, Features, TopPlayers, CTA
  src/components/player/*.tsx          ← PlayerCard, PlayerGrid, etc.
  src/components/charts/*.tsx          ← Use useChartTheme()
```

---

## TEST CHECKLIST

```
□ First visit (no localStorage) → Light theme loads
□ Toggle to Dark → reload → persists as Dark
□ Clear localStorage → respects OS prefers-color-scheme
□ No white/dark flash on reload (next-themes anti-FOUC)
□ Smooth 300ms transition when toggling
□ All text readable in both themes (contrast check)
□ Tier badges clearly distinguishable on light and dark
□ Chart tooltips/grid use correct theme colors
□ Card shadow: light = box-shadow, dark = acid glow
□ Noise overlay: visible only in dark mode
□ Player image grayscale: dark mode only
□ Scrollbar matches current theme
□ Selection highlight uses correct colors
□ Mobile responsive: toggle works on all breakpoints
□ 3-state toggle (if used): Light / System / Dark all work
□ resolvedTheme correctly resolves "system" → actual "light"/"dark"
□ No hydration mismatch warnings in console
```