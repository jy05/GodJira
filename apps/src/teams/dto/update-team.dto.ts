import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTeamDto {
  @ApiProperty({
    example: 'Platform Team',
    description: 'Team name',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'Core platform development and infrastructure',
    description: 'Team description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
