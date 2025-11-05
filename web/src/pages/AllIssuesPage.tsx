import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import {
  IssueType,
  IssueStatus,
  IssuePriority,
} from '../types';
import { issueApi } from '../services/issue.service';
import { projectApi } from '../services/project.service';

export const AllIssuesPage = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<IssueType | ''>('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | ''>('');
  const [projectFilter, setProjectFilter] = useState('');
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());

  // Fetch all issues
  const { data: issues = [], isLoading } = useQuery({
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

  // Fetch projects for filter
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getProjects(),
  });

  // Group issues hierarchically
  const { parentIssues, subTasksByParent } = useMemo(() => {
    const parents: any[] = [];
    const subTasks: Record<string, any[]> = {};

    issues.forEach((issue: any) => {
      if (issue.parentIssueId) {
        // This is a sub-task
        if (!subTasks[issue.parentIssueId]) {
          subTasks[issue.parentIssueId] = [];
        }
        subTasks[issue.parentIssueId].push(issue);
      } else {
        // This is a parent issue
        parents.push(issue);
      }
    });

    return { parentIssues: parents, subTasksByParent: subTasks };
  }, [issues]);

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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 sm:px-0 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">All Issues</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and filter issues across all projects
          </p>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-0 mb-6">
          <div className="bg-white p-4 rounded-lg shadow space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border rounded-md"
              />

              {/* Project Filter */}
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
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
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setProjectFilter('');
                  setTypeFilter('');
                  setStatusFilter('');
                  setPriorityFilter('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Issues Table */}
        <div className="px-4 sm:px-0">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading issues...</div>
            ) : issues.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No issues found. Create your first issue in a project to get started.
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
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parentIssues.map((issue) => {
                    const subTasks = subTasksByParent[issue.id] || [];
                    const isExpanded = expandedIssues.has(issue.id);
                    const hasSubTasks = subTasks.length > 0;

                    return (
                      <>
                        {/* Parent Issue Row */}
                        <tr
                          key={issue.id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            <div className="flex items-center gap-2">
                              {hasSubTasks && (
                                <button
                                  onClick={(e) => toggleExpand(issue.id, e)}
                                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                  {isExpanded ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  )}
                                </button>
                              )}
                              <span 
                                className="cursor-pointer hover:underline"
                                onClick={() => navigate(`/issues/${issue.id}`)}
                              >
                                {issue.key}
                              </span>
                              {hasSubTasks && (
                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                                  {subTasks.length} sub-task{subTasks.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </td>
                          <td 
                            className="px-6 py-4 text-sm text-gray-900 cursor-pointer"
                            onClick={() => navigate(`/issues/${issue.id}`)}
                          >
                            {issue.title}
                          </td>
                          <td 
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                            onClick={() => navigate(`/issues/${issue.id}`)}
                          >
                            {issue.project?.name}
                          </td>
                          <td 
                            className="px-6 py-4 whitespace-nowrap cursor-pointer"
                            onClick={() => navigate(`/issues/${issue.id}`)}
                          >
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getIssueTypeBadgeColor(
                                issue.type
                              )}`}
                            >
                              {issue.type}
                            </span>
                          </td>
                          <td 
                            className="px-6 py-4 whitespace-nowrap cursor-pointer"
                            onClick={() => navigate(`/issues/${issue.id}`)}
                          >
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getIssueStatusBadgeColor(
                                issue.status
                              )}`}
                            >
                              {issue.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td 
                            className="px-6 py-4 whitespace-nowrap cursor-pointer"
                            onClick={() => navigate(`/issues/${issue.id}`)}
                          >
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeColor(
                                issue.priority
                              )}`}
                            >
                              {issue.priority}
                            </span>
                          </td>
                          <td 
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                            onClick={() => navigate(`/issues/${issue.id}`)}
                          >
                            {issue.assignee?.name || 'Unassigned'}
                          </td>
                          <td 
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                            onClick={() => navigate(`/issues/${issue.id}`)}
                          >
                            {issue.storyPoints || '-'}
                          </td>
                        </tr>

                        {/* Sub-task Rows (shown when expanded) */}
                        {isExpanded && subTasks.map((subTask: any) => (
                          <tr
                            key={subTask.id}
                            className="bg-gray-50 hover:bg-gray-100"
                          >
                            <td className="px-6 py-3 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-2 pl-6">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span 
                                  className="font-medium text-blue-600 cursor-pointer hover:underline"
                                  onClick={() => navigate(`/issues/${subTask.id}`)}
                                >
                                  {subTask.key}
                                </span>
                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-indigo-100 text-indigo-800">
                                  SUB-TASK
                                </span>
                              </div>
                            </td>
                            <td 
                              className="px-6 py-3 text-sm text-gray-900 cursor-pointer"
                              onClick={() => navigate(`/issues/${subTask.id}`)}
                            >
                              {subTask.title}
                            </td>
                            <td 
                              className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
                              onClick={() => navigate(`/issues/${subTask.id}`)}
                            >
                              {subTask.project?.name}
                            </td>
                            <td 
                              className="px-6 py-3 whitespace-nowrap cursor-pointer"
                              onClick={() => navigate(`/issues/${subTask.id}`)}
                            >
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getIssueTypeBadgeColor(
                                  subTask.type
                                )}`}
                              >
                                {subTask.type}
                              </span>
                            </td>
                            <td 
                              className="px-6 py-3 whitespace-nowrap cursor-pointer"
                              onClick={() => navigate(`/issues/${subTask.id}`)}
                            >
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getIssueStatusBadgeColor(
                                  subTask.status
                                )}`}
                              >
                                {subTask.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td 
                              className="px-6 py-3 whitespace-nowrap cursor-pointer"
                              onClick={() => navigate(`/issues/${subTask.id}`)}
                            >
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeColor(
                                  subTask.priority
                                )}`}
                              >
                                {subTask.priority}
                              </span>
                            </td>
                            <td 
                              className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                              onClick={() => navigate(`/issues/${subTask.id}`)}
                            >
                              {subTask.assignee?.name || 'Unassigned'}
                            </td>
                            <td 
                              className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                              onClick={() => navigate(`/issues/${subTask.id}`)}
                            >
                              {subTask.storyPoints || '-'}
                            </td>
                          </tr>
                        ))}
                      </>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
