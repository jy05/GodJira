import apiClient from '@/lib/api-client';

export interface Watcher {
  id: string;
  userId: string;
  issueId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    jobTitle?: string | null;
    department?: string | null;
  };
}

export interface WatcherResponse {
  id: string;
  userId: string;
  issueId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  issue: {
    id: string;
    key: string;
    title: string;
  };
}

export const watcherApi = {
  // Watch an issue
  watchIssue: async (issueId: string): Promise<WatcherResponse> => {
    const response = await apiClient.post<WatcherResponse>(
      `/watchers/issue/${issueId}`
    );
    return response.data;
  },

  // Unwatch an issue
  unwatchIssue: async (issueId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/watchers/issue/${issueId}`
    );
    return response.data;
  },

  // Get all watchers for an issue
  getIssueWatchers: async (issueId: string): Promise<Watcher[]> => {
    const response = await apiClient.get<Watcher[]>(
      `/watchers/issue/${issueId}`
    );
    return response.data;
  },

  // Get watcher count for an issue
  getWatcherCount: async (issueId: string): Promise<number> => {
    const response = await apiClient.get<{ count: number }>(
      `/watchers/issue/${issueId}/count`
    );
    return response.data.count;
  },

  // Check if current user is watching an issue
  isWatching: async (issueId: string): Promise<boolean> => {
    const response = await apiClient.get<{ isWatching: boolean }>(
      `/watchers/issue/${issueId}/is-watching`
    );
    return response.data.isWatching;
  },

  // Get all issues watched by current user
  getMyWatchedIssues: async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/watchers/my-watched-issues');
    return response.data;
  },
};

export default watcherApi;
