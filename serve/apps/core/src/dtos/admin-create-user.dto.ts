import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsArray, IsEnum, ArrayMinSize, IsInt, Min, Max } from 'class-validator';
import { UserRole } from '@app/common';

export class AdminCreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsArray()
    @ArrayMinSize(1)
    @IsEnum(UserRole, { each: true })
    roles: UserRole[];

    @IsInt()
    @Min(0)
    @Max(1)
    accountType: number;
}
