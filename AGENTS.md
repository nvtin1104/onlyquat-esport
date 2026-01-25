# AGENTS.md — Guide for AI Coding Agents

This file provides context and instructions for AI agents (Cursor, GitHub Copilot, etc.) when working with the **onlyquat-esport** codebase.

---

## Project Overview

- **Name:** onlyquat-esport
- **Description:** Esports platform built with NestJS monorepo architecture
- **Status:** Active development
- **Architecture:** Microservices with shared MongoDB database
- **Tech Stack:** NestJS, MongoDB (Mongoose), NATS, Redis, Docker

---

## Development Environment

### Requirements

- Node.js 18+
- pnpm (install: `npm install -g pnpm`)
- Docker & Docker Compose

### Installation

```bash
cd serve
pnpm install
```

### Running Infrastructure

```bash
# Start MongoDB, NATS, and Redis
cd serve
docker-compose up -d
```

### Running the Project

```bash
cd serve

# Start all services in development mode
pnpm run start:all

# Or start individually:
pnpm run start:dev:api-gateway       # HTTP on :3000
pnpm run start:dev:identity-service  # NATS only
pnpm run start:dev:esports-service   # NATS only
```

### Build

```bash
cd serve

# Build all apps
pnpm run build

# Build specific app
pnpm run build:api-gateway
pnpm run build:identity-service
pnpm run build:esports-service
```

---

## Testing

### Running Tests

```bash
# npm test
# pytest
# cargo test
```

### Linting / Formatting

```bash
# pnpm run lint
# black . && ruff check .
```

---

## Code Conventions

- **Language:** TypeScript
- **Framework:** NestJS (Monorepo)
- **Formatting:** Follow NestJS style guide and TypeScript best practices
- **Naming:** 
  - Controllers: `*.controller.ts`
  - Services: `*.service.ts`
  - Modules: `*.module.ts`
  - Schemas: `*.schema.ts` (in `libs/common/src/schemas`)
  - DTOs: `*.dto.ts` (in `libs/common/src/dtos`)
- **Commits:** Use conventional commits (feat, fix, docs, refactor, etc.)

---

## Project Structure

```
onlyquat-esport/
├── serve/                          # Main application directory
│   ├── apps/
│   │   ├── api-gateway/           # HTTP Gateway (Port 3000)
│   │   │   └── src/
│   │   ├── identity-service/      # Auth & Users (NATS only)
│   │   │   └── src/
│   │   └── esports-service/       # Tournaments & Matches (NATS only)
│   │       └── src/
│   ├── libs/
│   │   └── common/                # Shared library
│   │       └── src/
│   │           ├── database/      # DatabaseModule (MongoDB config)
│   │           ├── schemas/       # User, Tournament, Match, Team schemas
│   │           └── dtos/          # Shared DTOs
│   ├── docker-compose.yml         # MongoDB, NATS, Redis
│   ├── package.json
│   ├── nest-cli.json
│   └── tsconfig.json
├── AGENTS.md                       # This file
└── README.md
```

## Architecture Notes

- **Shared MongoDB**: All services connect to the same database (`esports_platform_db`)
- **DatabaseModule**: Located in `libs/common/src/database/database.module.ts`
  - Uses `ConfigService` to read `MONGODB_URI` from environment
  - Import `DatabaseModule` in any app that needs MongoDB connection
- **Schema Sharing**: All Mongoose schemas are in `libs/common/src/schemas`
  - Import using `MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])`
  - Services can use schemas from other services (e.g., `esports-service` uses `UserSchema`)
- **Cross-Service Queries**: Use `populate()` to join data across collections
  - Example: `esports-service` can populate `User` data without calling `identity-service`
- **NATS**: Used for inter-service communication (message patterns)
  - Only **api-gateway** exposes HTTP (port 3000). Identity and Esports services are **NATS-only** (no HTTP ports).
- **Redis**: Available for caching (configure as needed)

---

## Contribution / PR Requirements

- New code must pass lint and tests (when available).
- Update documentation (README, AGENTS.md) when changing setup or workflows.
- Do not commit sensitive files (keys, secrets, tokens); use environment variables or gitignored config files.

---

## Notes for AI Agents

- Always read `README.md` and `AGENTS.md` before modifying code.
- **Database Connection**: Use `DatabaseModule` from `@app/common` - do NOT create separate MongoDB connections
- **Schemas**: Add new schemas to `libs/common/src/schemas` and export from `libs/common/src/schemas/index.ts`
- **DTOs**: Add shared DTOs to `libs/common/src/dtos` and export from `libs/common/src/dtos/index.ts`
- **Cross-Service Access**: When `esports-service` needs User data, use `populate()` instead of NATS calls
- **NATS Patterns**: Use `@MessagePattern()` for microservice endpoints, `ClientProxy` for sending messages
- **Environment Variables**: All config should use `ConfigService` from `@nestjs/config`
- When adding new dependencies, use `pnpm add <package>` (or `pnpm add -D <package>` for dev deps) and note it in commits/PRs
- If tech stack or conventions are unclear, ask the user instead of guessing

---

_Update `AGENTS.md` whenever setup, tooling, or project conventions change._
