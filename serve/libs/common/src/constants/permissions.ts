export const PERMISSIONS = {
  // USER
  USER_VIEW: 'user:view',
  USER_VIEW_DETAIL: 'user:view-detail',
  USER_MANAGE: 'user:manage',
  USER_UPDATE_ROLE: 'user:update-role',
  USER_BAN: 'user:ban',

  // TOURNAMENT
  TOURNAMENT_VIEW: 'tournament:view',
  TOURNAMENT_CREATE: 'tournament:create',
  TOURNAMENT_UPDATE: 'tournament:update',
  TOURNAMENT_DELETE: 'tournament:delete',
  TOURNAMENT_MANAGE: 'tournament:manage',

  // MATCH
  MATCH_VIEW: 'match:view',
  MATCH_CREATE: 'match:create',
  MATCH_UPDATE: 'match:update',
  MATCH_DELETE: 'match:delete',
  MATCH_MANAGE: 'match:manage',

  // PLAYER
  PLAYER_VIEW: 'player:view',
  PLAYER_CREATE: 'player:create',
  PLAYER_UPDATE: 'player:update',
  PLAYER_DELETE: 'player:delete',
  PLAYER_MANAGE: 'player:manage',

  // TEAM
  TEAM_VIEW: 'team:view',
  TEAM_CREATE: 'team:create',
  TEAM_UPDATE: 'team:update',
  TEAM_DELETE: 'team:delete',
  TEAM_MANAGE: 'team:manage',

  // RATING
  RATING_VIEW: 'rating:view',
  RATING_CREATE: 'rating:create',
  RATING_MODERATE: 'rating:moderate',
  RATING_DELETE: 'rating:delete',
  RATING_MANAGE: 'rating:manage',

  // POINTS
  POINTS_VIEW: 'points:view',
  POINTS_GRANT: 'points:grant',
  POINTS_MANAGE: 'points:manage',

  // CONTENT
  CONTENT_VIEW: 'content:view',
  CONTENT_CREATE: 'content:create',
  CONTENT_MANAGE: 'content:manage',

  // SYSTEM
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_PERMISSIONS: 'system:permissions',
  SYSTEM_MANAGE: 'system:manage',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
