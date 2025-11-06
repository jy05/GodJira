import apiClient from '@/lib/api-client';
import type { IssueLink, CreateIssueLinkRequest } from '@/types';

const BASE_URL = '/issue-links';

export const issueLinksApi = {
  /**
   * Create a new link between two issues
   */
  createLink: async (data: CreateIssueLinkRequest): Promise<IssueLink> => {
    const response = await apiClient.post<IssueLink>(BASE_URL, data);
    return response.data;
  },

  /**
   * Get all links for a specific issue
   */
  getLinksForIssue: async (issueId: string): Promise<IssueLink[]> => {
    const response = await apiClient.get<IssueLink[]>(`${BASE_URL}/issue/${issueId}`);
    return response.data;
  },

  /**
   * Remove a link between issues
   */
  deleteLink: async (linkId: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${linkId}`);
  },
};
