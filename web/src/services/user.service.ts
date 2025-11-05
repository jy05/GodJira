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

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  jobTitle?: string;
  department?: string;
  role?: 'ADMIN' | 'MANAGER' | 'USER';
  isActive?: boolean;
  isEmailVerified?: boolean;
}

export interface AdminResetPasswordData {
  newPassword: string;
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

  // Update avatar (multipart/form-data file upload)
  updateAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const { data } = await apiClient.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Get list of all users (admin/manager only)
  getUsers: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    // Convert page/limit to skip/take for backend compatibility
    const skip = params?.page && params?.limit ? (params.page - 1) * params.limit : undefined;
    const take = params?.limit;
    
    const { data} = await apiClient.get('/users', { 
      params: {
        skip,
        take,
        search: params?.search,
        role: params?.role,
        isActive: params?.isActive,
      }
    });
    return data;
  },

  // Get user by ID (admin/manager only)
  getUserById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },

  // Update user role (admin/manager only)
  updateUserRole: async (id: string, roleData: UpdateUserRoleData): Promise<User> => {
    const { data } = await apiClient.patch(`/users/admin/${id}`, roleData);
    return data;
  },

  // Deactivate user (admin only)
  deactivateUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}/deactivate`);
  },

  // Reactivate user (admin only)
  reactivateUser: async (id: string): Promise<User> => {
    const { data } = await apiClient.patch(`/users/${id}/reactivate`);
    return data;
  },

  // Create user (admin only)
  createUser: async (userData: CreateUserData): Promise<User> => {
    const { data } = await apiClient.post('/users/admin/create', userData);
    return data;
  },

  // Admin reset user password (admin only)
  adminResetPassword: async (id: string, passwordData: AdminResetPasswordData): Promise<void> => {
    await apiClient.patch(`/users/admin/${id}/reset-password`, passwordData);
  },
};
