# Phase 02 — Types, Mock Data & UI Primitives

## Context

- Plan: [plan.md](./plan.md)
- Research: [researcher-02-report.md](./research/researcher-02-report.md)
- Blocked by: [Phase 01](./phase-01-project-setup.md)
- Blocks: Phases 03, 04, 05

---

## Overview

| Field | Value |
|---|---|
| Date | 2026-02-14 |
| Priority | High |
| Status | pending |
| Review | pending |

Define all TypeScript interfaces aligned with backend schemas, populate realistic
mock data, and build the four reusable UI primitives (Card, Button, Badge, Tabs)
plus three shared domain components (TeamLogo, MatchCard, ArticleCard).

---

## Key Insights

- Backend `Team.players` is `ObjectId[]` but frontend needs populated `Player[]` —
  define both a `TeamBase` (id refs) and a `Team` (populated) type so future API
  migration is clean.
- Backend `Tournament.status` uses `'ongoing'` but the UI spec uses `'live'` —
  add a `displayStatus` mapper utility. Keep raw type matching backend exactly.
- Static TypeScript mock files have zero runtime overhead and are trivially replaced
  with `fetch()` calls later without changing consumer components.

---

## Requirements

**Types (`web/src/types/index.ts`):**
- `Player`, `Team`, `TeamBase`
- `Tournament`, `TournamentStatus`
- `Match`, `MatchStatus`, `MatchScore`
- `Article`, `ArticleCategory`
- `Minigame`
- `Standing` (for standings table)
- `Locale` (`'vi' | 'en'`)

**Mock data (`web/src/lib/mock-data/`):**
- `teams.ts` — 6 teams with 5 players each
- `tournaments.ts` — 5 tournaments (1 live/ongoing, 2 upcoming, 2 completed)
- `matches.ts` — 12 matches (mix of statuses; 1 live, 5 completed, 6 scheduled)
- `articles.ts` — 6 news articles
- `minigames.ts` — 3 minigame previews
- `standings.ts` — standings computed from mock matches
- `index.ts` — re-exports all

**UI Primitives (`web/src/components/ui/`):**
- `Card.tsx` — glassmorphism card wrapper
- `Button.tsx` — primary/secondary/ghost variants + glow
- `Badge.tsx` — status badge (live/upcoming/completed/cancelled)
- `Tabs.tsx` — tab bar with active indicator animation

**Shared components (`web/src/components/shared/`):**
- `TeamLogo.tsx` — team logo with fallback initials
- `MatchCard.tsx` — match row (logos, scores, status, time)
- `ArticleCard.tsx` — news card (thumbnail, category, title, meta)

---

## Architecture

### Type Alignment Strategy

```
Backend Schema          Frontend Type
──────────────          ─────────────
Team.players: ObjectId[] → Team.players: Player[]   (populated)
Tournament.status: 'ongoing' → TournamentStatus includes 'ongoing'
                             + helper: toDisplayStatus('ongoing') → 'live'
Match.score: {team1,team2}  → MatchScore: {team1: number, team2: number}
User.role: 'player'|'organizer'|'admin' → UserRole type (Phase 05 if needed)
```

### Component Props Pattern

All components use explicit TypeScript interfaces for props — no `any`, no implicit
`children: React.ReactNode` unless needed.

```tsx
// Example pattern
interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "cyan" | "purple" | "none";
}
```

---

## Related Code Files

| File | Action | Notes |
|---|---|---|
| `web/src/types/index.ts` | create | All TS interfaces |
| `web/src/lib/mock-data/teams.ts` | create | 6 teams |
| `web/src/lib/mock-data/tournaments.ts` | create | 5 tournaments |
| `web/src/lib/mock-data/matches.ts` | create | 12 matches |
| `web/src/lib/mock-data/articles.ts` | create | 6 articles |
| `web/src/lib/mock-data/minigames.ts` | create | 3 minigames |
| `web/src/lib/mock-data/standings.ts` | create | standings data |
| `web/src/lib/mock-data/index.ts` | create | re-exports |
| `web/src/lib/utils.ts` | create | helpers (cn, formatters) |
| `web/src/components/ui/Card.tsx` | create | glass card |
| `web/src/components/ui/Button.tsx` | create | button variants |
| `web/src/components/ui/Badge.tsx` | create | status badge |
| `web/src/components/ui/Tabs.tsx` | create | animated tabs |
| `web/src/components/shared/TeamLogo.tsx` | create | logo + fallback |
| `web/src/components/shared/MatchCard.tsx` | create | match row |
| `web/src/components/shared/ArticleCard.tsx` | create | news card |

---

## Implementation Steps

### Step 1 — Types

`web/src/types/index.ts`:

```ts
export type Locale = "vi" | "en";

// ── Users ──────────────────────────────────────────────
export type UserRole = "player" | "organizer" | "admin";

export interface Player {
  id: string;
  ign: string;
  realName: string;
  role: string;
  avatar: string;
  country?: string;
}

// ── Teams ──────────────────────────────────────────────
export interface TeamBase {
  id: string;
  name: string;
  tag: string;
  logo: string;
  country: string;
}

export interface Team extends TeamBase {
  players: Player[];
  captainId: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  rank: number;
  region: string;
}

// ── Tournaments ────────────────────────────────────────
// Matches backend exactly (including 'ongoing')
export type TournamentStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export interface Tournament {
  id: string;
  name: string;
  description: string;
  game: string;
  startDate: string; // ISO string
  endDate: string;
  status: TournamentStatus;
  teams: number;            // count for display
  teamIds: string[];        // for linking
  prizePool: number;        // numeric, format on display
  prizeCurrency: string;    // "USD"
  banner: string;
  region: string;
  organizerId?: string;
  rules?: string;
}

// ── Matches ────────────────────────────────────────────
export type MatchStatus = "scheduled" | "live" | "completed" | "cancelled";

export interface MatchScore {
  team1: number;
  team2: number;
}

export interface Match {
  id: string;
  tournamentId: string;
  team1: TeamBase;
  team2: TeamBase;
  score: MatchScore;
  status: MatchStatus;
  scheduledTime: string; // ISO string
  winnerId?: string;
  duration?: number;     // minutes
  streamUrl?: string;
  map?: string;
  round?: number;
}

// ── Articles ───────────────────────────────────────────
export type ArticleCategory = "news" | "interview" | "highlight" | "recap";

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  category: ArticleCategory;
  author: string;
  publishDate: string; // ISO string
  readTime: number;    // minutes
  tags: string[];
}

// ── Minigames ──────────────────────────────────────────
export interface Minigame {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  reward: string;
  rewardType: "cash" | "points" | "item";
  playerCount: number;
  type: "prediction" | "bracket" | "quiz";
}

// ── Standings ──────────────────────────────────────────
export interface Standing {
  rank: number;
  team: TeamBase;
  wins: number;
  losses: number;
  draws: number;
  roundDiff: number;
  points: number;
  form: ("W" | "L" | "D")[]; // last 5 results
}
```

### Step 2 — utils.ts

`web/src/lib/utils.ts`:

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TournamentStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Map backend 'ongoing' to display 'live'
export function toDisplayStatus(status: TournamentStatus): string {
  return status === "ongoing" ? "live" : status;
}

export function formatPrizePool(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function formatDate(isoDate: string, locale = "en"): string {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}
```

Install peer deps for `cn`: `npm install clsx tailwind-merge`

### Step 3 — Mock teams

`web/src/lib/mock-data/teams.ts`:

```ts
import { Team } from "@/types";

export const teams: Team[] = [
  {
    id: "t1",
    name: "T1",
    tag: "T1",
    logo: "/mock/teams/t1.svg",
    country: "KR",
    region: "Asia",
    rank: 1,
    wins: 15,
    losses: 2,
    draws: 0,
    points: 100,
    captainId: "p1",
    players: [
      { id: "p1", ign: "Faker", realName: "Lee Sang-hyeok", role: "Mid", avatar: "/mock/players/faker.svg", country: "KR" },
      { id: "p2", ign: "Gumayusi", realName: "Lee Min-hyeong", role: "Bot", avatar: "/mock/players/gumayusi.svg", country: "KR" },
      { id: "p3", ign: "Keria", realName: "Ryu Min-seok", role: "Support", avatar: "/mock/players/keria.svg", country: "KR" },
      { id: "p4", ign: "Zeus", realName: "Choi Woo-je", role: "Top", avatar: "/mock/players/zeus.svg", country: "KR" },
      { id: "p5", ign: "Oner", realName: "Moon Hyeon-jun", role: "Jungle", avatar: "/mock/players/oner.svg", country: "KR" },
    ],
  },
  {
    id: "fnc",
    name: "Fnatic",
    tag: "FNC",
    logo: "/mock/teams/fnc.svg",
    country: "EU",
    region: "Europe",
    rank: 2,
    wins: 12,
    losses: 4,
    draws: 1,
    points: 85,
    captainId: "p6",
    players: [
      { id: "p6", ign: "Upset", realName: "Elias Lipp", role: "Bot", avatar: "/mock/players/upset.svg", country: "DE" },
      { id: "p7", ign: "Humanoid", realName: "Martin Sundelin", role: "Mid", avatar: "/mock/players/humanoid.svg", country: "SE" },
      { id: "p8", ign: "Razork", realName: "Iván Martín", role: "Jungle", avatar: "/mock/players/razork.svg", country: "ES" },
      { id: "p9", ign: "Wunder", realName: "Martin Hansen", role: "Top", avatar: "/mock/players/wunder.svg", country: "DK" },
      { id: "p10", ign: "Rhukz", realName: "Daniel Bjerre", role: "Support", avatar: "/mock/players/rhukz.svg", country: "DK" },
    ],
  },
  {
    id: "prx",
    name: "Paper Rex",
    tag: "PRX",
    logo: "/mock/teams/prx.svg",
    country: "SG",
    region: "SEA",
    rank: 3,
    wins: 11,
    losses: 5,
    draws: 0,
    points: 78,
    captainId: "p11",
    players: [
      { id: "p11", ign: "f0rsakeN", realName: "Jason Susanto", role: "Duelist", avatar: "/mock/players/forsaken.svg", country: "SG" },
      { id: "p12", ign: "mindfreak", realName: "Aaron Leonhart", role: "Controller", avatar: "/mock/players/mindfreak.svg", country: "AU" },
      { id: "p13", ign: "Jinggg", realName: "Wang Jing Jie", role: "Duelist", avatar: "/mock/players/jinggg.svg", country: "SG" },
      { id: "p14", ign: "d4v41", realName: "Khalish Rusyaidee", role: "Initiator", avatar: "/mock/players/d4v41.svg", country: "MY" },
      { id: "p15", ign: "something", realName: "Ilya Petrov", role: "Sentinel", avatar: "/mock/players/something.svg", country: "RU" },
    ],
  },
  {
    id: "sen",
    name: "Sentinels",
    tag: "SEN",
    logo: "/mock/teams/sen.svg",
    country: "US",
    region: "Americas",
    rank: 4,
    wins: 10,
    losses: 5,
    draws: 0,
    points: 72,
    captainId: "p16",
    players: [
      { id: "p16", ign: "TenZ", realName: "Tyson Ngo", role: "Duelist", avatar: "/mock/players/tenz.svg", country: "CA" },
      { id: "p17", ign: "Zellsis", realName: "Jordan Montemurro", role: "Duelist", avatar: "/mock/players/zellsis.svg", country: "US" },
      { id: "p18", ign: "Sacy", realName: "Gustavo Rossi", role: "Initiator", avatar: "/mock/players/sacy.svg", country: "BR" },
      { id: "p19", ign: "pANcada", realName: "Bryan Luna", role: "Controller", avatar: "/mock/players/pancada.svg", country: "BR" },
      { id: "p20", ign: "johnqt", realName: "John Marlin", role: "Sentinel", avatar: "/mock/players/johnqt.svg", country: "US" },
    ],
  },
  {
    id: "nrg",
    name: "NRG Esports",
    tag: "NRG",
    logo: "/mock/teams/nrg.svg",
    country: "US",
    region: "Americas",
    rank: 5,
    wins: 9,
    losses: 6,
    draws: 1,
    points: 65,
    captainId: "p21",
    players: [
      { id: "p21", ign: "crashies", realName: "Austin Roberts", role: "Initiator", avatar: "/mock/players/crashies.svg", country: "US" },
      { id: "p22", ign: "Victor", realName: "Victor Wong", role: "Duelist", avatar: "/mock/players/victor.svg", country: "US" },
      { id: "p23", ign: "s0m", realName: "Sam Oh", role: "Controller", avatar: "/mock/players/s0m.svg", country: "US" },
      { id: "p24", ign: "FNS", realName: "Pujan Mehta", role: "Controller", avatar: "/mock/players/fns.svg", country: "CA" },
      { id: "p25", ign: "ardiis", realName: "Ardis Svarenieks", role: "Sentinel", avatar: "/mock/players/ardiis.svg", country: "LV" },
    ],
  },
  {
    id: "tl",
    name: "Team Liquid",
    tag: "TL",
    logo: "/mock/teams/tl.svg",
    country: "EU",
    region: "Europe",
    rank: 6,
    wins: 8,
    losses: 6,
    draws: 2,
    points: 60,
    captainId: "p26",
    players: [
      { id: "p26", ign: "Jamppi", realName: "Elias Olkkonen", role: "Duelist", avatar: "/mock/players/jamppi.svg", country: "FI" },
      { id: "p27", ign: "nAts", realName: "Ayaz Akhmetshin", role: "Sentinel", avatar: "/mock/players/nats.svg", country: "RU" },
      { id: "p28", ign: "Redgar", realName: "Igor Vlasov", role: "Initiator", avatar: "/mock/players/redgar.svg", country: "RU" },
      { id: "p29", ign: "ANGE1", realName: "Kyrylo Karasov", role: "Controller", avatar: "/mock/players/angel.svg", country: "UA" },
      { id: "p30", ign: "ScreaM", realName: "Adil Benrlitom", role: "Duelist", avatar: "/mock/players/scream.svg", country: "BE" },
    ],
  },
];
```

Note: `/mock/` image paths — add a `web/public/mock/` folder with placeholder SVGs
or use `https://ui-avatars.com/api/?name=T1&background=00d4ff&color=fff` URLs.

### Step 4 — Mock tournaments

`web/src/lib/mock-data/tournaments.ts`:

```ts
import { Tournament } from "@/types";

export const tournaments: Tournament[] = [
  {
    id: "vct-2026",
    name: "VCT Champions 2026",
    description: "The biggest Valorant tournament of the year.",
    game: "Valorant",
    startDate: "2026-02-10T00:00:00Z",
    endDate: "2026-02-20T00:00:00Z",
    status: "ongoing",
    teams: 16,
    teamIds: ["t1", "fnc", "prx", "sen", "nrg", "tl"],
    prizePool: 500000,
    prizeCurrency: "USD",
    banner: "/mock/tournaments/vct2026.svg",
    region: "International",
  },
  {
    id: "esl-pro-2026",
    name: "ESL Pro League S21",
    description: "CS2 premier league — spring season.",
    game: "CS2",
    startDate: "2026-03-01T00:00:00Z",
    endDate: "2026-03-30T00:00:00Z",
    status: "upcoming",
    teams: 24,
    teamIds: ["t1", "fnc", "tl"],
    prizePool: 250000,
    prizeCurrency: "USD",
    banner: "/mock/tournaments/eslpro.svg",
    region: "International",
  },
  {
    id: "blast-spring-2026",
    name: "BLAST Premier Spring 2026",
    description: "Spring group stage — top 8 CS2 teams.",
    game: "CS2",
    startDate: "2026-04-05T00:00:00Z",
    endDate: "2026-04-15T00:00:00Z",
    status: "upcoming",
    teams: 8,
    teamIds: ["fnc", "nrg"],
    prizePool: 177500,
    prizeCurrency: "USD",
    banner: "/mock/tournaments/blast.svg",
    region: "Europe",
  },
  {
    id: "worlds-2025",
    name: "League of Legends Worlds 2025",
    description: "Season finale — 24 teams, one world champion.",
    game: "League of Legends",
    startDate: "2025-10-01T00:00:00Z",
    endDate: "2025-11-02T00:00:00Z",
    status: "completed",
    teams: 24,
    teamIds: ["t1", "fnc"],
    prizePool: 2250000,
    prizeCurrency: "USD",
    banner: "/mock/tournaments/worlds2025.svg",
    region: "International",
  },
  {
    id: "vct-2025",
    name: "VCT Champions 2025",
    description: "Valorant Champions Tour 2025 grand finals.",
    game: "Valorant",
    startDate: "2025-08-01T00:00:00Z",
    endDate: "2025-08-25T00:00:00Z",
    status: "completed",
    teams: 16,
    teamIds: ["prx", "sen", "nrg"],
    prizePool: 1000000,
    prizeCurrency: "USD",
    banner: "/mock/tournaments/vct2025.svg",
    region: "International",
  },
];
```

### Step 5 — Mock matches

`web/src/lib/mock-data/matches.ts`:

```ts
import { Match } from "@/types";
import { teams } from "./teams";

const tb = (id: string) => {
  const t = teams.find((t) => t.id === id)!;
  return { id: t.id, name: t.name, tag: t.tag, logo: t.logo, country: t.country };
};

export const matches: Match[] = [
  // Live match
  { id: "m1", tournamentId: "vct-2026", team1: tb("t1"), team2: tb("fnc"), score: { team1: 8, team2: 5 }, status: "live", scheduledTime: new Date(Date.now() - 3600000).toISOString(), streamUrl: "https://twitch.tv/valorant", map: "Ascent", round: 1 },
  // Completed
  { id: "m2", tournamentId: "vct-2026", team1: tb("prx"), team2: tb("sen"), score: { team1: 13, team2: 7 }, status: "completed", scheduledTime: new Date(Date.now() - 7200000).toISOString(), winnerId: "prx", duration: 42, map: "Haven", round: 1 },
  { id: "m3", tournamentId: "vct-2026", team1: tb("nrg"), team2: tb("tl"), score: { team1: 10, team2: 13 }, status: "completed", scheduledTime: new Date(Date.now() - 14400000).toISOString(), winnerId: "tl", duration: 55, map: "Bind", round: 1 },
  { id: "m4", tournamentId: "worlds-2025", team1: tb("t1"), team2: tb("fnc"), score: { team1: 3, team2: 1 }, status: "completed", scheduledTime: "2025-11-02T14:00:00Z", winnerId: "t1", duration: 90, round: 5 },
  { id: "m5", tournamentId: "worlds-2025", team1: tb("sen"), team2: tb("nrg"), score: { team1: 2, team2: 3 }, status: "completed", scheduledTime: "2025-10-28T10:00:00Z", winnerId: "nrg", duration: 68, round: 4 },
  { id: "m6", tournamentId: "vct-2025", team1: tb("prx"), team2: tb("tl"), score: { team1: 13, team2: 11 }, status: "completed", scheduledTime: "2025-08-24T16:00:00Z", winnerId: "prx", duration: 52, map: "Icebox", round: 3 },
  // Scheduled
  { id: "m7", tournamentId: "vct-2026", team1: tb("t1"), team2: tb("prx"), score: { team1: 0, team2: 0 }, status: "scheduled", scheduledTime: new Date(Date.now() + 3600000).toISOString(), map: "Lotus", round: 2 },
  { id: "m8", tournamentId: "vct-2026", team1: tb("fnc"), team2: tb("sen"), score: { team1: 0, team2: 0 }, status: "scheduled", scheduledTime: new Date(Date.now() + 7200000).toISOString(), map: "Pearl", round: 2 },
  { id: "m9", tournamentId: "vct-2026", team1: tb("nrg"), team2: tb("tl"), score: { team1: 0, team2: 0 }, status: "scheduled", scheduledTime: new Date(Date.now() + 86400000).toISOString(), round: 2 },
  { id: "m10", tournamentId: "esl-pro-2026", team1: tb("t1"), team2: tb("tl"), score: { team1: 0, team2: 0 }, status: "scheduled", scheduledTime: "2026-03-05T12:00:00Z", round: 1 },
  { id: "m11", tournamentId: "esl-pro-2026", team1: tb("fnc"), team2: tb("prx"), score: { team1: 0, team2: 0 }, status: "scheduled", scheduledTime: "2026-03-05T15:00:00Z", round: 1 },
  { id: "m12", tournamentId: "blast-spring-2026", team1: tb("fnc"), team2: tb("nrg"), score: { team1: 0, team2: 0 }, status: "scheduled", scheduledTime: "2026-04-06T18:00:00Z", round: 1 },
];
```

### Step 6 — Mock articles

`web/src/lib/mock-data/articles.ts`:

```ts
import { Article } from "@/types";

export const articles: Article[] = [
  {
    id: "a1",
    title: "T1 Dominates VCT Champions 2026 Opening Day",
    excerpt: "T1 showed incredible form defeating Fnatic 13-5 in the first match of the tournament.",
    content: "...",
    thumbnail: "/mock/articles/t1-vct2026.svg",
    category: "recap",
    author: "Alex Chen",
    publishDate: new Date(Date.now() - 7200000).toISOString(),
    readTime: 4,
    tags: ["T1", "VCT", "Valorant"],
  },
  {
    id: "a2",
    title: "Paper Rex's f0rsakeN: 'We're here to win, not to participate'",
    excerpt: "Exclusive interview with PRX's star duelist before the VCT Champions 2026 semifinal.",
    content: "...",
    thumbnail: "/mock/articles/forsaken-interview.svg",
    category: "interview",
    author: "Sarah Kim",
    publishDate: new Date(Date.now() - 86400000).toISOString(),
    readTime: 6,
    tags: ["PRX", "Interview", "Valorant"],
  },
  {
    id: "a3",
    title: "ESL Pro League Season 21 Full Schedule Revealed",
    excerpt: "Twenty-four teams will compete across six weeks starting March 1st.",
    content: "...",
    thumbnail: "/mock/articles/eslpro-s21.svg",
    category: "news",
    author: "Marcus Johnson",
    publishDate: new Date(Date.now() - 172800000).toISOString(),
    readTime: 3,
    tags: ["ESL", "CS2", "Announcement"],
  },
  {
    id: "a4",
    title: "Top 5 Plays from VCT Champions 2026 Day 1",
    excerpt: "From a 1v4 clutch to an ace in overtime — here are the highlights.",
    content: "...",
    thumbnail: "/mock/articles/highlights-day1.svg",
    category: "highlight",
    author: "Lisa Park",
    publishDate: new Date(Date.now() - 3600000).toISOString(),
    readTime: 2,
    tags: ["Highlights", "VCT", "Valorant"],
  },
  {
    id: "a5",
    title: "Sentinels Acquire TenZ Under New Contract Terms",
    excerpt: "TenZ re-signs with Sentinels for two more years in a record-breaking deal.",
    content: "...",
    thumbnail: "/mock/articles/tenz-resign.svg",
    category: "news",
    author: "David Torres",
    publishDate: new Date(Date.now() - 259200000).toISOString(),
    readTime: 5,
    tags: ["Sentinels", "TenZ", "Transfer"],
  },
  {
    id: "a6",
    title: "Worlds 2025 Recap: T1 Claims Fifth World Championship",
    excerpt: "A legendary run — T1 goes 18-0 through the entire 2025 World Championship.",
    content: "...",
    thumbnail: "/mock/articles/worlds-2025-recap.svg",
    category: "recap",
    author: "Emma Wilson",
    publishDate: "2025-11-03T10:00:00Z",
    readTime: 8,
    tags: ["T1", "Worlds", "LoL"],
  },
];
```

### Step 7 — Mock minigames

`web/src/lib/mock-data/minigames.ts`:

```ts
import { Minigame } from "@/types";

export const minigames: Minigame[] = [
  {
    id: "mg1",
    name: "Match Predictor",
    description: "Predict match outcomes and earn points. Top predictors win weekly rewards.",
    thumbnail: "/mock/minigames/predictor.svg",
    reward: "$100",
    rewardType: "cash",
    playerCount: 12483,
    type: "prediction",
  },
  {
    id: "mg2",
    name: "Bracket Challenge",
    description: "Fill out your perfect bracket before the tournament starts. Can you go flawless?",
    thumbnail: "/mock/minigames/bracket.svg",
    reward: "$500",
    rewardType: "cash",
    playerCount: 8271,
    type: "bracket",
  },
  {
    id: "mg3",
    name: "Daily eSport Trivia",
    description: "Test your eSport knowledge with daily questions. Streak bonuses for consecutive days.",
    thumbnail: "/mock/minigames/trivia.svg",
    reward: "10,000 pts",
    rewardType: "points",
    playerCount: 24156,
    type: "quiz",
  },
];
```

### Step 8 — Mock standings

`web/src/lib/mock-data/standings.ts`:

```ts
import { Standing } from "@/types";
import { teams } from "./teams";

const tb = (id: string) => {
  const t = teams.find((t) => t.id === id)!;
  return { id: t.id, name: t.name, tag: t.tag, logo: t.logo, country: t.country };
};

export const standings: Standing[] = [
  { rank: 1, team: tb("t1"), wins: 5, losses: 0, draws: 0, roundDiff: 32, points: 15, form: ["W","W","W","W","W"] },
  { rank: 2, team: tb("fnc"), wins: 4, losses: 1, draws: 0, roundDiff: 18, points: 12, form: ["W","W","L","W","W"] },
  { rank: 3, team: tb("prx"), wins: 3, losses: 2, draws: 0, roundDiff: 5, points: 9, form: ["W","L","W","L","W"] },
  { rank: 4, team: tb("sen"), wins: 2, losses: 3, draws: 0, roundDiff: -4, points: 6, form: ["L","W","L","W","L"] },
  { rank: 5, team: tb("tl"), wins: 1, losses: 3, draws: 1, roundDiff: -15, points: 4, form: ["D","L","L","W","L"] },
  { rank: 6, team: tb("nrg"), wins: 0, losses: 4, draws: 1, roundDiff: -36, points: 1, form: ["L","L","D","L","L"] },
];
```

### Step 9 — Mock data index

`web/src/lib/mock-data/index.ts`:

```ts
export { teams } from "./teams";
export { tournaments } from "./tournaments";
export { matches } from "./matches";
export { articles } from "./articles";
export { minigames } from "./minigames";
export { standings } from "./standings";
```

### Step 10 — UI Primitive: Card

`web/src/components/ui/Card.tsx`:

```tsx
"use client";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "cyan" | "purple" | "none";
  hover?: boolean;
}

export function Card({ children, className, glow = "none", hover = false }: CardProps) {
  const glowMap = {
    cyan: "hover:shadow-[0_0_20px_rgba(0,212,255,0.25)]",
    purple: "hover:shadow-[0_0_20px_rgba(147,51,234,0.25)]",
    none: "",
  };
  return (
    <div
      className={cn(
        "bg-bg-card border border-white/10 rounded-xl",
        "backdrop-blur-sm",
        hover && "transition-all duration-300 hover:border-white/20 hover:-translate-y-0.5",
        glowMap[glow],
        className
      )}
    >
      {children}
    </div>
  );
}
```

### Step 11 — UI Primitive: Button

`web/src/components/ui/Button.tsx`:

```tsx
"use client";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  glow?: boolean;
}

export function Button({ variant = "primary", size = "md", glow = false, className, children, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-heading font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan disabled:opacity-50";
  const variants = {
    primary: "bg-accent-cyan/20 border border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan/30",
    secondary: "bg-accent-purple/20 border border-accent-purple/50 text-accent-purple hover:bg-accent-purple/30",
    ghost: "border border-white/10 text-text-secondary hover:border-white/30 hover:text-white",
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3 text-base" };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], glow && "shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]", className)}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Step 12 — UI Primitive: Badge

`web/src/components/ui/Badge.tsx`:

```tsx
import { cn } from "@/lib/utils";
import { TournamentStatus, MatchStatus } from "@/types";

type BadgeStatus = TournamentStatus | MatchStatus | "live";

const statusConfig: Record<string, { label: string; classes: string }> = {
  live:      { label: "LIVE",      classes: "bg-red-500/20 border-red-400/50 text-red-400" },
  ongoing:   { label: "LIVE",      classes: "bg-red-500/20 border-red-400/50 text-red-400" },
  upcoming:  { label: "UPCOMING",  classes: "bg-accent-cyan/20 border-accent-cyan/50 text-accent-cyan" },
  scheduled: { label: "SCHEDULED", classes: "bg-accent-cyan/20 border-accent-cyan/50 text-accent-cyan" },
  completed: { label: "ENDED",     classes: "bg-white/10 border-white/20 text-text-secondary" },
  cancelled: { label: "CANCELLED", classes: "bg-warning/10 border-warning/30 text-warning" },
};

interface BadgeProps {
  status: BadgeStatus;
  pulse?: boolean;
  className?: string;
}

export function Badge({ status, pulse = false, className }: BadgeProps) {
  const cfg = statusConfig[status] ?? statusConfig.upcoming;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border", cfg.classes, className)}>
      {(status === "live" || status === "ongoing") && (
        <span className={cn("w-1.5 h-1.5 rounded-full bg-red-400", pulse && "animate-pulse-live")} />
      )}
      {cfg.label}
    </span>
  );
}
```

### Step 13 — UI Primitive: Tabs

`web/src/components/ui/Tabs.tsx`:

```tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, defaultTab, onChange, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  const handleSelect = (id: string) => { setActive(id); onChange?.(id); };
  return (
    <div className={cn("flex gap-1 bg-bg-surface p-1 rounded-xl border border-white/10", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleSelect(tab.id)}
          className={cn("relative flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-heading font-semibold transition-colors duration-200 z-10",
            active === tab.id ? "text-white" : "text-text-muted hover:text-text-secondary"
          )}
        >
          {active === tab.id && (
            <motion.span
              layoutId="tab-indicator"
              className="absolute inset-0 bg-accent-cyan/15 border border-accent-cyan/30 rounded-lg"
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          {tab.icon}
          <span className="relative">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
```

### Step 14 — Shared: TeamLogo

`web/src/components/shared/TeamLogo.tsx`:

```tsx
import Image from "next/image";
import { cn } from "@/lib/utils";

interface TeamLogoProps {
  logo: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: 24, md: 40, lg: 64 };

export function TeamLogo({ logo, name, size = "md", className }: TeamLogoProps) {
  const px = sizes[size];
  return (
    <div className={cn("relative rounded-lg overflow-hidden bg-bg-surface flex-shrink-0", className)} style={{ width: px, height: px }}>
      <Image
        src={logo}
        alt={`${name} logo`}
        fill
        className="object-contain p-1"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-xs font-heading font-bold text-accent-cyan" aria-hidden>
        {name.slice(0, 3).toUpperCase()}
      </span>
    </div>
  );
}
```

### Step 15 — Shared: MatchCard

`web/src/components/shared/MatchCard.tsx`:

```tsx
import { Match } from "@/types";
import { TeamLogo } from "./TeamLogo";
import { Badge } from "@/components/ui/Badge";
import { cn, timeAgo } from "@/lib/utils";

interface MatchCardProps {
  match: Match;
  className?: string;
}

export function MatchCard({ match, className }: MatchCardProps) {
  const isCompleted = match.status === "completed";
  const t1Wins = isCompleted && match.winnerId === match.team1.id;
  const t2Wins = isCompleted && match.winnerId === match.team2.id;
  return (
    <div className={cn("flex items-center gap-4 p-4 bg-bg-card border border-white/10 rounded-xl hover:border-white/20 transition-colors", className)}>
      {/* Team 1 */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        <span className={cn("font-heading font-semibold text-sm truncate", t1Wins ? "text-white" : "text-text-secondary")}>{match.team1.name}</span>
        <TeamLogo logo={match.team1.logo} name={match.team1.name} size="sm" />
      </div>
      {/* Score */}
      <div className="flex flex-col items-center min-w-[80px]">
        <Badge status={match.status} pulse={match.status === "live"} />
        <div className="flex items-center gap-2 mt-1">
          <span className={cn("font-mono text-xl font-bold", t1Wins ? "text-white" : "text-text-secondary")}>{match.score.team1}</span>
          <span className="text-text-muted text-sm">:</span>
          <span className={cn("font-mono text-xl font-bold", t2Wins ? "text-white" : "text-text-secondary")}>{match.score.team2}</span>
        </div>
        {match.map && <span className="text-text-muted text-xs">{match.map}</span>}
      </div>
      {/* Team 2 */}
      <div className="flex items-center gap-2 flex-1 justify-start">
        <TeamLogo logo={match.team2.logo} name={match.team2.name} size="sm" />
        <span className={cn("font-heading font-semibold text-sm truncate", t2Wins ? "text-white" : "text-text-secondary")}>{match.team2.name}</span>
      </div>
      {/* Time */}
      <span className="text-text-muted text-xs hidden md:block w-16 text-right">{timeAgo(match.scheduledTime)}</span>
    </div>
  );
}
```

### Step 16 — Shared: ArticleCard

`web/src/components/shared/ArticleCard.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { Article } from "@/types";
import { cn, timeAgo } from "@/lib/utils";
import { Clock } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  locale: string;
  className?: string;
}

const categoryColors: Record<string, string> = {
  news: "text-accent-cyan border-accent-cyan/50",
  interview: "text-accent-purple border-accent-purple/50",
  highlight: "text-success border-success/50",
  recap: "text-warning border-warning/50",
};

export function ArticleCard({ article, locale, className }: ArticleCardProps) {
  return (
    <Link href={`/${locale}/news/${article.id}`} className={cn("group block bg-bg-card border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5", className)}>
      <div className="relative aspect-video bg-bg-surface">
        <Image src={article.thumbnail} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        <span className={cn("absolute top-3 left-3 text-xs font-mono font-semibold uppercase px-2 py-1 rounded border bg-bg-card/80 backdrop-blur-sm", categoryColors[article.category])}>
          {article.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-heading font-semibold text-white line-clamp-2 mb-2 group-hover:text-accent-cyan transition-colors">{article.title}</h3>
        <p className="text-text-muted text-sm line-clamp-2 mb-3">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>{article.author}</span>
          <span className="flex items-center gap-1"><Clock size={12} />{article.readTime} min · {timeAgo(article.publishDate)}</span>
        </div>
      </div>
    </Link>
  );
}
```

---

## Todo List

- [ ] Create `web/src/types/index.ts` with all interfaces
- [ ] Install `clsx` and `tailwind-merge`: `npm install clsx tailwind-merge`
- [ ] Create `web/src/lib/utils.ts`
- [ ] Create `web/src/lib/mock-data/teams.ts`
- [ ] Create `web/src/lib/mock-data/tournaments.ts`
- [ ] Create `web/src/lib/mock-data/matches.ts`
- [ ] Create `web/src/lib/mock-data/articles.ts`
- [ ] Create `web/src/lib/mock-data/minigames.ts`
- [ ] Create `web/src/lib/mock-data/standings.ts`
- [ ] Create `web/src/lib/mock-data/index.ts`
- [ ] Create `web/src/components/ui/Card.tsx`
- [ ] Create `web/src/components/ui/Button.tsx`
- [ ] Create `web/src/components/ui/Badge.tsx`
- [ ] Create `web/src/components/ui/Tabs.tsx`
- [ ] Create `web/src/components/shared/TeamLogo.tsx`
- [ ] Create `web/src/components/shared/MatchCard.tsx`
- [ ] Create `web/src/components/shared/ArticleCard.tsx`
- [ ] Add placeholder SVGs/images to `web/public/mock/`
- [ ] Verify no TypeScript errors: `npm run build`

---

## Success Criteria

- `tsc --noEmit` passes with 0 errors
- All mock data exports type-check against defined interfaces
- UI primitives render in browser without errors
- `Badge` shows red pulsing dot for `ongoing`/`live` status
- `Tabs` animates active indicator with spring transition

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Broken image paths | High | Use `ui-avatars.com` URLs as fallback in mock data |
| `framer-motion` not marked `"use client"` | High | All Framer Motion components need `"use client"` |
| `clsx`/`twMerge` not installed | Medium | Run `npm install clsx tailwind-merge` in Step 2 |

---

## Security Considerations

- Mock data only — no user input, no XSS risk in this phase
- `ArticleCard` uses `Link` (no `dangerouslySetInnerHTML`)

---

## Next Steps

Phase 03: Header, Footer, page transition wrapper using these types and primitives
