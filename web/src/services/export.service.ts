import apiClient from '@/lib/api-client';

export interface ExportFilters {
  projectId?: string;
  sprintId?: string;
  status?: string;
  priority?: string;
  type?: string;
  assigneeId?: string;
  startDate?: string;
  endDate?: string;
}

export const exportApi = {
  /**
   * Export issues to CSV or Excel
   * @param format - 'csv' or 'excel'
   * @param filters - Optional filters for issues
   */
  exportIssues: async (format: 'csv' | 'excel', filters?: ExportFilters): Promise<void> => {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const response = await apiClient.get(`/export/issues?${params.toString()}`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    const extension = format === 'csv' ? 'csv' : 'xlsx';
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `issues-${date}.${extension}`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Export sprint report as Excel
   * @param sprintId - Sprint UUID
   */
  exportSprintReport: async (sprintId: string): Promise<void> => {
    const response = await apiClient.get(`/export/sprints/${sprintId}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `sprint-report-${date}.xlsx`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Export work logs to CSV or Excel
   * @param format - 'csv' or 'excel'
   * @param filters - Optional date range and project/user filters
   */
  exportWorkLogs: async (format: 'csv' | 'excel', filters?: ExportFilters): Promise<void> => {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const response = await apiClient.get(`/export/work-logs?${params.toString()}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    const extension = format === 'csv' ? 'csv' : 'xlsx';
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `work-logs-${date}.${extension}`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Export user activity report as Excel
   * @param userId - User UUID
   * @param filters - Optional date range
   */
  exportUserActivity: async (userId: string, filters?: { startDate?: string; endDate?: string }): Promise<void> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const response = await apiClient.get(`/export/user-activity/${userId}?${params.toString()}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `user-activity-${date}.xlsx`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default exportApi;
