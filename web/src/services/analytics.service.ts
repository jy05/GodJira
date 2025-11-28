import apiClient from '@/lib/api-client';
import type { BurndownChart, VelocityReport } from '@/types';

export interface IssueAgingReport {
  projectId: string;
  projectName: string;
  aged0to7Days: any[];
  aged8to14Days: any[];
  aged15to30Days: any[];
  aged30PlusDays: any[];
  averageAgeDays: number;
  medianAgeDays: number;
  totalIssues: number;
  staleIssuesCount: number;
}

export interface TeamCapacityReport {
  teamId: string;
  teamName: string;
  sprintId?: string;
  sprintName?: string;
  startDate: string;
  endDate: string;
  members: {
    userId: string;
    userName: string;
    userEmail: string;
    assignedPoints: number;
    completedPoints: number;
    inProgressPoints: number;
    assignedIssues: number;
    completedIssues: number;
    inProgressIssues: number;
    timeLoggedMinutes: number;
    utilizationPercentage: number;
    averageCompletionTimeDays: number;
  }[];
  totalTeamCapacity: number;
  totalCommittedPoints: number;
  totalCompletedPoints: number;
  teamUtilization: number;
  teamSize: number;
  averagePointsPerMember: number;
  totalTimeLoggedMinutes: number;
}

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

  // Get issue aging report
  async getIssueAgingReport(projectId: string): Promise<IssueAgingReport> {
    const { data } = await apiClient.get('/analytics/issue-aging', {
      params: { projectId },
    });
    return data;
  },

  // Get team capacity report
  async getTeamCapacityReport(
    teamId: string,
    sprintId?: string,
    timeRange?: string
  ): Promise<TeamCapacityReport> {
    const params: any = { teamId };
    if (sprintId) params.sprintId = sprintId;
    if (timeRange) params.timeRange = timeRange;
    
    const { data } = await apiClient.get('/analytics/team-capacity', { params });
    return data;
  },
};
