import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification token from email link',
    example: 'xyz789abc123...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
