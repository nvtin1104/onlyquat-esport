# Client Theme & Package Analysis

> Generated: 2026-02-20

---

## 1. Tech Stack & Packages

| Category | Package | Version | Purpose |
|---|---|---|---|
| **Framework** | `next` | 16.1.6 | App Router (React 19) |
| **UI Runtime** | `react` / `react-dom` | 19.2.3 | React 19 |
| **Styling** | `tailwindcss` v4 + `@tailwindcss/postcss` | ^4 | Utility-first CSS (v4 uses `@theme inline` instead of `tailwind.config`) |
| **Class Utils** | `clsx` + `tailwind-merge` | ^2.1 / ^3.4 | `cn()` helper for merging class names |
| **Animation** | `framer-motion` | ^12.34 | Motion variants, stagger, hover effects |
| **Icons** | `lucide-react` | ^0.564 | Icon library |
| **Charts** | `recharts` | ^3.7 | Data visualization |
| **State** | `zustand` | ^5.0.11 | Client-side state management (filter store) |
| **Linting** | `eslint` + `eslint-config-next` | ^9 / 16.1.6 | Core Web Vitals + TypeScript rules |

**No UI library used** — no shadcn/ui, Radix UI, or any component library. All UI components (`Badge`, `Button`, `Card`, `Input`, `RatingNumber`, `SectionHeader`, `Skeleton`, `StatBar`) are **hand-crafted**.

---

## 2. Color System (Theme)

Declared in `src/app/globals.css` via `@theme inline` (Tailwind v4 syntax) + `:root` CSS variables.

### 2.1. Background Colors — Dark-first

| Token | Hex | Usage |
|---|---|---|
| `bg-base` | `#121212` | Main background (body) |
| `bg-elevated` | `#1A1A1B` | Cards, elevated panels |
| `bg-surface` | `#000000` | Deepest background |
| `bg-overlay` | `rgba(0,0,0,0.85)` | Modal overlay |

### 2.2. Border Colors

| Token | Hex |
|---|---|
| `border-subtle` | `#2A2A2B` |
| `border-hover` | `#3A3A3B` |

### 2.3. Accent Colors — Gaming Palette

| Token | Hex | Description |
|---|---|---|
| **`accent-acid`** | `#CCFF00` | **Acid green** — primary accent |
| **`accent-lava`** | `#FF4D00` | **Lava orange** — secondary accent |
| `accent-acid-dim` | `rgba(204,255,0,0.12)` | Light background tint |
| `accent-acid-glow` | `rgba(204,255,0,0.4)` | Glow/shadow effect |
| `accent-lava-dim` | `rgba(255,77,0,0.12)` | Light background tint |
| `accent-lava-glow` | `rgba(255,77,0,0.4)` | Glow/shadow effect |

### 2.4. Text Colors

| Token | Hex | Usage |
|---|---|---|
| `text-primary` | `#E8E8E8` | Heading, body text |
| `text-secondary` | `#888888` | Subtitle, labels |
| `text-dim` | `#555555` | Placeholder, muted text |

### 2.5. Tier Colors — 6 ranking tiers

| Tier | Color Name | Hex | Threshold |
|---|---|---|---|
| **S** | Acid Green | `#CCFF00` | ≥ 9.0 |
| **A** | Emerald | `#00FF88` | ≥ 8.0 |
| **B** | Cyan Blue | `#00AAFF` | ≥ 7.0 |
| **C** | Amber | `#FFB800` | ≥ 6.0 |
| **D** | Lava Orange | `#FF4D00` | ≥ 5.0 |
| **F** | Red | `#FF4444` | < 5.0 |

---

## 3. Typography

| Token | Font Family | Usage |
|---|---|---|
| `font-display` | **Chakra Petch** | Headings, large titles (gaming feel) |
| `font-body` | **Be Vietnam Pro** | Body text (Vietnamese-optimized) |
| `font-mono` | **JetBrains Mono** | Code, stats, numeric data |

All fonts loaded from Google Fonts via `@import url(...)` in `globals.css`.

---

## 4. Animation System

Defined in `src/lib/animations.ts` using Framer Motion `Variants`:

| Variant | Effect |
|---|---|
| `staggerContainer` | Stagger children by 0.08s |
| `fadeUpItem` | Fade in + translate Y from 30px to 0 |
| `cardHover` | Hover lift -8px + acid glow shadow `rgba(204,255,0,0.15)` |
| `fadeIn` | Simple opacity 0 → 1, 0.5s |
| `slideUp` | Fade in + translate Y from 20px to 0 |

**Easing curve:** `ease-out-expo` — `cubic-bezier(.23, 1, .32, 1)` (smooth deceleration)

---

## 5. Visual Effects

- **Noise texture overlay** on `body::before` — SVG `fractalNoise` filter, opacity 0.025, creates gritty/grain feel
- **Custom scrollbar** — thin style, `#2A2A2B` thumb on `#121212` track
- **Selection color** — acid green background (`#CCFF00`) + dark text (`#121212`)
- **Card hover glow** — box-shadow acid green 40px blur

---

## 6. Project Configuration

- **PostCSS:** `@tailwindcss/postcss` plugin only
- **TypeScript:** Strict mode, `bundler` module resolution, `@/*` path alias to `./src/*`
- **Next.js:** Remote images allowed from all HTTPS hosts
- **ESLint:** Next.js Core Web Vitals + TypeScript rules
- **No light mode** — single dark theme only

---

## 7. Component Architecture

```
src/components/
├── charts/          # Recharts-based visualizations
├── landing/         # Homepage sections
├── layout/          # Header, Footer, Navigation
├── player/          # Player-specific components
└── ui/              # Shared primitives
    ├── Badge.tsx
    ├── Button.tsx
    ├── Card.tsx
    ├── Input.tsx
    ├── RatingNumber.tsx
    ├── SectionHeader.tsx
    ├── Skeleton.tsx
    └── StatBar.tsx
```

---

## 8. Utility Functions

| Function | File | Purpose |
|---|---|---|
| `cn()` | `lib/utils.ts` | Merge Tailwind classes via `clsx` + `twMerge` |
| `getTierFromRating()` | `lib/utils.ts` | Rating number → Tier letter |
| `formatRating()` | `lib/utils.ts` | Number → "X.X" string |
| `formatNumber()` | `lib/utils.ts` | Number → "X.XK" format |
| `TIER_COLORS` | `lib/utils.ts` | Tier → hex color mapping |
| `TIER_THRESHOLDS` | `lib/constants.ts` | Tier → minimum rating |
| `NAV_LINKS` | `lib/constants.ts` | Navigation items |

---

## Summary

| Aspect | Detail |
|---|---|
| **Design Language** | Dark gaming aesthetic — acid green + lava orange |
| **UI Library** | None — all components hand-built with Tailwind v4 |
| **State Management** | Zustand (lightweight) |
| **Charts** | Recharts v3 |
| **Fonts** | Vietnamese-optimized (Be Vietnam Pro) + Gaming (Chakra Petch) + Monospace (JetBrains Mono) |
| **Theme Mode** | Dark only — no light mode |
| **Tailwind Version** | v4 — uses `@theme inline` instead of traditional config file |
