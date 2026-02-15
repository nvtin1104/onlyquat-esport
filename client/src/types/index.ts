export interface Game {
  id: string;
  name: string;
  shortName: string;
  iconUrl: string;
  roles: string[];
}

export interface Team {
  id: string;
  slug: string;
  name: string;
  tag: string;
  logoUrl: string;
  region: string;
  players: string[];
}

export interface PlayerStats {
  aim: number;
  gameIq: number;
  clutch: number;
  teamplay: number;
  consistency: number;
}

export interface Player {
  id: string;
  slug: string;
  displayName: string;
  realName?: string;
  nationality: string;
  imageUrl: string;
  bannerUrl?: string;
  gameId: string;
  teamId?: string;
  role: string;
  rating: number;
  stats: PlayerStats;
  totalRatings: number;
  tier: TierKey;
  rank: number;
  isActive: boolean;
}

export interface Rating {
  id: string;
  playerId: string;
  userName: string;
  userAvatar?: string;
  overall: number;
  aim?: number;
  gameIq?: number;
  clutch?: number;
  teamplay?: number;
  consistency?: number;
  comment: string;
  createdAt: string;
}

export type TierKey = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
