import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TierKey } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TIER_COLORS: Record<TierKey, string> = {
  S: '#CCFF00',
  A: '#00FF88',
  B: '#00AAFF',
  C: '#FFB800',
  D: '#FF4D00',
  F: '#FF4444',
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
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}
