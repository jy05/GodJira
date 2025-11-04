import { IsEmail, IsString, MinLength, Matches, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Password (min 8 chars, must include uppercase, lowercase, number, special char)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain uppercase, lowercase, number and special character',
    },
  )
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Software Engineer',
    description: 'Job title',
    required: false,
  })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiProperty({
    example: 'Engineering',
    description: 'Department',
    required: false,
  })
  @IsOptional()
  @IsString()
  department?: string;
}
