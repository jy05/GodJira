import { IsString, IsNotEmpty, IsOptional, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    example: 'WEB',
    description: 'Unique project key (2-10 uppercase letters)',
    minLength: 2,
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  @Matches(/^[A-Z]+$/, {
    message: 'Project key must contain only uppercase letters',
  })
  key: string;

  @ApiProperty({
    example: 'Website Redesign',
    description: 'Project name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Complete redesign of the company website with modern UI/UX',
    description: 'Project description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
