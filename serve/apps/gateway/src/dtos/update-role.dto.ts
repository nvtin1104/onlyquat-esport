import { IsArray, IsNotEmpty, ArrayMinSize, IsEnum } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { UserRole } from '@app/common';

export class UpdateRoleDto {
  @IsArray({ message: i18nValidationMessage('validation.IS_ARRAY') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @ArrayMinSize(1, { message: i18nValidationMessage('validation.ARRAY_MIN_SIZE') })
  @IsEnum(UserRole, { each: true, message: i18nValidationMessage('validation.IS_ENUM') })
  roles: UserRole[];
}
