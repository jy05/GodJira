import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({
    example: 'Platform Team',
    description: 'Team name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Core platform development and infrastructure',
    description: 'Team description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
