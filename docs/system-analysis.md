# Phân Tích Hệ Thống — onlyquat-esport

> Ngày phân tích: 22/02/2026

---

## 1. Kiến Trúc Tổng Quan

```
┌──────────────────┐   ┌────────────────────┐   ┌───────────────────────────────────────────────┐
│   Client :3000   │   │  Dashboard :5173    │   │              Backend (serve/)                  │
│   Next.js 16     │   │  React 19 + Vite   │   │                                               │
│   (mock data)    │   │  (real API calls)   │   │   Gateway :3333 ──NATS──► Core (auth/user)    │
│                  │   │                     │   │                  ──NATS──► Esports             │
└──────────────────┘   └─────────┬───────────┘   └─────────────────┬───────────────────────────────┘
                                 │                                 │
                                 └──────── HTTP :3333 ─────────────┘
                                                                   │
                                       PostgreSQL :5432  ◄─────────┤
                                       NATS :4223        ◄─────────┤
                                       Redis :6380       ◄─────────┘
```

| Layer | Directory | Tech | Port |
|-------|-----------|------|------|
| Backend (microservices) | `serve/` | NestJS, PostgreSQL (Prisma), NATS, Redis | Gateway: 3333 |
| Admin Dashboard | `dashboard/` | React 19 + Vite 7, TailwindCSS | 5173 |
| Public Client | `client/` | Next.js 16 (App Router) | 3000 |

---

## 2. Infrastructure (Docker Compose)

| Service | Image | Host Port | Notes |
|---------|-------|-----------|-------|
| **PostgreSQL** | `postgres:16-alpine` | 5432 | DB: `esports_platform_db`, user: `esports` |
| **NATS** | `nats:2.10-alpine` | 4223 | JetStream enabled, monitoring: 8223 |
| **Redis** | `redis:7-alpine` | 6380 | AOF persistence enabled |

---

## 3. Backend (`serve/`)

### 3.1. Apps Overview

#### 3.1.1. Gateway — HTTP API Gateway (`:3333`)

- **Entry:** `apps/gateway/src/main.ts` — HTTP NestJS + CORS, validation pipe (i18n), Swagger (`/api/docs`)
- **Module:** `apps/gateway/src/app.module.ts` — Imports `DatabaseModule`, `ConfigModule`, `I18nModule`, `PassportModule`, `JwtModule`, đăng ký 2 NATS clients: `IDENTITY_SERVICE` → core, `ESPORTS_SERVICE` → esports

**Controllers (7):**

| Controller | Routes | Forward to |
|------------|--------|------------|
| `AppController` | `GET /health`, `/tournaments/*`, `/matches/*`, `/players/*`, `/teams/*`, `/ratings/*` | `ESPORTS_SERVICE` |
| `AuthController` | `POST /auth/register`, `/auth/login`, `/auth/admin/login`, `/auth/refresh` | `IDENTITY_SERVICE` |
| `UsersController` | `GET/PATCH /users/me`, `GET/POST/PATCH/DELETE /users/:id` | `IDENTITY_SERVICE` |
| `AdminPermissionsController` | `GET/POST/PATCH/DELETE /admin/permissions/*` | `IDENTITY_SERVICE` |
| `RegionsController` | `GET/POST/PATCH/DELETE /regions/*` | `ESPORTS_SERVICE` |
| `OrganizationsController` | `GET/POST/PATCH/DELETE /organizations/*` | `ESPORTS_SERVICE` |
| `UploadsController` | `GET/POST/DELETE /uploads/*` | **Local** (Cloudflare R2) |

**Supporting:**
- **Guards:** `jwt-auth.guard.ts`, `permissions.guard.ts`
- **Strategies:** `jwt.strategy.ts` (Passport JWT)
- **Decorators:** `@Auth()` (JwtAuth + Permissions), `@Permissions()`
- **Filters:** `rpc-exception.filter.ts` (RPC → HTTP exception)
- **Interceptors:** `translate-response.interceptor.ts` (i18n)
- **i18n:** `en/`, `vi/` translation files

---

#### 3.1.2. Core — Identity/Auth Microservice (NATS only)

- **Entry:** `apps/core/src/main.ts` — NATS microservice + `AllExceptionsToRpcFilter`
- **Module:** `apps/core/src/app.module.ts` — `PrismaModule`, `ConfigModule`, 3 feature modules

| Module | NATS Patterns |
|--------|---------------|
| **AuthModule** | `auth.register`, `auth.login`, `auth.adminLogin`, `auth.refresh`, `auth.validate-token` |
| **UsersModule** | `user.adminCreate`, `user.findAll`, `user.findById`, `user.findByEmail`, `user.update`, `user.delete`, `user.changePassword`, `user.updateRole` |
| **PermissionsModule** | `permissions.findAll`, `permissions.roleDefaults`, `permissions.userPermissions`, `permissions.grantCustom`, `permissions.revokeCustom`, `permissions.buildCache`, `permissions.createGroup`, `permissions.updateGroup`, `permissions.deleteGroup`, `permissions.getGroupById`, `permissions.assignGroup`, `permissions.removeGroup` |

---

#### 3.1.3. Esports — Esports Microservice (NATS only)

- **Entry:** `apps/esports/src/main.ts` — NATS microservice + `AllExceptionsToRpcFilter`
- **Module:** `apps/esports/src/app.module.ts` — `PrismaModule`, `ConfigModule`, flat registration (no sub-modules)

| Controller | NATS Patterns |
|-----------|---------------|
| **EsportsController** | `tournaments.findAll`, `tournaments.create`, `tournaments.findById`, `matches.findByTournament` |
| **RegionController** | `regions.findAll`, `regions.findById`, `regions.create`, `regions.update`, `regions.delete` |
| **OrganizationController** | `organizations.findAll`, `organizations.findById`, `organizations.create`, `organizations.update`, `organizations.delete` |

---

### 3.2. NATS Communication Map

```
┌──────────────────────────────────────┐
│         Gateway (HTTP :3333)          │
│  IDENTITY_SERVICE    ESPORTS_SERVICE  │
└──────────┬───────────────────┬────────┘
           │ NATS              │ NATS
           ▼                   ▼
┌────────────────┐   ┌─────────────────┐
│     core       │   │    esports      │
│   (NATS only)  │   │   (NATS only)   │
├────────────────┤   ├─────────────────┤
│ auth.*         │   │ tournaments.*   │
│ user.*         │   │ matches.*   (!) │
│ permissions.*  │   │ regions.*       │
│                │   │ organizations.* │
│                │   │ players.*   (!) │
│                │   │ teams.*     (!) │
│                │   │ ratings.*   (!) │
└────────────────┘   └─────────────────┘
                      (!) = gateway gửi nhưng handler chưa implement
```

---

### 3.3. Common Library (`libs/common/`)

| Export | Mô tả |
|--------|--------|
| `PrismaModule` / `PrismaService` | Global module, `@prisma/adapter-pg`, auto-connect on init |
| `PERMISSIONS` / `PERMISSION_METADATA` | 44 permission codes, 10 modules (user, tournament, match, player, team, rating, points, content, region, organization, upload, system), i18n metadata |
| `PaginatedResponse<T>` | `{ data: T[], meta: { total, page, limit, totalPages } }` |
| `AllExceptionsToRpcFilter` | Global exception filter cho NATS microservices |
| Prisma generated | Enums + Types cho tất cả 15 models |

---

### 3.4. Database Schema (PostgreSQL — Prisma)

**15 models:**

```
┌─────────────────────────────────────────────────────────────┐
│                      USER SYSTEM                            │
│  User ─── UserPermission ─── UserGroupPermission            │
│                                    │                        │
│                              GroupPermission                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   INFORMATION SYSTEM                        │
│  Region ──┬── Organization ──── Team                        │
│           └── Team                                          │
│  Game ──── Player ──── TeamMember ──── Team                 │
│                └── Rating                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   TOURNAMENT SYSTEM                         │
│  Tournament ──── TournamentTeam ──── Team                   │
│       │                                                     │
│       └── Match ──── MatchEvent                             │
│              └── BracketProgression (self-relation)         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      FILE SYSTEM                            │
│  FileUpload (Cloudflare R2)                                 │
└─────────────────────────────────────────────────────────────┘
```

**Enums:**

| Enum | Values |
|------|--------|
| `UserRole` | ROOT, ADMIN, STAFF, ORGANIZER, CREATOR, PARTNER, PLAYER, USER |
| `UserStatus` | ACTIVE, UNACTIVE, BAN, LOCK |
| `TournamentStatus` | upcoming, ongoing, completed, cancelled |
| `MatchStatus` | scheduled, live, completed, cancelled |
| `PlayerTier` | S, A, B, C, D, F |
| `TeamMemberRole` | player, captain, coach, substitute |
| `OrganizationType` | ORGANIZER, SPONSOR, CLUB, AGENCY |

**Quan hệ chính:**

| Relation | Type | Mô tả |
|----------|------|--------|
| User → Player | 1:N | User claim profile tuyển thủ |
| User → Organization | 1:N (owner), 1:N (manager) | Quản lý tổ chức |
| User → UserPermission | 1:1 | Permission riêng + groups |
| Region → Team | 1:N | Team thuộc region |
| Region → Organization | 1:N | Org thuộc region |
| Organization → Team | 1:N | Org sở hữu team |
| Organization → Tournament | 1:N | Org tổ chức giải |
| Organization → Match | 1:N | Org sponsor match |
| Game → Player | 1:N | Player thuộc game |
| Game → Tournament | 1:N | Giải đấu theo game |
| Team → Player | 1:N | Tuyển thủ thuộc team |
| Team → TeamMember | 1:N | Roster history |
| Team → TournamentTeam | 1:N | Tham gia giải |
| Team → Match | 1:N (team1, team2, winner) | Thi đấu |
| Player → Rating | 1:N | Đánh giá tuyển thủ |
| Tournament → Match | 1:N | Trận đấu trong giải |
| Match → MatchEvent | 1:N | Sự kiện trận đấu |
| Match → Match | self (nextMatch) | Bracket progression |

---

## 4. Dashboard (`dashboard/`)

### 4.1. Tech Stack

| Category | Library |
|----------|---------|
| Framework | React 19 + Vite 7 |
| Routing | react-router-dom 7 |
| State | Zustand 5 (persist middleware) |
| Forms | react-hook-form 7 + zod 4 |
| HTTP | axios (interceptor JWT auto-refresh) |
| UI | TailwindCSS 4, @radix-ui, framer-motion 12 |
| Tables | @tanstack/react-table 8 |
| Charts | recharts 3 |
| Icons | lucide-react |
| Toasts | sonner 2 |

### 4.2. Routes (22 routes)

| Route | Page | Mô tả |
|-------|------|--------|
| `/login` | `LoginPage` | Đăng nhập admin |
| `/` | `OverviewPage` | Dashboard home / KPIs |
| `/players` | `PlayersPage` | Danh sách tuyển thủ |
| `/players/new` | `PlayerFormPage` | Tạo tuyển thủ |
| `/players/:id/edit` | `PlayerFormPage` | Sửa tuyển thủ |
| `/teams` | `TeamsPage` | Danh sách đội |
| `/matches` | `MatchesPage` | Danh sách trận |
| `/ratings` | `RatingsPage` | Quản lý đánh giá |
| `/points` | `PointsPage` | Giao dịch điểm |
| `/users` | `UsersPage` | Danh sách users |
| `/users/create` | `UserCreatePage` | Tạo user |
| `/users/:id` | `UserDetailPage` | Chi tiết user |
| `/users/permissions` | `UserPermissionsPage` | Quản lý permissions |
| `/users/:id/permissions` | `UserPermissionDetailPage` | Permission theo user |
| `/permissions/groups` | `PermissionGroupsPage` | Nhóm quyền |
| `/regions` | `RegionsPage` | Danh sách regions |
| `/regions/create` | `RegionCreatePage` | Tạo region |
| `/regions/:id` | `RegionDetailPage` | Chi tiết region |
| `/organizations` | `OrganizationsPage` | Danh sách organizations |
| `/organizations/create` | `OrganizationCreatePage` | Tạo organization |
| `/organizations/:id` | `OrganizationDetailPage` | Chi tiết organization |
| `/settings` | `SettingsPage` | Cài đặt |

### 4.3. Zustand Stores

| Store | Chức năng |
|-------|-----------|
| `useAuthStore` | Login/logout, JWT refresh, user profile (persist refreshToken) |
| `useUsersStore` | CRUD users + pagination |
| `usePermissionsStore` | Permission groups + per-user permissions |
| `useRegionsStore` | CRUD regions |
| `useOrganizationsStore` | CRUD organizations |
| `useThemeStore` | Dark/light toggle (persist) |

### 4.4. API Integration

- **Base URL:** `VITE_API_URL` → `http://localhost:3333`
- **Axios instance** với request interceptor (Bearer token) + response interceptor (401 → auto refresh + queue)
- **Domain APIs:** `users.api.ts`, `permissions.api.ts`, `regions.api.ts`, `organizations.api.ts`
- **Validation:** zod schemas in `src/lib/schemas/`

---

## 5. Client (`client/`)

### 5.1. Tech Stack

| Category | Library |
|----------|---------|
| Framework | Next.js 16.1.6 (App Router), React 19 |
| Styling | Tailwind CSS v4, clsx + tailwind-merge |
| Animation | Framer Motion 12 |
| Charts | Recharts 3 |
| State | Zustand 5 |
| Icons | lucide-react |
| Theming | next-themes (dark mode, class-based) |

### 5.2. Routes (7 routes)

| Route | Mô tả |
|-------|--------|
| `/` | Landing page (Hero, Stats, Features, Top Players, CTA) |
| `/players` | Danh sách tuyển thủ + filters |
| `/players/[slug]` | Chi tiết tuyển thủ |
| `/teams` | Danh sách đội |
| `/teams/[slug]` | Chi tiết đội |
| `/leaderboard` | Bảng xếp hạng |
| `/compare` | So sánh tuyển thủ |

### 5.3. Data Fetching

**100% mock data** — tất cả từ JSON files (`src/data/`):  
`players.json`, `teams.json`, `games.json`, `ratings.json`

Các hàm trong `src/lib/mock.ts` giả lập async (100ms delay): `getPlayers()`, `getPlayerBySlug()`, `getTeams()`, `getTeamBySlug()`, `getGames()`, `getRatings()`, `getTeamPlayers()`

**Chưa có API call nào tới backend.**

### 5.4. Components

| Nhóm | Components |
|------|------------|
| Layout | `Header`, `Footer` |
| Landing | `HeroSection`, `StatsRibbon`, `FeaturesGrid`, `TopPlayers`, `CTABanner` |
| Player/Data | `PlayerCard`, `PlayerGrid`, `PlayerStats`, `RatingList`, `TeamsGrid`, `ComparePageClient`, `LeaderboardClient` |
| Charts | `CompareChart`, `RadarChart`, `TierDonut`, `TrendLine` |
| UI | `Badge`, `Button`, `Card`, `Input`, `RatingNumber`, `SectionHeader`, `Skeleton`, `StatBar`, `ThemeToggle` |

### 5.5. Custom Hooks

| Hook | Mô tả |
|------|--------|
| `useFilterStore` | Zustand: search, game, role, tier, sort filters |
| `useChartTheme` | Chart color theming |
| `useCountUp` | Animated number counter |
| `useInView` | Intersection observer cho scroll animations |

---

## 6. Permission System

Hệ thống hybrid: **Role-based + User-specific overrides**.

```
User
  └── UserPermission (1:1)
        ├── additionalPermissions: String[]   ← per-user overrides
        ├── cachedCodes: String[]             ← computed effective permissions
        └── groups: UserGroupPermission[]     ← many-to-many
                          │
                    GroupPermission
                      ├── permissions: String[]
                      └── isSystem: Boolean
```

**Effective permissions** = Union(tất cả group permissions) + additionalPermissions → cache vào `cachedCodes`.

**44 permission codes** chia 10+ module:

| Module | Ví dụ codes |
|--------|-------------|
| User | `user.view`, `user.create`, `user.update`, `user.delete` |
| Tournament | `tournament.view`, `tournament.create`, `tournament.update`, `tournament.delete` |
| Match | `match.view`, `match.create`, `match.update`, `match.delete` |
| Player | `player.view`, `player.create`, `player.update`, `player.delete` |
| Team | `team.view`, `team.create`, `team.update`, `team.delete` |
| Rating | `rating.view`, `rating.create`, `rating.delete` |
| Region | `region.view`, `region.create`, `region.update`, `region.delete` |
| Organization | `org.view`, `org.create`, `org.update`, `org.delete` |
| Upload | `upload.view`, `upload.create`, `upload.delete` |
| System | `system.settings`, `system.admin` |

---

## 7. Cấu Trúc Thư Mục

```
onlyquat-esport/
├── AGENTS.md                          # AI agent instructions
├── CLAUDE.md                          # Claude-specific context
├── README.md
├── docs/                              # Documentation
├── plans/                             # Implementation plans
├── prompt/                            # Prompt templates
│
├── serve/                             # ══ BACKEND ══
│   ├── docker-compose.yml             # PostgreSQL, NATS, Redis
│   ├── nest-cli.json                  # Monorepo config
│   ├── package.json                   # Scripts: start:all, db:setup, prisma:*
│   ├── prisma.config.ts               # Prisma config
│   ├── apps/
│   │   ├── gateway/src/               # HTTP API Gateway (:3333)
│   │   │   ├── main.ts                # HTTP bootstrap + Swagger + CORS
│   │   │   ├── app.module.ts          # NATS clients, JWT, i18n
│   │   │   ├── app.controller.ts      # Tournaments, Matches, Players, Teams, Ratings
│   │   │   ├── auth/                  # AuthController (→ core)
│   │   │   ├── users/                 # UsersController (→ core)
│   │   │   ├── admin/                 # PermissionsController (→ core)
│   │   │   ├── regions/               # RegionsController (→ esports)
│   │   │   ├── organizations/         # OrganizationsController (→ esports)
│   │   │   ├── uploads/               # UploadsController (R2 direct)
│   │   │   ├── guards/                # jwt-auth, permissions
│   │   │   ├── strategies/            # jwt.strategy
│   │   │   ├── decorators/            # @Auth(), @Permissions()
│   │   │   ├── filters/               # RPC → HTTP exception
│   │   │   ├── interceptors/          # i18n response
│   │   │   ├── dtos/                  # Gateway DTOs
│   │   │   └── i18n/                  # en/, vi/
│   │   │
│   │   ├── core/src/                  # Identity Service (NATS)
│   │   │   ├── auth/                  # auth.module/controller/service
│   │   │   ├── users/                 # users.module/controller/service
│   │   │   ├── permissions/           # permissions.module/controller/service
│   │   │   └── dtos/
│   │   │
│   │   └── esports/src/              # Esports Service (NATS)
│   │       ├── esports.*              # tournaments, matches
│   │       ├── region/                # region.controller/service
│   │       ├── organization/          # organization.controller/service
│   │       └── dtos/
│   │
│   └── libs/common/
│       ├── prisma/schema.prisma       # Database schema (source of truth)
│       ├── generated/prisma/          # Prisma client + types
│       └── src/
│           ├── index.ts               # Barrel exports
│           ├── database/              # PrismaModule + PrismaService
│           ├── constants/             # PERMISSIONS, PERMISSION_METADATA
│           ├── types/                 # PaginatedResponse<T>
│           └── filters/               # AllExceptionsToRpcFilter
│
├── dashboard/                         # ══ ADMIN DASHBOARD ══
│   ├── src/
│   │   ├── App.tsx                    # React Router config
│   │   ├── pages/                     # 22 route pages
│   │   ├── components/                # layout/, shared/, ui/
│   │   ├── stores/                    # Zustand: auth, users, permissions, regions, orgs
│   │   ├── lib/                       # axios client, domain APIs, zod schemas
│   │   ├── types/                     # admin.ts, auth.ts, permissions.ts
│   │   └── constants/
│   └── vite.config.ts
│
└── client/                            # ══ PUBLIC CLIENT ══
    ├── src/
    │   ├── app/                       # Next.js App Router (7 routes)
    │   ├── components/                # Layout, Landing, Player, Charts, UI
    │   ├── data/                      # Mock JSON data
    │   ├── hooks/                     # useFilterStore, useChartTheme, useCountUp, useInView
    │   ├── lib/                       # mock.ts, animations.ts, utils.ts
    │   └── types/
    └── next.config.ts
```

---

## 8. Environment Variables

```env
# serve/.env
DATABASE_URL=postgresql://esports:esports_secret@localhost:5432/esports_platform_db
NATS_URL=nats://localhost:4223
JWT_SECRET=<secret>
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# R2 Upload
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=...

# dashboard/.env
VITE_API_URL=http://localhost:3333
```

---

## 9. Vấn Đề & Gaps

| # | Vấn đề | Mức độ | Chi tiết |
|---|--------|--------|----------|
| 1 | **Esports service thiếu handlers** | 🔴 Critical | Gateway gửi `players.*`, `teams.*`, `matches.*`, `ratings.*` nhưng esports chỉ handle `tournaments.*`, `regions.*`, `organizations.*`. Các request này sẽ timeout. |
| 2 | **Client chưa kết nối backend** | 🟡 Medium | Toàn bộ data từ mock JSON, cần thay `mock.ts` bằng fetch tới `:3333` |
| 3 | **Redis chưa sử dụng** | 🟢 Low | Container chạy nhưng chưa có caching logic |
| 4 | **Game CRUD chưa có endpoint** | 🟡 Medium | Model `Game` tồn tại trong schema nhưng chưa có controller/service riêng |
| 5 | **Dashboard Players/Teams/Matches** | 🟡 Medium | Dashboard có UI pages nhưng backend handlers chưa implement |
| 6 | **Esports module structure** | 🟢 Low | Esports dùng flat registration thay vì sub-modules, nên refactor khi scale |

---

## 10. Tóm Tắt Nhanh

- **Backend**: NestJS monorepo 3 apps (gateway + core + esports), PostgreSQL (Prisma), NATS transport, JWT auth, 44 permission codes, Cloudflare R2 upload
- **Dashboard**: React 19 admin panel, 22 routes, Zustand state, axios + JWT auto-refresh, đã kết nối API thật cho users/permissions/regions/organizations
- **Client**: Next.js 16 public site, 7 routes, UI hoàn chỉnh (landing, players, teams, leaderboard, compare), 100% mock data
- **Trạng thái**: Core (auth/users/permissions) hoạt động đầy đủ. Esports chỉ có tournaments + regions + organizations. Players, teams, matches, ratings cần implement handlers.
