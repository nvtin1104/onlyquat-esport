# Dashboard — Color System & Package Analysis

> Generated: 2026-02-20

---

## 1. Tech Stack & Packages

| Category | Package | Version | Purpose |
|---|---|---|---|
| **Build** | `vite` | ^7.3.1 | Dev server + bundler (SPA) |
| **Framework** | `react` / `react-dom` | ^19.2.4 | React 19 |
| **Routing** | `react-router-dom` | ^7.13 | Client-side SPA routing |
| **Styling** | `tailwindcss` v4 + `@tailwindcss/vite` | ^4.2 | Vite plugin (không dùng PostCSS) |
| **Class Utils** | `clsx` + `tailwind-merge` | ^2.1 / ^3.4 | `cn()` helper |
| **Animation** | `framer-motion` | ^12.34 | Motion effects |
| **Icons** | `lucide-react` | ^0.574 | Icon library |
| **Charts** | `recharts` | ^3.7 | Data visualization (line, area, bar, pie) |
| **HTTP** | `axios` | ^1.13 | API calls + JWT interceptors |
| **Forms** | `react-hook-form` + `@hookform/resolvers` | ^7.71 / ^5.2 | Form management |
| **Validation** | `zod` | ^4.3 | Schema validation |
| **Table** | `@tanstack/react-table` | ^8.21 | Headless data tables |
| **Dates** | `date-fns` | ^4.1 | Date formatting |
| **State** | `zustand` + persist middleware | ^5.0.11 | Auth state + localStorage |

### So sánh Dashboard vs Client

| | Client (Public) | Dashboard (Admin) |
|---|---|---|
| Build tool | **Next.js 16** (SSR) | **Vite 7** (SPA) |
| Routing | App Router (file-based) | `react-router-dom` (code-based) |
| Tailwind plugin | `@tailwindcss/postcss` | `@tailwindcss/vite` |
| HTTP | Không có | `axios` (interceptors, refresh token) |
| Forms | Không có | `react-hook-form` + `zod` |
| Tables | Không có | `@tanstack/react-table` |
| Auth | Không có | Zustand persist + JWT token manager |
| Theme switching | Không có (dark-only) | Không có (dark-only) |

---

## 2. Color System — CSS Custom Properties

Khai báo trong `src/globals.css` via `@theme inline` (Tailwind v4). **Dark-only** — không có `:root` / `.dark` switching.

### 2.1. Background Colors

| Tailwind Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| `bg-bg-base` | `--color-bg-base` | `#121212` | Main background, page bg |
| `bg-bg-elevated` | `--color-bg-elevated` | `#1A1A1B` | Active sidebar, table hover rows |
| `bg-bg-surface` | `--color-bg-surface` | `#000000` | Sidebar bg, header bg |
| `bg-bg-card` | `--color-bg-card` | `#0A0A0A` | Cards, inputs, dialogs, tooltips |

### 2.2. Border Colors

| Tailwind Token | CSS Variable | Hex |
|---|---|---|
| `border-border-subtle` | `--color-border-subtle` | `#2A2A2B` |
| `border-border-hover` | `--color-border-hover` | `#3A3A3B` |

### 2.3. Accent Colors

| Tailwind Token | CSS Variable | Hex | Description |
|---|---|---|---|
| `accent-acid` | `--color-accent-acid` | `#CCFF00` | **Primary accent** — acid green neon |
| `accent-lava` | `--color-accent-lava` | `#FF4D00` | **Secondary accent** — lava orange |
| `accent-acid-dim` | `--color-accent-acid-dim` | `rgba(204,255,0,0.12)` | Subtle background tint |
| `accent-acid-glow` | `--color-accent-acid-glow` | `rgba(204,255,0,0.4)` | Glow/shadow effect |
| `accent-lava-dim` | `--color-accent-lava-dim` | `rgba(255,77,0,0.12)` | Subtle background tint |
| `accent-lava-glow` | `--color-accent-lava-glow` | `rgba(255,77,0,0.4)` | Glow/shadow effect |

### 2.4. Text Colors

| Tailwind Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| `text-text-primary` | `--color-text-primary` | `#E8E8E8` | Headings, body text, table data |
| `text-text-secondary` | `--color-text-secondary` | `#888888` | Labels, meta info, sidebar items |
| `text-text-dim` | `--color-text-dim` | `#555555` | Placeholders, muted text, disabled |

### 2.5. Tier Colors — 6 ranking tiers

| Tier | Tailwind Token | Hex | Threshold |
|---|---|---|---|
| **S** | `tier-s` | `#CCFF00` | ≥ 9.0 |
| **A** | `tier-a` | `#00FF88` | ≥ 8.0 |
| **B** | `tier-b` | `#00AAFF` | ≥ 7.0 |
| **C** | `tier-c` | `#FFB800` | ≥ 6.0 |
| **D** | `tier-d` | `#FF4D00` | ≥ 5.0 |
| **F** | `tier-f` | `#FF4444` | < 5.0 |

### 2.6. Semantic Colors

| Tailwind Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| `success` | `--color-success` | `#00FF88` | Approved, active states |
| `warning` | `--color-warning` | `#FFB800` | Pending, caution states |
| `danger` | `--color-danger` | `#FF4444` | Rejected, banned, errors |
| `info` | `--color-info` | `#00AAFF` | Informational states |

### 2.7. Typography & Easing

| Token | Value | Usage |
|---|---|---|
| `font-display` | Chakra Petch | Headings, branding |
| `font-body` | Be Vietnam Pro | Body text (Vietnamese-optimized) |
| `font-mono` | JetBrains Mono | Code, stats, numbers |
| `ease-out-expo` | `cubic-bezier(.23, 1, .32, 1)` | Smooth deceleration |

### 2.8. Hardcoded Global Styles (not tokenized)

| Element | Property | Value |
|---|---|---|
| `*` (scrollbar) | `scrollbar-color` | `#2A2A2B #121212` |
| `::selection` | `background` / `color` | `#CCFF00` / `#121212` |

---

## 3. Color Usage Audit — Token vs Hardcoded

### ✅ Files Using Token-Based Colors Correctly

Phần lớn UI components và pages sử dụng đúng design tokens:

| Layer | Files | Tokens Used |
|---|---|---|
| **UI Primitives** (18 files) | `Badge`, `Button`, `Input`, `Select`, `Textarea`, `Checkbox`, `Switch`, `Dialog`, `Sheet`, `Table`, `Tabs`, `Toast`, `Tooltip`, `DropdownMenu`, `Label`, `Avatar`, `Separator` | `bg-bg-*`, `text-text-*`, `border-border-*`, `bg-accent-*`, `text-accent-*`, `bg-tier-*/10`, `text-tier-*`, `bg-success/*`, `text-success`, etc. |
| **Layout** (5 files) | `DashboardLayout`, `Sidebar`, `DashboardHeader`, `ProtectedRoute`, `UserMenu` | `bg-bg-base`, `bg-bg-surface`, `bg-bg-elevated`, `border-border-subtle`, `bg-accent-acid`, `text-accent-acid` |
| **Shared** (10 files) | `PageHeader`, `DataCard`, `StatBar`, `EmptyState`, `ConfirmDialog`, `SearchInput` | `bg-bg-card`, `border-border-subtle`, `bg-accent-acid` |
| **Pages** (10 files) | `LoginPage`, `SettingsPage`, `TeamsPage`, `MatchesPage`, `PointsPage`, etc. | Đúng token system |
| **Feature components** | `PlayersTable`, `PlayerForm`, `BulkActionsBar`, `UsersTable`, `TeamsTable`, `TeamRosterSheet`, `MatchesTable`, `TransactionsTable`, `GiftPointsDialog`, `RatingCard`, `RejectDialog` | Đúng token system |

### ⚠️ Files With Hardcoded Hex Colors (cần migrate)

#### 3.1. `lib/utils.ts` — TIER_COLORS constant

```typescript
// HIỆN TẠI — hardcoded hex
export const TIER_COLORS: Record<TierKey, string> = {
  S: '#CCFF00',  // duplicate of --color-tier-s
  A: '#00FF88',  // duplicate of --color-tier-a
  B: '#00AAFF',  // duplicate of --color-tier-b
  C: '#FFB800',  // duplicate of --color-tier-c
  D: '#FF4D00',  // duplicate of --color-tier-d
  F: '#FF4444',  // duplicate of --color-tier-f
};
```

**Ảnh hưởng:** Dùng bởi `TierBadge`, `RatingNumber`, `RatingCard`, `TeamsTable`, `PlayersTable`, `SettingsPage` qua `style={{ color }}` inline.

#### 3.2. `shared/GameBadge.tsx` — GAME_COLORS constant

```typescript
// Hex colors KHÔNG CÓ CSS variable tương ứng
GAME_COLORS = {
  LoL: '#C89B3C',    // Gold
  VAL: '#FF4654',    // Red
  CS2: '#DE9B35',    // Orange
  Dota2: '#E05926',  // Burnt orange
  fallback: '#6B7280' // Grey
};
```

**Dùng trong inline styles:** `style={{ backgroundColor, color, border }}`

#### 3.3. `shared/StatusBadge.tsx` — Unused hex in STATUS_CONFIG

```typescript
// STATUS_CONFIG.color fields (hex) — CÓ khai báo nhưng KHÔNG DÙNG
// Component thực tế dùng Tailwind classes (dotClass, textClass)
{ color: '#22c55e' }  // unused
{ color: '#eab308' }  // unused
{ color: '#ef4444' }  // unused
{ color: '#3b82f6' }  // unused
```

#### 3.4. Overview Components — Inline style hex colors

| File | Hardcoded Hex | Nên thay bằng |
|---|---|---|
| `overview/TopPlayersList.tsx` | `#0A0A0A`, `#2A2A2B` ×3, `#CCFF00` ×3, `#555555` | `var(--color-bg-card)`, `var(--color-border-subtle)`, `var(--color-accent-acid)`, `var(--color-text-dim)` |
| `overview/TierDistributionChart.tsx` | `#0A0A0A` ×2, `#2A2A2B` ×2 | `var(--color-bg-card)`, `var(--color-border-subtle)` |
| `overview/RecentRatingsTable.tsx` | `#0A0A0A`, `#2A2A2B` ×2, `#CCFF00` | `var(--color-bg-card)`, `var(--color-border-subtle)`, `var(--color-accent-acid)` |
| `overview/RatingTrendChart.tsx` | `#0A0A0A` ×2, `#2A2A2B` ×3, `#555555`, `#CCFF00` ×2 | Tương tự |
| `overview/QuickActions.tsx` | `#0A0A0A`, `#2A2A2B` | Tương tự |

#### 3.5. Recharts Components — JSX props with hex

| File | Hex in Props | Nên thay bằng |
|---|---|---|
| `points/PointsCharts.tsx` | `stroke="#CCFF00"`, `fill="#CCFF00"`, `stroke="#2A2A2B"`, `fill: '#555555'` (tick), `#FF4444` (negative bar) | CSS vars hoặc chart theme hook |
| `overview/RatingTrendChart.tsx` | `stroke="#CCFF00"`, `fill="#CCFF00"`, `stroke="#2A2A2B"`, `fill: '#555555'` (tick) | CSS vars hoặc chart theme hook |

#### 3.6. `data/mock-data.ts` — Embedded hex in tier distribution data

Tier distribution data chứa `color: '#CCFF00'` etc. — duplicate `TIER_COLORS`.

#### 3.7. Button.tsx — Arbitrary shadow value

```
shadow-[0_0_20px_rgba(204,255,0,0.3)]  // hardcoded in className
```

---

## 4. Tổng hợp vấn đề & Migration Map

### Thống kê tổng

| Status | Count | Files |
|---|---|---|
| ✅ Token-based (đúng) | ~40 files | UI, layout, shared, pages, feature components |
| ⚠️ Hardcoded hex | ~12 files | utils, charts, overview, mock-data, GameBadge |
| 🚫 `dark:` prefix | 0 files | Không có — pure dark-only |
| 🚫 Light theme | 0 | Chưa có light theme |
| 🚫 Theme toggle | 0 | Chưa có |

### Migration Priority

```
P0 (CRITICAL — blocks theme switching):
├── globals.css          → Add :root (light) + .dark (dark) variables
├── lib/utils.ts         → TIER_COLORS hex → var(--tier-*) CSS vars
└── mock-data.ts         → Remove embedded hex colors

P1 (HIGH — visible inline styles):
├── overview/*.tsx       → Replace all #hex → var(--color-*)
├── points/PointsCharts  → Use chart theme hook
└── shared/GameBadge.tsx → Add game color CSS variables

P2 (MEDIUM — Recharts theming):
├── RatingTrendChart.tsx → Chart theme hook
├── PointsCharts.tsx     → Chart theme hook
└── TierDistributionChart→ Chart theme hook

P3 (LOW — cleanup):
├── StatusBadge.tsx      → Remove unused hex color fields
├── Button.tsx           → Replace hardcoded rgba shadow
└── scrollbar + selection→ Use CSS variables
```

---

## 5. Đối chiếu Client Theme Prompt → Dashboard

Prompt `update-theme-client.md` đã thiết kế hệ thống dual-theme cho Client. Dưới đây là mapping tương ứng cho Dashboard:

| Client Approach | Dashboard Equivalent |
|---|---|
| `next-themes` (ThemeProvider) | Cần giải pháp SPA — Zustand store hoặc custom `ThemeProvider` (không có SSR) |
| `:root` / `.dark` CSS vars | Giống hệt — apply trực tiếp |
| `@theme inline` references `var()` | Giống hệt |
| `useChartTheme()` hook | Cần tạo — Recharts dùng rất nhiều trong dashboard |
| `ThemeToggle` component | Cần tạo — đặt trong `DashboardHeader` |
| `TIER_COLORS` → `var(--tier-*)` | Giống hệt — cùng constant structure |

### Key Differences

1. **Dashboard = Vite SPA** → không dùng `next-themes`, cần custom theme provider bằng Zustand hoặc React context
2. **Dashboard có nhiều Recharts hơn** → `useChartTheme()` hook quan trọng hơn
3. **Dashboard có nhiều inline style hex hơn** → cần audit & replace nhiều hơn
4. **Dashboard có `GAME_COLORS`** — cần thêm CSS variables cho game colors (Client không có)
5. **Dashboard không có noise overlay** — không cần `--noise-opacity`

---

## 6. Summary

| Aspect | Detail |
|---|---|
| **Theme** | Dark-only, cùng palette với Client |
| **Token adoption** | ~77% files dùng đúng tokens, ~23% còn hardcoded hex |
| **Biggest leaks** | Overview charts, TIER_COLORS constant, GameBadge, mock-data |
| **No `dark:` prefix** | 0 usage — cần thêm khi migrate sang dual-theme |
| **Fonts** | Cùng Client: Chakra Petch + Be Vietnam Pro + JetBrains Mono |
| **Package count** | 16 dependencies (Client: 9) — thêm axios, react-hook-form, zod, tanstack-table, date-fns, react-router-dom |
| **Theme switching** | Chưa có — cần implement cho dashboard riêng (không dùng next-themes) |
