import { IsString, IsOptional, IsEmail, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'Software engineer passionate about building scalable systems',
    description: 'User bio',
    required: false,
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    example: 'Senior Software Engineer',
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
    example: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
    description: 'Base64 encoded avatar image',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatar?: string;
}
