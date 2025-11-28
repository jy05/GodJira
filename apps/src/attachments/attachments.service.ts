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
  generateThumbnail,
} from '../common/utils/file-upload.utils';
import { encryptDataUrl, decryptDataUrl } from '../common/utils/encryption.utils';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upload a file attachment to an issue
   * Automatically generates thumbnails for image files (200x200px)
   * Thumbnails maintain aspect ratio and are stored as base64 data URLs
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

    // Encrypt the data URL for storage (data-at-rest encryption)
    const encryptedData = encryptDataUrl(dataUrl);

    // Generate thumbnail for images (200x200)
    const thumbnailDataUrl = await generateThumbnail(file.buffer, file.mimetype, 200, 200);
    
    // Encrypt thumbnail if it exists
    const encryptedThumbnail = thumbnailDataUrl ? encryptDataUrl(thumbnailDataUrl) : null;

    // Generate filename if not provided
    const extension = getExtensionFromMimeType(file.mimetype);
    const filename = file.originalname || `attachment${extension}`;

    // Create attachment record with encrypted data
    const attachment = await this.prisma.attachment.create({
      data: {
        filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        data: encryptedData,
        thumbnail: encryptedThumbnail,
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

    // Decrypt data before returning to client
    return {
      ...attachment,
      data: decryptDataUrl(attachment.data),
      thumbnail: attachment.thumbnail ? decryptDataUrl(attachment.thumbnail) : null,
    };
  }

  /**
   * Get all attachments for an issue
   * Decrypts attachment data before returning
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

    // Decrypt all attachment data before returning
    return attachments.map(attachment => ({
      ...attachment,
      data: decryptDataUrl(attachment.data),
      thumbnail: attachment.thumbnail ? decryptDataUrl(attachment.thumbnail) : null,
    }));
  }

  /**
   * Get a single attachment by ID
   * Decrypts attachment data before returning
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

    // Decrypt data before returning
    return {
      ...attachment,
      data: decryptDataUrl(attachment.data),
      thumbnail: attachment.thumbnail ? decryptDataUrl(attachment.thumbnail) : null,
    };
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
