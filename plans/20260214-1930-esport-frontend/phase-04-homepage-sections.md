# Phase 04 — Homepage Sections

## Context

- Plan: [plan.md](./plan.md)
- Research: [researcher-01-report.md](./research/researcher-01-report.md), [researcher-02-report.md](./research/researcher-02-report.md)
- Blocked by: [Phase 03](./phase-03-layout-components.md)
- Can run parallel with Phase 05 after Phase 03 completes

---

## Overview

| Field | Value |
|---|---|
| Date | 2026-02-14 |
| Priority | High |
| Status | pending |
| Review | pending |

Build all seven homepage sections. Each is an independent server or client component.
The homepage `page.tsx` composes them in order. Sections use mock data directly
(imported from `lib/mock-data`).

---

## Key Insights

- Sections with scroll-triggered animations use `whileInView` + `viewport={{ once: true }}`
  — Framer Motion handles this in a `"use client"` component; server components
  cannot animate.
- The HeroSection gradient needs `bg-[length:200%_200%] animate-gradient-shift`
  (defined in Phase 01 Tailwind config) — must be `"use client"` if gradient is
  animated via CSS class driven by JS, but pure CSS animation works in any component.
- TournamentsSection tabs need `"use client"` state; wrap just the tab switching
  logic in a client component and keep card rendering server-friendly.

---

## Requirements

- `HeroSection`: animated gradient bg, LIVE badge pulse, viewer count, CTA buttons,
  featured match display
- `TournamentsSection`: 3-tab (Live/Upcoming/Completed) card grid, 3 columns desktop
- `TeamsSection`: ranked list with hover quick-stats, win rate
- `MatchHistorySection`: list of recent completed + live matches using `MatchCard`
- `ScoringsSection`: standings table with rank medals (top 3), form dots
- `NewsSection`: article grid (3 col desktop) using `ArticleCard`
- `MinigamesSection`: 3-card preview grid with glow hover
- `[locale]/page.tsx`: compose all sections

---

## Architecture

```
app/[locale]/page.tsx  (server — imports all sections)
├── HeroSection          "use client" (framer motion, animated gradient)
├── TournamentsSection   "use client" (tab state)
├── TeamsSection         "use client" (hover state, whileInView)
├── MatchHistorySection  server OK (no client state)
├── ScoringsSection      server OK
├── NewsSection          server OK
└── MinigamesSection     "use client" (hover glow animation)
```

All sections receive data as props from `page.tsx` (server imports mock data, passes down).
This keeps mock data fetching in the server and makes future API migration trivial.

---

## Related Code Files

| File | Action | Notes |
|---|---|---|
| `web/src/app/[locale]/page.tsx` | modify | Compose all sections |
| `web/src/components/home/HeroSection.tsx` | create | Client component |
| `web/src/components/home/TournamentsSection.tsx` | create | Client component |
| `web/src/components/home/TeamsSection.tsx` | create | Client component |
| `web/src/components/home/MatchHistorySection.tsx` | create | Server component |
| `web/src/components/home/ScoringsSection.tsx` | create | Server component |
| `web/src/components/home/NewsSection.tsx` | create | Server component |
| `web/src/components/home/MinigamesSection.tsx` | create | Client component |

---

## Implementation Steps

### Step 1 — Homepage page.tsx

`web/src/app/[locale]/page.tsx`:

```tsx
import { teams, tournaments, matches, articles, minigames, standings } from "@/lib/mock-data";
import { HeroSection } from "@/components/home/HeroSection";
import { TournamentsSection } from "@/components/home/TournamentsSection";
import { TeamsSection } from "@/components/home/TeamsSection";
import { MatchHistorySection } from "@/components/home/MatchHistorySection";
import { ScoringsSection } from "@/components/home/ScoringsSection";
import { NewsSection } from "@/components/home/NewsSection";
import { MinigamesSection } from "@/components/home/MinigamesSection";
import { getLocale } from "next-intl/server";

export default async function HomePage() {
  const locale = await getLocale();
  const liveMatch = matches.find((m) => m.status === "live") ?? matches[0];
  const recentMatches = matches.filter((m) => m.status !== "scheduled").slice(0, 6);
  const latestNews = articles.slice(0, 6);

  return (
    <>
      <HeroSection liveMatch={liveMatch} locale={locale} />
      <TournamentsSection tournaments={tournaments} locale={locale} />
      <TeamsSection teams={teams} />
      <MatchHistorySection matches={recentMatches} locale={locale} />
      <ScoringsSection standings={standings} />
      <NewsSection articles={latestNews} locale={locale} />
      <MinigamesSection minigames={minigames} locale={locale} />
    </>
  );
}
```

### Step 2 — HeroSection

`web/src/components/home/HeroSection.tsx`:

```tsx
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Radio, Users, ExternalLink } from "lucide-react";
import { Match } from "@/types";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTranslations } from "next-intl";

interface HeroSectionProps {
  liveMatch: Match;
  locale: string;
}

export function HeroSection({ liveMatch, locale }: HeroSectionProps) {
  const t = useTranslations("hero");
  // Mock viewer count
  const viewers = "127K";

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#0a0e17] via-[#0d1520] to-[#0a0e17]
          bg-[length:200%_200%] animate-gradient-shift"
      />
      {/* Neon orb decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-purple/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-3xl">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mb-6"
          >
            <Badge status="live" pulse />
            <span className="flex items-center gap-1.5 text-text-secondary text-sm">
              <Users size={14} />
              <span className="font-mono text-accent-cyan">{viewers}</span> {t("viewers")}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-heading font-bold text-5xl sm:text-6xl lg:text-7xl text-white leading-none mb-4"
          >
            VCT CHAMPIONS
            <span className="block text-accent-cyan neon-cyan">2026</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-text-secondary text-lg mb-8 max-w-xl"
          >
            The world's biggest Valorant tournament. 16 teams. One champion.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap gap-3 mb-12"
          >
            {liveMatch.streamUrl && (
              <Button variant="primary" size="lg" glow>
                <Radio size={16} className="animate-pulse-live" />
                {t("watchStream")}
                <ExternalLink size={14} />
              </Button>
            )}
            <Button variant="ghost" size="lg" as={Link} href={`/${locale}/tournaments/vct-2026`}>
              {t("viewBracket")}
            </Button>
          </motion.div>

          {/* Featured match card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="glass p-5 inline-flex items-center gap-6"
          >
            <span className="text-text-muted text-xs font-mono uppercase tracking-wider">
              {t("featuredMatch")}
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TeamLogo logo={liveMatch.team1.logo} name={liveMatch.team1.name} size="md" />
                <span className="font-heading font-bold text-white">{liveMatch.team1.name}</span>
              </div>
              <div className="text-center">
                <div className="font-mono text-2xl font-bold text-white">
                  {liveMatch.score.team1}
                  <span className="text-text-muted mx-1">:</span>
                  {liveMatch.score.team2}
                </div>
                {liveMatch.map && <div className="text-text-muted text-xs">{liveMatch.map}</div>}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-white">{liveMatch.team2.name}</span>
                <TeamLogo logo={liveMatch.team2.logo} name={liveMatch.team2.name} size="md" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

Note: `Button` needs `as` prop support or use plain `<a>`/`Link` for the bracket
link. Simplest: add `href` prop to Button or just render Link alongside Button.

### Step 3 — TournamentsSection

`web/src/components/home/TournamentsSection.tsx`:

```tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Tournament, TournamentStatus } from "@/types";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatPrizePool } from "@/lib/utils";
import { Users, Trophy, ArrowRight } from "lucide-react";

interface TournamentsSectionProps {
  tournaments: Tournament[];
  locale: string;
}

const TAB_STATUS_MAP: Record<string, TournamentStatus[]> = {
  live: ["ongoing"],
  upcoming: ["upcoming"],
  completed: ["completed", "cancelled"],
};

export function TournamentsSection({ tournaments, locale }: TournamentsSectionProps) {
  const t = useTranslations("tournaments");
  const [activeTab, setActiveTab] = useState("live");

  const tabs = [
    { id: "live", label: t("live"), icon: <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse-live" /> },
    { id: "upcoming", label: t("upcoming") },
    { id: "completed", label: t("completed") },
  ];

  const filtered = tournaments.filter((t) =>
    TAB_STATUS_MAP[activeTab]?.includes(t.status)
  );

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="font-heading font-bold text-3xl text-white">{t("title")}</h2>
        <Link href={`/${locale}/tournaments`} className="text-accent-cyan text-sm flex items-center gap-1 hover:gap-2 transition-all">
          {t("viewAll")} <ArrowRight size={14} />
        </Link>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="live" onChange={setActiveTab} className="mb-8 max-w-sm" />

      {/* Grid */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filtered.length === 0 && (
          <p className="text-text-muted col-span-3 py-12 text-center">No tournaments in this category.</p>
        )}
        {filtered.map((tournament, i) => (
          <motion.div
            key={tournament.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link href={`/${locale}/tournaments/${tournament.id}`}>
              <Card hover glow="cyan" className="overflow-hidden group">
                {/* Banner */}
                <div className="aspect-video bg-bg-surface relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-card to-transparent z-10" />
                  <div className="absolute inset-0 flex items-center justify-center text-4xl font-heading font-black text-white/10 select-none">
                    {tournament.game.toUpperCase()}
                  </div>
                  <div className="absolute top-3 left-3 z-20">
                    <Badge status={tournament.status} pulse={tournament.status === "ongoing"} />
                  </div>
                  <div className="absolute top-3 right-3 z-20 text-xs font-mono text-text-secondary bg-bg/60 backdrop-blur-sm px-2 py-1 rounded">
                    {tournament.game}
                  </div>
                </div>
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-heading font-semibold text-white mb-3 group-hover:text-accent-cyan transition-colors line-clamp-1">
                    {tournament.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <Trophy size={14} className="text-warning" />
                      {formatPrizePool(tournament.prizePool, tournament.prizeCurrency)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-accent-cyan" />
                      {tournament.teams} {t("teams")}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
```

### Step 4 — TeamsSection

`web/src/components/home/TeamsSection.tsx`:

```tsx
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Team } from "@/types";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { ArrowRight, TrendingUp } from "lucide-react";

interface TeamsSectionProps {
  teams: Team[];
}

const MEDAL = ["🥇", "🥈", "🥉"];

export function TeamsSection({ teams }: TeamsSectionProps) {
  const t = useTranslations("teams");
  const top6 = teams.slice(0, 6).sort((a, b) => a.rank - b.rank);

  return (
    <section className="py-16 bg-bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading font-bold text-3xl text-white">{t("title")}</h2>
          <Link href="/teams" className="text-accent-cyan text-sm flex items-center gap-1 hover:gap-2 transition-all">
            {t("viewAll")} <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {top6.map((team, i) => {
            const winRate = Math.round((team.wins / (team.wins + team.losses + team.draws || 1)) * 100);
            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.04 }}
              >
                <Link href={`/teams/${team.id}`}
                  className="flex flex-col items-center gap-3 p-4 bg-bg-card border border-white/10 rounded-xl hover:border-accent-cyan/40 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)] transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-text-muted text-xs font-mono">{MEDAL[i] ?? `#${team.rank}`}</span>
                    <span className="flex items-center gap-0.5 text-xs text-success">
                      <TrendingUp size={10} />
                      {winRate}%
                    </span>
                  </div>
                  <TeamLogo logo={team.logo} name={team.name} size="lg" />
                  <div className="text-center">
                    <p className="font-heading font-bold text-white text-sm group-hover:text-accent-cyan transition-colors">{team.tag}</p>
                    <p className="text-text-muted text-xs">{team.wins}W {team.losses}L</p>
                  </div>
                  {/* Points badge */}
                  <span className="font-mono text-xs text-accent-cyan font-semibold">{team.points} pts</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

### Step 5 — MatchHistorySection

`web/src/components/home/MatchHistorySection.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Match } from "@/types";
import { MatchCard } from "@/components/shared/MatchCard";
import { ArrowRight } from "lucide-react";

interface MatchHistorySectionProps {
  matches: Match[];
  locale: string;
}

export async function MatchHistorySection({ matches, locale }: MatchHistorySectionProps) {
  const t = await getTranslations("matches");
  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-bold text-3xl text-white">{t("title")}</h2>
        <Link href={`/${locale}/tournaments`} className="text-accent-cyan text-sm flex items-center gap-1 hover:gap-2 transition-all">
          {t("viewDetails")} <ArrowRight size={14} />
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
}
```

### Step 6 — ScoringsSection

`web/src/components/home/ScoringsSection.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import { Standing } from "@/types";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { cn } from "@/lib/utils";

interface ScoringsSectionProps {
  standings: Standing[];
}

const MEDAL_COLORS = ["text-yellow-400", "text-slate-300", "text-amber-600"];
const FORM_COLORS = { W: "bg-success", L: "bg-danger", D: "bg-warning" };

export async function ScoringsSection({ standings }: ScoringsSectionProps) {
  const t = await getTranslations("standings");
  return (
    <section className="py-16 bg-bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="font-heading font-bold text-3xl text-white mb-8">{t("title")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-text-muted font-mono text-xs uppercase tracking-wider">
                <th className="pb-3 text-left w-12">{t("title").slice(0, 1)}</th>
                <th className="pb-3 text-left">Team</th>
                <th className="pb-3 text-center hidden sm:table-cell">{t("wl")}</th>
                <th className="pb-3 text-center hidden md:table-cell">{t("diff")}</th>
                <th className="pb-3 text-center">Form</th>
                <th className="pb-3 text-right">{t("points")}</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, i) => (
                <tr key={row.team.id} className={cn("border-b border-white/5 hover:bg-white/5 transition-colors", i < 3 && "")}>
                  <td className="py-3">
                    <span className={cn("font-mono font-bold text-sm", MEDAL_COLORS[i] ?? "text-text-secondary")}>
                      {i < 3 ? ["🥇","🥈","🥉"][i] : `#${row.rank}`}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <TeamLogo logo={row.team.logo} name={row.team.name} size="sm" />
                      <span className="font-heading font-semibold text-white">{row.team.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center hidden sm:table-cell text-text-secondary font-mono">
                    {row.wins}-{row.losses}
                  </td>
                  <td className={cn("py-3 text-center hidden md:table-cell font-mono text-xs", row.roundDiff >= 0 ? "text-success" : "text-danger")}>
                    {row.roundDiff >= 0 ? `+${row.roundDiff}` : row.roundDiff}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-center gap-1">
                      {row.form.map((r, j) => (
                        <span key={j} className={cn("w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-mono font-bold text-white", FORM_COLORS[r])}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-accent-cyan">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
```

### Step 7 — NewsSection

`web/src/components/home/NewsSection.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Article } from "@/types";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { ArrowRight } from "lucide-react";

interface NewsSectionProps {
  articles: Article[];
  locale: string;
}

export async function NewsSection({ articles, locale }: NewsSectionProps) {
  const t = await getTranslations("news");
  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-heading font-bold text-3xl text-white">{t("title")}</h2>
        <Link href={`/${locale}/news`} className="text-accent-cyan text-sm flex items-center gap-1 hover:gap-2 transition-all">
          {t("viewAll")} <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} locale={locale} />
        ))}
      </div>
    </section>
  );
}
```

### Step 8 — MinigamesSection

`web/src/components/home/MinigamesSection.tsx`:

```tsx
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Minigame } from "@/types";
import { Users, Trophy, Gamepad2 } from "lucide-react";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  prediction: <Trophy size={32} className="text-warning" />,
  bracket: <Gamepad2 size={32} className="text-accent-cyan" />,
  quiz: <Users size={32} className="text-accent-purple" />,
};

interface MinigamesSectionProps {
  minigames: Minigame[];
  locale: string;
}

export function MinigamesSection({ minigames, locale }: MinigamesSectionProps) {
  const t = useTranslations("minigames");
  return (
    <section className="py-16 bg-bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="font-heading font-bold text-3xl text-white mb-8">
          🎮 {t("title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {minigames.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Link href={`/${locale}/minigames`}
                className="flex flex-col gap-4 p-6 bg-bg-card border border-white/10 rounded-xl
                  hover:border-accent-cyan/40 hover:shadow-[0_0_25px_rgba(0,212,255,0.2)]
                  transition-all duration-300 group h-full"
              >
                <div className="flex items-start justify-between">
                  {TYPE_ICONS[game.type]}
                  <span className="font-mono text-xs text-warning font-semibold">{game.reward}</span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-lg mb-1 group-hover:text-accent-cyan transition-colors">
                    {game.name}
                  </h3>
                  <p className="text-text-muted text-sm line-clamp-2">{game.description}</p>
                </div>
                <div className="mt-auto flex items-center gap-2 text-xs text-text-secondary">
                  <Users size={12} />
                  {game.playerCount.toLocaleString()} {t("players")}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## Todo List

- [ ] Update `web/src/app/[locale]/page.tsx` with all section imports
- [ ] Create `web/src/components/home/HeroSection.tsx`
- [ ] Create `web/src/components/home/TournamentsSection.tsx`
- [ ] Create `web/src/components/home/TeamsSection.tsx`
- [ ] Create `web/src/components/home/MatchHistorySection.tsx`
- [ ] Create `web/src/components/home/ScoringsSection.tsx`
- [ ] Create `web/src/components/home/NewsSection.tsx`
- [ ] Create `web/src/components/home/MinigamesSection.tsx`
- [ ] Fix `Button` component to support anchor behavior for bracket link (use plain `<a>` or `Link` wrapper instead of `as` prop)
- [ ] Verify hero gradient animation visible on dark background
- [ ] Verify tab switching animates correctly in TournamentsSection
- [ ] Verify standings table scrolls horizontally on mobile
- [ ] Verify `whileInView` fires once for TeamsSection + MinigamesSection
- [ ] Verify all section headings use `font-heading` Rajdhani font

---

## Success Criteria

- Homepage renders all 7 sections without errors
- HeroSection shows live match, pulsing badge, animated gradient bg
- TournamentsSection tabs filter correct tournaments by status
- Teams ranking shows medals for top 3, win rate percentage
- Match history shows correct scores and status badges
- Standings table: form dots colored correctly (W=green, L=red, D=amber)
- News grid: 3 columns on desktop, 1 on mobile
- Minigames: glow appears on hover

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| `Button` needs `as` prop for Link | Medium | Just use `<Link>` wrapper around `<Button>`, or render `<a>` directly |
| Server components can't use `useTranslations` | Medium | Use `getTranslations()` from `next-intl/server` for server components |
| `whileInView` requires client component | High | All whileInView sections marked `"use client"` |
| Standings table overflow on mobile | Medium | `overflow-x-auto` wrapper + `hidden sm:` for non-critical columns |

---

## Security Considerations

- All `href` values from mock data — no user-controlled values
- `streamUrl` if rendered as `<a>` should add `rel="noopener noreferrer"`

---

## Next Steps

Phase 05: Subpages — `/tournaments`, `/teams`, `/news`, `/minigames` with detail pages
