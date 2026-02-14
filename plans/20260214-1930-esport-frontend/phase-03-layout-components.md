# Phase 03 — Layout Components

## Context

- Plan: [plan.md](./plan.md)
- Research: [researcher-01-report.md](./research/researcher-01-report.md)
- Blocked by: [Phase 01](./phase-01-project-setup.md), [Phase 02](./phase-02-types-mock-data.md)
- Blocks: Phase 04, Phase 05

---

## Overview

| Field | Value |
|---|---|
| Date | 2026-02-14 |
| Priority | High |
| Status | pending |
| Review | pending |

Build the three layout-level components: Header (nav + language switcher + mobile
hamburger), Footer (social links + links), and a PageTransitionWrapper that wraps
every page with Framer Motion AnimatePresence. Update the root layout to use them.

---

## Key Insights

- `AnimatePresence` must live in a Client Component in the layout to work with App
  Router — the layout itself can stay server-side but needs a `"use client"` child
  wrapper that receives `{children}`.
- Language switcher uses `next-intl`'s `useRouter` + `usePathname` to switch locale
  without navigating away — do NOT use `next/navigation` directly.
- Mobile hamburger uses `useState` (requires `"use client"`). Entire Header must be
  a client component because of this interactive state.

---

## Requirements

**Header:**
- Logo (text or SVG) that links to `/{locale}`
- Nav links: Home, Tournaments, Teams, News, Minigames
- Language switcher: VI / EN toggle (dropdown or inline buttons)
- Mobile hamburger menu (< md breakpoint) — slides down from top
- Sticky positioned, glass background on scroll

**Footer:**
- Logo + tagline
- Nav columns: Platform (Tournaments, Teams), Community (News, Minigames)
- Social icons: X/Twitter, Facebook, Instagram, YouTube (Lucide icons)
- Copyright line

**PageTransitionWrapper:**
- Client component wrapping `{children}` in `<AnimatePresence mode="wait">`
- Each wrapped page uses `opacity 0 → 1, y: 20 → 0` on enter

---

## Architecture

```
Layout render flow:
  [locale]/layout.tsx (server)
    └─ PageTransitionWrapper (client, AnimatePresence)
        └─ Header (client)
        └─ {children}  ← page content wrapped in motion.main
        └─ Footer (server, no interactivity)
```

```
components/layout/
├── Header.tsx              "use client" — nav + hamburger + lang switcher
├── Footer.tsx              server component OK
├── LanguageSwitcher.tsx    "use client" — uses useRouter from next-intl
├── MobileMenu.tsx          "use client" — hamburger drawer
└── PageTransitionWrapper.tsx "use client" — AnimatePresence wrapper
```

---

## Related Code Files

| File | Action | Notes |
|---|---|---|
| `web/src/components/layout/Header.tsx` | create | Client component |
| `web/src/components/layout/Footer.tsx` | create | Server component |
| `web/src/components/layout/LanguageSwitcher.tsx` | create | Client component |
| `web/src/components/layout/MobileMenu.tsx` | create | Client component |
| `web/src/components/layout/PageTransitionWrapper.tsx` | create | Client component |
| `web/src/app/[locale]/layout.tsx` | modify | Add Header, Footer, wrapper |

---

## Implementation Steps

### Step 1 — LanguageSwitcher

`web/src/components/layout/LanguageSwitcher.tsx`:

```tsx
"use client";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next-intl/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (next: string) => {
    router.replace(pathname, { locale: next });
  };

  return (
    <div className="flex items-center gap-1 bg-bg-surface border border-white/10 rounded-lg p-1">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={cn(
            "px-3 py-1 rounded text-xs font-mono font-semibold uppercase transition-colors",
            locale === loc
              ? "bg-accent-cyan/20 text-accent-cyan"
              : "text-text-muted hover:text-white"
          )}
          aria-pressed={locale === loc}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
```

### Step 2 — MobileMenu

`web/src/components/layout/MobileMenu.tsx`:

```tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { X } from "lucide-react";

const NAV_LINKS = [
  { key: "home", href: "/" },
  { key: "tournaments", href: "/tournaments" },
  { key: "teams", href: "/teams" },
  { key: "news", href: "/news" },
  { key: "minigames", href: "/minigames" },
] as const;

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const locale = useLocale();
  const t = useTranslations("nav");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-md md:hidden"
        >
          <div className="flex flex-col h-full p-6">
            <button onClick={onClose} className="self-end text-text-secondary hover:text-white mb-8" aria-label="Close menu">
              <X size={24} />
            </button>
            <nav className="flex flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.key}
                  href={`/${locale}${link.href === "/" ? "" : link.href}`}
                  onClick={onClose}
                  className="font-heading font-bold text-2xl text-text-secondary hover:text-accent-cyan transition-colors"
                >
                  {t(link.key)}
                </Link>
              ))}
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Step 3 — Header

`web/src/components/layout/Header.tsx`:

```tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { key: "home", href: "/" },
  { key: "tournaments", href: "/tournaments" },
  { key: "teams", href: "/teams" },
  { key: "news", href: "/news" },
  { key: "minigames", href: "/minigames" },
] as const;

export function Header() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-bg/80 backdrop-blur-md border-b border-white/10"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <span className="font-heading font-bold text-xl text-white">
              ONLY<span className="text-accent-cyan">QUAT</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={`/${locale}${link.href === "/" ? "" : link.href}`}
                className="px-4 py-2 text-sm font-heading font-medium text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              className="md:hidden text-text-secondary hover:text-white transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
```

### Step 4 — Footer

`web/src/components/layout/Footer.tsx`:

```tsx
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Twitter, Facebook, Instagram, Youtube } from "lucide-react";

const SOCIAL_LINKS = [
  { icon: Twitter, href: "#", label: "X / Twitter" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export async function Footer() {
  const locale = await getLocale();
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-bg-surface mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <span className="font-heading font-bold text-lg text-white">
              ONLY<span className="text-accent-cyan">QUAT</span>
            </span>
            <p className="text-text-muted text-sm mt-2">The premier eSport tournament platform.</p>
          </div>
          {/* Platform links */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-3 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              {[["Tournaments", `/${locale}/tournaments`], ["Teams", `/${locale}/teams`]].map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-accent-cyan transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          {/* Community links */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-3 uppercase tracking-wider">Community</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              {[["News", `/${locale}/news`], ["Minigames", `/${locale}/minigames`]].map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-accent-cyan transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
          <p className="text-text-muted text-sm">© {year} OnlyQuat. {t("rights")}.</p>
          <div className="flex items-center gap-3">
            <span className="text-text-muted text-sm">{t("followUs")}:</span>
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} aria-label={label} className="text-text-muted hover:text-accent-cyan transition-colors">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
```

### Step 5 — PageTransitionWrapper

`web/src/components/layout/PageTransitionWrapper.tsx`:

```tsx
"use client";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

export function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### Step 6 — Update root layout

`web/src/app/[locale]/layout.tsx` — add Header, Footer, wrapper:

```tsx
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransitionWrapper } from "@/components/layout/PageTransitionWrapper";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: { default: "OnlyQuat eSport", template: "%s | OnlyQuat eSport" },
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
          <Header />
          <PageTransitionWrapper>
            <main className="pt-16">{children}</main>
          </PageTransitionWrapper>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

Note: `pt-16` offsets the fixed header height (h-16 = 64px).

---

## Todo List

- [ ] Create `web/src/components/layout/LanguageSwitcher.tsx`
- [ ] Create `web/src/components/layout/MobileMenu.tsx`
- [ ] Create `web/src/components/layout/Header.tsx`
- [ ] Create `web/src/components/layout/Footer.tsx`
- [ ] Create `web/src/components/layout/PageTransitionWrapper.tsx`
- [ ] Update `web/src/app/[locale]/layout.tsx` with Header + Footer + wrapper
- [ ] Test desktop nav links resolve to correct locale paths
- [ ] Test mobile hamburger opens/closes
- [ ] Test language switcher VI ↔ EN preserves current route
- [ ] Test header becomes glass on scroll
- [ ] Test page transition animation fires on route change

---

## Success Criteria

- Header sticky on all pages, glass effect triggers after scrolling 20px
- Mobile menu opens/closes with Framer Motion slide
- Language switcher toggles locale without full page reload
- Footer renders with correct social icons
- Page content fades/slides on route change
- No hydration mismatch errors in console

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Hydration mismatch from `scrolled` state | Medium | `useEffect` init ensures server/client match |
| `useRouter` from next-intl vs next/navigation | High | Always import from `next-intl/navigation` for locale-aware routing |
| `AnimatePresence` key collision | Low | Use `pathname` as key — unique per route |
| Footer `getLocale()` server call failing | Low | Fallback handled by next-intl middleware |

---

## Security Considerations

- Social links are `href="#"` (mock) — no external navigation risk
- Nav links use `Link` (no `<a>` with external href)

---

## Next Steps

Phase 04: Homepage sections — HeroSection, TournamentsSection, TeamsSection,
MatchHistory, ScoringsSection, NewsSection, MinigamesSection
