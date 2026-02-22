import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsArray,
  IsEnum,
  ArrayMinSize,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { UserRole } from '@app/common';

export class AdminCreateUserDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  email: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @MinLength(8, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  password: string;

  @ApiProperty({ example: 'john_doe' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  username: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsOptional()
  name?: string;

  @ApiProperty({ enum: UserRole, isArray: true, example: [UserRole.USER] })
  @IsArray({ message: i18nValidationMessage('validation.IS_ARRAY') })
  @ArrayMinSize(1, { message: i18nValidationMessage('validation.ARRAY_MIN_SIZE') })
  @IsEnum(UserRole, { each: true, message: i18nValidationMessage('validation.IS_ENUM') })
  roles: UserRole[];

  @ApiProperty({ example: 1, description: '0 = admin account, 1 = public account' })
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Min(0, { message: i18nValidationMessage('validation.MIN') })
  @Max(1, { message: i18nValidationMessage('validation.MAX') })
  accountType: number;
}
