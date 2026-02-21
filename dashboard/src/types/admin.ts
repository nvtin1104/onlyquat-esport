export type TierKey = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface AdminPlayer {
  id: string;
  slug: string;
  displayName: string;
  realName?: string;
  nationality: string;
  imageUrl: string;
  gameId: string;
  gameName: string;
  gameShort: string;
  teamId?: string;
  teamTag?: string;
  role: string;
  rating: number;
  tier: TierKey;
  totalRatings: number;
  rank: number;
  isActive: boolean;
}

export interface AdminTeam {
  id: string;
  name: string;
  tag: string;
  slug: string;
  logoUrl: string;
  orgName: string | null;
  region: string;
  playerCount: number;
  avgRating: number;
  isActive: boolean;
}

export interface AdminMatch {
  id: string;
  game: string;
  teamA: { tag: string; name: string };
  teamB: { tag: string; name: string };
  tournament: string;
  scheduledAt: string;
  status: 'upcoming' | 'live' | 'completed';
  winner?: string;
  scoreA?: number;
  scoreB?: number;
}

export interface AdminRating {
  id: string;
  userName: string;
  userAvatar?: string;
  playerName: string;
  playerGame: string;
  playerRole: string;
  overall: number;
  aim: number;
  gameIq: number;
  clutch: number;
  teamplay: number;
  consistency: number;
  comment: string;
  timeAgo: string;
  status: 'pending' | 'approved' | 'rejected';
}

export type UserRole = 'ROOT' | 'ADMIN' | 'STAFF' | 'USER';
export type UserStatus = 'ACTIVE' | 'UNACTIVE' | 'BANNED';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  name: string | null;
  role: UserRole[];
  status: UserStatus;
  accountType: number;
  createdAt: string;
  updatedAt: string;
}

export interface UsersListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
}


export interface PointTransaction {
  id: string;
  userId: string;
  username: string;
  type: string;
  amount: number;
  balance: number;
  createdAt: string;
}

export interface KPIData {
  value: number;
  change: number;
  label: string;
  liveCount?: number;
}
