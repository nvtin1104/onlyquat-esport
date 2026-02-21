// Database Module (PostgreSQL - Prisma)
export * from './database/prisma.module';
export * from './database/prisma.service';

// Permission constants
export * from './constants/permissions';

// Prisma generated types & enums
export { UserRole, UserStatus, TournamentStatus, MatchStatus, PlayerTier, TeamMemberRole } from '../generated/prisma/client';
export type { 
  User, 
  Game, 
  Team, 
  Player, 
  TeamMember, 
  Rating, 
  Tournament, 
  TournamentTeam, 
  Match, 
  MatchEvent, 
  GroupPermission,
  UserPermission,
  UserGroupPermission
} from '../generated/prisma/client';
