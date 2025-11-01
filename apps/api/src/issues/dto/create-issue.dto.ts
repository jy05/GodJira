import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIssueDto {
  @ApiProperty({
    example: 'Implement user authentication',
    description: 'Issue title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Create a complete authentication system with JWT tokens and refresh tokens',
    description: 'Issue description (supports markdown)',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'TASK',
    enum: ['TASK', 'BUG', 'STORY', 'EPIC', 'SPIKE'],
    description: 'Issue type',
    required: false,
  })
  @IsEnum(['TASK', 'BUG', 'STORY', 'EPIC', 'SPIKE'])
  @IsOptional()
  type?: string;

  @ApiProperty({
    example: 'TODO',
    enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE', 'CLOSED'],
    description: 'Issue status',
    required: false,
  })
  @IsEnum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE', 'CLOSED'])
  @IsOptional()
  status?: string;

  @ApiProperty({
    example: 'MEDIUM',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'],
    description: 'Issue priority',
    required: false,
  })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'])
  @IsOptional()
  priority?: string;

  @ApiProperty({
    example: 5,
    description: 'Story points (Fibonacci scale)',
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  storyPoints?: number;

  @ApiProperty({
    example: 'project-uuid-here',
    description: 'Project ID',
  })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    example: 'sprint-uuid-here',
    description: 'Sprint ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  sprintId?: string;

  @ApiProperty({
    example: 'user-uuid-here',
    description: 'Assignee user ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({
    example: ['Platform Team', 'Backend'],
    description: 'Labels/tags',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labels?: string[];

  @ApiProperty({
    example: ['data:image/png;base64,iVBORw0KGgo...'],
    description: 'Attachments as base64 data URLs',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}
