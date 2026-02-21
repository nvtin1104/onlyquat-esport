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
import { UserRole } from '@app/common';

export class AdminCreateUserDto {
    @ApiProperty({ example: 'admin@example.com' })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'StrongPass123' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Mật khẩu tối thiểu 8 ký tự' })
    password: string;

    @ApiProperty({ example: 'john_doe' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: 'John Doe', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ enum: UserRole, isArray: true, example: [UserRole.USER] })
    @IsArray()
    @ArrayMinSize(1, { message: 'Phải chọn ít nhất 1 role' })
    @IsEnum(UserRole, { each: true, message: 'Role không hợp lệ' })
    roles: UserRole[];

    @ApiProperty({ example: 1, description: '0 = admin account, 1 = public account' })
    @IsInt()
    @Min(0)
    @Max(1)
    accountType: number;
}
