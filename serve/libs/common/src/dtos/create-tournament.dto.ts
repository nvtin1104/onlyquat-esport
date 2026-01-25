import { IsString, IsNotEmpty, IsDateString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';

export class CreateTournamentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  game: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsEnum(['upcoming', 'ongoing', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;

  @IsString()
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
