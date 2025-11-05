import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, ChangePasswordDto } from './dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  avatarFileFilter,
  MAX_AVATAR_SIZE,
  validateFileSize,
  bufferToBase64DataUrl,
} from '../common/utils/file-upload.utils';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({ skip, take, search });
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
  })
  getCurrentUser(@CurrentUser('userId') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Post('me/avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('avatar', {
      fileFilter: avatarFileFilter,
      limits: {
        fileSize: MAX_AVATAR_SIZE,
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload avatar image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file (JPEG, PNG, GIF, WebP, max 10MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or file size exceeds limit',
  })
  async uploadAvatar(
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file size (redundant but explicit)
    validateFileSize(file, MAX_AVATAR_SIZE);

    // Convert to base64 data URL
    const avatarDataUrl = bufferToBase64DataUrl(file.buffer, file.mimetype);

    // Update user avatar
    return this.usersService.update(userId, { avatar: avatarDataUrl });
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Password validation failed',
  })
  changePassword(
    @CurrentUser('userId') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, changePasswordDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN' as any)
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN' as any)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User deactivated successfully',
  })
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Patch(':id/reactivate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN' as any)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactivate user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User reactivated successfully',
  })
  reactivate(@Param('id') id: string) {
    return this.usersService.reactivate(id);
  }

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  @Post('admin/create')
  @UseGuards(RolesGuard)
  @Roles('ADMIN' as any)
  @ApiOperation({ summary: 'Admin: Create user with any role' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  adminCreateUser(@Body() adminCreateUserDto: AdminCreateUserDto) {
    return this.usersService.adminCreateUser(adminCreateUserDto);
  }

  @Get('admin/list')
  @UseGuards(RolesGuard)
  @Roles('ADMIN' as any)
  @ApiOperation({ summary: 'Admin: Get all users with full details' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: ['ADMIN', 'MANAGER', 'USER'] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  adminFindAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.usersService.adminFindAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      search,
      role,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get('admin/:id/stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN' as any, 'MANAGER' as any)
  @ApiOperation({ summary: 'Admin: Get user statistics' })
  getUserStats(@Param('id') id: string) {
    return this.usersService.getUserStats(id);
  }

  @Patch('admin/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN' as any)
  @ApiOperation({ summary: 'Admin: Update user with extended permissions' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  adminUpdate(@Param('id') id: string, @Body() adminUpdateUserDto: AdminUpdateUserDto) {
    return this.usersService.adminUpdateUser(id, adminUpdateUserDto);
  }

  @Delete('admin/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN' as any)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Permanently delete user' })
  @ApiResponse({
    status: 200,
    description: 'User permanently deleted',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  adminDelete(@Param('id') id: string) {
    return this.usersService.adminDeleteUser(id);
  }

  @Patch('admin/:id/reset-password')
  @UseGuards(RolesGuard)
  @Roles('ADMIN' as any)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Reset user password' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  adminResetPassword(
    @Param('id') id: string,
    @Body() adminResetPasswordDto: AdminResetPasswordDto,
  ) {
    return this.usersService.adminResetPassword(id, adminResetPasswordDto);
  }
}
