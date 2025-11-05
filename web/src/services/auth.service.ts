import apiClient, { setTokens, clearTokens } from '@/lib/api-client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ChangePasswordRequest,
  User,
} from '@/types';

export const authApi = {
  // Register new user
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/register', data);
    setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  // Login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    // JWT tokens are stateless, so we only need to clear them on the client
    clearTokens();
  },

  // Refresh token
  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await apiClient.post<RefreshResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      '/auth/forgot-password',
      data
    );
    return response.data;
  },

  // Reset password
  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      '/auth/reset-password',
      data
    );
    return response.data;
  },

  // Verify email
  verifyEmail: async (data: VerifyEmailRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/verify-email', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(
      '/users/me/password',
      data
    );
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      '/auth/resend-verification',
      { email }
    );
    return response.data;
  },
};

// Simplified service for easier imports
const authService = {
  register: authApi.register,
  login: authApi.login,
  logout: authApi.logout,
  refresh: authApi.refresh,
  getProfile: authApi.getProfile,
  forgotPassword: (email: string) => authApi.forgotPassword({ email }),
  resetPassword: (token: string, password: string) => authApi.resetPassword({ token, password }),
  verifyEmail: (token: string) => authApi.verifyEmail({ token }),
  changePassword: (currentPassword: string, newPassword: string) => 
    authApi.changePassword({ currentPassword, newPassword }),
  resendVerification: (email: string) => authApi.resendVerification(email),
};

export default authService;
