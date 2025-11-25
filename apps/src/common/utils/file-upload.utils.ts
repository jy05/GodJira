import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { Request } from 'express';
import sharp from 'sharp';

/**
 * File upload configuration and validation utilities
 */

// Allowed MIME types for images
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

// Allowed MIME types for attachments (images + documents)
export const ALLOWED_ATTACHMENT_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

// Maximum file sizes
export const MAX_AVATAR_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024; // 25MB

/**
 * Multer file filter for avatar images
 */
export const avatarFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return callback(
      new BadRequestException(
        `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
      ),
      false,
    );
  }

  const ext = extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

  if (!allowedExtensions.includes(ext)) {
    return callback(
      new BadRequestException(
        `Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`,
      ),
      false,
    );
  }

  callback(null, true);
};

/**
 * Multer file filter for issue attachments
 */
export const attachmentFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!ALLOWED_ATTACHMENT_TYPES.includes(file.mimetype)) {
    return callback(
      new BadRequestException(
        `Invalid file type. Allowed types: images, PDFs, and common document formats`,
      ),
      false,
    );
  }

  callback(null, true);
};

/**
 * Convert file buffer to base64 data URL
 */
export function bufferToBase64DataUrl(
  buffer: Buffer,
  mimetype: string,
): string {
  const base64 = buffer.toString('base64');
  return `data:${mimetype};base64,${base64}`;
}

/**
 * Validate file size
 */
export function validateFileSize(
  file: Express.Multer.File,
  maxSize: number,
): void {
  if (file.size > maxSize) {
    throw new BadRequestException(
      `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`,
    );
  }
}

/**
 * Extract base64 data from data URL
 */
export function extractBase64FromDataUrl(dataUrl: string): string {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new BadRequestException('Invalid data URL format');
  }
  return matches[2];
}

/**
 * Extract MIME type from data URL
 */
export function extractMimeTypeFromDataUrl(dataUrl: string): string {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new BadRequestException('Invalid data URL format');
  }
  return matches[1];
}

/**
 * Validate base64 data URL
 */
export function validateBase64DataUrl(dataUrl: string): void {
  if (!dataUrl.startsWith('data:')) {
    throw new BadRequestException('Invalid data URL: must start with "data:"');
  }

  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new BadRequestException('Invalid data URL format');
  }

  const mimetype = matches[1];
  const base64Data = matches[2];

  // Validate base64 string
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  if (!base64Regex.test(base64Data)) {
    throw new BadRequestException('Invalid base64 encoding');
  }

  // Validate MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(mimetype)) {
    throw new BadRequestException(
      `Invalid MIME type in data URL: ${mimetype}`,
    );
  }
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimetype: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      '.xlsx',
    'text/plain': '.txt',
    'text/csv': '.csv',
  };

  return mimeToExt[mimetype] || '';
}

/**
 * Generate thumbnail for images using sharp
 * Resizes the image while maintaining aspect ratio
 * @param buffer - Image buffer
 * @param mimetype - Image MIME type
 * @param maxWidth - Maximum width (default: 200px)
 * @param maxHeight - Maximum height (default: 200px)
 * @returns Base64 data URL of the thumbnail
 */
export async function generateThumbnail(
  buffer: Buffer,
  mimetype: string,
  maxWidth: number = 200,
  maxHeight: number = 200,
): Promise<string> {
  try {
    // Only generate thumbnails for images
    if (!ALLOWED_IMAGE_TYPES.includes(mimetype)) {
      return ''; // Return empty string for non-images
    }

    // Resize image while maintaining aspect ratio
    const thumbnailBuffer = await sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside', // Maintain aspect ratio
        withoutEnlargement: true, // Don't upscale small images
      })
      .toBuffer();

    // Convert to base64 data URL
    return bufferToBase64DataUrl(thumbnailBuffer, mimetype);
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    // Return empty string if thumbnail generation fails
    return '';
  }
}
