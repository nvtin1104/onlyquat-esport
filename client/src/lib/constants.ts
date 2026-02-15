import type { TierKey } from '@/types';

export const TIER_THRESHOLDS: Record<TierKey, number> = {
  S: 9.0,
  A: 8.0,
  B: 7.0,
  C: 6.0,
  D: 5.0,
  F: 0,
};

export const STAT_LABELS: Record<string, string> = {
  aim: 'Aim',
  gameIq: 'Game IQ',
  clutch: 'Clutch',
  teamplay: 'Teamplay',
  consistency: 'Consistency',
};

export const PLAYER_AVATARS: Record<string, string> = {
  dragonslayer99: '🐉',
  thunderace: '⚡',
  kitsunepro: '🦊',
  sakurawind: '🌸',
  shadowviper: '🐍',
  blazequeen: '🔥',
  ironwolf: '🐺',
  neonrush: '💜',
};

export const NAV_LINKS = [
  { href: '/players', label: 'Tuyển thủ' },
  { href: '/leaderboard', label: 'BXH' },
  { href: '/compare', label: 'So sánh' },
  { href: '/teams', label: 'Teams' },
];
