import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    example: 'This is a great idea! Let me know if you need help with implementation.',
    description: 'Comment content (supports markdown)',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: 'issue-uuid-here',
    description: 'Issue ID (required if taskId not provided)',
    required: false,
  })
  @IsString()
  @IsOptional()
  issueId?: string;

  @ApiProperty({
    example: 'task-uuid-here',
    description: 'Task ID (required if issueId not provided)',
    required: false,
  })
  @IsString()
  @IsOptional()
  taskId?: string;
}
