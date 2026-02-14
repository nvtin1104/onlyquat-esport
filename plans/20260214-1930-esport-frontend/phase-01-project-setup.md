# Phase 01 — Project Setup & Config

## Context

- Plan: [plan.md](./plan.md)
- Research: [researcher-01-report.md](./research/researcher-01-report.md)
- Dependencies: None — this is the foundation phase
- Blocks: All other phases

---

## Overview

| Field | Value |
|---|---|
| Date | 2026-02-14 |
| Priority | Critical |
| Status | pending |
| Review | pending |

Bootstrap the Next.js 14 App Router project at `web/`, configure TailwindCSS with
the full eSport design system, wire up next-intl middleware and routing, establish
the base layout, and create the complete folder structure.

---

## Key Insights

- `create-next-app` with `--src-dir` places all code under `web/src/` — required for
  next-intl's `[locale]` segment to work cleanly with middleware path matching.
- next-intl v3 needs `createMiddleware` in `middleware.ts` at the `web/src/` root,
  and `getRequestConfig` in `i18n/request.ts` — these two files are the entire
  server-side i18n wiring.
- TailwindCSS v3 uses `tailwind.config.ts` (JS object); custom CSS animations must
  be added via `keyframes`/`animation` inside `extend` and applied with `animate-*`
  utilities.

---

## Requirements

**Must deliver:**
- `web/` directory initialised as a Next.js 14 project compiling without errors
- TailwindCSS configured with full eSport color palette, custom fonts, custom
  screens, glassmorphism utilities, and CSS animation keyframes
- next-intl middleware routing `/` → `/vi` (default), `/en` supported
- Message files `messages/vi.json` and `messages/en.json` with nav/hero/common keys
- Root `app/[locale]/layout.tsx` loading fonts, `NextIntlClientProvider`, dark theme
- Complete folder scaffold created (no placeholder files needed, just dirs)

**Non-functional:**
- `npm run dev` starts without errors on port 3000
- `npm run build` succeeds
- Default locale `vi`, fallback to `en`

---

## Architecture

```
web/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx        # fonts + NextIntlClientProvider
│   │   │   ├── page.tsx          # homepage entry (stub)
│   │   │   ├── tournaments/
│   │   │   ├── teams/
│   │   │   ├── news/
│   │   │   └── minigames/
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   ├── home/
│   │   ├── ui/
│   │   └── shared/
│   ├── lib/
│   │   ├── mock-data/
│   │   └── utils.ts
│   ├── i18n/
│   │   ├── routing.ts
│   │   └── request.ts
│   ├── messages/
│   │   ├── en.json
│   │   └── vi.json
│   ├── types/
│   │   └── index.ts              # stub — filled in Phase 02
│   └── middleware.ts
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## Related Code Files

| File | Action | Notes |
|---|---|---|
| `web/` | create | Run create-next-app here |
| `web/tailwind.config.ts` | modify | Add eSport design tokens |
| `web/src/app/globals.css` | modify | Add keyframe animations |
| `web/src/middleware.ts` | create | next-intl routing middleware |
| `web/src/i18n/routing.ts` | create | defineRouting config |
| `web/src/i18n/request.ts` | create | getRequestConfig |
| `web/src/messages/en.json` | create | English translations |
| `web/src/messages/vi.json` | create | Vietnamese translations |
| `web/src/app/[locale]/layout.tsx` | create | Root layout |
| `web/src/app/[locale]/page.tsx` | create | Homepage stub |
| `web/next.config.ts` | modify | Add next-intl plugin |

---

## Implementation Steps

### Step 1 — Bootstrap Next.js project

Run from the project root (`C:/project/onlyquat-esport/`):

```bash
npx create-next-app@14 web \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git
```

Verify: `web/src/app/layout.tsx` and `web/tailwind.config.ts` exist.

### Step 2 — Install dependencies

```bash
cd web
npm install next-intl@^3.22 framer-motion@^11 lucide-react
npm install -D @types/node
```

### Step 3 — Configure TailwindCSS

Replace content of `web/tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0e17",
          surface: "#151922",
          card: "#1e2530",
        },
        accent: {
          cyan: "#00d4ff",
          purple: "#9333ea",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        "text-primary": "#ffffff",
        "text-secondary": "#94a3b8",
        "text-muted": "#64748b",
      },
      fontFamily: {
        heading: ["Rajdhani", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      screens: {
        xs: "475px",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px #00d4ff" },
          "50%": { boxShadow: "0 0 20px #00d4ff" },
        },
        "pulse-live": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "gradient-shift": "gradient-shift 6s ease infinite",
        "glow-cyan": "glow 2s ease-in-out infinite",
        "pulse-live": "pulse-live 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
```

### Step 4 — globals.css

Add to `web/src/app/globals.css` (after Tailwind directives):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

html {
  scroll-behavior: smooth;
}

body {
  background-color: #0a0e17;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
}

/* Glassmorphism utility */
.glass {
  @apply bg-white/5 backdrop-blur-md border border-white/10 rounded-xl;
}

/* Neon text */
.neon-cyan {
  text-shadow: 0 0 10px #00d4ff, 0 0 20px #00d4ff;
}

.neon-purple {
  text-shadow: 0 0 10px #9333ea, 0 0 20px #9333ea;
}
```

### Step 5 — next-intl routing config

Create `web/src/i18n/routing.ts`:

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
});
```

Create `web/src/i18n/request.ts`:

```ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as "vi" | "en")) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

### Step 6 — Middleware

Create `web/src/middleware.ts`:

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

### Step 7 — next.config.ts

```ts
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default withNextIntl(nextConfig);
```

### Step 8 — Root layout

Create `web/src/app/[locale]/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "OnlyQuat eSport",
  description: "eSport tournament platform — tournaments, teams, news, minigames",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "vi" | "en")) notFound();
  const messages = await getMessages();
  return (
    <html lang={locale} className="dark">
      <body className="bg-bg text-text-primary font-body min-h-screen">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Step 9 — Homepage stub

Create `web/src/app/[locale]/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <main>
      <p className="text-accent-cyan font-heading text-2xl p-8">
        eSport Platform — Phase 01 complete
      </p>
    </main>
  );
}
```

### Step 10 — Translation files (initial keys)

`web/src/messages/en.json`:

```json
{
  "nav": {
    "home": "Home",
    "tournaments": "Tournaments",
    "teams": "Teams",
    "news": "News",
    "minigames": "Minigames"
  },
  "hero": {
    "liveNow": "LIVE NOW",
    "viewers": "Viewers",
    "watchStream": "Watch Stream",
    "viewBracket": "View Bracket",
    "featuredMatch": "Featured Match"
  },
  "tournaments": {
    "title": "Tournaments",
    "live": "Live",
    "upcoming": "Upcoming",
    "completed": "Completed",
    "prizePool": "Prize Pool",
    "teams": "Teams",
    "viewAll": "View All"
  },
  "teams": {
    "title": "Top Teams",
    "rank": "Rank",
    "winRate": "Win Rate",
    "viewAll": "View All"
  },
  "matches": {
    "title": "Recent Matches",
    "vs": "VS",
    "viewDetails": "View Details"
  },
  "standings": {
    "title": "Standings",
    "wl": "W-L",
    "points": "Points",
    "diff": "Diff"
  },
  "news": {
    "title": "Latest News",
    "readMore": "Read More",
    "viewAll": "View All"
  },
  "minigames": {
    "title": "Play & Win",
    "players": "Players",
    "playNow": "Play Now"
  },
  "footer": {
    "rights": "All rights reserved",
    "followUs": "Follow Us"
  },
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "backToHome": "Back to Home"
  }
}
```

`web/src/messages/vi.json`:

```json
{
  "nav": {
    "home": "Trang chủ",
    "tournaments": "Giải đấu",
    "teams": "Đội tuyển",
    "news": "Tin tức",
    "minigames": "Minigame"
  },
  "hero": {
    "liveNow": "ĐANG LIVE",
    "viewers": "Người xem",
    "watchStream": "Xem Trực Tiếp",
    "viewBracket": "Xem Nhánh Đấu",
    "featuredMatch": "Trận Đấu Nổi Bật"
  },
  "tournaments": {
    "title": "Giải Đấu",
    "live": "Đang diễn ra",
    "upcoming": "Sắp tới",
    "completed": "Đã kết thúc",
    "prizePool": "Giải Thưởng",
    "teams": "Đội",
    "viewAll": "Xem Tất Cả"
  },
  "teams": {
    "title": "Đội Tuyển Hàng Đầu",
    "rank": "Hạng",
    "winRate": "Tỉ lệ thắng",
    "viewAll": "Xem Tất Cả"
  },
  "matches": {
    "title": "Trận Đấu Gần Đây",
    "vs": "VS",
    "viewDetails": "Xem Chi Tiết"
  },
  "standings": {
    "title": "Bảng Xếp Hạng",
    "wl": "T-B",
    "points": "Điểm",
    "diff": "Hiệu Số"
  },
  "news": {
    "title": "Tin Tức Mới Nhất",
    "readMore": "Đọc Thêm",
    "viewAll": "Xem Tất Cả"
  },
  "minigames": {
    "title": "Chơi & Thắng",
    "players": "Người Chơi",
    "playNow": "Chơi Ngay"
  },
  "footer": {
    "rights": "Bản quyền thuộc về",
    "followUs": "Theo Dõi Chúng Tôi"
  },
  "common": {
    "loading": "Đang tải...",
    "error": "Có lỗi xảy ra",
    "backToHome": "Về Trang Chủ"
  }
}
```

### Step 11 — Create folder scaffold

```bash
mkdir -p web/src/components/{layout,home,ui,shared}
mkdir -p web/src/components/motion
mkdir -p web/src/lib/mock-data
mkdir -p web/src/types
touch web/src/types/index.ts
touch web/src/lib/utils.ts
```

### Step 12 — Create subpage stubs

```bash
mkdir -p web/src/app/[locale]/{tournaments,teams,news,minigames}
# Each gets a page.tsx stub in Phase 05
```

---

## Todo List

- [ ] Run `create-next-app` command from project root
- [ ] Install next-intl, framer-motion, lucide-react
- [ ] Replace `tailwind.config.ts` with eSport config
- [ ] Update `globals.css` with fonts + utilities + keyframes
- [ ] Create `i18n/routing.ts`
- [ ] Create `i18n/request.ts`
- [ ] Create `middleware.ts`
- [ ] Update `next.config.ts` with next-intl plugin
- [ ] Create `[locale]/layout.tsx`
- [ ] Create `[locale]/page.tsx` stub
- [ ] Create `messages/en.json`
- [ ] Create `messages/vi.json`
- [ ] Create folder scaffold
- [ ] Verify `npm run dev` starts clean
- [ ] Verify `npm run build` succeeds
- [ ] Verify `/` redirects to `/vi`
- [ ] Verify `/en` loads English

---

## Success Criteria

- `npm run dev` starts, `localhost:3000` redirects to `localhost:3000/vi`
- `localhost:3000/en` shows English page stub
- Background is `#0a0e17`, font is Inter
- No TypeScript errors
- `npm run build` output: 0 errors

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| next-intl v3 API change | Low | Pin to `^3.22`, check changelog |
| `params` as Promise in Next.js 14 | Medium | Always `await params` in layout |
| Google Fonts blocked in Vietnam | Low | Self-host or use `next/font/google` |
| TailwindCSS content path misses files | Low | Use `"./src/**/*.{ts,tsx}"` glob |

---

## Security Considerations

- No sensitive data in this phase
- `next.config.ts` `remotePatterns` restricts image domains — tighten before production

---

## Next Steps

Phase 02: Define TypeScript interfaces + populate mock data files + build UI primitives
