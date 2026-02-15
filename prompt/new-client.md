# 🎮 ARCADE ARENA — Frontend Spec (Next.js 15)

## Prompt xây dựng Frontend E-sports với phong cách "High-Contrast Stealth"

> **Phạm vi:** Chỉ Frontend. Dữ liệu dùng mock JSON. Không cần backend, database, hay auth thật. Mục tiêu là hoàn thiện toàn bộ giao diện, interaction, animation trước — backend ghép sau.

---

## 1. TECH STACK

```
Framework       Next.js 15          App Router + React Server Components
Language        TypeScript 5.x      Strict mode
Styling         Tailwind CSS 4      CSS Variables cho theme tokens
Animation       Framer Motion 12    Page transitions + micro-interactions
Charts          Recharts            Radar, Bar, Line, Pie charts
State           Zustand             Client state (filters, UI toggles)
Data Fetching   Mock JSON files     /data/*.json — thay bằng API sau
Font            Chakra Petch        Display headings (Vietnamese OK)
                Be Vietnam Pro      Body text (Vietnamese native)
                JetBrains Mono      Data, labels, numbers
Icons           Lucide React        Consistent, tree-shakable
Package Mgr     pnpm                Nhanh, tiết kiệm disk
```

### Khởi tạo dự án

```bash
pnpm create next-app@latest arcade-arena --typescript --tailwind --app --src-dir
cd arcade-arena
pnpm add framer-motion recharts zustand lucide-react
pnpm add -D @types/node
```

### Cấu hình `next.config.ts`

```typescript
const config = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};
export default config;
```

### Cấu hình `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Chakra Petch', 'sans-serif'],
        body: ['Be Vietnam Pro', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          base: '#121212',
          elevated: '#1A1A1B',
          surface: '#000000',
        },
        border: {
          subtle: '#2A2A2B',
          hover: '#3A3A3B',
        },
        accent: {
          acid: '#CCFF00',
          lava: '#FF4D00',
          'acid-dim': 'rgba(204,255,0,0.12)',
          'acid-glow': 'rgba(204,255,0,0.4)',
          'lava-dim': 'rgba(255,77,0,0.12)',
          'lava-glow': 'rgba(255,77,0,0.4)',
        },
        text: {
          primary: '#E8E8E8',
          secondary: '#888888',
          dim: '#555555',
        },
        tier: {
          s: '#CCFF00',
          a: '#00FF88',
          b: '#00AAFF',
          c: '#FFB800',
          d: '#FF4D00',
          f: '#FF4444',
        },
      },
    },
  },
  plugins: [],
};
export default config;
```

---

## 2. DESIGN SYSTEM TOKENS

### 2.1 CSS Variables (`globals.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Nền */
  --bg-base: #121212;
  --bg-elevated: #1A1A1B;
  --bg-surface: #000000;
  --bg-overlay: rgba(0, 0, 0, 0.85);

  /* Viền */
  --border-subtle: #2A2A2B;
  --border-hover: #3A3A3B;

  /* Accent */
  --accent-acid: #CCFF00;
  --accent-lava: #FF4D00;

  /* Text */
  --text-primary: #E8E8E8;
  --text-secondary: #888888;
  --text-dim: #555555;
}

* { scrollbar-width: thin; scrollbar-color: #2A2A2B #121212; }
::selection { background: #CCFF00; color: #121212; }

body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: 'Be Vietnam Pro', sans-serif;
}

/* Noise texture overlay */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
}
```

### 2.2 Typography Scale

| Token | Font | Weight | Size | Dùng cho |
|-------|------|--------|------|----------|
| `hero-title` | Chakra Petch | 700 | 48–64px | Hero heading |
| `section-title` | Chakra Petch | 700 | 28–36px | Section headings |
| `card-title` | Chakra Petch | 600 | 14–18px | Player name, card heading |
| `body` | Be Vietnam Pro | 400–500 | 15–16px | Paragraphs, descriptions |
| `label` | JetBrains Mono | 500 | 10–12px | "AIM", "WINRATE", tags |
| `data-lg` | JetBrains Mono | 700 | 32–48px | Rating numbers (9.8) |
| `data-sm` | JetBrains Mono | 500 | 12–14px | Stat values (96, 88) |
| `button` | Chakra Petch | 700 | 12–14px | CTA text |

### 2.3 Hover Interaction Rules

```
┌────────────────────────────────────────────────────────┐
│ COMPONENT          │ IDLE               │ HOVER        │
├────────────────────┼────────────────────┼──────────────┤
│ Player Card        │ border: subtle     │ border: acid │
│                    │ shadow: none       │ glow-acid    │
│                    │ y: 0               │ y: -8px      │
│                    │ img: grayscale(50%)│ grayscale(0) │
│                    │ img: scale(1)      │ scale(1.05)  │
│                    │ rating: white      │ rating: acid │
│                    │ stat-bars: no glow │ bars: glow   │
│                    │                    │              │
│ Stat Bar           │ fill: acid, flat   │ fill: + glow │
│                    │ tooltip: hidden    │ tooltip: show│
│                    │                    │              │
│ Rating Number      │ color: white       │ color: tier  │
│                    │ shadow: none       │ tier glow    │
│                    │ scale: 1           │ scale: 1.05  │
│                    │                    │              │
│ Button (Primary)   │ bg: acid           │ + glow-acid  │
│                    │ y: 0               │ y: -2px      │
│   clip-path: polygon cắt góc tactical  │              │
│                    │                    │              │
│ Nav Link           │ color: secondary   │ color: white │
│                    │ underline: 0%      │ underline→100│
│                    │                    │              │
│ Feature Cell       │ bg: surface        │ bg: elevated │
│                    │ top-border: 0%     │ acid → 100%  │
│                    │ icon-box: subtle   │ icon: acid   │
│                    │                    │              │
│ All transitions: 0.4s cubic-bezier(.23, 1, .32, 1)    │
└────────────────────────────────────────────────────────┘
```

---

## 3. CẤU TRÚC THƯ MỤC

```
src/
├── app/
│   ├── layout.tsx                    ← Root layout (fonts, metadata)
│   ├── globals.css                   ← CSS tokens + Tailwind
│   ├── page.tsx                      ← Landing page
│   ├── players/
│   │   ├── page.tsx                  ← Grid tuyển thủ + filter + search
│   │   └── [slug]/
│   │       └── page.tsx              ← Profile tuyển thủ chi tiết
│   ├── compare/
│   │   └── page.tsx                  ← Head-to-Head so sánh 2 player
│   ├── leaderboard/
│   │   └── page.tsx                  ← Bảng xếp hạng (sort, filter by game)
│   └── teams/
│       ├── page.tsx                  ← Grid đội tuyển
│       └── [slug]/
│           └── page.tsx              ← Profile đội tuyển + roster
│
├── components/
│   ├── ui/                           ← Base design system
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx                 ← Tier badge (S/A/B/C/D/F)
│   │   ├── Input.tsx
│   │   ├── StatBar.tsx               ← Thanh chỉ số ngang + hover glow
│   │   ├── RatingNumber.tsx          ← Số lớn + tier color
│   │   ├── Tooltip.tsx
│   │   ├── Skeleton.tsx              ← Dark shimmer loading
│   │   └── SectionHeader.tsx         ← Label + Title combo
│   │
│   ├── player/
│   │   ├── PlayerCard.tsx            ← Card trong grid
│   │   ├── PlayerGrid.tsx            ← Responsive grid wrapper
│   │   ├── PlayerProfile.tsx         ← Hero section trong profile page
│   │   ├── PlayerStats.tsx           ← Radar chart + detailed stat bars
│   │   ├── RatingForm.tsx            ← Slider form chấm điểm (mock)
│   │   └── RatingList.tsx            ← Danh sách đánh giá
│   │
│   ├── charts/
│   │   ├── RadarChart.tsx            ← 5-axis: Aim, IQ, Clutch, Team, Consist
│   │   ├── CompareChart.tsx          ← Side-by-side bar cho H2H
│   │   ├── TrendLine.tsx             ← Rating trend theo thời gian
│   │   └── TierDonut.tsx             ← Phân bố tier (pie chart)
│   │
│   ├── layout/
│   │   ├── Header.tsx                ← Fixed, backdrop-blur, dark
│   │   ├── Footer.tsx                ← Minimal
│   │   └── MobileNav.tsx             ← Hamburger menu
│   │
│   └── landing/
│       ├── HeroSection.tsx           ← Split layout: text + player showcase
│       ├── StatsRibbon.tsx           ← Counter animation (4 metrics)
│       ├── FeaturesGrid.tsx          ← 3-col grid, hover border anim
│       ├── TopPlayers.tsx            ← 4 featured PlayerCards
│       └── CTABanner.tsx             ← Bottom call-to-action
│
├── data/                             ← Mock JSON (thay bằng API sau)
│   ├── players.json
│   ├── teams.json
│   ├── ratings.json
│   └── games.json
│
├── lib/
│   ├── utils.ts                      ← cn(), getTierColor(), formatRating()
│   ├── constants.ts                  ← Tier thresholds, game list, roles
│   └── mock.ts                       ← Hàm get mock data (simulate async)
│
├── hooks/
│   ├── useCountUp.ts                 ← Counter animation hook
│   ├── useInView.ts                  ← Intersection observer hook
│   └── useFilterStore.ts             ← Zustand store cho filters
│
└── types/
    └── index.ts                      ← Player, Team, Rating, Game interfaces
```

---

## 4. MOCK DATA

### 4.1 Types (`src/types/index.ts`)

```typescript
export interface Game {
  id: string;
  name: string;
  shortName: string;         // "LoL", "VAL", "CS2"
  iconUrl: string;
  roles: string[];           // ["Mid", "ADC", "Support", ...]
}

export interface Team {
  id: string;
  slug: string;
  name: string;
  tag: string;               // "T1", "GEN", "TES"
  logoUrl: string;
  region: string;            // "VN", "KR", "CN", "EU"
  players: string[];         // player IDs
}

export interface PlayerStats {
  aim: number;               // 0–100
  gameIq: number;
  clutch: number;
  teamplay: number;
  consistency: number;
}

export interface Player {
  id: string;
  slug: string;
  displayName: string;       // "Faker"
  realName?: string;         // "Lee Sang-hyeok"
  nationality: string;
  imageUrl: string;          // Ảnh render chính
  bannerUrl?: string;        // Ảnh nền profile
  gameId: string;
  teamId?: string;
  role: string;              // "Mid", "Duelist"
  rating: number;            // 0.0–10.0 (avg)
  stats: PlayerStats;
  totalRatings: number;
  tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  rank: number;
  isActive: boolean;
}

export interface Rating {
  id: string;
  playerId: string;
  userName: string;
  userAvatar?: string;
  overall: number;
  aim?: number;
  gameIq?: number;
  clutch?: number;
  teamplay?: number;
  consistency?: number;
  comment: string;
  createdAt: string;         // ISO date
}

export type TierKey = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
```

### 4.2 Mock JSON (`src/data/players.json`) — Ví dụ 8 tuyển thủ

```json
[
  {
    "id": "p1",
    "slug": "dragonslayer99",
    "displayName": "DragonSlayer99",
    "realName": "Nguyễn Minh Đức",
    "nationality": "VN",
    "imageUrl": "/images/players/dragonslayer.webp",
    "bannerUrl": "/images/banners/dragon-banner.webp",
    "gameId": "g1",
    "teamId": "t1",
    "role": "Mid",
    "rating": 9.8,
    "stats": { "aim": 96, "gameIq": 94, "clutch": 98, "teamplay": 90, "consistency": 95 },
    "totalRatings": 12450,
    "tier": "S",
    "rank": 1,
    "isActive": true
  },
  {
    "id": "p2",
    "slug": "thunderace",
    "displayName": "ThunderAce",
    "realName": "Trần Hoàng Nam",
    "nationality": "VN",
    "imageUrl": "/images/players/thunderace.webp",
    "gameId": "g2",
    "teamId": "t2",
    "role": "Duelist",
    "rating": 9.5,
    "stats": { "aim": 98, "gameIq": 88, "clutch": 92, "teamplay": 85, "consistency": 91 },
    "totalRatings": 9830,
    "tier": "S",
    "rank": 2,
    "isActive": true
  },
  {
    "id": "p3",
    "slug": "kitsunepro",
    "displayName": "KitsunePro",
    "realName": "Lê Thị Hương",
    "nationality": "VN",
    "imageUrl": "/images/players/kitsune.webp",
    "gameId": "g3",
    "teamId": "t3",
    "role": "Carry",
    "rating": 9.3,
    "stats": { "aim": 89, "gameIq": 97, "clutch": 86, "teamplay": 92, "consistency": 94 },
    "totalRatings": 8200,
    "tier": "S",
    "rank": 3,
    "isActive": true
  },
  {
    "id": "p4",
    "slug": "sakurawind",
    "displayName": "SakuraWind",
    "realName": "Phạm Anh Thư",
    "nationality": "VN",
    "imageUrl": "/images/players/sakura.webp",
    "gameId": "g4",
    "teamId": "t1",
    "role": "AWPer",
    "rating": 9.1,
    "stats": { "aim": 99, "gameIq": 90, "clutch": 88, "teamplay": 82, "consistency": 87 },
    "totalRatings": 7650,
    "tier": "S",
    "rank": 4,
    "isActive": true
  },
  {
    "id": "p5",
    "slug": "shadowviper",
    "displayName": "ShadowViper",
    "realName": "Võ Quốc Huy",
    "nationality": "VN",
    "imageUrl": "/images/players/shadow.webp",
    "gameId": "g2",
    "teamId": "t2",
    "role": "Controller",
    "rating": 8.7,
    "stats": { "aim": 82, "gameIq": 95, "clutch": 84, "teamplay": 96, "consistency": 90 },
    "totalRatings": 5420,
    "tier": "A",
    "rank": 5,
    "isActive": true
  },
  {
    "id": "p6",
    "slug": "blazequeen",
    "displayName": "BlazeQueen",
    "realName": "Đặng Thùy Linh",
    "nationality": "VN",
    "imageUrl": "/images/players/blaze.webp",
    "gameId": "g1",
    "teamId": "t3",
    "role": "ADC",
    "rating": 8.4,
    "stats": { "aim": 93, "gameIq": 86, "clutch": 80, "teamplay": 88, "consistency": 85 },
    "totalRatings": 4890,
    "tier": "A",
    "rank": 6,
    "isActive": true
  },
  {
    "id": "p7",
    "slug": "ironwolf",
    "displayName": "IronWolf",
    "realName": "Bùi Đức Anh",
    "nationality": "VN",
    "imageUrl": "/images/players/ironwolf.webp",
    "gameId": "g3",
    "teamId": "t1",
    "role": "Offlane",
    "rating": 7.9,
    "stats": { "aim": 78, "gameIq": 88, "clutch": 82, "teamplay": 90, "consistency": 80 },
    "totalRatings": 3200,
    "tier": "B",
    "rank": 7,
    "isActive": true
  },
  {
    "id": "p8",
    "slug": "neonrush",
    "displayName": "NeonRush",
    "realName": "Hoàng Văn Tùng",
    "nationality": "VN",
    "imageUrl": "/images/players/neon.webp",
    "gameId": "g4",
    "teamId": "t2",
    "role": "Entry",
    "rating": 7.5,
    "stats": { "aim": 90, "gameIq": 72, "clutch": 78, "teamplay": 75, "consistency": 70 },
    "totalRatings": 2100,
    "tier": "B",
    "rank": 8,
    "isActive": true
  }
]
```

### 4.3 Utility (`src/lib/utils.ts`)

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TierKey } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TIER_COLORS: Record<TierKey, string> = {
  S: '#CCFF00',
  A: '#00FF88',
  B: '#00AAFF',
  C: '#FFB800',
  D: '#FF4D00',
  F: '#FF4444',
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
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}
```

---

## 5. CÁC TRANG CẦN XÂY DỰNG

### 5.1 Landing Page (`/`)

```
┌──────────────────────────────────────────────────────────┐
│ HEADER (fixed, backdrop-blur, border-bottom subtle)      │
│ [■ Logo]              [Tuyển thủ] [BXH] [So sánh] [Teams]│
├──────────────────────────────────────────────────────────┤
│                                                          │
│ HERO SECTION (min-h-screen, split 2 columns)             │
│ ┌─────────────────────┐ ┌──────────────────────────────┐ │
│ │ Tag: SEASON 12 LIVE │ │                              │ │
│ │                     │ │   [Player Render Image]      │ │
│ │ ĐÁNH GIÁ.          │ │                              │ │
│ │ PHÂN TÍCH.          │ │   ┌──────────┐              │ │
│ │ CHẤM ĐIỂM          │ │   │AIM  97.3 │ ← float stat │ │
│ │ TUYỂN THỦ E-SPORTS. │ │   └──────────┘              │ │
│ │                     │ │          ┌──────────┐       │ │
│ │ Mô tả ngắn...      │ │          │WIN  84%  │       │ │
│ │                     │ │          └──────────┘       │ │
│ │ [VÀO ĐẤU TRƯỜNG]   │ │   ┌──────────┐              │ │
│ │ [CHẤM ĐIỂM NGAY]   │ │   │CLUTCH A+ │              │ │
│ │                     │ │   └──────────┘              │ │
│ └─────────────────────┘ └──────────────────────────────┘ │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ STATS RIBBON (bg surface, border top/bottom)             │
│ 2,547+        185,420+       52,000+        48           │
│ Tuyển thủ     Đánh giá       Cộng đồng      Giải đấu    │
│ ← counter animation on scroll into view                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ FEATURES GRID (3 columns, 1px gap = border effect)       │
│ ┌──────────┐┌──────────┐┌──────────┐                     │
│ │01        ││02        ││03        │                     │
│ │[icon]    ││[icon]    ││[icon]    │                     │
│ │CHẤM ĐIỂM││PHÂN TÍCH ││HEAD-TO-  │                     │
│ │TUYỂN THỦ ││ĐỘI HÌNH ││HEAD      │                     │
│ │Mô tả... ││Mô tả... ││Mô tả... │                     │
│ └──────────┘└──────────┘└──────────┘                     │
│ ┌──────────┐┌──────────┐┌──────────┐                     │
│ │04        ││05        ││06        │                     │
│ │BXH LIVE  ││CỘNG ĐỒNG││MINI GAME │                     │
│ └──────────┘└──────────┘└──────────┘                     │
│ ← hover: top border acid slide-in, bg → elevated        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ TOP PLAYERS (4-col grid PlayerCards)                     │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                             │
│ │#01 │ │#02 │ │#03 │ │#04 │                             │
│ │img │ │img │ │img │ │img │                             │
│ │9.8 │ │9.5 │ │9.3 │ │9.1 │                             │
│ │bars│ │bars│ │bars│ │bars│                             │
│ └────┘ └────┘ └────┘ └────┘                             │
│ ← staggered reveal animation on scroll                   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ CTA BANNER                                               │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ gradient top border (acid → lava)                    │ │
│ │ "Sẵn sàng vào đấu trường?"    [BẮT ĐẦU NGAY →]     │ │
│ │ "52,000+ game thủ..."         radial glow top-right  │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ FOOTER (minimal, surface bg)                             │
│ [■] ARCADE ARENA    [Links...]    © 2026                 │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Players Page (`/players`)

```
┌──────────────────────────────────────────────────────────┐
│ HEADER                                                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ PAGE HEADER                                              │
│ ── Tuyển thủ                                             │
│ Khám phá & chấm điểm tuyển thủ E-sports                 │
│                                                          │
│ FILTER BAR                                               │
│ [🔍 Tìm tuyển thủ...    ]  [Game ▾] [Role ▾] [Tier ▾]  │
│                              [Sắp xếp: Rating ▾]        │
│                                                          │
│ RESULTS: "Hiển thị 8 tuyển thủ"                          │
│                                                          │
│ PLAYER GRID (responsive: 4col → 2col → 1col)            │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                             │
│ │Card│ │Card│ │Card│ │Card│                             │
│ └────┘ └────┘ └────┘ └────┘                             │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                             │
│ │Card│ │Card│ │Card│ │Card│                             │
│ └────┘ └────┘ └────┘ └────┘                             │
│                                                          │
│ PAGINATION hoặc LOAD MORE                                │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ FOOTER                                                   │
└──────────────────────────────────────────────────────────┘
```

### 5.3 Player Profile (`/players/[slug]`)

```
┌──────────────────────────────────────────────────────────┐
│ HEADER                                                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ PROFILE HERO (full-width, banner background)             │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ gradient overlay on banner image                     │ │
│ │                                                      │ │
│ │ [Player Image]  DRAGONSLAYER99          #01 · S TIER │ │
│ │  (large,        Nguyễn Minh Đức · 🇻🇳               │ │
│ │   rounded)      League of Legends · Mid · Team Alpha │ │
│ │                                                      │ │
│ │                 9.8 /10     12,450 đánh giá          │ │
│ │                 ████████████████████░░                │ │
│ │                                                      │ │
│ │ [⭐ CHẤM ĐIỂM]  [📊 SO SÁNH]                        │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ CONTENT (2-column: main + sidebar)                       │
│ ┌──────────────────────────┐ ┌───────────────────────┐   │
│ │ STATS CHI TIẾT           │ │ THÔNG TIN NHANH      │   │
│ │                          │ │                       │   │
│ │ [===== RADAR CHART ====] │ │ Game:    LoL          │   │
│ │ [  Aim / IQ / Clutch   ] │ │ Role:    Mid          │   │
│ │ [  Team / Consistency  ] │ │ Team:    Team Alpha   │   │
│ │                          │ │ Region:  VN           │   │
│ │ STAT BARS (detailed)     │ │ Rank:    #1           │   │
│ │ Aim       ██████████ 96  │ │ Ratings: 12,450       │   │
│ │ Game IQ   █████████░ 94  │ │                       │   │
│ │ Clutch    ██████████ 98  │ ├───────────────────────┤   │
│ │ Teamplay  █████████░ 90  │ │ RATING TREND          │   │
│ │ Consist.  █████████░ 95  │ │ [Line chart 6 months] │   │
│ │                          │ │                       │   │
│ ├──────────────────────────┤ ├───────────────────────┤   │
│ │ ĐÁNH GIÁ TỪ CỘNG ĐỒNG  │ │ CÙNG ĐỘI              │   │
│ │                          │ │ [Mini PlayerCards x4] │   │
│ │ ┌──────────────────────┐ │ │                       │   │
│ │ │ UserA · ⭐ 9.5       │ │ └───────────────────────┘   │
│ │ │ "Chơi mid quá đỉnh!" │ │                            │
│ │ │ 2 ngày trước          │ │                            │
│ │ └──────────────────────┘ │                            │
│ │ ┌──────────────────────┐ │                            │
│ │ │ UserB · ⭐ 9.8       │ │                            │
│ │ │ "Clutch king..."     │ │                            │
│ │ └──────────────────────┘ │                            │
│ │                          │                            │
│ │ [XEM THÊM ĐÁNH GIÁ]     │                            │
│ └──────────────────────────┘                            │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ FOOTER                                                   │
└──────────────────────────────────────────────────────────┘
```

### 5.4 Compare Page (`/compare`)

```
┌──────────────────────────────────────────────────────────┐
│ HEADER                                                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ PLAYER SELECTOR                                          │
│ ┌────────────────────┐  ⚔️ VS ⚔️  ┌────────────────────┐ │
│ │ [Search Player A]  │            │ [Search Player B]  │ │
│ │ DragonSlayer99     │            │ ThunderAce         │ │
│ │ [img] Mid · LoL    │            │ [img] Duelist · VAL│ │
│ │ Rating: 9.8        │            │ Rating: 9.5        │ │
│ └────────────────────┘            └────────────────────┘ │
│                                                          │
│ OVERLAY RADAR CHART (2 players superimposed)             │
│ ┌──────────────────────────────────────────────────────┐ │
│ │                    Aim                               │ │
│ │                     ╱╲                               │ │
│ │        Consist.  ╱    ╲  Game IQ                     │ │
│ │                ╱        ╲                            │ │
│ │               ╲          ╱                           │ │
│ │        Teamplay ╲      ╱  Clutch                    │ │
│ │                   ╲  ╱                               │ │
│ │         ■ Player A (acid)   ■ Player B (lava)        │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ SIDE-BY-SIDE STAT BARS                                   │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Aim       96 ████████████████|██████████████████ 98  │ │
│ │ Game IQ   94 ███████████████░|█████████████░░░░░ 88  │ │
│ │ Clutch    98 ████████████████|████████████████░░ 92  │ │
│ │ Teamplay  90 ██████████████░░|█████████████░░░░░ 85  │ │
│ │ Consist.  95 ███████████████░|███████████████░░░ 91  │ │
│ │           ◄── Player A ──┤├── Player B ──►           │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ VERDICT                                                  │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ DragonSlayer99 thắng 3/5 chỉ số                      │ │
│ │ Chênh lệch tổng: +1.2 điểm                          │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ FOOTER                                                   │
└──────────────────────────────────────────────────────────┘
```

### 5.5 Leaderboard Page (`/leaderboard`)

```
┌──────────────────────────────────────────────────────────┐
│ HEADER                                                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ FILTER TABS                                              │
│ [Tất cả] [LoL] [Valorant] [CS2] [Dota 2]               │
│                                                          │
│ LEADERBOARD TABLE                                        │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ #   Player          Game    Role    Rating   Tier    │ │
│ │ ──────────────────────────────────────────────────── │ │
│ │ 1   [img] DragonS.  LoL     Mid     9.8      [S]    │ │
│ │ 2   [img] ThunderA. VAL     Duelist 9.5      [S]    │ │
│ │ 3   [img] KitsuneP. Dota2   Carry   9.3      [S]    │ │
│ │ 4   [img] SakuraW.  CS2     AWPer   9.1      [S]    │ │
│ │ 5   [img] ShadowV.  VAL     Control 8.7      [A]    │ │
│ │ 6   [img] BlazeQ.   LoL     ADC     8.4      [A]    │ │
│ │ 7   [img] IronWolf  Dota2   Offlane 7.9      [B]    │ │
│ │ 8   [img] NeonRush  CS2     Entry   7.5      [B]    │ │
│ │                                                      │ │
│ │ ← hover row: bg elevated, rating glow, border-left  │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ TIER DISTRIBUTION (donut chart sidebar)                  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ FOOTER                                                   │
└──────────────────────────────────────────────────────────┘
```

---

## 6. KEY COMPONENTS CHI TIẾT

### 6.1 PlayerCard.tsx

```
Props:
  player: Player
  rank?: number
  showStats?: boolean (default: true)

Structure:
  <motion.div>                          ← Framer Motion wrapper
    <Link href={/players/${slug}}>
      <div className="player-img-wrap"> ← aspect-square, overflow-hidden
        <span className="rank-badge">   ← absolute top-left
        <Image />                        ← Next/Image, grayscale filter
        <div className="gradient-overlay"> ← bottom fade to black
      </div>
      <div className="player-info">
        <h3>{displayName}</h3>           ← font-display, card-title
        <p>{game} · {role}</p>           ← font-mono, label
        <div className="rating">
          <RatingNumber value={rating} /> ← big number + tier color
          <span>/10</span>
        </div>
        {showStats && (
          <div className="stat-bars">
            <StatBar label="Aim" value={stats.aim} />
            <StatBar label="IQ" value={stats.gameIq} />
            <StatBar label="Clutch" value={stats.clutch} />
          </div>
        )}
      </div>
    </Link>
  </motion.div>

Hover:
  border: subtle → acid
  shadow: none → glow-acid
  translateY: 0 → -8px
  image: grayscale(50%) → grayscale(0), scale(1) → scale(1.05)
  rating: white → tier color + glow
  stat-bar fills: + glow shadow
  transition: 0.4s cubic-bezier(.23, 1, .32, 1)
```

### 6.2 StatBar.tsx

```
Props:
  label: string         ← "Aim", "Game IQ"
  value: number         ← 0–100
  maxValue?: number     ← default 100
  showValue?: boolean   ← default true
  size?: 'sm' | 'md'   ← bar height

Structure:
  <div className="stat-row">
    <span className="label">{label}</span>     ← font-mono, text-dim
    <div className="bar-track">                 ← bg border-subtle, h-[2px]
      <motion.div
        className="bar-fill"                    ← bg accent-acid
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}        ← animate on mount
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
    {showValue && <span className="value">{value}</span>}  ← font-mono
  </div>

Hover (parent card triggers):
  .bar-fill: box-shadow: 0 0 8px var(--accent-acid-glow)
```

### 6.3 RadarChart.tsx (Recharts)

```
Props:
  stats: PlayerStats
  compareStats?: PlayerStats    ← cho compare page
  size?: number                 ← default 300

Data format cho Recharts:
  [
    { stat: 'Aim',         A: 96, B: 98 },
    { stat: 'Game IQ',     A: 94, B: 88 },
    { stat: 'Clutch',      A: 98, B: 92 },
    { stat: 'Teamplay',    A: 90, B: 85 },
    { stat: 'Consistency', A: 95, B: 91 },
  ]

Styling:
  - Background: transparent
  - Grid lines: var(--border-subtle)
  - Player A fill: var(--accent-acid) opacity 0.3, stroke acid
  - Player B fill: var(--accent-lava) opacity 0.3, stroke lava
  - Labels: font-mono, text-dim
  - Dots: acid/lava with glow on hover
  - Tooltip: dark bg, border subtle
```

---

## 7. ANIMATION SPECS

### 7.1 Page Load Sequence

```
t=0.0s  Header fade in
t=0.2s  Hero tag slide up + fade
t=0.4s  Hero H1 slide up + fade
t=0.6s  Hero description slide up
t=0.8s  CTA buttons slide up
t=0.6s  Hero right (player showcase) fade in
t=1.0s  Float stats appear one by one (stagger 0.15s)

On scroll:
  Stats Ribbon → counter animation (2s duration, easeOut)
  Features Grid → stagger reveal (0.08s per cell)
  Top Players → stagger reveal (0.1s per card)
  CTA Banner → slide up + fade
```

### 7.2 Framer Motion Variants

```typescript
// Stagger container
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

// Child item
export const fadeUpItem = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
};

// Card hover
export const cardHover = {
  rest: { y: 0, boxShadow: 'none' },
  hover: {
    y: -8,
    boxShadow: '0 0 40px rgba(204,255,0,0.15)',
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
  },
};
```

---

## 8. RESPONSIVE BREAKPOINTS

```
Desktop   ≥1280px   4-col grids, split hero, full sidebar
Laptop    ≥1024px   3-col features, 2-col profile
Tablet    ≥768px    2-col grids, stacked hero
Mobile    <768px    1-col everything, hamburger nav, bottom CTA sticky
```

| Component | Desktop | Tablet | Mobile |
|-----------|---------|--------|--------|
| Player Grid | 4 cols | 2 cols | 1 col |
| Features Grid | 3 cols | 2 cols | 1 col |
| Hero | Split 2-col | Split 2-col | Stacked |
| Profile | Main + Sidebar | Main + Sidebar | Stacked |
| Compare | Side by side | Side by side | Stacked |
| Leaderboard | Full table | Scrollable | Card list |
| Header Nav | Inline links | Inline links | Hamburger |

---

## 9. PLACEHOLDER IMAGES

Vì chưa có ảnh tuyển thủ thật, sử dụng placeholder:

```typescript
// src/lib/constants.ts
export const PLAYER_AVATARS: Record<string, string> = {
  dragonslayer99: '🐉',
  thunderace: '⚡',
  kitsunepro: '🦊',
  sakurawind: '🌸',
  shadowviper: '🐍',
  blazequeen: '🔥',
  ironwolf: '🐺',
  neonrush: '💜',
};

// Hoặc dùng UI Avatars API (không cần download):
// https://ui-avatars.com/api/?name=DragonSlayer&background=1A1A1B&color=CCFF00&size=400

// Hoặc dùng DiceBear (SVG avatars):
// https://api.dicebear.com/9.x/bottts-neutral/svg?seed=dragonslayer
```

---

## 10. CHECKLIST TRIỂN KHAI

```
Phase 1 — Foundation (Tuần 1–2)
  □ Khởi tạo Next.js 15 + Tailwind + Framer Motion
  □ Setup globals.css với design tokens
  □ Tạo mock data JSON
  □ Build base UI components (Button, Card, Badge, StatBar, Input)
  □ Build Header + Footer + MobileNav
  □ Build Landing Page (Hero → Stats → Features → Players → CTA)
  □ Responsive test: Desktop / Tablet / Mobile

Phase 2 — Core Pages (Tuần 3–4)
  □ Players Grid page (/players) + filter + search (client-side)
  □ Player Profile page (/players/[slug]) + RadarChart + StatBars
  □ RatingForm component (mock submit)
  □ RatingList component

Phase 3 — Advanced Pages (Tuần 5–6)
  □ Compare page (/compare) + player selector + overlay radar
  □ Leaderboard page (/leaderboard) + game filter tabs
  □ Teams page (/teams) + Team Profile (/teams/[slug])

Phase 4 — Polish (Tuần 7–8)
  □ Page transition animations (Framer Motion layout)
  □ Loading skeletons cho mọi page
  □ SEO metadata (generateMetadata cho dynamic pages)
  □ Lighthouse audit: LCP < 1.5s, CLS < 0.05
  □ Accessibility: keyboard nav, aria labels, focus rings
  □ Final responsive QA
```

---

*Sử dụng từng section trong file này làm prompt riêng biệt. Ví dụ: copy Section 6.1 + Section 2 + Section 3 để prompt AI tạo PlayerCard component hoàn chỉnh với đúng design system.*
