import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { issueLinksApi } from '@/services/issue-links.service';
import { issueApi } from '@/services/issue.service';
import type { IssueLink, IssueLinkType, Issue } from '@/types';

interface IssueLinkSectionProps {
  issueId: string;
}

const LINK_TYPE_LABELS: Record<IssueLinkType, { outbound: string; inbound: string }> = {
  BLOCKS: { outbound: 'Blocks', inbound: 'Blocked by' },
  BLOCKED_BY: { outbound: 'Blocked by', inbound: 'Blocks' },
  RELATES_TO: { outbound: 'Relates to', inbound: 'Relates to' },
  DUPLICATES: { outbound: 'Duplicates', inbound: 'Duplicated by' },
  DUPLICATED_BY: { outbound: 'Duplicated by', inbound: 'Duplicates' },
  PARENT_OF: { outbound: 'Parent of', inbound: 'Child of' },
  CHILD_OF: { outbound: 'Child of', inbound: 'Parent of' },
};

export function IssueLinkSection({ issueId }: IssueLinkSectionProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [linkType, setLinkType] = useState<IssueLinkType>('RELATES_TO');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<string>('');

  // Fetch links for this issue
  const { data: links = [], isLoading, isError } = useQuery({
    queryKey: ['issue-links', issueId],
    queryFn: () => issueLinksApi.getLinksForIssue(issueId),
    enabled: !!issueId,
  });

  // Search issues
  const { data: searchResults = [] } = useQuery({
    queryKey: ['issues-search', searchTerm],
    queryFn: () => issueApi.getIssues({ search: searchTerm, take: 10 }),
    enabled: searchTerm.length > 0,
    select: (data) => {
      // Handle both array and paginated response
      const issues = Array.isArray(data) ? data : (data as any).data || [];
      return issues.filter((issue: any) => issue.id !== issueId);
    },
  });

  // Create link mutation
  const createLinkMutation = useMutation({
    mutationFn: issueLinksApi.createLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue-links', issueId] });
      setIsCreating(false);
      setSearchTerm('');
      setSelectedIssueId('');
      setLinkType('RELATES_TO');
    },
    onError: (error: any) => {
      console.error('Failed to create link:', error);
      alert(`Failed to create link: ${error?.response?.data?.message || error.message || 'Unknown error'}`);
    },
  });

  // Delete link mutation
  const deleteLinkMutation = useMutation({
    mutationFn: issueLinksApi.deleteLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue-links', issueId] });
    },
  });

  const handleCreateLink = () => {
    console.log('handleCreateLink called');
    console.log('selectedIssueId:', selectedIssueId);
    console.log('linkType:', linkType);
    console.log('issueId:', issueId);
    
    if (!selectedIssueId) {
      alert('Please select an issue first');
      return;
    }

    const linkData = {
      linkType,
      fromIssueId: issueId,
      toIssueId: selectedIssueId,
    };
    
    console.log('Creating link with data:', linkData);
    createLinkMutation.mutate(linkData);
  };

  const handleDeleteLink = (linkId: string) => {
    if (confirm('Are you sure you want to remove this link?')) {
      deleteLinkMutation.mutate(linkId);
    }
  };

  const getDisplayLabel = (link: IssueLink): string => {
    const isOutbound = link.fromIssueId === issueId;
    return isOutbound
      ? LINK_TYPE_LABELS[link.linkType].outbound
      : LINK_TYPE_LABELS[link.linkType].inbound;
  };

  const getLinkedIssue = (link: IssueLink) => {
    return link.fromIssueId === issueId ? link.toIssue : link.fromIssue;
  };

  if (isLoading) {
    return <div className="bg-white p-6 rounded-lg shadow">Loading links...</div>;
  }

  if (isError) {
    return <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Issue Links</h3>
      <p className="text-gray-500 text-sm">Unable to load issue links.</p>
    </div>;
  }

  // Ensure links is an array before processing
  const linksArray = Array.isArray(links) ? links : [];

  // Group links by type
  const groupedLinks = linksArray.reduce((acc, link) => {
    const label = getDisplayLabel(link);
    if (!acc[label]) acc[label] = [];
    acc[label].push(link);
    return acc;
  }, {} as Record<string, IssueLink[]>);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Issue Links ({linksArray.length})</h3>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          {isCreating ? 'Cancel' : '+ Link Issue'}
        </button>
      </div>

      {/* Create Link Form */}
      {isCreating && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-3">
            {/* Link Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link Type
              </label>
              <select
                value={linkType}
                onChange={(e) => setLinkType(e.target.value as IssueLinkType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="RELATES_TO">Relates to</option>
                <option value="BLOCKS">Blocks</option>
                <option value="BLOCKED_BY">Blocked by</option>
                <option value="DUPLICATES">Duplicates</option>
                <option value="DUPLICATED_BY">Duplicated by</option>
              </select>
            </div>

            {/* Issue Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Issue
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by key or title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchResults.length > 0 && !selectedIssueId && (
                <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 rounded-lg bg-white">
                  {searchResults.map((issue: Issue) => (
                    <button
                      key={issue.id}
                      onClick={() => {
                        setSelectedIssueId(issue.id);
                        setSearchTerm(`${issue.key}: ${issue.title}`);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-sm text-blue-600">
                        {issue.key}
                      </div>
                      <div className="text-sm text-gray-700 truncate">
                        {issue.title}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {selectedIssueId && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ Issue selected
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLink}
                disabled={!selectedIssueId || createLinkMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createLinkMutation.isPending ? 'Creating...' : 'Create Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display Links */}
      {linksArray.length === 0 ? (
        <p className="text-gray-500 text-sm">No linked issues</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedLinks).map(([label, groupLinks]) => (
            <div key={label}>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">{label}</h4>
              <div className="space-y-2">
                {groupLinks.map((link) => {
                  const linkedIssue = getLinkedIssue(link);
                  if (!linkedIssue) return null;

                  return (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300"
                    >
                      <div className="flex-1">
                        <button
                          onClick={() => navigate(`/issues/${linkedIssue.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline text-left"
                        >
                          {linkedIssue.key}
                        </button>
                        <p className="text-sm text-gray-700 mt-1">{linkedIssue.title}</p>
                        <div className="flex gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              linkedIssue.status === 'DONE'
                                ? 'bg-green-100 text-green-800'
                                : linkedIssue.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {linkedIssue.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                            {linkedIssue.type}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="ml-4 text-red-600 hover:text-red-800 text-sm"
                        disabled={deleteLinkMutation.isPending}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
