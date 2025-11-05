import apiClient from '@/lib/api-client';

export interface SystemSettings {
  id: string;
  registrationEnabled: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface UpdateSettingsDto {
  registrationEnabled: boolean;
}

export const settingsApi = {
  getSettings: async (): Promise<SystemSettings> => {
    const response = await apiClient.get<SystemSettings>('/settings');
    return response.data;
  },

  updateSettings: async (data: UpdateSettingsDto): Promise<SystemSettings> => {
    const response = await apiClient.patch<SystemSettings>('/settings', data);
    return response.data;
  },

  isRegistrationEnabled: async (): Promise<boolean> => {
    const response = await apiClient.get<{ enabled: boolean }>('/settings/registration-enabled');
    return response.data.enabled;
  },
};
