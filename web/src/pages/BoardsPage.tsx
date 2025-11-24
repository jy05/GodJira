import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import * as React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { Layout } from '@/components/Layout';
import { Breadcrumbs, BreadcrumbItem } from '@/components/Breadcrumbs';
import { IssueType, IssueStatus, IssuePriority } from '../types';
import { issueApi } from '../services/issue.service';
import { userApi } from '../services/user.service';
import { projectApi } from '../services/project.service';

type BoardView = 'overview' | 'users' | 'unassigned';

// Status columns for drag and drop
const STATUS_COLUMNS: IssueStatus[] = [
  'UNASSIGNED',
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'BLOCKED',
  'DONE',
  'CLOSED',
];

export default function BoardsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedView, setSelectedView] = useState<BoardView>('overview');
  const [activeIssue, setActiveIssue] = useState<any>(null);
  
  // Overview filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<IssueType | ''>('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | ''>('');
  const [projectFilter, setProjectFilter] = useState('');
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch all issues
  const { data: issues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ['all-issues', searchTerm, typeFilter, statusFilter, priorityFilter, projectFilter],
    queryFn: () =>
      issueApi.getIssues({
        search: searchTerm || undefined,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        projectId: projectFilter || undefined,
      }),
  });

  // Fetch users
  const { data: usersResponse } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getUsers(),
  });

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getProjects(),
  });

  const users = Array.isArray(usersResponse?.data) ? usersResponse.data : [];

  // Group issues hierarchically at the top level (for Overview Board)
  const { parentIssues, subTasksByParent } = useMemo(() => {
    const parents: any[] = [];
    const subTasks: Record<string, any[]> = {};

    issues.forEach((issue: any) => {
      if (issue.parentIssueId) {
        if (!subTasks[issue.parentIssueId]) {
          subTasks[issue.parentIssueId] = [];
        }
        subTasks[issue.parentIssueId].push(issue);
      } else {
        parents.push(issue);
      }
    });

    // Sort by last update (oldest first)
    parents.sort((a, b) => 
      new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );

    return { parentIssues: parents, subTasksByParent: subTasks };
  }, [issues]);

  // Toggle expand function for hierarchical view
  const toggleExpand = (issueId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(issueId)) {
      newExpanded.delete(issueId);
    } else {
      newExpanded.add(issueId);
    }
    setExpandedIssues(newExpanded);
  };

  // Mutation to update issue status
  const updateIssueMutation = useMutation({
    mutationFn: ({ issueId, status }: { issueId: string; status: IssueStatus }) =>
      issueApi.updateIssue(issueId, { status }),
    onMutate: async ({ issueId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['all-issues'] });
      
      // Snapshot the previous value
      const previousIssues = queryClient.getQueryData(['all-issues', searchTerm, typeFilter, statusFilter, priorityFilter, projectFilter]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['all-issues', searchTerm, typeFilter, statusFilter, priorityFilter, projectFilter], (old: any) => {
        if (!old) return old;
        return old.map((issue: any) => 
          issue.id === issueId ? { ...issue, status } : issue
        );
      });
      
      return { previousIssues };
    },
    onError: (_err, _variables, context: any) => {
      // Rollback on error
      if (context?.previousIssues) {
        queryClient.setQueryData(['all-issues', searchTerm, typeFilter, statusFilter, priorityFilter, projectFilter], context.previousIssues);
      }
    },
    onSuccess: () => {
      // Invalidate all queries that start with 'all-issues' to refetch
      queryClient.invalidateQueries({ queryKey: ['all-issues'] });
    },
  });

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const issue = issues.find((i: any) => i.id === event.active.id);
    setActiveIssue(issue);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

    const issueId = active.id as string;
    const newStatus = over.id as IssueStatus;

    // Find the issue and check if status changed
    const issue = issues.find((i: any) => i.id === issueId);
    if (issue && issue.status !== newStatus) {
      updateIssueMutation.mutate({ issueId, status: newStatus });
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

  const getIssueStatusBadgeColor = (status: IssueStatus) => {
    switch (status) {
      case 'UNASSIGNED':
        return 'bg-gray-200 text-gray-700';
      case 'BACKLOG':
        return 'bg-gray-100 text-gray-800';
      case 'TODO':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_REVIEW':
        return 'bg-purple-100 text-purple-800';
      case 'SMOKE_TESTING':
        return 'bg-orange-100 text-orange-800';
      case 'BLOCKED':
        return 'bg-red-100 text-red-800';
      case 'DONE':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: IssuePriority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-600 text-white';
      case 'URGENT':
        return 'bg-red-400 text-white';
      case 'HIGH':
        return 'bg-orange-500 text-white';
      case 'MEDIUM':
        return 'bg-yellow-500 text-white';
      case 'LOW':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getTimeSinceUpdate = (updatedAt: string) => {
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffMs = now.getTime() - updated.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  };

  const getUpdateColorClass = (updatedAt: string) => {
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffDays = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 7) return 'text-red-600 font-semibold';
    if (diffDays > 3) return 'text-orange-600 font-semibold';
    if (diffDays > 1) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Overview Board: All tasks with hierarchical grouping, filters, and last update
  const renderOverviewBoard = () => {
    return (
      <div className="space-y-4">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Project Filter */}
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Projects</option>
              {projects.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as IssueType | '')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="STORY">Story</option>
              <option value="TASK">Task</option>
              <option value="BUG">Bug</option>
              <option value="EPIC">Epic</option>
              <option value="SPIKE">Spike</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as IssueStatus | '')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="UNASSIGNED">Unassigned</option>
              <option value="BACKLOG">Backlog</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="SMOKE_TESTING">Smoke Testing</option>
              <option value="BLOCKED">Blocked</option>
              <option value="DONE">Done</option>
              <option value="CLOSED">Closed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as IssuePriority | '')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setSearchTerm('');
                setProjectFilter('');
                setTypeFilter('');
                setStatusFilter('');
                setPriorityFilter('');
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Issues Table with Hierarchical View */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              All Issues Overview
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {parentIssues.length} issue{parentIssues.length !== 1 ? 's' : ''} • Sorted by last update (oldest first)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Update
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parentIssues.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No issues found
                    </td>
                  </tr>
                ) : (
                  parentIssues.map((issue: any) => {
                    const subTasks = subTasksByParent[issue.id] || [];
                    const hasSubTasks = subTasks.length > 0;
                    const isExpanded = expandedIssues.has(issue.id);

                    return (
                      <React.Fragment key={issue.id}>
                        {/* Parent Issue Row */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {hasSubTasks && (
                                <button
                                  onClick={(e) => toggleExpand(issue.id, e)}
                                  className="p-1 hover:bg-gray-200 rounded"
                                >
                                  <svg
                                    className={`w-4 h-4 transition-transform ${
                                      isExpanded ? 'transform rotate-90' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </button>
                              )}
                              <div
                                className="flex flex-col cursor-pointer"
                                onClick={() => navigate(`/issues/${issue.id}`)}
                              >
                                <div className="flex items-center gap-2">
                                  <span 
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/issues/${issue.id}`);
                                    }}
                                  >
                                    {issue.key}
                                  </span>
                                  {hasSubTasks && (
                                    <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
                                      {subTasks.length} sub-task{subTasks.length !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm text-gray-900">{issue.title}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {issue.project?.name}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getIssueTypeBadgeColor(
                                issue.type
                              )}`}
                            >
                              {issue.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getIssueStatusBadgeColor(
                                issue.status
                              )}`}
                            >
                              {issue.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeColor(
                                issue.priority
                              )}`}
                            >
                              {issue.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {issue.assignee?.name || 'Unassigned'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm ${getUpdateColorClass(issue.updatedAt)}`}>
                              {getTimeSinceUpdate(issue.updatedAt)}
                            </span>
                          </td>
                        </tr>

                        {/* Sub-tasks (expanded) */}
                        {isExpanded &&
                          subTasks.map((subTask: any) => (
                            <tr
                              key={subTask.id}
                              className="bg-gray-50 hover:bg-gray-100 cursor-pointer"
                              onClick={() => navigate(`/issues/${subTask.id}`)}
                            >
                              <td className="px-6 py-3 pl-16">
                                <div className="flex items-center gap-2">
                                  <svg
                                    className="w-4 h-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                  </svg>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-blue-600">
                                        {subTask.key}
                                      </span>
                                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                                        SUB-TASK
                                      </span>
                                    </div>
                                    <span className="text-sm text-gray-900">{subTask.title}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-900">
                                {subTask.project?.name}
                              </td>
                              <td className="px-6 py-3">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${getIssueTypeBadgeColor(
                                    subTask.type
                                  )}`}
                                >
                                  {subTask.type}
                                </span>
                              </td>
                              <td className="px-6 py-3">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${getIssueStatusBadgeColor(
                                    subTask.status
                                  )}`}
                                >
                                  {subTask.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-3">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeColor(
                                    subTask.priority
                                  )}`}
                                >
                                  {subTask.priority}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-900">
                                {subTask.assignee?.name || 'Unassigned'}
                              </td>
                              <td className="px-6 py-3">
                                <span className={`text-sm ${getUpdateColorClass(subTask.updatedAt)}`}>
                                  {getTimeSinceUpdate(subTask.updatedAt)}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Draggable Issue Component
  const DraggableIssue = ({ issue }: { issue: any }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: issue.id,
    });

    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      opacity: isDragging ? 0.5 : 1,
    } : undefined;

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className="px-4 py-3 bg-white border rounded-lg shadow-sm hover:shadow-md cursor-move transition-shadow"
      >
        <div className="flex items-center gap-2 mb-1">
          <span 
            className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/issues/${issue.id}`);
            }}
          >
            {issue.key}
          </span>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${getIssueTypeBadgeColor(
              issue.type
            )}`}
          >
            {issue.type}
          </span>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeColor(
              issue.priority
            )}`}
          >
            {issue.priority}
          </span>
        </div>
        <div className="text-sm text-gray-900 line-clamp-2">{issue.title}</div>
        <div className="text-xs text-gray-500 mt-1">{issue.project?.name}</div>
      </div>
    );
  };

  // Droppable Status Column Component
  // Droppable Status Column Component
  const DroppableStatusColumn = ({
    status,
    issues,
  }: {
    status: IssueStatus;
    issues: any[];
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: status,
    });

    const statusLabels: Record<IssueStatus, string> = {
      UNASSIGNED: 'Unassigned',
      BACKLOG: 'Backlog',
      TODO: 'To Do',
      IN_PROGRESS: 'In Progress',
      IN_REVIEW: 'In Review',
      SMOKE_TESTING: 'Smoke Testing',
      BLOCKED: 'Blocked',
      DONE: 'Done',
      CLOSED: 'Closed',
    };

    return (
      <div
        ref={setNodeRef}
        className={`flex-1 min-w-[250px] bg-gray-50 rounded-lg p-4 ${
          isOver ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-700">{statusLabels[status]}</h4>
          <span className="px-2 py-1 bg-white rounded-full text-xs text-gray-600">
            {issues.length}
          </span>
        </div>
        <div className="space-y-2">
          {issues.map((issue: any) => (
            <DraggableIssue key={issue.id} issue={issue} />
          ))}
          {issues.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              Drop issues here
            </div>
          )}
        </div>
      </div>
    );
  };

  // Users Board: Group tasks by assignee with drag and drop
  const renderUsersBoard = () => {
    const issuesByUser: Record<string, any[]> = {};
    
    users.forEach((user: any) => {
      issuesByUser[user.id] = [];
    });

    issues.forEach((issue: any) => {
      if (issue.assigneeId && issuesByUser[issue.assigneeId]) {
        issuesByUser[issue.assigneeId].push(issue);
      }
    });

    return (
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-8">
          <div className="bg-gray-50 px-6 py-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900">
              Tasks by Team Member - Drag & Drop Board
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Drag issues between status columns to update their progress
            </p>
          </div>

          {users.map((user: any) => {
            const userIssues = issuesByUser[user.id] || [];
            const issuesByStatus: Record<IssueStatus, any[]> = {} as Record<
              IssueStatus,
              any[]
            >;

            // Initialize status columns
            STATUS_COLUMNS.forEach((status) => {
              issuesByStatus[status] = [];
            });

            // Group user's issues by status
            userIssues.forEach((issue: any) => {
              const issueStatus = issue.status as IssueStatus;
              if (issuesByStatus[issueStatus]) {
                issuesByStatus[issueStatus].push(issue);
              }
            });

            const totalIssues = userIssues.length;
            const inProgress = userIssues.filter(
              (i: any) => i.status === 'IN_PROGRESS'
            ).length;

            return (
              <div key={user.id} className="bg-white rounded-lg shadow-lg">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {totalIssues}
                      </div>
                      <div className="text-gray-500">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {inProgress}
                      </div>
                      <div className="text-gray-500">In Progress</div>
                    </div>
                  </div>
                </div>

                {userIssues.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    No issues assigned to this user
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {STATUS_COLUMNS.map((status) => (
                        <DroppableStatusColumn
                          key={status}
                          status={status}
                          issues={issuesByStatus[status]}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeIssue ? (
            <div className="px-4 py-3 bg-white border-2 border-blue-500 rounded-lg shadow-xl cursor-move">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-blue-600">
                  {activeIssue.key}
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${getIssueTypeBadgeColor(
                    activeIssue.type
                  )}`}
                >
                  {activeIssue.type}
                </span>
              </div>
              <div className="text-sm text-gray-900 line-clamp-2">
                {activeIssue.title}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  };

  // Unassigned Board: All unassigned issues and projects needing attention
  const renderUnassignedBoard = () => {
    const unassignedIssues = issues.filter((issue: any) => 
      !issue.assigneeId || issue.status === 'UNASSIGNED'
    );
    const issuesByProject: Record<string, any[]> = {};

    unassignedIssues.forEach((issue: any) => {
      const projectId = issue.projectId;
      if (!issuesByProject[projectId]) {
        issuesByProject[projectId] = [];
      }
      issuesByProject[projectId].push(issue);
    });

    return (
      <div className="space-y-6">
        <div className="bg-red-50 px-6 py-4 rounded-lg border border-red-200">
          <h2 className="text-lg font-semibold text-red-900">
            Unassigned Work Items
          </h2>
          <p className="text-sm text-red-700 mt-1">
            {unassignedIssues.length} issue{unassignedIssues.length !== 1 ? 's' : ''} need{unassignedIssues.length === 1 ? 's' : ''} to be assigned
          </p>
        </div>

        {unassignedIssues.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              All Clear!
            </h3>
            <p className="text-gray-500">
              All issues have been assigned to team members
            </p>
          </div>
        ) : (
          <>
            {Object.entries(issuesByProject).map(([projectId, projectIssues]) => {
              const project = projects.find((p: any) => p.id === projectId);
              
              return (
                <div key={projectId} className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {project?.name || 'Unknown Project'}
                      </h3>
                      <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                        {projectIssues.length} unassigned
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {projectIssues.map((issue: any) => (
                      <div
                        key={issue.id}
                        className="px-6 py-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                        onClick={() => navigate(`/issues/${issue.id}`)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span 
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/issues/${issue.id}`);
                              }}
                            >
                              {issue.key}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${getIssueTypeBadgeColor(
                                issue.type
                              )}`}
                            >
                              {issue.type}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${getIssueStatusBadgeColor(
                                issue.status
                              )}`}
                            >
                              {issue.status.replace('_', ' ')}
                            </span>
                            {issue.storyPoints && (
                              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                                {issue.storyPoints} pts
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-900">{issue.title}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeColor(
                              issue.priority
                            )}`}
                          >
                            {issue.priority}
                          </span>
                          <span className={`text-sm ${getUpdateColorClass(issue.updatedAt)}`}>
                            {getTimeSinceUpdate(issue.updatedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    );
  };

  // Build breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Boards' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbs} />
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Boards</h1>
            <p className="mt-2 text-sm text-gray-600">
              Visual kanban board with drag-and-drop for workflow management. Organize and track issues by status with multiple views.
            </p>
          </div>

          {/* Board Selector */}
          <div className="mb-6 bg-white rounded-lg shadow-sm p-2 flex gap-2">
            <button
              onClick={() => setSelectedView('overview')}
              className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
                selectedView === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedView('users')}
              className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
                selectedView === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>By Team Member</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedView('unassigned')}
              className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
                selectedView === 'unassigned'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Unassigned</span>
              </div>
            </button>
          </div>

          {/* Board Content */}
          {issuesLoading ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : (
            <>
              {selectedView === 'overview' && renderOverviewBoard()}
              {selectedView === 'users' && renderUsersBoard()}
              {selectedView === 'unassigned' && renderUnassignedBoard()}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
