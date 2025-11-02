import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSubTaskDto {
  @ApiProperty({
    description: 'Parent issue ID',
    example: 'uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  parentIssueId: string;

  @ApiProperty({
    description: 'Sub-task title',
    example: 'Implement login API endpoint',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Sub-task description',
    example: 'Create POST /api/auth/login endpoint',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Assignee ID',
    example: 'user-uuid',
    required: false,
  })
  @IsString()
  @IsOptional()
  assigneeId?: string;
}
