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

// Helper function to get notification icon based on type
export const getNotificationIcon = (type: NotificationType): string => {
  const iconMap: Record<NotificationType, string> = {
    ISSUE_ASSIGNED: '📋',
    ISSUE_UPDATED: '✏️',
    ISSUE_COMMENTED: '💬',
    ISSUE_MENTIONED: '@',
    ISSUE_STATUS_CHANGED: '🔄',
    SPRINT_STARTED: '🚀',
    SPRINT_COMPLETED: '✅',
    TEAM_ADDED: '👥',
    WATCHER_ADDED: '👁️',
  };
  return iconMap[type] || '🔔';
};

// Helper function to get notification color based on type
export const getNotificationColor = (type: NotificationType): string => {
  const colorMap: Record<NotificationType, string> = {
    ISSUE_ASSIGNED: 'blue',
    ISSUE_UPDATED: 'yellow',
    ISSUE_COMMENTED: 'green',
    ISSUE_MENTIONED: 'purple',
    ISSUE_STATUS_CHANGED: 'indigo',
    SPRINT_STARTED: 'cyan',
    SPRINT_COMPLETED: 'emerald',
    TEAM_ADDED: 'pink',
    WATCHER_ADDED: 'gray',
  };
  return colorMap[type] || 'gray';
};

export default notificationApi;
