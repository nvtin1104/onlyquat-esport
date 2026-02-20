import { IsArray, IsEnum, IsNotEmpty, ArrayMinSize } from 'class-validator';
import { UserRole } from '@app/common';

export class UpdateRoleDto {
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];
}
