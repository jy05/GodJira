import { apiClient } from '@/lib/api-client';
import type { User, PaginatedResponse, PaginationParams } from '@/types';

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  jobTitle?: string;
  department?: string;
}

export interface UpdateUserRoleData {
  role: 'ADMIN' | 'MANAGER' | 'USER';
}

export const userApi = {
  // Get current user profile
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get('/users/me');
    return data;
  },

  // Update current user profile
  updateProfile: async (profileData: UpdateProfileData): Promise<User> => {
    const { data } = await apiClient.patch('/users/me', profileData);
    return data;
  },

  // Update avatar (base64 string)
  updateAvatar: async (avatar: string): Promise<User> => {
    const { data } = await apiClient.patch('/users/me/avatar', { avatar });
    return data;
  },

  // Get list of all users (admin/manager only)
  getUsers: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const { data} = await apiClient.get('/users', { params });
    return data;
  },

  // Get user by ID (admin/manager only)
  getUserById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },

  // Update user role (admin/manager only)
  updateUserRole: async (id: string, roleData: UpdateUserRoleData): Promise<User> => {
    const { data } = await apiClient.patch(`/users/${id}/role`, roleData);
    return data;
  },

  // Deactivate user (admin only)
  deactivateUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // Reactivate user (admin only)
  reactivateUser: async (id: string): Promise<User> => {
    const { data } = await apiClient.post(`/users/${id}/reactivate`);
    return data;
  },
};
