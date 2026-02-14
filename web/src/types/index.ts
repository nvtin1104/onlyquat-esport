export type Locale = "vi" | "en";

// -- Users --
export type UserRole = "player" | "organizer" | "admin";

export interface Player {
  id: string;
  ign: string;
  realName: string;
  role: string;
  avatar: string;
  country?: string;
}

// -- Teams --
export interface TeamBase {
  id: string;
  name: string;
  tag: string;
  logo: string;
  country: string;
}

export interface Team extends TeamBase {
  players: Player[];
  captainId: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  rank: number;
  region: string;
}

// -- Tournaments --
export type TournamentStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export interface Tournament {
  id: string;
  name: string;
  description: string;
  game: string;
  startDate: string;
  endDate: string;
  status: TournamentStatus;
  teams: number;
  teamIds: string[];
  prizePool: number;
  prizeCurrency: string;
  banner: string;
  region: string;
  organizerId?: string;
  rules?: string;
}

// -- Matches --
export type MatchStatus = "scheduled" | "live" | "completed" | "cancelled";

export interface MatchScore {
  team1: number;
  team2: number;
}

export interface Match {
  id: string;
  tournamentId: string;
  team1: TeamBase;
  team2: TeamBase;
  score: MatchScore;
  status: MatchStatus;
  scheduledTime: string;
  winnerId?: string;
  duration?: number;
  streamUrl?: string;
  map?: string;
  round?: number;
}

// -- Articles --
export type ArticleCategory = "news" | "interview" | "highlight" | "recap";

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  category: ArticleCategory;
  author: string;
  publishDate: string;
  readTime: number;
  tags: string[];
}

// -- Minigames --
export interface Minigame {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  reward: string;
  rewardType: "cash" | "points" | "item";
  playerCount: number;
  type: "prediction" | "bracket" | "quiz";
}

// -- Standings --
export interface Standing {
  rank: number;
  team: TeamBase;
  wins: number;
  losses: number;
  draws: number;
  roundDiff: number;
  points: number;
  form: ("W" | "L" | "D")[];
}
