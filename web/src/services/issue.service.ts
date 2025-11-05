import axios from 'axios';
import {
  Issue,
  CreateIssueRequest,
  UpdateIssueRequest,
  IssueFilters,
  IssueStatus,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const issueApi = {
  // Get all issues with filters
  async getIssues(filters?: IssueFilters): Promise<Issue[]> {
    // Filter out undefined values to prevent NaN errors
    const params: Record<string, any> = {};
    if (filters) {
      if (filters.skip !== undefined) params.skip = filters.skip;
      if (filters.take !== undefined) params.take = filters.take;
      if (filters.projectId !== undefined) params.projectId = filters.projectId;
      if (filters.sprintId !== undefined) params.sprintId = filters.sprintId;
      if (filters.status !== undefined) params.status = filters.status;
      if (filters.priority !== undefined) params.priority = filters.priority;
      if (filters.type !== undefined) params.type = filters.type;
      if (filters.assigneeId !== undefined) params.assigneeId = filters.assigneeId;
      if (filters.creatorId !== undefined) params.creatorId = filters.creatorId;
      if (filters.search !== undefined) params.search = filters.search;
    }

    const { data } = await api.get('/issues', { params });
    // Handle paginated response structure
    return data.data || data;
  },

  // Get single issue by ID
  async getIssue(id: string): Promise<Issue> {
    const { data } = await api.get(`/issues/${id}`);
    return data;
  },

  // Get issue by key (e.g., "WEB-123")
  async getIssueByKey(key: string): Promise<Issue> {
    const { data } = await api.get(`/issues/key/${key}`);
    return data;
  },

  // Create new issue
  async createIssue(issue: CreateIssueRequest): Promise<Issue> {
    const { data } = await api.post('/issues', issue);
    return data;
  },

  // Update issue
  async updateIssue(id: string, updates: UpdateIssueRequest): Promise<Issue> {
    const { data } = await api.patch(`/issues/${id}`, updates);
    return data;
  },

  // Delete issue
  async deleteIssue(id: string): Promise<void> {
    await api.delete(`/issues/${id}`);
  },

  // Assign issue to user
  async assignIssue(id: string, assigneeId: string | null): Promise<Issue> {
    const { data } = await api.patch(`/issues/${id}/assign`, { assigneeId });
    return data;
  },

  // Change issue status
  async changeStatus(id: string, status: IssueStatus): Promise<Issue> {
    const { data } = await api.patch(`/issues/${id}/status`, { status });
    return data;
  },

  // Move issue to sprint
  async moveToSprint(id: string, sprintId: string | null): Promise<Issue> {
    const { data } = await api.patch(`/issues/${id}/sprint`, { sprintId });
    return data;
  },

  // Create sub-task
  async createSubTask(
    parentIssueId: string,
    subTask: CreateIssueRequest
  ): Promise<Issue> {
    const { data } = await api.post(
      `/issues/${parentIssueId}/sub-tasks`,
      subTask
    );
    return data;
  },

  // Get sub-tasks of an issue
  async getSubTasks(issueId: string): Promise<Issue[]> {
    const { data } = await api.get(`/issues/${issueId}/sub-tasks`);
    return data;
  },

  // Convert issue to sub-task
  async convertToSubTask(issueId: string, parentIssueId: string): Promise<Issue> {
    const { data } = await api.patch(`/issues/${issueId}/convert-to-subtask`, {
      parentIssueId,
    });
    return data;
  },

  // Promote sub-task to regular issue
  async promoteToIssue(subTaskId: string): Promise<Issue> {
    const { data } = await api.patch(`/issues/${subTaskId}/promote`);
    return data;
  },

  // Bulk update issues
  async bulkUpdate(
    issueIds: string[],
    updates: UpdateIssueRequest
  ): Promise<void> {
    await api.post('/issues/bulk-update', { issueIds, updates });
  },
};
