# Research Report 02: eSport UI Patterns + Design + Mock Data

## 1. eSport Web Design Patterns

### Common Patterns (HLTV, VLR.gg, Liquipedia)
- **Match cards**: Two team logos flanking score, status badge (LIVE/upcoming/completed), time indicator
- **Tournament brackets**: Tree-style bracket visualization, clickable nodes
- **Team rankings**: Table with rank #, team logo+name, W-L record, points, trend arrow
- **Live indicators**: Red pulsing dot, "LIVE" badge, viewer count
- **Score tables**: Zebra-striped rows, sticky header, sortable columns

### Key UI Elements
- **Status badges**: Color-coded (red=live, blue=upcoming, gray=completed)
- **Team logos**: Circular/rounded-square, consistent sizing, fallback initials
- **Score display**: Large monospace numbers, highlight winner
- **Time displays**: Relative ("2h ago") for recent, absolute for scheduled

### Layout Patterns
- Full-width hero with featured match/tournament
- Card grid for tournaments (3-col desktop, 1-col mobile)
- Table layout for rankings/standings
- Timeline/list for match history
- Sidebar for quick stats (optional for demo)

## 2. Glassmorphism + Neon in TailwindCSS

### Glassmorphism Card
```html
<div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
  <!-- content -->
</div>
```

### Neon Glow Effects
```html
<!-- Cyan glow button -->
<button class="bg-cyan-500/20 border border-cyan-400/50 text-cyan-400
  shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]
  transition-shadow duration-300">
</button>

<!-- Purple accent glow -->
<div class="shadow-[0_0_20px_rgba(147,51,234,0.3)]"></div>
```

### Gradient Backgrounds
```html
<!-- Animated gradient hero -->
<div class="bg-gradient-to-br from-[#0a0e17] via-[#151922] to-[#1e2530]
  bg-[length:200%_200%] animate-gradient-shift">
</div>
```

### Tailwind Config Additions
```js
extend: {
  colors: {
    bg: { DEFAULT: '#0a0e17', surface: '#151922', card: '#1e2530' },
    accent: { cyan: '#00d4ff', purple: '#9333ea' }
  },
  animation: {
    'gradient-shift': 'gradient-shift 6s ease infinite',
    'pulse-glow': 'glow 2s ease-in-out infinite'
  }
}
```

## 3. Mock Data Strategy

### Recommended: Static TypeScript Files
For a preview demo connecting to NestJS later, use **static TS mock data files**.

**Why:**
- Zero runtime overhead
- Type-safe, matches backend schemas
- Easy to replace with API calls later
- No extra dependencies (MSW/faker add complexity)

### Structure
```
lib/mock-data/
├── teams.ts          # 6-8 teams with players
├── tournaments.ts    # 3-5 tournaments (mix of statuses)
├── matches.ts        # 10-15 matches
├── articles.ts       # 4-6 news articles
├── minigames.ts      # 3 minigame previews
└── index.ts          # Re-export all
```

### Data Access Pattern
```ts
// lib/mock-data/teams.ts
import { Team } from "@/types";
export const teams: Team[] = [/* ... */];

// Later replace with:
// export async function getTeams() { return fetch('/api/teams').then(r => r.json()); }
```

### Alignment with Backend Schemas
Frontend mock types should mirror backend schemas but with populated fields:
- Backend `Team.players: ObjectId[]` → Frontend `Team.players: Player[]`
- Backend `Tournament.status: 'upcoming'|'ongoing'|'completed'|'cancelled'` → Match in frontend
- Backend `Match.score: { team1: number, team2: number }` → Keep same structure

### Key Consideration
- Mock data should use realistic eSport names/stats
- Use placeholder image URLs (via `/placeholder.svg` or avatar generators)
- Dates should be relative to current date for demo freshness

## Unresolved Questions
- Prompt mentions `react-i18next` as alternative — `next-intl` is better for App Router
- Prompt says "single JSX artifact" in final output but describes full project structure — recommend proper project structure for maintainability
