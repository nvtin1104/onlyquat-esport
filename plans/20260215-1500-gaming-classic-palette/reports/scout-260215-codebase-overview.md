# Codebase Scout Report: OnlyQuat eSport

## PROJECT FRAMEWORK & TECH STACK
- Framework: Next.js 14.2.35
- React: React 18
- Language: TypeScript 5
- Styling: Tailwind CSS 3.4.1
- Animation: Framer Motion 12.34.0
- Icons: Lucide React 0.564.0
- i18n: next-intl 4.8.2

## CURRENT STYLING APPROACH
- Primary: Tailwind CSS with CSS Custom Properties
- Architecture: Utility-first with theme extensions
- Theme System: Light/Dark mode with localStorage persistence
- Global Styles: web/src/app/globals.css
- Configuration: web/tailwind.config.ts

## CURRENT COLOR PALETTE

### Theme Colors (CSS Variables)
Light Mode:
- --bg-primary: 255 255 255 (white)
- --text-primary: 15 23 42 (dark slate)
- --border: 226 232 240 (light gray)

Dark Mode:
- --bg-primary: 15 15 15 (near black)
- --text-primary: 248 250 252 (near white)
- --border: 51 65 85 (slate)

### Accent Colors
- Blue Primary: #0EA5E9
- Blue Hover: #0284C7
- Purple: #9333ea
- Red: #EF4444
- Gold: #FFD700

### Design Documentation
File: prompt/color.md (433 lines)
- Gaming Classic color palette
- Light/Dark mode specifications
- Component usage guide
- WCAG AA accessibility compliance

## COMPONENT STRUCTURE

UI Components (4):
- Badge.tsx
- Button.tsx
- Card.tsx
- Tabs.tsx

Layout Components (6):
- Header.tsx
- Footer.tsx
- ThemeProvider.tsx
- LanguageSwitcher.tsx
- MobileMenu.tsx
- PageTransitionWrapper.tsx

Home Sections (7):
- HeroSection, MatchHistorySection, MinigamesSection
- NewsSection, ScoringsSection, TeamsSection, TournamentsSection

Shared Components (3):
- ArticleCard.tsx, MatchCard.tsx, TeamLogo.tsx

Page Components (2):
- NewsFilterClient.tsx, TournamentsFilterClient.tsx

## APP LAYOUT STRUCTURE
src/app/
- Root layout.tsx
- [locale]/layout.tsx (with ThemeProvider, Header, Footer)
- Routes: /, /tournaments, /teams, /news, /minigames
- i18n Support: Locale-based routing

## THEMING CONFIGURATION FILES

1. /c/project/onlyquat-esport/web/tailwind.config.ts
2. /c/project/onlyquat-esport/web/postcss.config.mjs
3. /c/project/onlyquat-esport/web/src/app/globals.css
4. /c/project/onlyquat-esport/web/tsconfig.json
5. /c/project/onlyquat-esport/web/next.config.mjs

## GLOBALS.CSS & MAIN STYLESHEET
File: /c/project/onlyquat-esport/web/src/app/globals.css
- Tailwind directives (@tailwind base, components, utilities)
- Google Fonts imports (Rajdhani, Inter, JetBrains Mono)
- CSS Custom Properties for theme colors
- Custom utility classes: .glass, .neon-blue, .neon-purple
- HTML scroll behavior: smooth

## DESIGN SYSTEM & COMPONENT LIBRARY

shadcn/ui Status: NOT USED
Custom Implementation:
- All UI components built from scratch
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons
- No external component library dependencies

## UTILITY FUNCTIONS
File: web/src/lib/utils.ts
- cn() - Merge Tailwind classes
- toDisplayStatus() - Status conversion
- formatPrizePool() - Currency formatting
- timeAgo() - Relative time
- formatDate() - Date formatting

## TYPE SYSTEM
File: web/src/types/index.ts
- Locale, UserRole, TournamentStatus, MatchStatus
- Data Models: Player, Team, Tournament, Match, Article, Minigame, Standing

## COMPLETE FILE LIST (37 FILES)

Configuration (5):
1. web/tailwind.config.ts
2. web/postcss.config.mjs
3. web/src/app/globals.css
4. web/tsconfig.json
5. web/next.config.mjs

Theme & Color (2):
1. prompt/color.md
2. web/src/components/layout/ThemeProvider.tsx

UI Components (4):
1. web/src/components/ui/Badge.tsx
2. web/src/components/ui/Button.tsx
3. web/src/components/ui/Card.tsx
4. web/src/components/ui/Tabs.tsx

Layout Components (6):
1. web/src/components/layout/Header.tsx
2. web/src/components/layout/Footer.tsx
3. web/src/components/layout/LanguageSwitcher.tsx
4. web/src/components/layout/MobileMenu.tsx
5. web/src/components/layout/PageTransitionWrapper.tsx

Home Page (7):
1. web/src/components/home/HeroSection.tsx
2. web/src/components/home/MatchHistorySection.tsx
3. web/src/components/home/MinigamesSection.tsx
4. web/src/components/home/NewsSection.tsx
5. web/src/components/home/ScoringsSection.tsx
6. web/src/components/home/TeamsSection.tsx
7. web/src/components/home/TournamentsSection.tsx

Shared (3):
1. web/src/components/shared/ArticleCard.tsx
2. web/src/components/shared/MatchCard.tsx
3. web/src/components/shared/TeamLogo.tsx

Page Specific (2):
1. web/src/components/page/NewsFilterClient.tsx
2. web/src/components/page/TournamentsFilterClient.tsx

Utilities & Types (2):
1. web/src/lib/utils.ts
2. web/src/types/index.ts

App Layout (2):
1. web/src/app/layout.tsx
2. web/src/app/[locale]/layout.tsx

## KEY FINDINGS

Strengths:
- Excellent Tailwind CSS configuration
- Comprehensive design documentation
- Proper theme system with persistence
- Clean custom components
- Full TypeScript implementation
- Proper i18n integration
- Effective Framer Motion usage

Areas for Enhancement:
- Limited base UI components
- Could benefit from design tokens
- No Storybook documentation

Architecture: Excellent
- Clean separation of concerns
- Proper React hooks
- Client/Server components appropriate
- No unnecessary dependencies
- Efficient bundle size

Report Date: 2026-02-15
Status: Complete
