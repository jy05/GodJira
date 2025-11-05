import { IsBoolean, IsOptional, IsString } from 'class-validator';
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

  @ApiProperty({
    example: 'America/Chicago',
    description: 'System timezone (IANA timezone identifier)',
    required: false,
  })
  @IsString()
  @IsOptional()
  systemTimezone?: string;
}
