import type { AdminPlayer, AdminTeam, AdminMatch, AdminRating, AdminUser, PointTransaction, KPIData } from '@/types/admin';
import { TIER_COLORS } from '@/lib/utils';

export const mockPlayers: AdminPlayer[] = [
  { id: 'p1', slug: 'dragonslayer99', displayName: 'DragonSlayer99', realName: 'Nguyen Minh Duc', nationality: 'VN', imageUrl: '/avatars/dragon.webp', gameId: 'g1', gameName: 'League of Legends', gameShort: 'LoL', teamId: 't1', teamTag: 'ALP', role: 'Mid', rating: 9.8, tier: 'S', totalRatings: 12450, rank: 1, isActive: true },
  { id: 'p2', slug: 'thunderace', displayName: 'ThunderAce', realName: 'Tran Hoang Nam', nationality: 'VN', imageUrl: '/avatars/thunder.webp', gameId: 'g2', gameName: 'Valorant', gameShort: 'VAL', teamId: 't2', teamTag: 'PHX', role: 'Duelist', rating: 9.5, tier: 'S', totalRatings: 9830, rank: 2, isActive: true },
  { id: 'p3', slug: 'kitsunepro', displayName: 'KitsunePro', realName: 'Le Thi Huong', nationality: 'VN', imageUrl: '/avatars/kitsune.webp', gameId: 'g3', gameName: 'Dota 2', gameShort: 'Dota2', teamId: 't3', teamTag: 'ORC', role: 'Carry', rating: 9.3, tier: 'S', totalRatings: 8200, rank: 3, isActive: true },
  { id: 'p4', slug: 'sakurawind', displayName: 'SakuraWind', realName: 'Pham Anh Thu', nationality: 'VN', imageUrl: '/avatars/sakura.webp', gameId: 'g4', gameName: 'CS2', gameShort: 'CS2', teamId: 't1', teamTag: 'ALP', role: 'AWPer', rating: 9.1, tier: 'S', totalRatings: 7650, rank: 4, isActive: true },
  { id: 'p5', slug: 'shadowviper', displayName: 'ShadowViper', realName: 'Vo Quoc Huy', nationality: 'VN', imageUrl: '/avatars/shadow.webp', gameId: 'g2', gameName: 'Valorant', gameShort: 'VAL', teamId: 't2', teamTag: 'PHX', role: 'Controller', rating: 8.7, tier: 'A', totalRatings: 5420, rank: 5, isActive: true },
  { id: 'p6', slug: 'blazequeen', displayName: 'BlazeQueen', realName: 'Dang Thuy Linh', nationality: 'VN', imageUrl: '/avatars/blaze.webp', gameId: 'g1', gameName: 'League of Legends', gameShort: 'LoL', teamId: 't3', teamTag: 'ORC', role: 'ADC', rating: 8.4, tier: 'A', totalRatings: 4890, rank: 6, isActive: true },
  { id: 'p7', slug: 'ironwolf', displayName: 'IronWolf', realName: 'Bui Duc Anh', nationality: 'VN', imageUrl: '/avatars/ironwolf.webp', gameId: 'g3', gameName: 'Dota 2', gameShort: 'Dota2', teamId: 't1', teamTag: 'ALP', role: 'Offlane', rating: 7.9, tier: 'B', totalRatings: 3200, rank: 7, isActive: true },
  { id: 'p8', slug: 'neonrush', displayName: 'NeonRush', realName: 'Hoang Van Tung', nationality: 'VN', imageUrl: '/avatars/neon.webp', gameId: 'g4', gameName: 'CS2', gameShort: 'CS2', teamId: 't2', teamTag: 'PHX', role: 'Entry', rating: 7.5, tier: 'B', totalRatings: 2100, rank: 8, isActive: false },
];

export const mockTeams: AdminTeam[] = [
  { id: 't1', name: 'Team Alpha', tag: 'ALP', slug: 'team-alpha', logoUrl: '/logos/alpha.webp', orgName: 'Alpha Esports', region: 'VN', playerCount: 5, avgRating: 9.0, isActive: true },
  { id: 't2', name: 'Phoenix Rising', tag: 'PHX', slug: 'phoenix-rising', logoUrl: '/logos/phoenix.webp', orgName: 'Phoenix Org', region: 'VN', playerCount: 5, avgRating: 8.6, isActive: true },
  { id: 't3', name: 'Orca Gaming', tag: 'ORC', slug: 'orca-gaming', logoUrl: '/logos/orca.webp', orgName: null, region: 'SEA', playerCount: 4, avgRating: 8.8, isActive: true },
];

export const mockMatches: AdminMatch[] = [
  { id: 'm1', game: 'LoL', teamA: { tag: 'ALP', name: 'Team Alpha' }, teamB: { tag: 'PHX', name: 'Phoenix Rising' }, tournament: 'VCS Mua Xuan 2026', scheduledAt: '2026-02-20T14:00:00', status: 'upcoming' },
  { id: 'm2', game: 'VAL', teamA: { tag: 'PHX', name: 'Phoenix Rising' }, teamB: { tag: 'ORC', name: 'Orca Gaming' }, tournament: 'VCT Vietnam', scheduledAt: '2026-02-18T19:00:00', status: 'live' },
  { id: 'm3', game: 'CS2', teamA: { tag: 'ALP', name: 'Team Alpha' }, teamB: { tag: 'ORC', name: 'Orca Gaming' }, tournament: 'BLAST Open', scheduledAt: '2026-02-15T16:00:00', status: 'completed', winner: 'ALP', scoreA: 2, scoreB: 1 },
];

export const mockRatings: AdminRating[] = [
  { id: 'r1', userName: 'NamAnh', playerName: 'DragonSlayer99', playerGame: 'LoL', playerRole: 'Mid', overall: 9.5, aim: 96, gameIq: 92, clutch: 95, teamplay: 88, consistency: 90, comment: 'Choi mid qua dinh, carry ca team trong game 3', timeAgo: '2 phut truoc', status: 'pending' },
  { id: 'r2', userName: 'HuyPro', playerName: 'ThunderAce', playerGame: 'Valorant', playerRole: 'Duelist', overall: 8.0, aim: 88, gameIq: 75, clutch: 82, teamplay: 70, consistency: 78, comment: 'Aim tot nhung teamplay can cai thien', timeAgo: '5 phut truoc', status: 'approved' },
  { id: 'r3', userName: 'LinhChi', playerName: 'KitsunePro', playerGame: 'Dota 2', playerRole: 'Carry', overall: 9.8, aim: 98, gameIq: 97, clutch: 96, teamplay: 95, consistency: 94, comment: 'Best carry VN hien tai, khong co gi phai ban', timeAgo: '8 phut truoc', status: 'pending' },
  { id: 'r4', userName: 'DucMinh', playerName: 'SakuraWind', playerGame: 'CS2', playerRole: 'AWPer', overall: 7.5, aim: 90, gameIq: 72, clutch: 68, teamplay: 65, consistency: 70, comment: 'AWP on nhung round eco yeu', timeAgo: '12 phut truoc', status: 'approved' },
  { id: 'r5', userName: 'ThuHa', playerName: 'ShadowViper', playerGame: 'Valorant', playerRole: 'Controller', overall: 8.9, aim: 85, gameIq: 92, clutch: 88, teamplay: 90, consistency: 87, comment: 'Smoke rat chuan, IQ game cao', timeAgo: '15 phut truoc', status: 'rejected' },
];

export const mockUsers: any[] = [
  { id: 'u1', username: 'NamAnh', email: 'nam@email.com', role: ['USER'], points: 1250, ratingsCount: 45, joinedAt: '2025-06-15', status: 'ACTIVE' },
  { id: 'u2', username: 'HuyPro', email: 'huy@email.com', role: ['STAFF'], points: 3400, ratingsCount: 120, joinedAt: '2025-03-20', status: 'ACTIVE' },
  { id: 'u3', username: 'AdminThu', email: 'thu@arcadearena.vn', role: ['ADMIN'], points: 9999, ratingsCount: 5, joinedAt: '2025-01-01', status: 'ACTIVE' },
  { id: 'u4', username: 'SpamBot99', email: 'spam@fake.com', role: ['USER'], points: 0, ratingsCount: 200, joinedAt: '2026-02-10', status: 'BANNED' },
];

export const kpiData: Record<string, KPIData> = {
  totalPlayers: { value: 2547, change: 12.5, label: 'Tuyen thu' },
  totalRatings: { value: 185420, change: 8.5, label: 'Danh gia' },
  totalPoints: { value: 1200000, change: 23.1, label: 'Diem da phat' },
  totalMatches: { value: 48, change: 0, liveCount: 5, label: 'Tran dau' },
};

export const ratingTrend = [
  { month: 'T8', count: 22400 },
  { month: 'T9', count: 25100 },
  { month: 'T10', count: 28300 },
  { month: 'T11', count: 31200 },
  { month: 'T12', count: 29800 },
  { month: 'T1', count: 34500 },
];

export const tierDistribution = [
  { tier: 'S', count: 305, color: TIER_COLORS.S },
  { tier: 'A', count: 637, color: TIER_COLORS.A },
  { tier: 'B', count: 764, color: TIER_COLORS.B },
  { tier: 'C', count: 509, color: TIER_COLORS.C },
  { tier: 'D', count: 254, color: TIER_COLORS.D },
  { tier: 'F', count: 78, color: TIER_COLORS.F },
];

export const mockTransactions: PointTransaction[] = [
  { id: 'tx1', userId: 'u1', username: 'NamAnh', type: 'earn_rating', amount: 50, balance: 1250, createdAt: '2026-02-18T10:30:00' },
  { id: 'tx2', userId: 'u2', username: 'HuyPro', type: 'earn_daily', amount: 10, balance: 3400, createdAt: '2026-02-18T09:00:00' },
  { id: 'tx3', userId: 'u1', username: 'NamAnh', type: 'spend_predict', amount: -100, balance: 1200, createdAt: '2026-02-17T20:15:00' },
  { id: 'tx4', userId: 'u3', username: 'AdminThu', type: 'admin_gift', amount: 500, balance: 9999, createdAt: '2026-02-17T15:00:00' },
];

export const gameRoles: Record<string, string[]> = {
  g1: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
  g2: ['Duelist', 'Initiator', 'Controller', 'Sentinel'],
  g3: ['Carry', 'Mid', 'Offlane', 'Soft Support', 'Hard Support'],
  g4: ['Entry', 'AWPer', 'Lurker', 'Support', 'IGL'],
};

export const games = [
  { id: 'g1', name: 'League of Legends', shortName: 'LoL' },
  { id: 'g2', name: 'Valorant', shortName: 'VAL' },
  { id: 'g3', name: 'Dota 2', shortName: 'Dota2' },
  { id: 'g4', name: 'CS2', shortName: 'CS2' },
];
