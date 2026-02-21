# Database Schema

Complete Prisma schema documentation for the onlyquat-esport platform.

Location: `serve/libs/common/prisma/schema.prisma`

---

## Overview

The database uses PostgreSQL with Prisma ORM. All models are organized by functional domain:
- **User Management:** User, UserPermission, UserGroupPermission, GroupPermission
- **Information System:** Region, Organization
- **Game & Competition:** Game, Tournament, Match, MatchEvent
- **Teams & Players:** Team, TeamMember, Player, Rating

---

## Enums

### UserRole

User role classification for access control.

```prisma
enum UserRole {
  ROOT      // Full system permissions
  ADMIN     // System-wide administration
  STAFF     // Platform staff
  ORGANIZER // Tournament/event organizer
  CREATOR   // Content creator
  PARTNER   // Business partner
  PLAYER    // Professional player (profile claimable)
  USER      // Regular user (fans, raters)
}
```

### UserStatus

User account status.

```prisma
enum UserStatus {
  ACTIVE    // Normal operation
  UNACTIVE  // Deactivated but not deleted
  BAN       // Banned from platform
  LOCK      // Locked pending review
}
```

### TournamentStatus

Tournament lifecycle status.

```prisma
enum TournamentStatus {
  upcoming  // Not started
  ongoing   // In progress
  completed // Finished
  cancelled // Cancelled
}
```

### MatchStatus

Match game status.

```prisma
enum MatchStatus {
  scheduled // Awaiting start
  live      // Currently playing
  completed // Finished
  cancelled // Cancelled
}
```

### PlayerTier

Player skill tier ranking.

```prisma
enum PlayerTier {
  S // Tier 1 (Elite)
  A // Tier 2
  B // Tier 3
  C // Tier 4
  D // Tier 5
  F // Tier 6 (Beginner)
}
```

### TeamMemberRole

Team member position/role.

```prisma
enum TeamMemberRole {
  player     // Regular team member
  captain    // Team captain
  coach      // Coach/staff
  substitute // Substitute/backup
}
```

### OrganizationType

Organization classification. An organization can have multiple roles.

```prisma
enum OrganizationType {
  ORGANIZER // Tournament organizer
  SPONSOR   // Financial sponsor
  CLUB      // Team/club owner
  AGENCY    // Talent agency or representative
}
```

---

## User Models

### User

Core user account model.

```prisma
model User {
  id               String     @id @default(uuid())
  email            String     @unique
  password         String
  username         String     @unique
  name             String?
  accountType      Int        @default(1)       // 0: admin, 1: regular user
  role             UserRole[] @default([USER])
  status           UserStatus @default(ACTIVE)
  avatar           String?                       // URL
  ggId             String?                       // Google ID for OAuth
  bio              String?
  suspendedAt      DateTime?                     // Suspension timestamp
  suspendedUntil   DateTime?                     // Suspension expiry
  suspensionReason String?
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt

  // Relations
  players              Player[]
  ratings              Rating[]
  organizedTournaments Tournament[]
  refereedMatches      Match[]
  permission           UserPermission?
  ownedOrganizations   Organization[] @relation("OrgOwner")
  managedOrganizations Organization[] @relation("OrgManager")

  @@map("users")
}
```

**Key Fields:**
- `id`: UUID primary key
- `email`, `username`: Both unique, required for authentication
- `password`: Hashed password (never returned in API responses)
- `role`: Array of `UserRole` enums for multi-role support
- `status`: Account status (active, banned, etc.)
- `accountType`: Legacy field (0 = admin, 1 = user)

**Relations:**
- Owns multiple players (claimed profiles)
- Can submit ratings for players
- Can organize tournaments
- Can referee matches
- Has optional permissions record
- Can own/manage organizations

---

### UserPermission

User-specific permission overrides (hybrid with role-based permissions).

```prisma
model UserPermission {
  id                    String   @id @default(uuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  cachedCodes           String[] @default([])        // Cached permission codes
  additionalPermissions String[] @default([])        // User-specific overrides
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  groups UserGroupPermission[]

  @@map("user_permissions")
}
```

**Purpose:** Stores both cached role-based permissions and user-specific overrides. Effective permissions = union of role permissions + additional permissions.

---

### UserGroupPermission

Join table linking users to permission groups.

```prisma
model UserGroupPermission {
  id                String          @id @default(uuid())
  userId            String
  userPermission    UserPermission  @relation(fields: [userId], references: [userId], onDelete: Cascade)
  groupPermissionId String
  groupPermission   GroupPermission @relation(fields: [groupPermissionId], references: [id], onDelete: Cascade)
  createdAt         DateTime        @default(now())

  @@unique([userId, groupPermissionId])
  @@index([userId])
  @@index([groupPermissionId])
  @@map("user_group_permissions")
}
```

**Uniqueness:** Prevents duplicate group assignments per user.

---

### GroupPermission

Reusable permission group (role template).

```prisma
model GroupPermission {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  isSystem    Boolean  @default(false)        // System-defined groups
  isActive    Boolean  @default(true)
  permissions String[] @default([])           // Array of permission codes
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userGroups UserGroupPermission[]

  @@map("group_permissions")
}
```

**Use Case:** Define reusable permission sets (e.g., "Tournament Admin", "Moderator").

---

## Information System Models

### Region

Geographic or logical area for organizing teams and organizations.

```prisma
model Region {
  id        String   @id @default(uuid())
  name      String   @unique               // e.g., "North America"
  code      String   @unique               // e.g., "NA"
  logo      String?                        // URL
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  teams         Team[]
  organizations Organization[]

  @@map("regions")
}
```

**Key Fields:**
- `name`, `code`: Both unique for lookups and UI display
- `logo`: Optional URL to region branding

**Relations:**
- Has many teams
- Has many organizations

---

### Organization

Entity representing organizers, sponsors, clubs, or agencies.

```prisma
model Organization {
  id          String             @id @default(uuid())
  name        String             @unique
  shortName   String?
  logo        String?                                // URL
  website     String?
  description String?
  mediaLinks  Json               @default("[]")     // Array of links
  roles       OrganizationType[]                     // ORGANIZER | SPONSOR | CLUB | AGENCY

  ownerId   String
  owner     User    @relation("OrgOwner", fields: [ownerId], references: [id])
  managerId String?
  manager   User?   @relation("OrgManager", fields: [managerId], references: [id])

  regionId String?
  region   Region? @relation(fields: [regionId], references: [id])

  teams            Team[]
  tournaments      Tournament[] @relation("OrgTournaments")
  sponsoredMatches Match[]      @relation("OrgSponsoredMatches")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([regionId])
  @@index([ownerId])
  @@map("organizations")
}
```

**Key Fields:**
- `name`: Unique organization name
- `roles`: Array of `OrganizationType` for multi-role organizations
- `mediaLinks`: JSON array of `{ url: string; description?: string }`
- `ownerId`: Creator/owner of the organization
- `managerId`: Optional day-to-day manager
- `regionId`: Optional region association

**Relations:**
- Owns multiple teams
- Can organize tournaments
- Can sponsor matches
- Has an owner (User) and optional manager (User)
- Belongs to optional region

---

## Game & Competition Models

### Game

Supported esports games/titles.

```prisma
model Game {
  id        String   @id @default(uuid())
  name      String   @unique               // e.g., "Counter-Strike 2"
  shortName String                         // e.g., "CS2"
  iconUrl   String   @default("")
  roles     String[] @default([])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  players     Player[]
  tournaments Tournament[]

  @@map("games")
}
```

---

### Tournament

Esports tournament/event.

```prisma
model Tournament {
  id          String           @id @default(uuid())
  slug        String           @unique         // URL-friendly identifier
  name        String
  description String?
  startDate   DateTime
  endDate     DateTime
  status      TournamentStatus @default(upcoming)
  prizePool   Float            @default(0)
  rules       String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  gameId      String
  game        Game   @relation(fields: [gameId], references: [id])
  organizerId String
  organizer   User   @relation(fields: [organizerId], references: [id])

  organizationId String?
  organization   Organization? @relation("OrgTournaments", fields: [organizationId], references: [id], onDelete: SetNull)

  tournamentTeams TournamentTeam[]
  matches         Match[]

  @@index([status])
  @@index([gameId])
  @@index([startDate])
  @@index([organizationId])
  @@map("tournaments")
}
```

**Key Fields:**
- `slug`: Unique URL-friendly identifier
- `status`: Lifecycle status
- `organizerId`: User who created/organizes the tournament
- `organizationId`: Optional organization affiliation (nullable)

---

### TournamentTeam

Join table for teams participating in tournaments.

```prisma
model TournamentTeam {
  id        String @id @default(uuid())
  seed      Int?                    // Bracket seeding
  placement Int?                    // Final placement

  tournamentId String
  tournament   Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  teamId       String
  team         Team       @relation(fields: [teamId], references: [id], onDelete: Cascade)

  @@unique([tournamentId, teamId])
  @@map("tournament_teams")
}
```

---

### Match

Individual match/game within a tournament.

```prisma
model Match {
  id            String      @id @default(uuid())
  scheduledTime DateTime
  status        MatchStatus @default(scheduled)
  scoreTeam1    Int?                            // Final score
  scoreTeam2    Int?                            // Final score
  duration      Int?                            // Minutes
  streamUrl     String?
  round         Int?                            // Tournament round
  bracketPos    Int?                            // Bracket position
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  tournamentId String
  tournament   Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  team1Id      String?
  team1        Team?      @relation("MatchTeam1", fields: [team1Id], references: [id])
  team2Id      String?
  team2        Team?      @relation("MatchTeam2", fields: [team2Id], references: [id])
  winnerId     String?
  winner       Team?      @relation("MatchWinner", fields: [winnerId], references: [id])
  refereeId    String?
  referee      User?      @relation(fields: [refereeId], references: [id])
  nextMatchId  String?
  nextMatch    Match?     @relation("BracketProgression", fields: [nextMatchId], references: [id])
  prevMatches  Match[]    @relation("BracketProgression")

  sponsorId String?
  sponsor   Organization? @relation("OrgSponsoredMatches", fields: [sponsorId], references: [id], onDelete: SetNull)

  matchEvents MatchEvent[]

  @@index([tournamentId])
  @@index([status])
  @@index([scheduledTime])
  @@index([sponsorId])
  @@map("matches")
}
```

**Key Fields:**
- `status`: Match lifecycle (scheduled → live → completed)
- `scoreTeam1/scoreTeam2`: Final scores
- `winner`: FK to winning team (can be null for draws)
- `referee`: Optional match referee
- `sponsor`: Optional sponsoring organization
- `nextMatchId`: Self-referencing FK for bracket progression

---

### MatchEvent

In-match events (kills, objectives, etc.) for detailed stats.

```prisma
model MatchEvent {
  id        String   @id @default(uuid())
  type      String                 // e.g., "kill", "objective"
  timestamp DateTime @default(now())
  data      Json     @default("{}")  // Event-specific data

  matchId  String
  match    Match   @relation(fields: [matchId], references: [id], onDelete: Cascade)
  teamId   String?
  team     Team?   @relation(fields: [teamId], references: [id])
  playerId String?
  player   Player? @relation(fields: [playerId], references: [id])

  @@index([matchId])
  @@index([type])
  @@map("match_events")
}
```

---

## Teams & Players Models

### Team

Esports team/organization unit.

```prisma
model Team {
  id        String   @id @default(uuid())
  slug      String   @unique                 // URL identifier
  name      String   @unique
  tag       String?                          // Team tag/abbreviation
  logoUrl   String?
  regionTag String?  @map("region")         // Legacy field (use regionId)
  wins      Int      @default(0)
  losses    Int      @default(0)
  draws     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  regionId       String?
  region         Region?       @relation(fields: [regionId], references: [id], onDelete: SetNull)

  players         Player[]
  members         TeamMember[]
  tournamentTeams TournamentTeam[]
  matchesAsTeam1  Match[]          @relation("MatchTeam1")
  matchesAsTeam2  Match[]          @relation("MatchTeam2")
  matchesWon      Match[]          @relation("MatchWinner")
  matchEvents     MatchEvent[]

  @@index([organizationId])
  @@index([regionId])
  @@map("teams")
}
```

**Key Fields:**
- `slug`: URL-friendly identifier
- `regionTag`: Legacy string field (deprecated, use regionId)
- `wins/losses/draws`: Match record
- `organizationId`: Optional parent organization
- `regionId`: Optional region association

---

### Player

Professional player profile.

```prisma
model Player {
  id           String     @id @default(uuid())
  slug         String     @unique               // URL identifier
  displayName  String
  realName     String?
  nationality  String?
  imageUrl     String     @default("")
  bannerUrl    String?
  role         String?                          // e.g., "support", "carry"
  rating       Float      @default(0)
  aim          Int        @default(0) @db.SmallInt
  gameIq       Int        @default(0) @db.SmallInt
  clutch       Int        @default(0) @db.SmallInt
  teamplay     Int        @default(0) @db.SmallInt
  consistency  Int        @default(0) @db.SmallInt
  totalRatings Int        @default(0)
  tier         PlayerTier @default(F)
  rank         Int        @default(0)
  isActive     Boolean    @default(true)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  userId String?
  user   User?   @relation(fields: [userId], references: [id], onDelete: SetNull)
  gameId String
  game   Game    @relation(fields: [gameId], references: [id])
  teamId String?
  team   Team?   @relation(fields: [teamId], references: [id], onDelete: SetNull)

  teamMembers TeamMember[]
  ratings     Rating[]
  matchEvents MatchEvent[]

  @@index([rating(sort: Desc)])
  @@index([tier])
  @@index([gameId])
  @@index([teamId])
  @@map("players")
}
```

**Key Fields:**
- `slug`: URL-friendly identifier
- `displayName`, `realName`: Public and private names
- `userId`: Optional link to user account (claimed profile)
- `rating`: Calculated from ratings
- `tier`: Derived from rating or manual assignment
- Skill attributes: `aim`, `gameIq`, `clutch`, `teamplay`, `consistency`

---

### TeamMember

Team roster entry (many-to-many with temporal tracking).

```prisma
model TeamMember {
  id       String         @id @default(uuid())
  role     TeamMemberRole @default(player)
  joinedAt DateTime       @default(now())
  leftAt   DateTime?                          // Null = currently on team

  teamId   String
  team     Team   @relation(fields: [teamId], references: [id], onDelete: Cascade)
  playerId String
  player   Player @relation(fields: [playerId], references: [id], onDelete: Cascade)

  @@unique([teamId, playerId, leftAt])
  @@index([teamId])
  @@index([playerId])
  @@map("team_members")
}
```

**Key Design:**
- `joinedAt/leftAt`: Track membership history
- Unique constraint on `(teamId, playerId, leftAt)` allows multiple entries for same player (career history)

---

### Rating

Player skill rating/review.

```prisma
model Rating {
  id          String   @id @default(uuid())
  overall     Float
  aim         Int?     @db.SmallInt
  gameIq      Int?     @db.SmallInt
  clutch      Int?     @db.SmallInt
  teamplay    Int?     @db.SmallInt
  consistency Int?     @db.SmallInt
  comment     String   @default("")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  playerId String
  player   Player @relation(fields: [playerId], references: [id], onDelete: Cascade)
  userId   String?
  user     User?  @relation(fields: [userId], references: [id], onDelete: SetNull)

  // Anonymous rating support (for mock data)
  userName   String?
  userAvatar String?

  @@index([playerId])
  @@index([userId])
  @@map("ratings")
}
```

**Use Case:** Community ratings, player skill assessment, internal evaluations.

---

## Indexes & Performance

Key indexes for query optimization:

```prisma
// User
User
  @unique on email
  @unique on username

// Permissions
UserGroupPermission
  @@unique([userId, groupPermissionId])
  @@index([userId])
  @@index([groupPermissionId])

// Organization
Organization
  @@index([regionId])
  @@index([ownerId])

// Tournament
Tournament
  @@index([status])
  @@index([gameId])
  @@index([startDate])
  @@index([organizationId])

// Match
Match
  @@index([tournamentId])
  @@index([status])
  @@index([scheduledTime])
  @@index([sponsorId])

// Team
Team
  @@index([organizationId])
  @@index([regionId])

// Player
Player
  @@index([rating(sort: Desc)])
  @@index([tier])
  @@index([gameId])
  @@index([teamId])

// Rating
Rating
  @@index([playerId])
  @@index([userId])
```

---

## Prisma Commands

```bash
cd serve

# Generate Prisma client
pnpm run prisma:generate

# Create new migration
pnpm run prisma:migrate

# Apply migrations (production)
pnpm run prisma:migrate:deploy

# Seed database
pnpm run prisma:seed

# Interactive database browser
pnpm run prisma:studio

# Reset database (drop + recreate + seed)
pnpm run prisma:reset
```

---

## Key Relationships Summary

```
User
  ├─→ owns Players (via userId)
  ├─→ creates Ratings
  ├─→ organizes Tournaments
  ├─→ referees Matches
  ├─→ owns Organizations (OrgOwner)
  └─→ manages Organizations (OrgManager)

Organization
  ├─→ owns User (owner)
  ├─→ managed by User (manager)
  ├─→ belongs to Region
  ├─→ owns Teams
  ├─→ organizes Tournaments
  └─→ sponsors Matches

Region
  ├─→ contains Teams
  └─→ contains Organizations

Tournament
  ├─→ uses Game
  ├─→ organized by User
  ├─→ belongs to Organization (optional)
  ├─→ includes Teams (via TournamentTeam)
  └─→ contains Matches

Match
  ├─→ part of Tournament
  ├─→ between Team1 and Team2
  ├─→ won by Team (optional)
  ├─→ refereed by User (optional)
  ├─→ sponsored by Organization (optional)
  └─→ contains MatchEvents

Team
  ├─→ part of Organization (optional)
  ├─→ part of Region (optional)
  ├─→ contains Players
  ├─→ contains TeamMembers
  └─→ participates in Tournaments

Player
  ├─→ claimed by User (optional)
  ├─→ plays Game
  ├─→ belongs to Team (optional)
  ├─→ in TeamMembers
  └─→ receives Ratings
```

---

## Cascading Deletes

- `Tournament` → deletes `TournamentTeam`, `Match`
- `Match` → deletes `MatchEvent`
- `Team` → deletes `TeamMember`
- `Player` → deletes `TeamMember`, `Rating`, `MatchEvent`
- `User` → deletes `UserPermission`, cascades through org relations

---

## Best Practices

1. **Always use Prisma client** from `@app/common/generated/prisma`
2. **Use transactions** for multi-step operations (see RegionService, OrganizationService)
3. **Include related data** only when needed to avoid N+1 queries
4. **Use indexes** for frequently filtered fields
5. **Validate DTOs** before database operations
6. **Leverage unique constraints** for domain uniqueness (email, username, region.code)

