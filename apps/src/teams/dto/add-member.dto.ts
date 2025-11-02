import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty({
    example: 'user-uuid-here',
    description: 'User ID to add to team',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: 'MEMBER',
    enum: ['LEAD', 'MEMBER'],
    description: 'Team member role',
    required: false,
  })
  @IsEnum(['LEAD', 'MEMBER'])
  @IsOptional()
  role?: string;
}
