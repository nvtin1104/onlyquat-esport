# CLAUDE.md — onlyquat-esport

Instructions and context for Claude Code when working in this repository.

---

## Project Overview

**onlyquat-esport** is an esports platform monorepo with three layers:

| Layer | Directory | Tech | Port |
|---|---|---|---|
| Backend (microservices) | `serve/` | NestJS, PostgreSQL, NATS, Redis | Gateway: 3333 |
| Admin Dashboard | `dashboard/` | React + Vite, TailwindCSS | 5173 |
| Public Client | `client/` | Next.js 15 (App Router) | 3000 |

---

## Architecture

### Backend (`serve/`)

NestJS monorepo with three apps:

- **`apps/gateway`** — HTTP API gateway (port 3333). Handles all HTTP requests, forwards to microservices via NATS. Manages JWT auth, CORS, validation.
- **`apps/core`** — Identity/auth microservice (NATS only). Handles users, auth, roles.
- **`apps/esports`** — Esports microservice (NATS only). Handles tournaments, matches, teams, players.
- **`libs/common`** — Shared library: Prisma client, database module, shared types.

**Transport:** NATS on `nats://localhost:4223`
**Database:** PostgreSQL via Prisma (schema at `libs/common/prisma/schema.prisma`)
**Auth:** JWT (passport-jwt strategy in gateway)
**ORM:** Prisma with custom client output at `libs/common/generated/prisma`

### Frontend — Dashboard (`dashboard/`)

React SPA (Vite) for admin use.

- **Routing:** react-router-dom
- **State:** Zustand stores
- **Forms:** react-hook-form + zod
- **HTTP:** axios
- **UI:** TailwindCSS, lucide-react, framer-motion
- **Tables:** @tanstack/react-table
- **Charts:** recharts

### Frontend — Client (`client/`)

Next.js 15 public-facing site.

- **Routing:** App Router (`src/app/`)
- **State:** Zustand
- **UI:** TailwindCSS, next-themes (dark mode), framer-motion
- **Charts:** recharts

---

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm
- Docker & Docker Compose

### Infrastructure (run first)

```bash
cd serve
docker-compose up -d
# Starts: PostgreSQL :5432, NATS :4223, Redis :6380
```

### Backend

```bash
cd serve
pnpm install

# Database setup
pnpm run db:setup          # generate + migrate + seed

# Start all services
pnpm run start:all

# Or individually
pnpm run start:dev:gateway   # HTTP on :3333
pnpm run start:dev:core      # NATS only
pnpm run start:dev:esports   # NATS only
```

### Dashboard

```bash
cd dashboard
pnpm install
pnpm dev   # :5173
```

### Client

```bash
cd client
pnpm install
pnpm dev   # :3000
```

---

## Database (Prisma)

Schema: `serve/libs/common/prisma/schema.prisma`
Config: `serve/prisma.config.ts`

```bash
cd serve
pnpm run prisma:generate     # regenerate client
pnpm run prisma:migrate      # create + apply migration
pnpm run prisma:migrate:deploy  # apply migrations (prod)
pnpm run prisma:seed         # seed data
pnpm run prisma:studio       # visual DB browser
pnpm run prisma:reset        # drop + recreate + seed
```

**Key models:** `User`, `Tournament`, `Match`, `Team`, `Player`, `Region`, `Organization`
**Key enums:** `UserRole`, `UserStatus`, `TournamentStatus`, `MatchStatus`, `PlayerTier`, `TeamMemberRole`, `OrganizationType`

---

## Code Conventions

- **Language:** TypeScript throughout
- **Formatting:** NestJS style guide, TypeScript strict
- **Naming:**
  - NestJS: `*.controller.ts`, `*.service.ts`, `*.module.ts`
  - Shared schemas/types: `libs/common/src/`
  - DTOs live alongside their feature (gateway dtos or core dtos)
- **Commits:** Conventional commits (`feat`, `fix`, `refactor`, `docs`, etc.)
- **Package manager:** pnpm (never npm or yarn)

---

## Data Fetching & API Conventions

### Pagination

All endpoints that return a list of paginated results **MUST** standardize on the `PaginatedResponse<T>` shape from `serve/libs/common/src/...` (and `dashboard/src/types/admin.ts`).

- The successful response payload should look like this:
```json
{
  "data": [ { ... }, { ... } ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```
- In the frontend dashboard, you should rely on `src/components/ui/Pagination.tsx` when displaying paginated data.

### Frontend UI Components

- **Toast Notifications:** Use `toast` from `sonner` via `src/components/ui/sonner.tsx`. We have transitioned away from the custom Zustand store.
- **Icons:** Use `lucide-react` for all iconography.
- **Styling:** Use standard Tailwind utility classes. For complex class merges, use the `cn()` utility from `src/lib/utils.ts`.

### Responsive Layouts & Tables

- Tables should be wrapped in a scrollable block for small screens to prevent layout breaks: `<div className="overflow-x-auto">...<table>...</div>`.
- Use flexbox utility classes (`flex-col sm:flex-row`) to stack filter inputs, search bars, and pagination controls on mobile and place them side-by-side on larger screens.
- Hide non-essential columns on mobile devices using Tailwind's `hidden md:table-cell` or `hidden sm:table-cell` utilities.

### Permissions System

- The platform supports a hybrid permission system: Role-based permissions combined with User-specific overrides.
- When assigning permissions to a user, the effective permissions are the union of their roles' permissions and their specific overrides. Use `EffectivePermissionList` and `PermissionPicker` components when building permission-related UI.

---

## Key Files

| File | Purpose |
|---|---|
| `serve/libs/common/prisma/schema.prisma` | Database schema (single source of truth) |
| `serve/libs/common/src/database/` | PrismaModule + PrismaService |
| `serve/apps/gateway/src/main.ts` | CORS config, port 3333 |
| `serve/apps/gateway/src/app.module.ts` | NATS client registration |
| `serve/apps/gateway/src/strategies/jwt.strategy.ts` | JWT passport strategy |
| `serve/docker-compose.yml` | PostgreSQL, NATS, Redis |
| `dashboard/src/stores/` | Zustand stores |
| `client/src/app/` | Next.js App Router pages |

---

## Environment Variables (serve/.env)

```
DATABASE_URL=postgresql://esports:esports_secret@localhost:5432/esports_platform_db
NATS_URL=nats://localhost:4223
JWT_SECRET=<secret>
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Rules for Claude

- Always read relevant files before modifying them.
- Use `PrismaService` from `libs/common` — never create separate DB connections.
- When adding Prisma models, update `schema.prisma` then run `prisma:migrate`.
- Only `gateway` exposes HTTP. Core and esports are NATS-only.
- Use `@MessagePattern()` for microservice handlers, `ClientProxy` to call them.
- All config must use `ConfigService` from `@nestjs/config`.
- Use `pnpm add` for dependencies, never npm/yarn.
- Do not commit `.env` files or secrets.
- Keep changes minimal and focused — no unsolicited refactors or extra features.
