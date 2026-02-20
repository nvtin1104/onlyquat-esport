import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type TierKey = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TIER_COLORS: Record<TierKey, string> = {
  S: 'var(--color-tier-s)',
  A: 'var(--color-tier-a)',
  B: 'var(--color-tier-b)',
  C: 'var(--color-tier-c)',
  D: 'var(--color-tier-d)',
  F: 'var(--color-tier-f)',
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
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}
