import apiClient from '@/lib/api-client';
import type { BurndownChart, VelocityReport } from '@/types';

export const analyticsApi = {
  // Get burndown chart for a sprint
  async getBurndownChart(sprintId: string): Promise<BurndownChart> {
    const { data } = await apiClient.get(`/analytics/burndown/${sprintId}`);
    return data;
  },

  // Get velocity report for a project
  async getVelocityReport(projectId: string, teamId?: string): Promise<VelocityReport> {
    const params: any = { projectId };
    if (teamId) params.teamId = teamId;
    
    const { data } = await apiClient.get('/analytics/velocity', { params });
    return data;
  },

  // Get project summary
  async getProjectSummary(projectId: string) {
    const { data } = await apiClient.get(`/analytics/project-summary/${projectId}`);
    return data;
  },

  // Get comprehensive sprint report
  async getSprintReport(sprintId: string) {
    const { data } = await apiClient.get(`/analytics/sprint-report/${sprintId}`);
    return data;
  },
};
