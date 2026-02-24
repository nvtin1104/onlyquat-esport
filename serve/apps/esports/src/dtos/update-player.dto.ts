import { PlayerTier } from '@app/common';

export class UpdatePlayerDto {
  displayName?: string;
  realName?: string;
  nationality?: string;
  imageUrl?: string;
  stats?: Record<string, unknown>;
  mechanics?: number;
  tactics?: number;
  composure?: number;
  teamwork?: number;
  consistency?: number;
  isPro?: boolean;
  isActive?: boolean;
  gameId?: string;
  teamId?: string;
  userId?: string;
  tier?: PlayerTier;
  rank?: number;
}
