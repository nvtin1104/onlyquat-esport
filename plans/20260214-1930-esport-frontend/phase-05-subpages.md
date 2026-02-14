# Phase 05 — Subpages

## Context

- Plan: [plan.md](./plan.md)
- Research: [researcher-02-report.md](./research/researcher-02-report.md)
- Blocked by: [Phase 03](./phase-03-layout-components.md)
- Can run parallel with Phase 04

---

## Overview

| Field | Value |
|---|---|
| Date | 2026-02-14 |
| Priority | Medium |
| Status | pending |
| Review | pending |

Create four subpage routes with list + detail views where applicable:
`/tournaments`, `/teams`, `/news`, `/minigames`. All pages use mock data passed
from server page components. Detail pages use dynamic `[id]` segments.

---

## Key Insights

- App Router dynamic segments: `app/[locale]/tournaments/[id]/page.tsx` — `params`
  is a `Promise<{ locale: string; id: string }>` in Next.js 14 (must be awaited).
- `generateStaticParams` should be added to all `[id]` pages so Next.js pre-renders
  them at build time — fast, no SSR latency on the demo.
- Reuse `MatchCard`, `ArticleCard`, `TeamLogo`, `Badge` from Phase 02 heavily —
  no new primitives needed; only page-level layout and composition.

---

## Requirements

**Tournaments (`/tournaments`):**
- List page: header, filter bar (Live/Upcoming/Completed tabs), card grid
- Detail page (`/tournaments/[id]`): banner, prize pool, dates, rules, team list,
  match schedule for that tournament

**Teams (`/teams`):**
- List page: searchable/filterable team grid with rank, W/L record
- Detail page (`/teams/[id]`): team info banner, stats, player roster cards

**News (`/news`):**
- List page: article grid + category filter tabs
- Detail page (`/news/[id]`): full article view (title, meta, thumbnail, content)

**Minigames (`/minigames`):**
- Showcase page only (no detail): 3 game cards, large format, with description +
  "Play Now" CTA (modal or disabled with "Coming Soon")

---

## Architecture

```
app/[locale]/
├── tournaments/
│   ├── page.tsx              server — list all tournaments
│   └── [id]/
│       └── page.tsx          server — single tournament + matches + teams
├── teams/
│   ├── page.tsx              server — list all teams
│   └── [id]/
│       └── page.tsx          server — team detail + players
├── news/
│   ├── page.tsx              server — article grid + tabs client wrapper
│   └── [id]/
│       └── page.tsx          server — article detail
└── minigames/
    └── page.tsx              "use client" — interactive showcase
```

Data flow: all `page.tsx` import from `@/lib/mock-data`, look up by id, pass as
props to display components. `notFound()` if id not in mock data.

---

## Related Code Files

| File | Action | Notes |
|---|---|---|
| `web/src/app/[locale]/tournaments/page.tsx` | create | List page |
| `web/src/app/[locale]/tournaments/[id]/page.tsx` | create | Detail page |
| `web/src/app/[locale]/teams/page.tsx` | create | List page |
| `web/src/app/[locale]/teams/[id]/page.tsx` | create | Detail page |
| `web/src/app/[locale]/news/page.tsx` | create | List page |
| `web/src/app/[locale]/news/[id]/page.tsx` | create | Detail page |
| `web/src/app/[locale]/minigames/page.tsx` | create | Showcase page |
| `web/src/components/page/TournamentDetail.tsx` | create | Tournament detail display |
| `web/src/components/page/TeamDetail.tsx` | create | Team detail display |
| `web/src/components/page/ArticleDetail.tsx` | create | Article detail display |
| `web/src/components/page/TournamentsFilterClient.tsx` | create | Client tab filter |
| `web/src/components/page/NewsFilterClient.tsx` | create | Client category filter |

---

## Implementation Steps

### Step 1 — Tournaments list page

`web/src/app/[locale]/tournaments/page.tsx`:

```tsx
import { tournaments, matches } from "@/lib/mock-data";
import { getTranslations } from "next-intl/server";
import { TournamentsFilterClient } from "@/components/page/TournamentsFilterClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tournaments" };

export default async function TournamentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("tournaments");
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading font-bold text-4xl text-white mb-8">{t("title")}</h1>
      <TournamentsFilterClient tournaments={tournaments} locale={locale} />
    </div>
  );
}
```

`web/src/components/page/TournamentsFilterClient.tsx`:

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
import { Trophy, Users, Calendar } from "lucide-react";

const STATUS_GROUPS: Record<string, TournamentStatus[]> = {
  all: ["upcoming", "ongoing", "completed", "cancelled"],
  live: ["ongoing"],
  upcoming: ["upcoming"],
  completed: ["completed", "cancelled"],
};

interface Props { tournaments: Tournament[]; locale: string; }

export function TournamentsFilterClient({ tournaments, locale }: Props) {
  const t = useTranslations("tournaments");
  const [tab, setTab] = useState("all");
  const tabs = [
    { id: "all", label: "All" },
    { id: "live", label: t("live"), icon: <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-live" /> },
    { id: "upcoming", label: t("upcoming") },
    { id: "completed", label: t("completed") },
  ];
  const filtered = tournaments.filter((t) => STATUS_GROUPS[tab]?.includes(t.status));
  return (
    <>
      <Tabs tabs={tabs} defaultTab="all" onChange={setTab} className="mb-8 max-w-lg" />
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filtered.map((tournament) => (
          <Link key={tournament.id} href={`/${locale}/tournaments/${tournament.id}`}>
            <Card hover glow="cyan" className="overflow-hidden group">
              <div className="aspect-video bg-bg-surface relative flex items-center justify-center">
                <div className="text-5xl font-heading font-black text-white/10 select-none">{tournament.game}</div>
                <div className="absolute top-3 left-3"><Badge status={tournament.status} pulse={tournament.status === "ongoing"} /></div>
              </div>
              <div className="p-5">
                <h3 className="font-heading font-bold text-white mb-1 group-hover:text-accent-cyan transition-colors line-clamp-2">{tournament.name}</h3>
                <p className="text-text-muted text-xs mb-4 line-clamp-2">{tournament.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                  <span className="flex items-center gap-1.5"><Trophy size={14} className="text-warning" />{formatPrizePool(tournament.prizePool)}</span>
                  <span className="flex items-center gap-1.5"><Users size={14} className="text-accent-cyan" />{tournament.teams} teams</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14} />{new Date(tournament.startDate).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </motion.div>
    </>
  );
}
```

### Step 2 — Tournament detail page

`web/src/app/[locale]/tournaments/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { tournaments, matches, teams } from "@/lib/mock-data";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import { MatchCard } from "@/components/shared/MatchCard";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { formatPrizePool } from "@/lib/utils";
import { Trophy, Users, Calendar } from "lucide-react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return tournaments.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const tournament = tournaments.find((t) => t.id === id);
  return { title: tournament?.name ?? "Tournament" };
}

export default async function TournamentDetailPage({
  params,
}: { params: Promise<{ locale: string; id: string }> }) {
  const { id, locale } = await params;
  const tournament = tournaments.find((t) => t.id === id);
  if (!tournament) notFound();

  const tournamentMatches = matches.filter((m) => m.tournamentId === id);
  const tournamentTeams = teams.filter((t) => tournament.teamIds.includes(t.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Badge status={tournament.status} pulse={tournament.status === "ongoing"} />
          <span className="text-text-muted text-sm font-mono">{tournament.game}</span>
        </div>
        <h1 className="font-heading font-bold text-4xl lg:text-5xl text-white mb-3">{tournament.name}</h1>
        <p className="text-text-secondary max-w-2xl">{tournament.description}</p>
        {/* Stats row */}
        <div className="flex flex-wrap gap-6 mt-6">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-warning" />
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wider">Prize Pool</p>
              <p className="font-mono font-bold text-white">{formatPrizePool(tournament.prizePool)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users size={20} className="text-accent-cyan" />
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wider">Teams</p>
              <p className="font-mono font-bold text-white">{tournament.teams}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-accent-purple" />
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wider">Dates</p>
              <p className="font-mono text-white text-sm">
                {new Date(tournament.startDate).toLocaleDateString()} – {new Date(tournament.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Matches */}
        <div className="lg:col-span-2">
          <h2 className="font-heading font-bold text-xl text-white mb-4">Matches</h2>
          {tournamentMatches.length === 0
            ? <p className="text-text-muted">No matches scheduled yet.</p>
            : <div className="flex flex-col gap-3">{tournamentMatches.map((m) => <MatchCard key={m.id} match={m} />)}</div>
          }
        </div>
        {/* Teams */}
        <div>
          <h2 className="font-heading font-bold text-xl text-white mb-4">Participating Teams</h2>
          <div className="flex flex-col gap-2">
            {tournamentTeams.map((team) => (
              <div key={team.id} className="flex items-center gap-3 p-3 bg-bg-card border border-white/10 rounded-xl">
                <TeamLogo logo={team.logo} name={team.name} size="sm" />
                <div>
                  <p className="font-heading font-semibold text-white text-sm">{team.name}</p>
                  <p className="text-text-muted text-xs">{team.region}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 3 — Teams list page

`web/src/app/[locale]/teams/page.tsx`:

```tsx
import { teams } from "@/lib/mock-data";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Teams" };

export default async function TeamsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("teams");
  const sorted = [...teams].sort((a, b) => a.rank - b.rank);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading font-bold text-4xl text-white mb-8">{t("title")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sorted.map((team) => {
          const wr = Math.round((team.wins / (team.wins + team.losses + team.draws || 1)) * 100);
          return (
            <Link key={team.id} href={`/${locale}/teams/${team.id}`}
              className="flex items-center gap-4 p-5 bg-bg-card border border-white/10 rounded-xl hover:border-accent-cyan/40 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)] transition-all duration-300 group"
            >
              <span className="font-mono text-text-muted text-sm w-6">#{team.rank}</span>
              <TeamLogo logo={team.logo} name={team.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-white group-hover:text-accent-cyan transition-colors truncate">{team.name}</p>
                <p className="text-text-muted text-xs">{team.region} · {team.wins}W {team.losses}L</p>
              </div>
              <div className="flex items-center gap-1 text-success text-xs font-mono">
                <TrendingUp size={12} />{wr}%
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

### Step 4 — Team detail page

`web/src/app/[locale]/teams/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { teams } from "@/lib/mock-data";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { Shield, Trophy, Users } from "lucide-react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return teams.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const team = teams.find((t) => t.id === id);
  return { title: team?.name ?? "Team" };
}

export default async function TeamDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = await params;
  const team = teams.find((t) => t.id === id);
  if (!team) notFound();
  const wr = Math.round((team.wins / (team.wins + team.losses + team.draws || 1)) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-10 p-6 bg-bg-card border border-white/10 rounded-2xl">
        <TeamLogo logo={team.logo} name={team.name} size="lg" className="!w-20 !h-20" />
        <div className="flex-1">
          <p className="text-text-muted text-sm font-mono mb-1">{team.tag} · {team.region} · {team.country}</p>
          <h1 className="font-heading font-bold text-4xl text-white">{team.name}</h1>
        </div>
        <div className="flex gap-8">
          {[
            { label: "Wins", value: team.wins, icon: Trophy, color: "text-success" },
            { label: "Losses", value: team.losses, icon: Shield, color: "text-danger" },
            { label: "Win Rate", value: `${wr}%`, icon: Users, color: "text-accent-cyan" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="text-center">
              <Icon size={16} className={`${color} mx-auto mb-1`} />
              <p className={`font-mono font-bold text-xl ${color}`}>{value}</p>
              <p className="text-text-muted text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Roster */}
      <h2 className="font-heading font-bold text-2xl text-white mb-5">Roster</h2>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {team.players.map((player) => (
          <div key={player.id} className="flex flex-col items-center gap-3 p-4 bg-bg-card border border-white/10 rounded-xl hover:border-accent-cyan/30 transition-colors">
            <div className="w-16 h-16 rounded-full bg-bg-surface border border-white/10 flex items-center justify-center overflow-hidden">
              <span className="font-heading font-bold text-accent-cyan text-xl">{player.ign.slice(0, 1).toUpperCase()}</span>
            </div>
            <div className="text-center">
              <p className="font-heading font-semibold text-white text-sm">{player.ign}</p>
              <p className="text-text-muted text-xs">{player.realName}</p>
              <span className="mt-1 inline-block text-xs font-mono text-accent-purple px-2 py-0.5 rounded bg-accent-purple/10 border border-accent-purple/30">{player.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step 5 — News list page

`web/src/app/[locale]/news/page.tsx`:

```tsx
import { articles } from "@/lib/mock-data";
import { getLocale, getTranslations } from "next-intl/server";
import { NewsFilterClient } from "@/components/page/NewsFilterClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "News" };

export default async function NewsPage() {
  const locale = await getLocale();
  const t = await getTranslations("news");
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading font-bold text-4xl text-white mb-8">{t("title")}</h1>
      <NewsFilterClient articles={articles} locale={locale} />
    </div>
  );
}
```

`web/src/components/page/NewsFilterClient.tsx`:

```tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Article, ArticleCategory } from "@/types";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { Tabs } from "@/components/ui/Tabs";

const CATEGORIES: Array<ArticleCategory | "all"> = ["all", "news", "interview", "highlight", "recap"];

interface Props { articles: Article[]; locale: string; }

export function NewsFilterClient({ articles, locale }: Props) {
  const [cat, setCat] = useState<string>("all");
  const tabs = CATEGORIES.map((c) => ({ id: c, label: c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1) }));
  const filtered = cat === "all" ? articles : articles.filter((a) => a.category === cat);
  return (
    <>
      <Tabs tabs={tabs} defaultTab="all" onChange={setCat} className="mb-8 max-w-xl" />
      <motion.div key={cat} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((a) => <ArticleCard key={a.id} article={a} locale={locale} />)}
      </motion.div>
    </>
  );
}
```

### Step 6 — News detail page

`web/src/app/[locale]/news/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { articles } from "@/lib/mock-data";
import Image from "next/image";
import { Clock, User, Tag } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return articles.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = articles.find((a) => a.id === id);
  return { title: article?.title ?? "Article" };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = await params;
  const article = articles.find((a) => a.id === id);
  if (!article) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Category + meta */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-mono font-semibold uppercase px-2.5 py-1 rounded border bg-bg-card text-accent-cyan border-accent-cyan/40">
          {article.category}
        </span>
      </div>
      <h1 className="font-heading font-bold text-3xl sm:text-4xl text-white mb-4">{article.title}</h1>
      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 text-text-muted text-sm mb-6">
        <span className="flex items-center gap-1.5"><User size={14} />{article.author}</span>
        <span className="flex items-center gap-1.5"><Clock size={14} />{article.readTime} min read</span>
        <span>{timeAgo(article.publishDate)}</span>
      </div>
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {article.tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-bg-card border border-white/10 text-text-secondary">
            <Tag size={10} />{tag}
          </span>
        ))}
      </div>
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden mb-8 bg-bg-surface">
        <Image src={article.thumbnail} alt={article.title} fill className="object-cover" />
      </div>
      {/* Excerpt (demo content) */}
      <p className="text-text-secondary leading-relaxed text-base">{article.excerpt}</p>
      <div className="mt-6 p-6 bg-bg-card border border-white/10 rounded-xl text-text-muted text-sm">
        Full article content will be loaded from the CMS/backend in production.
      </div>
    </article>
  );
}
```

### Step 7 — Minigames showcase page

`web/src/app/[locale]/minigames/page.tsx`:

```tsx
"use client";
import { minigames } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Trophy, Gamepad2, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  prediction: <Trophy size={48} className="text-warning" />,
  bracket: <Gamepad2 size={48} className="text-accent-cyan" />,
  quiz: <Zap size={48} className="text-accent-purple" />,
};

export default function MinigamesPage() {
  const t = useTranslations("minigames");
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading font-bold text-5xl text-white mb-3">🎮 {t("title")}</h1>
        <p className="text-text-secondary max-w-xl mx-auto">Compete, predict, and win exclusive rewards.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {minigames.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(0,212,255,0.2)" }}
            className="flex flex-col gap-6 p-8 bg-bg-card border border-white/10 rounded-2xl"
          >
            <div className="flex justify-center">{TYPE_ICONS[game.type]}</div>
            <div className="text-center">
              <h2 className="font-heading font-bold text-2xl text-white mb-2">{game.name}</h2>
              <p className="text-text-secondary text-sm">{game.description}</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-text-muted">
                <Users size={14} />
                {game.playerCount.toLocaleString()} {t("players")}
              </span>
              <span className="font-mono font-bold text-warning text-lg">{game.reward}</span>
            </div>
            <Button variant="primary" glow className="w-full justify-center" disabled>
              {t("playNow")} — Coming Soon
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

---

## Todo List

- [ ] Create `web/src/app/[locale]/tournaments/page.tsx`
- [ ] Create `web/src/components/page/TournamentsFilterClient.tsx`
- [ ] Create `web/src/app/[locale]/tournaments/[id]/page.tsx` with `generateStaticParams`
- [ ] Create `web/src/app/[locale]/teams/page.tsx`
- [ ] Create `web/src/app/[locale]/teams/[id]/page.tsx` with `generateStaticParams`
- [ ] Create `web/src/app/[locale]/news/page.tsx`
- [ ] Create `web/src/components/page/NewsFilterClient.tsx`
- [ ] Create `web/src/app/[locale]/news/[id]/page.tsx` with `generateStaticParams`
- [ ] Create `web/src/app/[locale]/minigames/page.tsx`
- [ ] Create `web/src/components/page/` directory
- [ ] Test direct URL navigation to `/en/tournaments/vct-2026`
- [ ] Test `notFound()` triggered for invalid IDs
- [ ] Test `generateStaticParams` — build includes all detail routes
- [ ] Test team detail shows all 5 players per team
- [ ] Test news detail renders article correctly
- [ ] Test language switcher on subpages preserves route

---

## Success Criteria

- All 4 list pages render with correct mock data
- All detail pages accessible via URL, show correct filtered data
- Invalid ID URLs return 404 page
- `npm run build` shows all static detail routes pre-rendered
- Tabs filter tournaments/articles correctly
- Team roster shows all players with role badges
- Minigames page has disabled "Coming Soon" CTA buttons

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| `params` not awaited in detail pages | High | Always `const { id } = await params` |
| `generateStaticParams` missing locale segment | Medium | Return `{ id }` only — locale handled by parent layout |
| Framer Motion in Server Component | Medium | `minigames/page.tsx` marked `"use client"` |
| `next-intl` `useTranslations` in server page | Medium | Use `getTranslations()` from `next-intl/server` |

---

## Security Considerations

- Article `content` field: if ever rendering user HTML, use DOMPurify. For now,
  demo content is hardcoded — no XSS risk.
- `generateStaticParams` ensures only known IDs are pre-rendered.

---

## Next Steps

Phase 06: Polish — animation refinement, responsive fixes, SEO, performance, a11y
