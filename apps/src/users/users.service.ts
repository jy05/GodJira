import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, ChangePasswordDto } from './dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Get all users (exclude password)
   */
  async findAll(params?: { skip?: number; take?: number; search?: string }) {
    const { skip = 0, take = 50, search } = params || {};

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { department: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          name: true,
          bio: true,
          jobTitle: true,
          department: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        skip,
        take,
      },
    };
  }

  /**
   * Get user by ID
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        jobTitle: true,
        department: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            createdIssues: true,
            assignedIssues: true,
            createdTasks: true,
            assignedTasks: true,
            comments: true,
            workLogs: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Update user profile
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Validate avatar if provided
    if (updateUserDto.avatar) {
      this.validateAvatar(updateUserDto.avatar);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        jobTitle: true,
        department: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check password history (NIST compliance)
    const historySize = this.configService.get<number>('PASSWORD_HISTORY_SIZE') || 5;
    const recentPasswords = user.passwordHistory.slice(-historySize);

    for (const oldHash of recentPasswords) {
      const isMatch = await bcrypt.compare(changePasswordDto.newPassword, oldHash);
      if (isMatch) {
        throw new BadRequestException(
          'Password has been used recently. Please choose a different password.',
        );
      }
    }

    // Hash new password
    const bcryptRounds = this.configService.get<number>('BCRYPT_ROUNDS') || 12;
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, bcryptRounds);

    // Update password and password history
    const updatedPasswordHistory = [...user.passwordHistory, hashedPassword].slice(-historySize);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordHistory: updatedPasswordHistory,
      },
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Deactivate user account
   */
  async deactivate(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'User deactivated successfully' };
  }

  /**
   * Reactivate user account
   */
  async reactivate(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    return { message: 'User reactivated successfully' };
  }

  /**
   * Delete user (soft delete - set as inactive)
   */
  async remove(id: string) {
    return this.deactivate(id);
  }

  /**
   * Validate avatar format and size
   */
  private validateAvatar(avatar: string) {
    // Check if it's a valid data URL
    if (!avatar.startsWith('data:image/')) {
      throw new BadRequestException('Invalid avatar format. Must be a base64 data URL.');
    }

    // Extract mime type
    const matches = avatar.match(/^data:(image\/[a-z]+);base64,/);
    if (!matches) {
      throw new BadRequestException('Invalid avatar format');
    }

    const mimeType = matches[1];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(mimeType)) {
      throw new BadRequestException(
        'Invalid image type. Allowed types: JPEG, PNG, GIF, WebP',
      );
    }

    // Check size (approximate - base64 is ~33% larger than binary)
    const base64Length = avatar.split(',')[1].length;
    const sizeInBytes = (base64Length * 3) / 4;
    const maxSize = this.configService.get<number>('MAX_FILE_SIZE') || 10485760; // 10MB

    if (sizeInBytes > maxSize) {
      throw new BadRequestException(
        `Avatar size exceeds maximum allowed size of ${maxSize / 1048576}MB`,
      );
    }
  }
}
