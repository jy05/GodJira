import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('Settings')
@Controller('settings')
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get system settings' })
  @ApiResponse({
    status: 200,
    description: 'System settings retrieved successfully',
  })
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Get('registration-enabled')
  @ApiOperation({ summary: 'Check if registration is enabled (public)' })
  @ApiResponse({
    status: 200,
    description: 'Registration status',
  })
  async isRegistrationEnabled() {
    const enabled = await this.settingsService.isRegistrationEnabled();
    return { registrationEnabled: enabled };
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN' as any)
  @ApiOperation({ summary: 'Update system settings (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Settings updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  updateSettings(@Body() updateSettingsDto: UpdateSettingsDto, @Req() req: any) {
    return this.settingsService.updateSettings(req.user.userId, updateSettingsDto);
  }
}
