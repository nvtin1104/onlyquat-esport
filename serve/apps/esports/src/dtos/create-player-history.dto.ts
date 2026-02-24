import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PlayerHistoryEventType } from '@app/common/../generated/prisma/client';

export class CreatePlayerHistoryDto {
  @IsUUID()
  playerId: string;

  @IsEnum(PlayerHistoryEventType)
  eventType: PlayerHistoryEventType;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  happenedAt?: string;

  @IsOptional()
  @IsUUID()
  teamId?: string;
}
