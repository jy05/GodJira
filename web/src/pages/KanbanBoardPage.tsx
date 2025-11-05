import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import {
  IssueStatus,
  IssueType,
  IssuePriority,
} from '../types';
import { issueApi } from '../services/issue.service';
import { projectApi } from '../services/project.service';
import { sprintApi } from '../services/sprint.service';

const STATUS_COLUMNS: IssueStatus[] = [
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'BLOCKED',
  'DONE',
];

export default function KanbanBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sprintFilter, setSprintFilter] = useState<string | 'backlog' | ''>('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<IssueType | ''>('');
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);

  // Fetch project details
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getProject(projectId!),
    enabled: !!projectId,
  });

  // Fetch issues for the board
  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['issues', projectId, sprintFilter, assigneeFilter, typeFilter],
    queryFn: () =>
      issueApi.getIssues({
        projectId,
        sprintId:
          sprintFilter === 'backlog'
            ? null
            : sprintFilter
            ? sprintFilter
            : undefined,
        assigneeId: assigneeFilter || undefined,
        type: typeFilter || undefined,
      }),
    enabled: !!projectId,
  });

  // Fetch sprints for filter
  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => sprintApi.getSprints({ projectId }),
    enabled: !!projectId,
  });

  // Change status mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: IssueStatus }) =>
      issueApi.changeStatus(id, status),
    onSuccess: () => {
      // Invalidate and refetch all issue queries
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['project-summary'] });
      queryClient.refetchQueries({ 
        queryKey: ['issues', projectId],
        exact: false 
      });
    },
  });

  const getIssuesByStatus = (status: IssueStatus) => {
    return issues.filter((issue) => issue.status === status);
  };

  const handleDragStart = (issueId: string) => {
    setDraggedIssueId(issueId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (newStatus: IssueStatus) => {
    if (draggedIssueId) {
      statusMutation.mutate({ id: draggedIssueId, status: newStatus });
      setDraggedIssueId(null);
    }
  };

  const getIssueTypeBadgeColor = (type: IssueType) => {
    switch (type) {
      case 'STORY':
        return 'bg-green-100 text-green-800';
      case 'TASK':
        return 'bg-blue-100 text-blue-800';
      case 'BUG':
        return 'bg-red-100 text-red-800';
      case 'EPIC':
        return 'bg-purple-100 text-purple-800';
      case 'SPIKE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: IssuePriority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'border-l-4 border-red-600';
      case 'URGENT':
        return 'border-l-4 border-red-400';
      case 'HIGH':
        return 'border-l-4 border-orange-500';
      case 'MEDIUM':
        return 'border-l-4 border-yellow-500';
      case 'LOW':
        return 'border-l-4 border-gray-400';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  const getColumnColor = (status: IssueStatus) => {
    switch (status) {
      case 'BACKLOG':
        return 'bg-gray-100';
      case 'TODO':
        return 'bg-blue-50';
      case 'IN_PROGRESS':
        return 'bg-yellow-50';
      case 'IN_REVIEW':
        return 'bg-purple-50';
      case 'BLOCKED':
        return 'bg-red-50';
      case 'DONE':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getStatusLabel = (status: IssueStatus) => {
    return status.replace('_', ' ');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 h-screen flex flex-col">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {project?.name} - Board
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Drag issues between columns to update their status
                </p>
              </div>
          <button
            onClick={() => navigate(`/projects/${projectId}/issues`)}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            View List
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sprint Filter */}
          <select
            value={sprintFilter}
            onChange={(e) => setSprintFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Sprints</option>
            <option value="backlog">Backlog (No Sprint)</option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name} ({sprint.status})
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as IssueType | '')}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Types</option>
            <option value="STORY">Story</option>
            <option value="TASK">Task</option>
            <option value="BUG">Bug</option>
            <option value="EPIC">Epic</option>
            <option value="SPIKE">Spike</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSprintFilter('');
              setAssigneeFilter('');
              setTypeFilter('');
            }}
            className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading board...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 h-full min-w-max pb-4">
            {STATUS_COLUMNS.map((status) => {
              const columnIssues = getIssuesByStatus(status);
              return (
                <div
                  key={status}
                  className="flex-shrink-0 w-80 flex flex-col"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(status)}
                >
                  {/* Column Header */}
                  <div
                    className={`${getColumnColor(
                      status
                    )} px-4 py-3 rounded-t-lg border-b-2 border-gray-200`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        {getStatusLabel(status)}
                      </h3>
                      <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-full">
                        {columnIssues.length}
                      </span>
                    </div>
                  </div>

                  {/* Column Body */}
                  <div
                    className={`${getColumnColor(
                      status
                    )} flex-1 px-4 py-3 rounded-b-lg overflow-y-auto space-y-3`}
                  >
                    {columnIssues.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No issues
                      </p>
                    ) : (
                      columnIssues.map((issue) => (
                        <div
                          key={issue.id}
                          draggable
                          onDragStart={() => handleDragStart(issue.id)}
                          onClick={() => navigate(`/issues/${issue.id}`)}
                          className={`bg-white p-3 rounded-lg shadow hover:shadow-md cursor-pointer transition-shadow ${getPriorityColor(
                            issue.priority
                          )}`}
                        >
                          {/* Issue Key and Type */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium text-blue-600">
                                {issue.key}
                              </span>
                              {issue.parentIssueId && (
                                <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-indigo-100 text-indigo-800">
                                  SUB
                                </span>
                              )}
                            </div>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded ${getIssueTypeBadgeColor(
                                issue.type
                              )}`}
                            >
                              {issue.type}
                            </span>
                          </div>

                          {/* Issue Title */}
                          <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                            {issue.title}
                          </p>

                          {/* Issue Metadata */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                              {issue.storyPoints && (
                                <span className="px-2 py-1 bg-gray-100 rounded">
                                  {issue.storyPoints} pts
                                </span>
                              )}
                              {issue._count?.subIssues &&
                                issue._count.subIssues > 0 && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                    {issue._count.subIssues} sub
                                  </span>
                                )}
                            </div>
                            {issue.assignee && (
                              <div className="flex items-center gap-1">
                                {issue.assignee.avatar ? (
                                  <img
                                    src={issue.assignee.avatar}
                                    alt={issue.assignee.name}
                                    className="w-6 h-6 rounded-full"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">
                                    {issue.assignee.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
        </div>
      </div>
    </Layout>
  );
}
