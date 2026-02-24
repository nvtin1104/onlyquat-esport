export type TeamHistoryEventType =
  | 'NAME_CHANGE'
  | 'LOGO_CHANGE'
  | 'ACHIEVEMENT'
  | 'PLAYER_JOIN'
  | 'PLAYER_LEAVE'
  | 'ORG_CHANGE';

export type PlayerHistoryEventType =
  | 'DISPLAY_NAME_CHANGE'
  | 'TEAM_JOIN'
  | 'TEAM_LEAVE'
  | 'TEAM_TRANSFER'
  | 'ACHIEVEMENT'
  | 'TIER_CHANGE';

export interface TeamHistoryItem {
  id: string;
  eventType: TeamHistoryEventType;
  metadata: Record<string, any>;
  note: string | null;
  happenedAt: string;
  createdAt: string;
  teamId: string;
  playerId: string | null;
  player?: {
    id: string;
    slug: string;
    displayName: string;
    imageUrl: string;
  } | null;
}

export interface PlayerHistoryItem {
  id: string;
  eventType: PlayerHistoryEventType;
  metadata: Record<string, any>;
  note: string | null;
  happenedAt: string;
  createdAt: string;
  playerId: string;
  teamId: string | null;
  team?: {
    id: string;
    slug: string;
    name: string;
    logo: string | null;
  } | null;
}

export interface AddTeamHistoryDto {
  eventType: TeamHistoryEventType;
  metadata?: Record<string, any>;
  note?: string;
  happenedAt?: string;
  playerId?: string;
}

export interface AddPlayerHistoryDto {
  eventType: PlayerHistoryEventType;
  metadata?: Record<string, any>;
  note?: string;
  happenedAt?: string;
  teamId?: string;
}
