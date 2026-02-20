# 🎨 ARCADE ARENA — Prompt Thêm Light/Dark Theme

## Chuyển từ Dark-only → Dual Theme (Light mặc định + Dark toggle)

---

### CONTEXT HIỆN TẠI

```
Stack:        Next.js 16 + React 19 + Tailwind CSS v4 (@theme inline)
UI Library:   KHÔNG — tất cả components tự viết (Badge, Button, Card, Input, StatBar...)
State:        Zustand
Fonts:        Chakra Petch (display) + Be Vietnam Pro (body) + JetBrains Mono (mono)
Theme hiện:   Dark only — hardcoded CSS variables trong :root
Tailwind v4:  Dùng @theme inline thay vì tailwind.config.ts
```

### MỤC TIÊU

1. **Light theme là mặc định** (lần đầu truy cập = light)
2. **Dark theme giữ nguyên** aesthetic gaming hiện tại
3. Toggle switch ở Header
4. Lưu preference vào `localStorage`
5. Respect `prefers-color-scheme` nếu chưa có preference
6. **Không flash** (FOUC) khi load page
7. Không cài thêm thư viện nào (không next-themes) — tự implement

---

### BƯỚC 1: Anti-Flash Script (`src/app/layout.tsx`)

Thêm inline script vào `<head>` để set theme TRƯỚC khi React hydrate:

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

        {/* Anti-FOUC: set theme class trước khi render */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('arcade-arena-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = stored || (prefersDark ? 'dark' : 'light');
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-body bg-base text-primary antialiased transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
```

---

### BƯỚC 2: CSS Variables — Dual Theme (`src/app/globals.css`)

Thay thế toàn bộ `:root` hiện tại. Giữ nguyên `@theme inline` cho Tailwind v4:

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

  /* Accent — giữ acid green nhưng đậm hơn cho light */
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

  /* Tier Colors — tối hơn cho nền sáng, đảm bảo contrast */
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

  /* Shadows */
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-acid-glow: 0 0 20px rgba(122, 184, 0, 0.15);

  /* Noise overlay */
  --noise-opacity: 0;

  /* Scrollbar */
  --scrollbar-thumb: #D1D1D1;
  --scrollbar-track: #F5F5F5;

  /* Selection */
  --selection-bg: #7AB800;
  --selection-text: #FFFFFF;
}

/* ═══════════════════════════════════════════
   DARK THEME (toggle hoặc prefers-color-scheme)
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

  /* Accent — neon sáng cho dark bg */
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

  /* Tier Colors — neon sáng trên nền tối */
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

  /* Shadows */
  --shadow-card: none;
  --shadow-card-hover: 0 0 40px rgba(204, 255, 0, 0.15);
  --shadow-acid-glow: 0 0 40px rgba(204, 255, 0, 0.15);

  /* Noise overlay */
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

/* Noise texture — chỉ hiện ở dark mode */
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

### BƯỚC 3: Theme Store (`src/stores/themeStore.ts`)

```typescript
import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem('arcade-arena-theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: getInitialTheme(),

  setTheme: (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('arcade-arena-theme', theme);
    set({ theme });
  },

  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', next === 'dark');
      localStorage.setItem('arcade-arena-theme', next);
      return { theme: next };
    });
  },
}));
```

---

### BƯỚC 4: Theme Toggle Component (`src/components/ui/ThemeToggle.tsx`)

```tsx
'use client';

import { useThemeStore } from '@/stores/themeStore';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="
        relative flex items-center justify-center
        w-10 h-10 rounded-lg
        bg-bg-elevated border border-border-subtle
        hover:border-border-hover
        transition-all duration-300
        cursor-pointer
        group
      "
      aria-label={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
    >
      <AnimatePresence mode="wait">
        {theme === 'light' ? (
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

---

### BƯỚC 5: Thêm ThemeToggle vào Header (`src/components/layout/Header.tsx`)

```tsx
// Trong Header component, thêm ThemeToggle cạnh nav links:
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Trong JSX, vị trí phải cùng row với nav:
<div className="flex items-center gap-3">
  <ThemeToggle />
  {/* ...existing nav links, CTA button... */}
</div>
```

---

### BƯỚC 6: Cập Nhật `src/lib/utils.ts`

Thêm tier colors mapping dùng CSS variables thay vì hardcoded hex:

```typescript
// CẬP NHẬT — Dùng CSS variable thay vì hardcoded hex
export const TIER_COLORS: Record<TierKey, string> = {
  S: 'var(--tier-s)',
  A: 'var(--tier-a)',
  B: 'var(--tier-b)',
  C: 'var(--tier-c)',
  D: 'var(--tier-d)',
  F: 'var(--tier-f)',
};

// Tailwind class mapping (dùng cho className, không dùng inline style)
export const TIER_TEXT_CLASS: Record<TierKey, string> = {
  S: 'text-tier-s',
  A: 'text-tier-a',
  B: 'text-tier-b',
  C: 'text-tier-c',
  D: 'text-tier-d',
  F: 'text-tier-f',
};

export const TIER_BG_CLASS: Record<TierKey, string> = {
  S: 'bg-tier-s/10 text-tier-s border-tier-s/30',
  A: 'bg-tier-a/10 text-tier-a border-tier-a/30',
  B: 'bg-tier-b/10 text-tier-b border-tier-b/30',
  C: 'bg-tier-c/10 text-tier-c border-tier-c/30',
  D: 'bg-tier-d/10 text-tier-d border-tier-d/30',
  F: 'bg-tier-f/10 text-tier-f border-tier-f/30',
};
```

---

### BƯỚC 7: Cập Nhật Animations (`src/lib/animations.ts`)

Card hover cần dùng CSS variable cho shadow:

```typescript
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
```

---

### BƯỚC 8: Component Updates Checklist

Các components hiện tại dùng hardcoded dark colors cần rà soát:

```
┌──────────────────────────┬───────────────────────────────────────────────┐
│ Component                │ Cần thay đổi                                 │
├──────────────────────────┼───────────────────────────────────────────────┤
│ ui/Card.tsx              │ bg-[#0A0A0A] → bg-bg-card                    │
│                          │ border-[#2A2A2B] → border-border-subtle      │
│                          │ hover shadow → shadow-card-hover             │
│                          │                                               │
│ ui/Badge.tsx             │ Tier colors: hardcoded hex → TIER_BG_CLASS   │
│                          │                                               │
│ ui/Button.tsx            │ bg-[#CCFF00] → bg-accent-acid               │
│                          │ text-[#000] → Cần check contrast cả 2 theme  │
│                          │ Nút primary: light=dark text, dark=dark text  │
│                          │                                               │
│ ui/Input.tsx             │ bg → bg-bg-card                               │
│                          │ border → border-border-subtle                 │
│                          │ focus ring → ring-accent-acid                 │
│                          │                                               │
│ ui/StatBar.tsx           │ Track bg → bg-border-subtle                   │
│                          │ Fill bg → bg-accent-acid                      │
│                          │ Glow → shadow-acid-glow (hover)              │
│                          │                                               │
│ ui/RatingNumber.tsx      │ Color → TIER_TEXT_CLASS[tier]                 │
│                          │ Glow shadow → chỉ dark mode                  │
│                          │                                               │
│ ui/Skeleton.tsx          │ shimmer bg → bg-bg-elevated                   │
│                          │ shimmer highlight → bg-border-subtle          │
│                          │                                               │
│ ui/SectionHeader.tsx     │ Text colors → text-text-primary/secondary    │
│                          │                                               │
│ layout/Header.tsx        │ bg-[#000]/80 → bg-bg-surface/80             │
│                          │ backdrop-blur giữ nguyên                      │
│                          │ Thêm <ThemeToggle />                          │
│                          │                                               │
│ layout/Footer.tsx        │ bg → bg-bg-surface                            │
│                          │ border → border-border-subtle                 │
│                          │                                               │
│ landing/HeroSection.tsx  │ Gradient overlays → dùng bg-bg-base           │
│                          │ Float stat cards → bg-bg-card                 │
│                          │                                               │
│ landing/StatsRibbon.tsx  │ bg → bg-bg-surface                            │
│                          │ Numbers → text-text-primary                   │
│                          │                                               │
│ landing/FeaturesGrid.tsx │ Cell bg → bg-bg-card                          │
│                          │ Hover top-border → border-accent-acid         │
│                          │                                               │
│ landing/TopPlayers.tsx   │ PlayerCard → dùng Card tokens                │
│                          │                                               │
│ landing/CTABanner.tsx    │ Gradient border → accent-acid → accent-lava  │
│                          │ bg → bg-bg-card                               │
│                          │                                               │
│ player/PlayerCard.tsx    │ Image grayscale → chỉ dark mode:             │
│                          │   dark:grayscale-[50%] grayscale-0            │
│                          │ Border glow → var(--shadow-acid-glow)         │
│                          │                                               │
│ charts/ (Recharts)       │ Grid stroke → var(--border-subtle)            │
│                          │ Axis fill → var(--text-dim)                   │
│                          │ Tooltip bg → var(--bg-card)                   │
│                          │ Line stroke → var(--accent-acid)              │
└──────────────────────────┴───────────────────────────────────────────────┘
```

**Pattern chung để tìm & thay:**

```
TÌM (regex):                        THAY BẰNG:
─────────────────────────────────────────────────────
bg-\[#121212\]                   →   bg-bg-base
bg-\[#1A1A1B\]                   →   bg-bg-elevated
bg-\[#000000?\]                  →   bg-bg-surface
bg-\[#0A0A0A\]                   →   bg-bg-card
border-\[#2A2A2B\]               →   border-border-subtle
border-\[#3A3A3B\]               →   border-border-hover
text-\[#E8E8E8\]                 →   text-text-primary
text-\[#888888?\]                →   text-text-secondary
text-\[#555555?\]                →   text-text-dim
bg-\[#CCFF00\]                   →   bg-accent-acid
text-\[#CCFF00\]                 →   text-accent-acid
bg-\[#FF4D00\]                   →   bg-accent-lava
```

---

### BƯỚC 9: Light Theme Design Notes

```
┌────────────────────────────────────────────────────────────┐
│              LIGHT THEME DESIGN PHILOSOPHY                 │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 1. NỀN: Warm grey (#F5F5F5) thay vì trắng tinh           │
│    → Dễ nhìn, bớt chói, vẫn chuyên nghiệp                │
│                                                            │
│ 2. CARD: Trắng (#FFFFFF) + subtle shadow                  │
│    → Nổi bật trên nền grey, thay thế border glow          │
│                                                            │
│ 3. ACCENT: Acid green tối hơn (#7AB800 thay vì #CCFF00)   │
│    → WCAG AA contrast trên nền trắng (ratio 3.8:1)        │
│    → Dark mode giữ neon #CCFF00 vì trên nền đen OK        │
│                                                            │
│ 4. TIER COLORS: Tối hơn 30-40%                            │
│    → Đảm bảo đọc được trên nền sáng                       │
│    → Dark mode giữ nguyên neon cho "gaming" feel           │
│                                                            │
│ 5. SHADOWS: Light dùng box-shadow thật                     │
│    → Dark mode dùng glow (acid green shadow)               │
│    → Cùng 1 variable, khác giá trị                        │
│                                                            │
│ 6. NOISE TEXTURE: Tắt ở light mode                        │
│    → opacity: 0 (light) vs 0.025 (dark)                   │
│                                                            │
│ 7. PLAYER IMAGE GRAYSCALE: Chỉ dark mode                  │
│    → Light mode: ảnh full color luôn                       │
│    → Dark mode: grayscale → color on hover (giữ hiệu ứng) │
│                                                            │
│ 8. TRANSITION: 300ms ease cho tất cả color changes         │
│    → Smooth, không giật                                    │
│                                                            │
│ 9. SCROLLBAR: Light grey thumb trên light track            │
│    → Dark: dark thumb trên dark track                      │
│                                                            │
│ 10. OVERALL FEEL:                                          │
│     Light = Clean, professional, dễ đọc ban ngày           │
│     Dark = Gaming, immersive, acid neon, đêm khuya         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### BƯỚC 10: Recharts Theme Hook (`src/hooks/useChartTheme.ts`)

```typescript
'use client';

import { useThemeStore } from '@/stores/themeStore';

export function useChartTheme() {
  const { theme } = useThemeStore();

  return {
    grid: theme === 'dark' ? '#2A2A2B' : '#E5E5E5',
    axis: theme === 'dark' ? '#555555' : '#A0A0A0',
    tooltip: {
      bg: theme === 'dark' ? '#0A0A0A' : '#FFFFFF',
      border: theme === 'dark' ? '#2A2A2B' : '#E5E5E5',
      text: theme === 'dark' ? '#E8E8E8' : '#1A1A1A',
    },
    accent: theme === 'dark' ? '#CCFF00' : '#7AB800',
    lava: theme === 'dark' ? '#FF4D00' : '#E04400',
    areaFill: theme === 'dark' ? 'rgba(204,255,0,0.08)' : 'rgba(122,184,0,0.06)',
    tierColors: theme === 'dark'
      ? { S:'#CCFF00', A:'#00FF88', B:'#00AAFF', C:'#FFB800', D:'#FF4D00', F:'#FF4444' }
      : { S:'#6B9E00', A:'#00B35F', B:'#0088CC', C:'#CC9200', D:'#CC3D00', F:'#CC3333' },
  };
}
```

Dùng trong Recharts components:

```tsx
// Ví dụ trong RadarChart.tsx:
const chartTheme = useChartTheme();

<ResponsiveContainer>
  <RadarChart data={data}>
    <PolarGrid stroke={chartTheme.grid} />
    <PolarAngleAxis tick={{ fill: chartTheme.axis, fontSize: 11 }} />
    <Radar fill={chartTheme.accent} fillOpacity={0.3} stroke={chartTheme.accent} />
    <Tooltip
      contentStyle={{
        backgroundColor: chartTheme.tooltip.bg,
        border: `1px solid ${chartTheme.tooltip.border}`,
        color: chartTheme.tooltip.text,
        borderRadius: '4px',
      }}
    />
  </RadarChart>
</ResponsiveContainer>
```

---

### TÓM TẮT FILES CẦN TẠO / SỬA

```
TẠO MỚI:
  src/stores/themeStore.ts          ← Zustand store
  src/components/ui/ThemeToggle.tsx  ← Sun/Moon toggle button
  src/hooks/useChartTheme.ts        ← Recharts theme values

SỬA:
  src/app/globals.css               ← Dual :root + .dark variables
  src/app/layout.tsx                ← Anti-flash script + suppressHydrationWarning
  src/components/layout/Header.tsx  ← Thêm <ThemeToggle />
  src/lib/utils.ts                  ← TIER_COLORS dùng CSS var()
  src/lib/animations.ts             ← cardHover shadow dùng CSS var()

RÀ SOÁT (find & replace hardcoded hex → Tailwind tokens):
  src/components/ui/*.tsx           ← Tất cả UI primitives
  src/components/layout/*.tsx       ← Header, Footer
  src/components/landing/*.tsx      ← Hero, Stats, Features, TopPlayers, CTA
  src/components/player/*.tsx       ← PlayerCard, PlayerGrid, etc.
  src/components/charts/*.tsx       ← Dùng useChartTheme()
```

---

### TEST CHECKLIST

```
□ Mở trang lần đầu (no localStorage) → Light theme
□ Toggle → Dark → reload → vẫn Dark (localStorage)
□ Xoá localStorage → respect prefers-color-scheme
□ Không flash trắng/đen khi reload (anti-FOUC script)
□ Transition mượt 300ms khi toggle
□ Tất cả text đọc được trên cả 2 theme (contrast check)
□ Tier badges rõ ràng trên cả light và dark
□ Charts tooltip/grid đúng màu theo theme
□ Card shadow: light=box-shadow, dark=glow
□ Noise overlay: chỉ hiện dark mode
□ Player image grayscale: chỉ dark mode
□ Scrollbar phù hợp với theme
□ Selection highlight đúng màu
□ Mobile responsive: toggle vẫn hoạt động
```