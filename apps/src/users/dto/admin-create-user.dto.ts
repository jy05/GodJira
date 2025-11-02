import { IsEmail, IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminCreateUserDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecureP@ssw0rd',
    description: 'User password',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Software Engineer',
    description: 'Job title',
    required: false,
  })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiProperty({
    example: 'Engineering',
    description: 'Department',
    required: false,
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({
    example: 'USER',
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
}
