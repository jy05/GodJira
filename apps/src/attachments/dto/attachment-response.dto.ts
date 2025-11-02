import { ApiProperty } from '@nestjs/swagger';

export class AttachmentResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'screenshot.png' })
  filename: string;

  @ApiProperty({ example: 'screenshot.png' })
  originalName: string;

  @ApiProperty({ example: 'image/png' })
  mimetype: string;

  @ApiProperty({ example: 1024000, description: 'File size in bytes' })
  size: number;

  @ApiProperty({
    example: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
    description: 'Base64 encoded file data',
  })
  data: string;

  @ApiProperty({
    example: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
    description: 'Base64 encoded thumbnail (for images)',
    required: false,
    nullable: true,
  })
  thumbnail?: string | null;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  issueId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  uploadedBy: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    type: 'object',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      name: 'John Doe',
    },
    description: 'User who uploaded the file',
  })
  uploader?: {
    id: string;
    email: string;
    name: string;
  };
}
