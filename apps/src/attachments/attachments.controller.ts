import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AttachmentsService } from './attachments.service';
import { AttachmentResponseDto } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  attachmentFileFilter,
  MAX_ATTACHMENT_SIZE,
  validateFileSize,
} from '../common/utils/file-upload.utils';

@ApiTags('attachments')
@ApiBearerAuth()
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('issues/:issueId')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: attachmentFileFilter,
      limits: { fileSize: MAX_ATTACHMENT_SIZE },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file attachment to an issue' })
  @ApiParam({ name: 'issueId', description: 'Issue UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (max 20MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Attachment uploaded successfully',
    type: AttachmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file or missing file' })
  @ApiResponse({ status: 404, description: 'Issue not found' })
  async uploadAttachment(
    @Param('issueId') issueId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('userId') userId: string,
  ): Promise<AttachmentResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    validateFileSize(file, MAX_ATTACHMENT_SIZE);

    return this.attachmentsService.create(issueId, file, userId);
  }

  @Get('issues/:issueId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all attachments for an issue' })
  @ApiParam({ name: 'issueId', description: 'Issue UUID' })
  @ApiResponse({
    status: 200,
    description: 'List of attachments',
    type: [AttachmentResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Issue not found' })
  async getIssueAttachments(
    @Param('issueId') issueId: string,
  ): Promise<AttachmentResponseDto[]> {
    return this.attachmentsService.findByIssue(issueId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a single attachment by ID' })
  @ApiParam({ name: 'id', description: 'Attachment UUID' })
  @ApiResponse({
    status: 200,
    description: 'Attachment details',
    type: AttachmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async getAttachment(@Param('id') id: string): Promise<AttachmentResponseDto> {
    return this.attachmentsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an attachment' })
  @ApiParam({ name: 'id', description: 'Attachment UUID' })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async deleteAttachment(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.attachmentsService.remove(id, userId, userRole);
  }
}
