import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '@app/common';

export class UpdateRoleDto {
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
