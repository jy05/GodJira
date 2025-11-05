import apiClient from '@/lib/api-client';
import type {
  Sprint,
  CreateSprintRequest,
  UpdateSprintRequest,
  SprintStatistics,
  SprintStatus,
} from '@/types';

export const sprintApi = {
  // Get all sprints with optional filters
  async getSprints(params?: {
    skip?: number;
    take?: number;
    projectId?: string;
    status?: SprintStatus;
  }): Promise<Sprint[]> {
    const { data } = await apiClient.get('/sprints', { params });
    return data;
  },

  // Get single sprint by ID
  async getSprint(id: string): Promise<Sprint> {
    const { data } = await apiClient.get(`/sprints/${id}`);
    return data;
  },

  // Get sprint statistics
  async getSprintStatistics(id: string): Promise<SprintStatistics> {
    const { data} = await apiClient.get(`/sprints/${id}/statistics`);
    return data;
  },

  // Create new sprint
  async createSprint(sprintData: CreateSprintRequest): Promise<Sprint> {
    const { data } = await apiClient.post('/sprints', sprintData);
    return data;
  },

  // Update sprint
  async updateSprint(
    id: string,
    sprintData: UpdateSprintRequest
  ): Promise<Sprint> {
    const { data } = await apiClient.patch(`/sprints/${id}`, sprintData);
    return data;
  },

  // Start sprint (PLANNED -> ACTIVE)
  async startSprint(id: string): Promise<Sprint> {
    const { data } = await apiClient.patch(`/sprints/${id}/start`);
    return data;
  },

  // Complete sprint (ACTIVE -> COMPLETED)
  async completeSprint(id: string): Promise<Sprint> {
    const { data } = await apiClient.patch(`/sprints/${id}/complete`);
    return data;
  },

  // Cancel sprint (PLANNED/ACTIVE -> CANCELLED)
  async cancelSprint(id: string): Promise<Sprint> {
    const { data } = await apiClient.patch(`/sprints/${id}/cancel`);
    return data;
  },

  // Delete sprint
  async deleteSprint(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete(`/sprints/${id}`);
    return data;
  },
};
