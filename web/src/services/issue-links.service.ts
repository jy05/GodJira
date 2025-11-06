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
    const response = await apiClient.get<{ outgoing: IssueLink[], incoming: IssueLink[] }>(`${BASE_URL}/issue/${issueId}`);
    
    // Combine outgoing and incoming links
    const allLinks = [...response.data.outgoing, ...response.data.incoming];
    
    // Deduplicate bidirectional links - keep only one direction
    const seen = new Set<string>();
    const deduplicatedLinks: IssueLink[] = [];
    
    for (const link of allLinks) {
      // Create a unique key for the link pair (sorted IDs to catch both directions)
      const ids = [link.fromIssueId, link.toIssueId].sort();
      const linkKey = `${ids[0]}-${ids[1]}-${link.linkType}`;
      
      if (!seen.has(linkKey)) {
        seen.add(linkKey);
        deduplicatedLinks.push(link);
      }
    }
    
    return deduplicatedLinks;
  },

  /**
   * Remove a link between issues
   */
  deleteLink: async (linkId: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${linkId}`);
  },
};
