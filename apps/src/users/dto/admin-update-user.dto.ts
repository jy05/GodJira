import { IsEnum, IsOptional, IsBoolean, IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateUserDto } from './update-user.dto';

export class AdminUpdateUserDto extends UpdateUserDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'ADMIN',
    enum: ['ADMIN', 'MANAGER', 'USER'],
    description: 'User role',
    required: false,
  })
  @IsEnum(['ADMIN', 'MANAGER', 'USER'])
  @IsOptional()
  role?: string;

  @ApiProperty({
    example: true,
    description: 'Whether user is active',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether email is verified',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;

  @ApiProperty({
    example: 0,
    description: 'Reset failed login attempts',
    required: false,
  })
  @IsOptional()
  failedLoginAttempts?: number;
}
