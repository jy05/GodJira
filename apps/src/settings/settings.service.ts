import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get system settings (creates default if doesn't exist)
   */
  async getSettings() {
    let settings = await this.prisma.systemSettings.findFirst();
    
    if (!settings) {
      // Create default settings if they don't exist
      settings = await this.prisma.systemSettings.create({
        data: {
          registrationEnabled: true,
        },
      });
    }
    
    return settings;
  }

  /**
   * Update system settings (admin only)
   */
  async updateSettings(userId: string, data: { registrationEnabled?: boolean }) {
    const settings = await this.getSettings();
    
    return this.prisma.systemSettings.update({
      where: { id: settings.id },
      data: {
        ...data,
        updatedBy: userId,
      },
    });
  }

  /**
   * Check if registration is enabled
   */
  async isRegistrationEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.registrationEnabled;
  }
}
