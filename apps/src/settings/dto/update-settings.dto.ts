import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiProperty({
    example: true,
    description: 'Enable or disable user registration',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  registrationEnabled?: boolean;
}
