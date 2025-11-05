import apiClient from '@/lib/api-client';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectStatistics,
} from '@/types';

export const projectApi = {
  // Get all projects with optional filters
  async getProjects(params?: {
    skip?: number;
    take?: number;
    search?: string;
    ownerId?: string;
  }): Promise<Project[]> {
    const { data } = await apiClient.get('/projects', { params });
    return data;
  },

  // Get single project by ID
  async getProject(id: string): Promise<Project> {
    const { data } = await apiClient.get(`/projects/${id}`);
    return data;
  },

  // Get project by key
  async getProjectByKey(key: string): Promise<Project> {
    const { data } = await apiClient.get(`/projects/key/${key}`);
    return data;
  },

  // Get project statistics
  async getProjectStatistics(id: string): Promise<ProjectStatistics> {
    const { data } = await apiClient.get(`/projects/${id}/statistics`);
    return data;
  },

  // Create new project
  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    const { data } = await apiClient.post('/projects', projectData);
    return data;
  },

  // Update project
  async updateProject(
    id: string,
    projectData: UpdateProjectRequest
  ): Promise<Project> {
    const { data } = await apiClient.patch(`/projects/${id}`, projectData);
    return data;
  },

  // Delete project
  async deleteProject(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete(`/projects/${id}`);
    return data;
  },
};
