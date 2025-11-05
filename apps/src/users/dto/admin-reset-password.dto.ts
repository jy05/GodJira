import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminResetPasswordDto {
  @ApiProperty({
    example: 'NewSecureP@ssw0rd',
    description: 'New password for the user',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
