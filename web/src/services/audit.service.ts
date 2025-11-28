import apiClient from '@/lib/api-client';

// Audit Log types
export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'STATUS_CHANGE'
  | 'ASSIGN'
  | 'COMMENT'
  | 'LOGIN'
  | 'LOGOUT';

export type AuditEntityType =
  | 'USER'
  | 'PROJECT'
  | 'SPRINT'
  | 'ISSUE'
  | 'COMMENT'
  | 'WORKLOG'
  | 'TEAM'
  | 'ATTACHMENT';

export interface AuditLog {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  userId: string;
  userName?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  changes?: any; // JSON object containing before/after values
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogFilters {
  skip?: number;
  take?: number;
  entityType?: AuditEntityType;
  entityId?: string;
  userId?: string;
  action?: AuditAction;
  startDate?: string;
  endDate?: string;
}

export interface ActivityFeedItem {
  id: string;
  entityType: AuditEntityType;
  action: AuditAction;
  title: string;
  description: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: any;
  createdAt: string;
}

export const auditApi = {
  // Get audit logs with filters (admin only)
  getAuditLogs: async (
    filters?: AuditLogFilters
  ): Promise<{ data: AuditLog[]; total: number }> => {
    const response = await apiClient.get<{ data: AuditLog[]; total: number }>(
      '/audit/logs',
      { params: filters }
    );
    return response.data;
  },

  // Get recent activity feed
  getActivityFeed: async (params?: {
    skip?: number;
    take?: number;
    projectId?: string;
  }): Promise<{ data: ActivityFeedItem[]; total: number }> => {
    const response = await apiClient.get<{
      data: ActivityFeedItem[];
      total: number;
    }>('/audit/activity-feed', { params });
    return response.data;
  },
};

// Helper function to get human-readable action text
export const getActionText = (action: AuditAction): string => {
  const actionMap: Record<AuditAction, string> = {
    CREATE: 'created',
    UPDATE: 'updated',
    DELETE: 'deleted',
    STATUS_CHANGE: 'changed status of',
    ASSIGN: 'assigned',
    COMMENT: 'commented on',
    LOGIN: 'logged in',
    LOGOUT: 'logged out',
  };
  return actionMap[action] || action.toLowerCase();
};

// Helper function to get entity type display name
export const getEntityDisplayName = (entityType: AuditEntityType): string => {
  const entityMap: Record<AuditEntityType, string> = {
    USER: 'User',
    PROJECT: 'Project',
    SPRINT: 'Sprint',
    ISSUE: 'Issue',
    COMMENT: 'Comment',
    WORKLOG: 'Work Log',
    TEAM: 'Team',
    ATTACHMENT: 'Attachment',
  };
  return entityMap[entityType] || entityType;
};

// Helper function to get action color
export const getActionColor = (action: AuditAction): string => {
  const colorMap: Record<AuditAction, string> = {
    CREATE: 'green',
    UPDATE: 'blue',
    DELETE: 'red',
    STATUS_CHANGE: 'yellow',
    ASSIGN: 'purple',
    COMMENT: 'indigo',
    LOGIN: 'cyan',
    LOGOUT: 'gray',
  };
  return colorMap[action] || 'gray';
};

export default auditApi;
