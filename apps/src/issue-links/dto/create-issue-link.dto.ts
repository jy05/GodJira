import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IssueLinkType } from '@prisma/client';

export class CreateIssueLinkDto {
  @ApiProperty({
    description: 'Type of link relationship',
    enum: IssueLinkType,
    example: 'BLOCKS',
  })
  @IsEnum(IssueLinkType)
  @IsNotEmpty()
  linkType: IssueLinkType;

  @ApiProperty({
    description: 'ID of the source issue',
    example: 'uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  fromIssueId: string;

  @ApiProperty({
    description: 'ID of the target issue',
    example: 'uuid-456',
  })
  @IsString()
  @IsNotEmpty()
  toIssueId: string;
}
