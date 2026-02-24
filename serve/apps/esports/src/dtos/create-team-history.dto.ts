import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TeamHistoryEventType } from '@app/common/../generated/prisma/client';

export class CreateTeamHistoryDto {
  @IsUUID()
  teamId: string;

  @IsEnum(TeamHistoryEventType)
  eventType: TeamHistoryEventType;

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
  playerId?: string;
}
