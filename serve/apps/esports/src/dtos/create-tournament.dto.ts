import { IsString, IsNotEmpty, IsDateString, IsOptional, IsEnum, IsNumber, Min, IsUUID } from 'class-validator';
import { TournamentStatus } from '@app/common';

export class CreateTournamentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  gameId: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsEnum(TournamentStatus)
  @IsOptional()
  status?: TournamentStatus;

  @IsUUID()
  @IsNotEmpty()
  organizerId: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  prizePool?: number;

  @IsString()
  @IsOptional()
  rules?: string;
}
