# Prompt Xây Dựng Web Preview Demo - Nền Tảng eSport

## Tổng Quan Dự Án
Xây dựng trang web demo preview cho nền tảng eSport với backend đang phát triển, sử dụng công nghệ hiện đại, thiết kế tối giản và hỗ trợ đa ngôn ngữ.

---

## Tính Năng Chính

### 1. Quản Lý Đội Tuyển & Giải Đấu
- **Danh sách đội tuyển**
  - Hiển thị logo, tên đội, danh sách thành viên
  - Thống kê nhanh: số trận thắng, tỷ lệ thắng
  - Chi tiết từng cầu thủ: tên, vị trí, avatar
  
- **Thông tin giải đấu**
  - Giải đấu đang diễn ra (Live)
  - Giải đấu sắp tới (Upcoming)
  - Giải đấu đã kết thúc (Completed)
  - Prize pool, số đội tham gia
  
- **Lịch sử trận đấu**
  - Danh sách các trận đã đấu
  - Kết quả, thời gian, đội thi đấu
  - Link xem replay/highlights

### 2. Hệ Thống Chấm Điểm
- **Bảng điểm theo vòng đấu**
  - Điểm số từng round
  - Tổng điểm tích lũy
  - Rank/vị trí hiện tại
  
- **Xếp hạng đội tuyển**
  - Bảng xếp hạng tổng thể
  - Lọc theo giải đấu
  - Visualize xu hướng tăng/giảm

- **Chi tiết trận đấu**
  - Breakdown điểm từng map/game
  - MVP của trận
  - Statistics chi tiết

### 3. Hệ Thống Đăng Bài
- **Quản lý nội dung**
  - Tin tức giải đấu
  - Phỏng vấn cầu thủ
  - Highlights & recaps
  
- **Hiển thị bài viết**
  - Grid layout responsive
  - Thumbnail, tiêu đề, mô tả ngắn
  - Category tags
  - Publish date, author

### 4. Minigames
- **Khu vực interactive games**
  - Prediction game (dự đoán kết quả)
  - Quiz về eSport
  - Bracket challenge
  
- **Preview minigame**
  - Thumbnail/banner game
  - Mô tả ngắn
  - Số người chơi, rewards

---

## Yêu Cầu Kỹ Thuật

### Stack Công Nghệ
```
Frontend Framework: React 18+ với Next.js 14 (App Router)
Styling: TailwindCSS 3.4+
Animation: Framer Motion
Language: TypeScript
Icons: Lucide React
Fonts: Google Fonts (Inter, Rajdhana)
```

### Tính Năng Kỹ Thuật
- ✅ Server Components & Client Components
- ✅ Responsive Design (Mobile-first)
- ✅ Dark theme mặc định
- ✅ Smooth page transitions
- ✅ Lazy loading images
- ✅ SEO optimized

### Đa Ngôn Ngữ (i18n)
- **Ngôn ngữ hỗ trợ:** Tiếng Việt, English (mở rộng: Korean, Chinese)
- **Thư viện:** next-intl hoặc react-i18next
- **UI:** Language switcher ở header
- **Scope:** Toàn bộ UI text, navigation, content

---

## Thiết Kế UI/UX

### Color Palette
```css
/* Dark Theme - Primary */
Background: #0a0e17 (Deep Space Blue)
Surface: #151922 (Dark Navy)
Card: #1e2530 (Slate)

/* Accent Colors */
Primary: #00d4ff (Cyan Electric)
Secondary: #9333ea (Purple Vibrant)
Success: #10b981 (Emerald)
Warning: #f59e0b (Amber)
Danger: #ef4444 (Red)

/* Text */
Text Primary: #ffffff
Text Secondary: #94a3b8
Text Muted: #64748b
```

### Typography
```css
Headings: 'Rajdhana' (Bold, Tech-feel)
Body: 'Inter' (Regular, Clean)
Mono: 'JetBrains Mono' (Stats, Scores)
```

### Design Principles
- **Minimalist:** Không gian trống hợp lý, tránh cluttered
- **High Contrast:** Text rõ ràng trên nền tối
- **Glassmorphism:** Card với backdrop blur nhẹ
- **Neon Accents:** Glow effects cho elements quan trọng
- **Micro-interactions:** Hover, click animations tinh tế

---

## Cấu Trúc Trang

### 1. Header/Navigation
```
┌─────────────────────────────────────────────┐
│ [Logo] Home | Tournaments | Teams | News    │
│                    Minigames | 🌐 EN | 👤   │
└─────────────────────────────────────────────┘
```

**Components:**
- Logo clickable → Home
- Navigation menu (desktop: horizontal, mobile: hamburger)
- Language switcher (dropdown)
- User avatar (mock authentication)

### 2. Hero Section
```
┌─────────────────────────────────────────────┐
│          🎮 VALORANT CHAMPIONS 2025         │
│         LIVE NOW • 127K Viewers             │
│    [Watch Stream] [View Bracket]            │
│                                             │
│  Featured Match:                            │
│  Team A vs Team B • Map 2/3                │
└─────────────────────────────────────────────┘
```

**Features:**
- Dynamic banner (video background hoặc animated gradient)
- Live badge với pulsing effect
- Real-time viewer count (mock)
- CTA buttons prominent

### 3. Tournaments Section
```
┌──────────┬──────────┬──────────┐
│  🔴 LIVE │ 📅 COMING│ ✓ ENDED  │
├──────────┼──────────┼──────────┤
│ VCT 2025 │ ESL Pro  │ Worlds   │
│ $500K    │ $250K    │ $1M      │
│ 16 Teams │ 8 Teams  │ 24 Teams │
└──────────┴──────────┴──────────┘
```

**Layout:**
- Tab navigation (Live, Upcoming, Completed)
- Card grid (3 columns desktop, 1 mobile)
- Each card: Banner, title, prize, teams count, dates

### 4. Teams Section
```
┌────────────────────────────────────┐
│  TOP TEAMS                         │
├─────┬─────┬─────┬─────┬─────┬─────┤
│ [1] │ [2] │ [3] │ [4] │ [5] │ [6] │
│ T1  │ FNC │ PRX │ SEN │ NRG │ TL  │
│ 💯  │ 95  │ 92  │ 90  │ 88  │ 85  │
└─────┴─────┴─────┴─────┴─────┴─────┘
```

**Features:**
- Rankings với số thứ tự
- Team logo/avatar
- Team name + score
- Hover: Show quick stats (W-L record, recent form)

### 5. Match History
```
┌─────────────────────────────────────┐
│ RECENT MATCHES                      │
├─────────────────────────────────────┤
│ T1 [13] ⚔️ [11] FNC  • 2h ago      │
│ PRX [13] ⚔️ [7] SEN  • 4h ago      │
│ NRG [10] ⚔️ [13] TL  • 6h ago      │
└─────────────────────────────────────┘
```

**Data shown:**
- Team logos
- Scores
- Time ago
- Map name (optional)
- Click → Chi tiết trận đấu

### 6. Scoring System Preview
```
┌─────────────────────────────────────┐
│ ROUND 1 STANDINGS                   │
├──────┬───────┬──────┬──────┬───────┤
│ Rank │ Team  │ W-L  │ RD   │ Points│
├──────┼───────┼──────┼──────┼───────┤
│  1   │ T1    │ 5-0  │ +32  │  15   │
│  2   │ FNC   │ 4-1  │ +18  │  12   │
│  3   │ PRX   │ 3-2  │ +5   │  9    │
└──────┴───────┴──────┴──────┴───────┘
```

**Columns:**
- Rank (với medal icons cho top 3)
- Team name + logo
- Win-Loss record
- Round differential
- Total points

### 7. News/Blog Section
```
┌──────────┬──────────┬──────────┐
│ [IMG]    │ [IMG]    │ [IMG]    │
│ Title 1  │ Title 2  │ Title 3  │
│ Excerpt  │ Excerpt  │ Excerpt  │
│ 2h ago   │ 5h ago   │ 1d ago   │
└──────────┴──────────┴──────────┘
```

**Card structure:**
- Featured image (16:9 ratio)
- Category tag
- Headline (max 2 lines)
- Short excerpt (max 3 lines)
- Meta: Date, read time, author

### 8. Minigames Preview
```
┌─────────────────────────────────────┐
│ 🎮 PLAY & WIN                       │
├──────────┬──────────┬──────────────┤
│ Predict  │ Bracket  │ Daily Quiz   │
│ Winners  │ Challenge│ Trivia       │
│ 🏆 $100  │ 🏆 $500  │ 🏆 Points    │
└──────────┴──────────┴──────────────┘
```

**Features:**
- Icon/illustration cho mỗi game
- Game name
- Reward/prize
- Hover: Glow effect
- Click: Modal hoặc navigate to game

### 9. Footer
```
┌─────────────────────────────────────┐
│ [Logo]           FOLLOW US          │
│                  🐦 𝕏  📘  📷  ▶️   │
│ About | Contact | Privacy | Terms   │
│ © 2025 eSport Platform              │
└─────────────────────────────────────┘
```

---

## Mock Data Structure

### Teams
```typescript
interface Team {
  id: string;
  name: string;
  logo: string;
  region: string;
  rank: number;
  wins: number;
  losses: number;
  points: number;
  players: Player[];
}

interface Player {
  id: string;
  ign: string; // In-game name
  realName: string;
  role: string;
  avatar: string;
}
```

### Tournaments
```typescript
interface Tournament {
  id: string;
  name: string;
  game: string;
  status: 'live' | 'upcoming' | 'completed';
  prizePool: string;
  startDate: Date;
  endDate: Date;
  teams: number;
  banner: string;
  region: string;
}
```

### Matches
```typescript
interface Match {
  id: string;
  tournamentId: string;
  team1: Team;
  team2: Team;
  score1: number;
  score2: number;
  status: 'live' | 'upcoming' | 'completed';
  scheduledTime: Date;
  map?: string;
  round?: number;
}
```

### News
```typescript
interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  category: string;
  author: string;
  publishDate: Date;
  readTime: number;
}
```

---

## Component Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx (Homepage)
│   │   ├── tournaments/
│   │   ├── teams/
│   │   ├── news/
│   │   └── minigames/
│   └── layout.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── TournamentsSection.tsx
│   │   ├── TeamsSection.tsx
│   │   ├── MatchHistory.tsx
│   │   ├── ScoringsSection.tsx
│   │   ├── NewsSection.tsx
│   │   └── MinigamesSection.tsx
│   ├── ui/
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   └── Tabs.tsx
│   └── shared/
│       ├── TeamLogo.tsx
│       ├── MatchCard.tsx
│       └── ArticleCard.tsx
├── lib/
│   ├── mockData.ts
│   └── i18n.ts
└── types/
    └── index.ts
```

---

## Animation Guidelines

### Framer Motion Variants
```typescript
// Page transitions
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// Card hover
const cardHover = {
  rest: { scale: 1, boxShadow: "0 0 0 rgba(0,212,255,0)" },
  hover: { 
    scale: 1.02, 
    boxShadow: "0 0 20px rgba(0,212,255,0.3)",
    transition: { duration: 0.2 }
  }
};

// Stagger children
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

### CSS Animations
```css
/* Pulsing live indicator */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Gradient shift */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Glow effect */
@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px var(--primary); }
  50% { box-shadow: 0 0 20px var(--primary); }
}
```

---

## i18n Setup

### Translation Files
```typescript
// locales/en.json
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
    "viewBracket": "View Bracket"
  },
  "tournaments": {
    "live": "Live",
    "upcoming": "Upcoming",
    "completed": "Completed",
    "prizePool": "Prize Pool",
    "teams": "Teams"
  }
  // ... more translations
}

// locales/vi.json
{
  "nav": {
    "home": "Trang chủ",
    "tournaments": "Giải đấu",
    "teams": "Đội tuyển",
    "news": "Tin tức",
    "minigames": "Minigame"
  }
  // ... Vietnamese translations
}
```

---

## Responsive Breakpoints

```css
/* Tailwind Config */
screens: {
  'xs': '475px',
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}
```

### Layout Adjustments
- **Mobile (< 640px):** 1 column, hamburger menu, stacked cards
- **Tablet (640-1024px):** 2 columns, collapsed sidebar
- **Desktop (> 1024px):** 3-4 columns, full navigation

---

## Performance Optimization

### Image Optimization
- Use Next.js `<Image>` component
- WebP format với PNG fallback
- Lazy loading below fold
- Blur placeholder

### Code Splitting
- Dynamic imports cho heavy components
- Route-based splitting tự động (Next.js)
- Separate vendor bundles

### Caching Strategy
- Static pages: ISR (Incremental Static Regeneration)
- Mock API: Client-side cache với SWR/React Query
- CDN for assets

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Build successful (`npm run build`)
- [ ] All pages render correctly
- [ ] i18n working on all routes
- [ ] Responsive on all breakpoints
- [ ] Animations smooth (60fps)
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] Meta tags & SEO setup
- [ ] Favicon & PWA icons

---

## Sample Mock Data

```typescript
// Sample teams
export const mockTeams: Team[] = [
  {
    id: '1',
    name: 'T1',
    logo: '/teams/t1.png',
    region: 'KR',
    rank: 1,
    wins: 15,
    losses: 2,
    points: 100,
    players: [
      { id: '1', ign: 'Faker', realName: 'Lee Sang-hyeok', role: 'Mid', avatar: '/players/faker.jpg' },
      // ... more players
    ]
  },
  // ... more teams
];

// Sample tournaments
export const mockTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Valorant Champions 2025',
    game: 'Valorant',
    status: 'live',
    prizePool: '$500,000',
    startDate: new Date('2025-02-10'),
    endDate: new Date('2025-02-20'),
    teams: 16,
    banner: '/tournaments/vct2025.jpg',
    region: 'International'
  },
  // ... more tournaments
];
```

---

## Final Output Format

**Deliverable:** Single React artifact (`.jsx`) file chứa:

1. ✅ All imports (React, Next.js, Framer Motion, Lucide icons)
2. ✅ Mock data embedded
3. ✅ All components inline
4. ✅ TailwindCSS classes
5. ✅ Responsive design
6. ✅ Animations configured
7. ✅ i18n placeholders
8. ✅ Comments giải thích
9. ✅ Ready to copy-paste và run

**File structure:**
```jsx
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
// ... more imports

// Mock Data
const teams = [...];
const tournaments = [...];
// ... more data

// Components
const Header = () => { ... };
const HeroSection = () => { ... };
// ... more components

// Main Page
export default function EsportDemo() {
  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <Header />
      <HeroSection />
      {/* ... more sections */}
    </div>
  );
}
```

---

## Additional Notes

### Future Enhancements (Phase 2)
- Real-time WebSocket integration
- User authentication & profiles
- Betting/prediction system
- Live chat
- Video player integration
- Admin dashboard
- Analytics tracking

### Browser Support
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS 14+, Android 10+

### Accessibility (a11y)
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader friendly
- Focus indicators
- Alt text for images
- ARIA labels

---
