import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, ChangePasswordDto } from './dto';
import * as bcrypt from 'bcryptjs';
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
          isEmailVerified: true,
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
        isEmailVerified: true,
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
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

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

  // ==========================================
  // ADMIN-ONLY METHODS
  // ==========================================

  /**
   * Admin: Create user with any role
   */
  async adminCreateUser(data: {
    email: string;
    password: string;
    name: string;
    jobTitle?: string;
    department?: string;
    role?: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
  }) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        jobTitle: data.jobTitle,
        department: data.department,
        role: data.role as any || 'USER',
        isActive: data.isActive !== undefined ? data.isActive : true,
        isEmailVerified: data.isEmailVerified !== undefined ? data.isEmailVerified : false,
      },
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
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Admin: Update user with extended permissions
   */
  async adminUpdateUser(id: string, data: any) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Admin can update role, isActive, isEmailVerified, and reset failed attempts
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.jobTitle !== undefined && { jobTitle: data.jobTitle }),
        ...(data.department !== undefined && { department: data.department }),
        ...(data.role && { role: data.role as any }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.isEmailVerified !== undefined && { isEmailVerified: data.isEmailVerified }),
        ...(data.failedLoginAttempts !== undefined && { 
          failedLoginAttempts: data.failedLoginAttempts,
          ...(data.failedLoginAttempts === 0 && { lockedUntil: null })
        }),
        ...(data.avatar && { avatar: data.avatar }),
      },
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
        isEmailVerified: true,
        failedLoginAttempts: true,
        lockedUntil: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Admin: Permanently delete user
   */
  async adminDeleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User permanently deleted' };
  }

  /**
   * Admin: Get user statistics
   */
  async getUserStats(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Count activities manually
    const [
      issuesCreated,
      issuesAssigned,
      commentsPosted,
      workLogsCount,
      watchingIssues,
      teamMemberships,
      workLogs,
    ] = await Promise.all([
      this.prisma.issue.count({ where: { creatorId: id } }),
      this.prisma.issue.count({ where: { assigneeId: id } }),
      this.prisma.comment.count({ where: { authorId: id } }),
      this.prisma.workLog.count({ where: { userId: id } }),
      this.prisma.watcher.count({ where: { userId: id } }),
      this.prisma.teamMember.count({ where: { userId: id } }),
      this.prisma.workLog.findMany({
        where: { userId: id },
        select: { timeSpent: true },
      }),
    ]);

    const totalTimeLogged = workLogs.reduce((sum, log) => sum + log.timeSpent, 0);

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      issuesCreated,
      issuesAssigned,
      commentsPosted,
      workLogsCount,
      totalTimeLogged, // in minutes
      watchingIssues,
      teamMemberships,
    };
  }

  /**
   * Admin: Get all users with full details including sensitive info
   */
  async adminFindAll(params?: { 
    skip?: number; 
    take?: number; 
    search?: string;
    role?: string;
    isActive?: boolean;
  }) {
    const { skip = 0, take = 50, search, role, isActive } = params || {};

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { department: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

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
          isEmailVerified: true,
          failedLoginAttempts: true,
          lockedUntil: true,
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
      users,
      pagination: {
        total,
        skip,
        take,
        pages: Math.ceil(total / take),
      },
    };
  }
}

