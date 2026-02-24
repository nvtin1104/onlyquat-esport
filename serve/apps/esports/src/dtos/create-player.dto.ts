export class CreatePlayerDto {
  displayName: string;
  slug?: string;
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
  gameId: string;
  teamId?: string;
  userId?: string;
}
