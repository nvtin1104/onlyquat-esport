import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateRoleDto {
  @IsEnum(['player', 'organizer', 'admin'])
  @IsNotEmpty()
  role: string;
}
