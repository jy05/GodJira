import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Layout } from '@/components/Layout';
import { Breadcrumbs, BreadcrumbItem } from '@/components/Breadcrumbs';
import {
  CreateIssueRequest,
  IssueType,
  IssueStatus,
  IssuePriority,
} from '../types';
import { issueApi } from '../services/issue.service';
import { projectApi } from '../services/project.service';
import { sprintApi } from '../services/sprint.service';
import { userApi } from '../services/user.service';

interface UserBasic {
  id: string;
  name: string;
  email: string;
}

export default function IssuesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<IssueType | ''>('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | ''>('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [sprintFilter, setSprintFilter] = useState<string | 'backlog' | ''>('');
  const [projectFilter, setProjectFilter] = useState<string>(''); // For filtering by project when viewing all issues

  // Fetch project details
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getProject(projectId!),
    enabled: !!projectId,
  });

  // Fetch issues with filters
  const { data: issues = [], isLoading } = useQuery({
    queryKey: [
      'issues',
      projectId,
      projectFilter, // Add projectFilter to query key
      searchTerm,
      typeFilter,
      statusFilter,
      priorityFilter,
      assigneeFilter,
      sprintFilter,
    ],
    queryFn: () =>
      issueApi.getIssues({
        projectId: projectId || projectFilter || undefined, // Use route projectId, or filter projectId, or undefined
        search: searchTerm || undefined,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        assigneeId: assigneeFilter || undefined,
        sprintId:
          sprintFilter === 'backlog'
            ? null
            : sprintFilter
            ? sprintFilter
            : undefined,
      }),
    // Always fetch issues, projectId is optional for filtering
  });

  // Fetch sprints for filter dropdown (fetch all sprints across all projects)
  const { data: allSprintsResponse = [] } = useQuery({
    queryKey: ['all-sprints'],
    queryFn: () => sprintApi.getSprints({}), // Fetch all sprints without project filter
  });

  // Filter sprints based on selected project if one is chosen
  const sprints = (projectId || projectFilter)
    ? allSprintsResponse.filter((sprint: any) => sprint.projectId === (projectId || projectFilter))
    : allSprintsResponse;

  // Fetch all projects for the create modal when no projectId is in route
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getProjects(),
    enabled: !projectId, // Only fetch if not on a specific project page
  });

  // Fetch users for assignee filter
  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getUsers(),
  });

  const users: UserBasic[] = Array.isArray(usersResponse?.data) 
    ? usersResponse.data 
    : [];

  // Create issue mutation
  const createMutation = useMutation({
    mutationFn: issueApi.createIssue,
    onSuccess: (newIssue) => {
      // Invalidate all queries that start with 'issues' to refresh all issue lists
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['project-summary'] });
      // Refetch the current page's issues immediately
      queryClient.refetchQueries({ 
        queryKey: ['issues', projectId],
        exact: false 
      });
      setIsCreateModalOpen(false);
      reset();
      // Show success message
      alert(`Issue ${newIssue.key} created successfully!`);
    },
    onError: (error: any) => {
      console.error('Failed to create issue:', error);
      alert(`Failed to create issue: ${error?.response?.data?.message || error.message}`);
    },
  });

  // Delete issue mutation
  const deleteMutation = useMutation({
    mutationFn: issueApi.deleteIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['project-summary'] });
    },
  });

  // Form for creating issue
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateIssueRequest>({
    defaultValues: {
      projectId,
      type: 'TASK',
      priority: 'MEDIUM',
    },
  });

  const onSubmit = (data: CreateIssueRequest) => {
    console.log('Creating issue with data:', data);
    createMutation.mutate({
      ...data,
      projectId: data.projectId || projectId!, // Use form projectId or route projectId
      labels: data.labels || [],
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      deleteMutation.mutate(id);
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

  // Build breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
  ];
  
  if (projectId && project) {
    breadcrumbs.push(
      { label: 'Projects', href: '/projects' },
      { label: project.name, href: `/projects/${projectId}` },
      { label: 'Issues' }
    );
  } else {
    breadcrumbs.push({ label: 'All Issues' });
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbs} />
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {project?.name ? `${project.name} - Issues` : 'All Issues'}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your backlog, stories, tasks, bugs, and spikes
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Issue
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded-md col-span-2"
          />

          {/* Project Filter - Only show when viewing all issues */}
          {!projectId && (
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Projects</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          )}

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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as IssueStatus | '')}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Statuses</option>
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
            onChange={(e) =>
              setPriorityFilter(e.target.value as IssuePriority | '')
            }
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          {/* Sprint Filter - Always visible and usable */}
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
        </div>

        {/* Clear Filters Button */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setProjectFilter('');
              setTypeFilter('');
              setStatusFilter('');
              setPriorityFilter('');
              setAssigneeFilter('');
              setSprintFilter('');
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading issues...</div>
        ) : issues.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No issues found. Create your first issue to get started.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
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
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {issues.map((issue) => (
                <tr
                  key={issue.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/issues/${issue.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {issue.key}
                    {issue.parentIssueId && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded bg-indigo-100 text-indigo-800">
                        SUB-TASK
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {issue.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getIssueTypeBadgeColor(
                        issue.type
                      )}`}
                    >
                      {issue.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getIssueStatusBadgeColor(
                        issue.status
                      )}`}
                    >
                      {issue.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeColor(
                        issue.priority
                      )}`}
                    >
                      {issue.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {issue.assignee?.name || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {issue.storyPoints || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(issue.id);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Issue Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create Issue</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 text-sm font-medium">Please fix the following errors:</p>
                  <ul className="list-disc list-inside text-red-700 text-sm mt-1">
                    {Object.entries(errors).map(([key, error]: [string, any]) => (
                      <li key={key}>{key}: {error?.message || 'Required'}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Project Selector - Only show when not on a specific project page */}
              {!projectId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project *
                  </label>
                  <select
                    {...register('projectId', { required: 'Project is required' })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select a project</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name}
                      </option>
                    ))}
                  </select>
                  {errors.projectId && (
                    <p className="text-red-500 text-sm mt-1">{errors.projectId.message}</p>
                  )}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-3 py-2 border rounded-md"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              {/* Type, Priority, Story Points */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    {...register('type', { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="TASK">Task</option>
                    <option value="STORY">Story</option>
                    <option value="BUG">Bug</option>
                    <option value="EPIC">Epic</option>
                    <option value="SPIKE">Spike</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    {...register('priority')}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Story Points
                  </label>
                  <input
                    type="number"
                    {...register('storyPoints', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    min="0"
                  />
                </div>
              </div>

              {/* Sprint and Assignee */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sprint
                  </label>
                  <select
                    {...register('sprintId')}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Backlog (No Sprint)</option>
                    {sprints.map((sprint) => (
                      <option key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignee
                  </label>
                  <select
                    {...register('assigneeId')}
                    disabled={usersLoading || users.length === 0}
                    className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  {usersLoading && (
                    <p className="text-xs text-gray-500 mt-1">Loading users...</p>
                  )}
                  {!usersLoading && users.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No users found. Please create users first.</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    reset();
                  }}
                  className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </div>
    </Layout>
  );
}
