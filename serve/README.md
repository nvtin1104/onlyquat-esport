# OnlyQuat Esports Platform - NestJS Monorepo

A microservices architecture built with NestJS, using NATS for inter-service communication, Redis for caching, and a **single shared MongoDB database** for all services.

## Architecture Overview

This monorepo contains:

- **`libs/common`**: Shared library containing:
  - `DatabaseModule` - Single MongoDB connection configuration
  - Mongoose Schemas (User, Tournament, Match, Team)
  - Shared DTOs

- **`apps/api-gateway`**: HTTP entry point (Port 3000)
  - Routes requests to microservices via NATS

- **`apps/identity-service`**: Authentication & User management (**NATS only**, no HTTP)
  - Handles user registration, login, and user data

- **`apps/esports-service`**: Tournament & Match management (**NATS only**, no HTTP)
  - Manages tournaments, matches, and teams
  - **Demonstrates cross-service queries** using `populate()` to join User data

## Key Architecture Decision: Shared MongoDB

Unlike traditional microservices, all services share **one MongoDB database** (`esports_platform_db`). This allows:

- Direct cross-collection queries using Mongoose `populate()`
- No need for HTTP/NATS calls to fetch related data
- Simplified data consistency
- Example: `esports-service` can directly populate `User` data from `identity-service`'s collection

## Prerequisites

- Node.js 18+
- pnpm (install: `npm install -g pnpm`)
- Docker & Docker Compose

## Setup

1. **Install dependencies:**
   ```bash
   cd serve
   pnpm install
   ```

2. **Start infrastructure (MongoDB, NATS, Redis):**
   ```bash
   docker-compose up -d
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Start all services:**
   ```bash
   pnpm run start:all
   ```

   Or start individually:
   ```bash
   pnpm run start:dev:api-gateway       # HTTP on :3000
   pnpm run start:dev:identity-service  # NATS only
   pnpm run start:dev:esports-service   # NATS only
   ```

   **Note:** Only the API Gateway exposes HTTP (port 3000). Identity and Esports services are NATS-only workers.

## API Endpoints

### API Gateway (http://localhost:3000)

- `GET /health` - Health check
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /tournaments` - List all tournaments
- `POST /tournaments` - Create tournament

## Project Structure

```
serve/
├── apps/
│   ├── api-gateway/          # HTTP Gateway
│   ├── identity-service/     # Auth & Users
│   └── esports-service/      # Tournaments & Matches
├── libs/
│   └── common/               # Shared schemas, DTOs, DatabaseModule
├── docker-compose.yml        # Infrastructure services
└── package.json
```

## Cross-Service Query Example

In `esports-service`, see `esports.service.ts`:

```typescript
// Populate User data from identity-service's collection
async findMatchesByTournament(tournamentId: string) {
  return this.matchModel
    .find({ tournamentId })
    .populate('refereeId', 'username email') // User from identity-service
    .populate('team1Id', 'name tag')
    .populate('team2Id', 'name tag')
    .exec();
}
```

This demonstrates the benefit of shared MongoDB - no inter-service calls needed!

## Development

- Build: `pnpm run build`
- Build specific app: `pnpm run build:api-gateway`
- Watch mode: `pnpm run start:dev:api-gateway`

## Tech Stack

- **Framework**: NestJS (Monorepo)
- **Database**: MongoDB (Mongoose)
- **Message Broker**: NATS
- **Cache**: Redis
- **Language**: TypeScript
