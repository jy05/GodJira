import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignProjectDto {
  @ApiProperty({
    example: 'project-uuid-here',
    description: 'Project ID to assign to team',
  })
  @IsString()
  @IsNotEmpty()
  projectId: string;
}
