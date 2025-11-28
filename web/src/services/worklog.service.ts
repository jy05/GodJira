import apiClient from '@/lib/api-client';

// WorkLog types
export interface WorkLog {
  id: string;
  issueId: string;
  userId: string;
  timeSpentMinutes: number;
  description?: string;
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  issue?: {
    id: string;
    key: string;
    title: string;
  };
}

export interface CreateWorkLogRequest {
  issueId: string;
  timeSpentMinutes: number;
  description?: string;
  loggedAt?: string; // ISO date string, defaults to now
}

export interface UpdateWorkLogRequest {
  timeSpentMinutes?: number;
  description?: string;
  loggedAt?: string;
}

export interface WorkLogStatistics {
  totalLogs: number;
  totalTimeMinutes: number;
  averageTimePerLog: number;
  logsByDate: {
    date: string;
    count: number;
    totalMinutes: number;
  }[];
  logsByIssue: {
    issueId: string;
    issueKey: string;
    issueTitle: string;
    totalMinutes: number;
    logCount: number;
  }[];
}

export const worklogApi = {
  // Create a new work log entry
  createWorkLog: async (data: CreateWorkLogRequest): Promise<WorkLog> => {
    const response = await apiClient.post<WorkLog>('/worklogs', data);
    return response.data;
  },

  // Get all work logs for a specific issue
  getIssueWorkLogs: async (issueId: string): Promise<WorkLog[]> => {
    const response = await apiClient.get<WorkLog[]>(`/worklogs/issue/${issueId}`);
    return response.data;
  },

  // Get total time logged for a specific issue
  getIssueTotalTime: async (issueId: string): Promise<{ totalMinutes: number }> => {
    const response = await apiClient.get<{ totalMinutes: number }>(
      `/worklogs/issue/${issueId}/total-time`
    );
    return response.data;
  },

  // Get all work logs by a specific user
  getUserWorkLogs: async (
    userId: string,
    params?: { skip?: number; take?: number; startDate?: string; endDate?: string }
  ): Promise<WorkLog[]> => {
    const response = await apiClient.get<WorkLog[]>(`/worklogs/user/${userId}`, {
      params,
    });
    return response.data;
  },

  // Get work log statistics for a user
  getUserWorkLogStats: async (
    userId: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<WorkLogStatistics> => {
    const response = await apiClient.get<WorkLogStatistics>(
      `/worklogs/user/${userId}/stats`,
      { params }
    );
    return response.data;
  },

  // Get a specific work log by ID
  getWorkLog: async (id: string): Promise<WorkLog> => {
    const response = await apiClient.get<WorkLog>(`/worklogs/${id}`);
    return response.data;
  },

  // Update a work log
  updateWorkLog: async (id: string, data: UpdateWorkLogRequest): Promise<WorkLog> => {
    const response = await apiClient.patch<WorkLog>(`/worklogs/${id}`, data);
    return response.data;
  },

  // Delete a work log
  deleteWorkLog: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/worklogs/${id}`);
    return response.data;
  },
};

// Helper functions for time formatting
export const formatMinutesToHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const parseTimeStringToMinutes = (timeString: string): number => {
  // Supports formats like: "2h 30m", "2.5h", "150m", "2h", "30m"
  const hoursMatch = timeString.match(/(\d+(?:\.\d+)?)\s*h/i);
  const minutesMatch = timeString.match(/(\d+)\s*m/i);

  let totalMinutes = 0;

  if (hoursMatch) {
    totalMinutes += parseFloat(hoursMatch[1]) * 60;
  }

  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1], 10);
  }

  return Math.round(totalMinutes);
};

export default worklogApi;
