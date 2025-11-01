import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({
    example: 'Updated comment content with markdown **support**',
    description: 'Comment content (supports markdown)',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
