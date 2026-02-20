import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TierKey } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// For inline styles (Recharts, Framer Motion, etc.) — auto-switches with theme
export const TIER_COLORS: Record<TierKey, string> = {
  S: 'var(--tier-s)',
  A: 'var(--tier-a)',
  B: 'var(--tier-b)',
  C: 'var(--tier-c)',
  D: 'var(--tier-d)',
  F: 'var(--tier-f)',
};

// For Tailwind className usage
export const TIER_TEXT_CLASS: Record<TierKey, string> = {
  S: 'text-tier-s',
  A: 'text-tier-a',
  B: 'text-tier-b',
  C: 'text-tier-c',
  D: 'text-tier-d',
  F: 'text-tier-f',
};

export const TIER_BG_CLASS: Record<TierKey, string> = {
  S: 'bg-tier-s/10 text-tier-s border border-tier-s/30',
  A: 'bg-tier-a/10 text-tier-a border border-tier-a/30',
  B: 'bg-tier-b/10 text-tier-b border border-tier-b/30',
  C: 'bg-tier-c/10 text-tier-c border border-tier-c/30',
  D: 'bg-tier-d/10 text-tier-d border border-tier-d/30',
  F: 'bg-tier-f/10 text-tier-f border border-tier-f/30',
};

export const TIER_LABELS: Record<TierKey, string> = {
  S: 'S Tier',
  A: 'A Tier',
  B: 'B Tier',
  C: 'C Tier',
  D: 'D Tier',
  F: 'F Tier',
};

export function getTierFromRating(rating: number): TierKey {
  if (rating >= 9.0) return 'S';
  if (rating >= 8.0) return 'A';
  if (rating >= 7.0) return 'B';
  if (rating >= 6.0) return 'C';
  if (rating >= 5.0) return 'D';
  return 'F';
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}
