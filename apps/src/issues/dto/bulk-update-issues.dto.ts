import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { IssueStatus, IssuePriority } from '@prisma/client';

export class BulkUpdateIssuesDto {
  @ApiProperty({
    description: 'Array of issue IDs to update',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
    type: [String],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  issueIds: string[];

  @ApiProperty({
    description: 'New assignee ID for all issues',
    example: 'user-uuid',
    required: false,
  })
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({
    description: 'New status for all issues',
    enum: IssueStatus,
    required: false,
  })
  @IsEnum(IssueStatus)
  @IsOptional()
  status?: IssueStatus;

  @ApiProperty({
    description: 'New sprint ID for all issues',
    example: 'sprint-uuid',
    required: false,
  })
  @IsString()
  @IsOptional()
  sprintId?: string;

  @ApiProperty({
    description: 'New priority for all issues',
    enum: IssuePriority,
    required: false,
  })
  @IsEnum(IssuePriority)
  @IsOptional()
  priority?: IssuePriority;

  @ApiProperty({
    description: 'Labels to add to all issues',
    example: ['Platform Team', 'High Priority'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  addLabels?: string[];

  @ApiProperty({
    description: 'Labels to remove from all issues',
    example: ['Low Priority'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  removeLabels?: string[];
}
