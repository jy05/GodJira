import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectDto {
  @ApiProperty({
    example: 'Website Redesign 2.0',
    description: 'Project name',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'Updated description for the project',
    description: 'Project description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'user-uuid-here',
    description: 'New owner user ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  ownerId?: string;
}
