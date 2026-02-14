# Phase 06 — Polish & Optimization

## Context

- Plan: [plan.md](./plan.md)
- Research: [researcher-01-report.md](./research/researcher-01-report.md), [researcher-02-report.md](./research/researcher-02-report.md)
- Blocked by: [Phase 04](./phase-04-homepage-sections.md), [Phase 05](./phase-05-subpages.md)
- Final phase — no blocks

---

## Overview

| Field | Value |
|---|---|
| Date | 2026-02-14 |
| Priority | Medium |
| Status | pending |
| Review | pending |

Refine animations, fix responsive edge cases, add full SEO metadata and OpenGraph
tags, optimize images, audit performance (Lighthouse), verify i18n completeness,
and fix any accessibility gaps before the demo goes live.

---

## Key Insights

- Framer Motion `whileInView` with `viewport={{ once: true }}` is the correct pattern
  for scroll animations — `once: false` causes re-animation on scroll-up which is
  distracting for an eSport demo.
- Next.js `<Image>` with `placeholder="blur"` requires `blurDataURL` — for SVG
  placeholders, generate a tiny base64 data URI and hardcode it in the Image call
  or use `unoptimized` for SVGs.
- Lighthouse scores are heavily penalized by layout shift (CLS) — every `<Image>`
  must have explicit `width`/`height` or `fill` with a sized container.

---

## Requirements

**Animations:**
- Audit all `whileInView` — ensure `viewport={{ once: true }}` everywhere
- Hero entrance animations: stagger delay chain is correct (0.1 → 0.55)
- Tab switch: `motion.div` key-based re-render provides smooth fade
- MatchCard hover: `hover:border-white/20 hover:-translate-y-0.5` consistent
- No janky scroll-triggered reflows (avoid `layout` prop)

**Responsive:**
- Mobile (< 640px): single column, hamburger menu, standings hides `diff` column
- Tablet (640-1024px): 2 columns for cards, teams grid 3-col
- Desktop (> 1024px): 3 columns, full nav bar
- Test `xs: 475px` breakpoint for team roster grid

**SEO & OpenGraph:**
- Root layout: title template `"%s | OnlyQuat eSport"`
- Per-page: `generateMetadata` for tournament, team, article detail pages (done in Ph05)
- OpenGraph image: add static `opengraph-image.png` at `app/[locale]/`
- `robots.ts` and `sitemap.ts` in `app/`

**Image Optimization:**
- Replace mock `/mock/*.svg` hrefs with `https://ui-avatars.com/...` URLs for demo
  or add actual SVG files to `public/mock/`
- All `<Image>` components: add `priority` prop to above-the-fold images (hero)
- Use `sizes` prop on grid images

**Performance:**
- Dynamic import heavy sections (MatchHistorySection, ScoringsSection) with
  `next/dynamic` + `{ ssr: false }` if they're client components
- Actually: these are server components — no dynamic import needed
- Add `loading="lazy"` to below-fold images (Next.js Image does this by default)

**i18n Completeness:**
- Audit: every `t("key")` call has a matching key in both `en.json` and `vi.json`
- Add missing translation keys found during development

**a11y:**
- `lang` attribute on `<html>` (already set in layout)
- All `<Image>` have descriptive `alt` text
- Interactive elements have `aria-label` if icon-only
- Focus ring visible: add `focus-visible:ring-2 focus-visible:ring-accent-cyan` to
  all interactive elements (already on Button; audit MatchCard, ArticleCard links)
- Check color contrast: `text-text-muted #64748b` on `#1e2530` = ~4.1:1 — passes AA

---

## Architecture

No new components — this phase is purely refinement and addition of metadata/config
files.

```
web/src/app/
├── robots.ts                 # tells crawlers to allow/disallow
├── sitemap.ts                # auto-generates sitemap.xml
├── [locale]/
│   ├── opengraph-image.png   # 1200x630 OG image
│   └── ...
```

---

## Related Code Files

| File | Action | Notes |
|---|---|---|
| `web/src/app/robots.ts` | create | Robots config |
| `web/src/app/sitemap.ts` | create | Sitemap |
| `web/src/app/[locale]/layout.tsx` | modify | Add OpenGraph metadata |
| All `components/home/*.tsx` | modify | Audit viewport/once, aria-labels |
| All `components/shared/*.tsx` | modify | Add focus rings, sizes prop |
| `web/src/messages/en.json` | modify | Fill any missing keys |
| `web/src/messages/vi.json` | modify | Fill any missing keys |

---

## Implementation Steps

### Step 1 — robots.ts

`web/src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://onlyquat.gg/sitemap.xml",
  };
}
```

### Step 2 — sitemap.ts

`web/src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { tournaments } from "@/lib/mock-data";
import { teams } from "@/lib/mock-data";
import { articles } from "@/lib/mock-data";

const BASE = "https://onlyquat.gg";
const LOCALES = ["vi", "en"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/tournaments", "/teams", "/news", "/minigames"];
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const route of staticRoutes) {
      entries.push({ url: `${BASE}/${locale}${route}`, priority: route === "" ? 1 : 0.8 });
    }
    for (const t of tournaments) {
      entries.push({ url: `${BASE}/${locale}/tournaments/${t.id}`, priority: 0.7 });
    }
    for (const t of teams) {
      entries.push({ url: `${BASE}/${locale}/teams/${t.id}`, priority: 0.7 });
    }
    for (const a of articles) {
      entries.push({ url: `${BASE}/${locale}/news/${a.id}`, changeFrequency: "weekly", priority: 0.6 });
    }
  }
  return entries;
}
```

### Step 3 — Enhanced OpenGraph in root layout

`web/src/app/[locale]/layout.tsx` — expand metadata:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: { default: "OnlyQuat eSport", template: "%s | OnlyQuat eSport" },
    description: locale === "vi"
      ? "Nền tảng giải đấu eSport — giải đấu, đội tuyển, tin tức, minigame"
      : "eSport tournament platform — tournaments, teams, news, minigames",
    openGraph: {
      type: "website",
      siteName: "OnlyQuat eSport",
      locale: locale === "vi" ? "vi_VN" : "en_US",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/og-image.png"],
    },
    icons: { icon: "/favicon.ico" },
    themeColor: "#0a0e17",
  };
}
```

### Step 4 — Animation audit checklist

Review each animated component and apply these fixes where missing:

```tsx
// TeamsSection, MinigamesSection — ensure once: true
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}  // ← this must be present

// All cards — consistent hover pattern (no Framer layout)
// Use CSS transitions, not Framer Motion layout for card hover
className="transition-all duration-300 hover:-translate-y-0.5"

// Hero section — no layout animations; only opacity + transform
// Already correct in Phase 04 plan

// Tab indicator — spring bounce is fine but keep duration short
transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
```

### Step 5 — Image optimization fixes

In `TeamLogo.tsx` — add `sizes` and `priority` as prop:

```tsx
interface TeamLogoProps {
  // ... existing
  priority?: boolean;
}

// Inside component:
<Image
  src={logo}
  alt={`${name} logo`}
  fill
  sizes={`${px}px`}
  className="object-contain p-1"
  priority={priority}
  unoptimized={logo.endsWith(".svg")}
/>
```

In `ArticleCard.tsx` — add `sizes` to the thumbnail image:

```tsx
<Image
  src={article.thumbnail}
  alt={article.title}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="object-cover group-hover:scale-105 transition-transform duration-500"
/>
```

In `HeroSection.tsx` — hero team logos should have `priority`:

```tsx
<TeamLogo logo={liveMatch.team1.logo} name={liveMatch.team1.name} size="md" priority />
```

### Step 6 — Responsive fixes

Apply these targeted responsive fixes after visual testing:

```tsx
// Hero: font size scaling on xs screens
// text-5xl → xs:text-4xl md:text-5xl lg:text-7xl

// Standings: hide form column on xs
// hidden xs:table-cell → hidden sm:table-cell  (already in plan, verify)

// TournamentsSection: min card width on xs
// grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3

// TeamDetail player grid: 2-col on xs
// grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5
```

### Step 7 — Accessibility audit

Quick WCAG AA check pass on key interactive elements:

```bash
# Check focus rings in browser DevTools
# Ensure every clickable element has visible focus ring

# Keyboard test:
# Tab through header nav → all links reachable
# Tab into MobileMenu trigger → Enter/Space opens it
# Tab through tournament cards → Enter navigates
```

Fixes to apply:
- `ArticleCard` `<Link>` — already has focus via Tailwind's default focus styles
- `MatchCard` — if wrapping in Link in future, add `focus-visible:ring-2`
- `Tabs` buttons — add `focus-visible:ring-2 focus-visible:ring-accent-cyan`
- Social links in Footer — have `aria-label` (already in plan)
- `LanguageSwitcher` buttons — have `aria-pressed` (already in plan)

### Step 8 — i18n completeness check

Run this mental audit of all `t("key")` calls vs message files:

Keys needed that may be missing from `en.json`/`vi.json`:
- `standings.title` (used in ScoringsSection heading and table header)
- `common.backToHome` (for 404 page)

Add a `not-found.tsx` for locale 404:

`web/src/app/[locale]/not-found.tsx`:

```tsx
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations("common");
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <span className="font-mono text-8xl font-bold text-accent-cyan/30">404</span>
      <h1 className="font-heading font-bold text-3xl text-white">Page Not Found</h1>
      <Link href={`/${locale}`} className="text-accent-cyan hover:underline">
        {t("backToHome")}
      </Link>
    </div>
  );
}
```

### Step 9 — Performance audit

Run Lighthouse in Chrome DevTools (Incognito) after `npm run build && npm start`:

Target scores:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

Common fixes if score < 90:
- CLS > 0.1: ensure all `<Image>` have explicit dimensions
- LCP > 2.5s: add `priority` to HeroSection's main image
- FID/TBT: reduce JS bundle — check for unused framer-motion imports
- Missing alt text: grep for `alt=""` and fix

---

## Todo List

- [ ] Create `web/src/app/robots.ts`
- [ ] Create `web/src/app/sitemap.ts`
- [ ] Update `[locale]/layout.tsx` with full OpenGraph metadata
- [ ] Create `web/public/og-image.png` (1200x630, dark eSport branded)
- [ ] Create `web/public/favicon.ico`
- [ ] Audit all `whileInView` — add `viewport={{ once: true }}` where missing
- [ ] Add `sizes` prop to all `ArticleCard` images
- [ ] Add `priority` to HeroSection logo images
- [ ] Add `unoptimized` to all SVG images in `<Image>`
- [ ] Fix hero title font size on xs screens
- [ ] Create `web/src/app/[locale]/not-found.tsx`
- [ ] Add `focus-visible:ring-2` to `Tabs` buttons
- [ ] Verify `lang` attribute on `<html>` switches with locale
- [ ] Verify all 4 subpages render correctly at all breakpoints
- [ ] Run `npm run build` — 0 errors, all static params generated
- [ ] Run Lighthouse audit — all scores > 90
- [ ] Verify i18n: manually test `/vi` and `/en` versions of every page
- [ ] Verify mobile hamburger menu on 375px viewport

---

## Success Criteria

- `npm run build` produces 0 errors, 0 TypeScript errors
- Lighthouse scores: Performance ≥ 90, Accessibility ≥ 90, SEO ≥ 90
- No hydration mismatch errors in browser console
- All pages readable and interactive on 375px mobile viewport
- `/vi` and `/en` routes show different translations throughout
- Animations play at 60fps (no janky reflows)
- 404 page renders for invalid tournament/team/article IDs
- All images load (or show graceful fallback text for SVG placeholders)

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| SVG images not optimized by Next.js | High | Add `unoptimized` prop to SVG `<Image>` calls |
| CLS from images without sizes | Medium | Add `sizes` to all fill images |
| Missing translation keys cause runtime error | Medium | next-intl throws — run `tsc` + visual smoke test both locales |
| OG image needs manual creation | High | Create simple dark 1200x630 PNG in Figma or use Canva |
| Lighthouse TBT high (large Framer bundle) | Low | Framer Motion v11 is tree-shakeable; only import what's used |

---

## Security Considerations

- `robots.ts` disallow `/api` paths if API routes are added later
- `sitemap.ts` — ensure `BASE` URL is correct before production deploy
- No user-generated content in this phase

---

## Next Steps

Phase 06 complete = demo is production-ready. Future phases (not in scope):
- Real API integration (replace mock imports with `fetch` calls)
- Authentication (POST /auth/login, /auth/register)
- WebSocket live score updates
- Admin dashboard
