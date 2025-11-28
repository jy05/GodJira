import apiClient from '@/lib/api-client';

// Notification types
export type NotificationType =
  | 'ISSUE_ASSIGNED'
  | 'ISSUE_UPDATED'
  | 'ISSUE_COMMENTED'
  | 'ISSUE_MENTIONED'
  | 'ISSUE_STATUS_CHANGED'
  | 'SPRINT_STARTED'
  | 'SPRINT_COMPLETED'
  | 'TEAM_ADDED'
  | 'WATCHER_ADDED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: {
    issueId?: string;
    issueKey?: string;
    sprintId?: string;
    teamId?: string;
    commentId?: string;
    [key: string]: any;
  };
  createdAt: string;
  readAt?: string;
}

export interface NotificationFilters {
  skip?: number;
  take?: number;
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
}

export const notificationApi = {
  // Get all notifications for the current user with optional filters
  getNotifications: async (
    filters?: NotificationFilters
  ): Promise<{ data: Notification[]; total: number }> => {
    const response = await apiClient.get<{ data: Notification[]; total: number }>(
      '/notifications',
      { params: filters }
    );
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get<{ count: number }>(
      '/notifications/unread-count'
    );
    return response.data;
  },

  // Mark a specific notification as read
  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.patch<Notification>(
      `/notifications/${id}/read`
    );
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ message: string; count: number }> => {
    const response = await apiClient.patch<{ message: string; count: number }>(
      '/notifications/read-all'
    );
    return response.data;
  },

  // Delete a notification
  deleteNotification: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/notifications/${id}`
    );
    return response.data;
  },
};

// Helper function to get notification icon type based on notification type
export const getNotificationIconType = (type: NotificationType): string => {
  const iconMap: Record<NotificationType, string> = {
    ISSUE_ASSIGNED: 'clipboard',
    ISSUE_UPDATED: 'pencil',
    ISSUE_COMMENTED: 'chat',
    ISSUE_MENTIONED: 'at',
    ISSUE_STATUS_CHANGED: 'refresh',
    SPRINT_STARTED: 'lightning',
    SPRINT_COMPLETED: 'check-circle',
    TEAM_ADDED: 'users',
    WATCHER_ADDED: 'eye',
  };
  return iconMap[type] || 'bell';
};

// Helper function to get notification color based on type
export const getNotificationColor = (type: NotificationType): string => {
  const colorMap: Record<NotificationType, string> = {
    ISSUE_ASSIGNED: 'bg-blue-500',
    ISSUE_UPDATED: 'bg-yellow-500',
    ISSUE_COMMENTED: 'bg-green-500',
    ISSUE_MENTIONED: 'bg-purple-500',
    ISSUE_STATUS_CHANGED: 'bg-indigo-500',
    SPRINT_STARTED: 'bg-cyan-500',
    SPRINT_COMPLETED: 'bg-emerald-500',
    TEAM_ADDED: 'bg-pink-500',
    WATCHER_ADDED: 'bg-gray-500',
  };
  return colorMap[type] || 'bg-gray-500';
};

export default notificationApi;
