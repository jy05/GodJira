import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  bufferToBase64DataUrl,
  validateFileSize,
  getExtensionFromMimeType,
} from '../common/utils/file-upload.utils';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upload a file attachment to an issue
   */
  async create(
    issueId: string,
    file: Express.Multer.File,
    userId: string,
  ) {
    // Verify issue exists
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new NotFoundException(`Issue with ID ${issueId} not found`);
    }

    // Convert buffer to base64 data URL
    const dataUrl = bufferToBase64DataUrl(file.buffer, file.mimetype);

    // Generate filename if not provided
    const extension = getExtensionFromMimeType(file.mimetype);
    const filename = file.originalname || `attachment${extension}`;

    // Create attachment record
    const attachment = await this.prisma.attachment.create({
      data: {
        filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        data: dataUrl,
        issueId,
        uploadedBy: userId,
      },
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return attachment;
  }

  /**
   * Get all attachments for an issue
   */
  async findByIssue(issueId: string) {
    // Verify issue exists
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new NotFoundException(`Issue with ID ${issueId} not found`);
    }

    const attachments = await this.prisma.attachment.findMany({
      where: { issueId },
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return attachments;
  }

  /**
   * Get a single attachment by ID
   */
  async findOne(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return attachment;
  }

  /**
   * Delete an attachment
   * Only the uploader or project owner can delete
   */
  async remove(id: string, userId: string, userRole: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
      include: {
        issue: {
          include: {
            project: {
              select: { ownerId: true },
            },
          },
        },
      },
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    // Check permissions: uploader, project owner, or admin
    const isUploader = attachment.uploadedBy === userId;
    const isProjectOwner = attachment.issue.project.ownerId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isUploader && !isProjectOwner && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to delete this attachment',
      );
    }

    await this.prisma.attachment.delete({
      where: { id },
    });

    return { message: 'Attachment deleted successfully' };
  }
}
