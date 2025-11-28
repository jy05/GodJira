import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { IssueLinkSection } from '@/components/issue/IssueLinkSection';
import { WatchersList } from '@/components/issue/WatchersList';
import { AttachmentUpload } from '@/components/issue/AttachmentUpload';
import { AttachmentList } from '@/components/issue/AttachmentList';
import { WorkLogModal } from '@/components/issue/WorkLogModal';
import { WorkLogsList } from '@/components/issue/WorkLogsList';
import {
  UpdateIssueRequest,
  IssueType,
  IssueStatus,
  IssuePriority,
  CreateIssueRequest,
} from '../types';
import { issueApi } from '../services/issue.service';
import { sprintApi } from '../services/sprint.service';
import { userApi } from '../services/user.service';
import { commentApi } from '../services/comment.service';

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingSubTask, setIsCreatingSubTask] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [showWorkLogModal, setShowWorkLogModal] = useState(false);

  // Fetch issue details
  const { data: issue, isLoading } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => issueApi.getIssue(id!),
    enabled: !!id,
  });

  // Fetch sub-tasks
  const { data: subTasks = [] } = useQuery({
    queryKey: ['sub-tasks', id],
    queryFn: () => issueApi.getSubTasks(id!),
    enabled: !!id,
  });

  // Fetch comments
  const { data: comments = [] } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => commentApi.getIssueComments(id!),
    enabled: !!id,
  });

  // Fetch sprints for sprint selector
  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints', issue?.projectId],
    queryFn: () => sprintApi.getSprints({ projectId: issue?.projectId }),
    enabled: !!issue?.projectId,
  });

  // Fetch users for assignee selector
  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getUsers(),
  });

  const users = Array.isArray(usersResponse?.data) ? usersResponse.data : [];

  // Update issue mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateIssueRequest }) =>
      issueApi.updateIssue(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['project-summary'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      console.error('Update mutation error:', error);
      alert(`Failed to update issue: ${error?.response?.data?.message || error.message || 'Unknown error'}`);
    },
  });

  // Delete issue mutation
  const deleteMutation = useMutation({
    mutationFn: issueApi.deleteIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['project-summary'] });
      navigate(`/projects/${issue?.projectId}/issues`);
    },
  });

  // Assign issue mutation
  const assignMutation = useMutation({
    mutationFn: ({ id, assigneeId }: { id: string; assigneeId: string | null }) =>
      issueApi.assignIssue(id, assigneeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });

  // Change status mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: IssueStatus }) =>
      issueApi.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['project-summary'] });
    },
  });

  // Move to sprint mutation
  const sprintMutation = useMutation({
    mutationFn: ({ id, sprintId }: { id: string; sprintId: string | null }) =>
      issueApi.moveToSprint(id, sprintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: (content: string) =>
      commentApi.createComment({ content, issueId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      setNewComment('');
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
    },
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      commentApi.updateComment(commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      setEditingCommentId(null);
      setEditCommentContent('');
    },
  });

  // Create sub-task mutation
  const createSubTaskMutation = useMutation({
    mutationFn: ({
      parentIssueId,
      subTask,
    }: {
      parentIssueId: string;
      subTask: CreateIssueRequest;
    }) => issueApi.createSubTask(parentIssueId, subTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      setIsCreatingSubTask(false);
      subTaskReset();
      alert('Sub-task created successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to create sub-task:', error);
      alert(`Failed to create sub-task: ${error?.response?.data?.message || error.message}`);
    },
  });

  // Promote sub-task mutation
  const promoteMutation = useMutation({
    mutationFn: issueApi.promoteToIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
    },
  });

  // Form for editing issue
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateIssueRequest>({
    values: issue
      ? {
          title: issue.title,
          description: issue.description ?? undefined,
          type: issue.type,
          status: issue.status,
          priority: issue.priority,
          storyPoints: issue.storyPoints ?? undefined,
          labels: issue.labels,
          sprintId: issue.sprintId ?? undefined,
          assigneeId: issue.assigneeId ?? undefined,
        }
      : undefined,
  });

  // Form for creating sub-task
  const {
    register: subTaskRegister,
    handleSubmit: subTaskHandleSubmit,
    reset: subTaskReset,
    formState: { errors: subTaskErrors },
  } = useForm<CreateIssueRequest>({
    defaultValues: {
      projectId: issue?.projectId,
      type: 'TASK',
      priority: 'MEDIUM',
    },
  });

  const onUpdate = (data: UpdateIssueRequest) => {
    if (id) {
      updateMutation.mutate({ id, updates: data });
    }
  };

  const onCreateSubTask = (data: CreateIssueRequest) => {
    if (id) {
      createSubTaskMutation.mutate({
        parentIssueId: id,
        subTask: {
          ...data,
          projectId: issue!.projectId,
        },
      });
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      if (id) deleteMutation.mutate(id);
    }
  };

  const handleAssign = (assigneeId: string) => {
    if (id) {
      assignMutation.mutate({
        id,
        assigneeId: assigneeId === '' ? null : assigneeId,
      });
    }
  };

  const handleStatusChange = (status: IssueStatus) => {
    if (id) {
      statusMutation.mutate({ id, status });
    }
  };

  const handleSprintChange = (sprintId: string) => {
    if (id) {
      sprintMutation.mutate({ id, sprintId: sprintId === '' ? null : sprintId });
    }
  };

  const handlePromote = (subTaskId: string) => {
    if (window.confirm('Promote this sub-task to a regular issue?')) {
      promoteMutation.mutate(subTaskId);
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

  const handleAddComment = () => {
    if (newComment.trim()) {
      createCommentMutation.mutate(newComment);
    }
  };

  const handleEditComment = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditCommentContent(content);
  };

  const handleSaveCommentEdit = () => {
    if (editCommentContent.trim() && editingCommentId) {
      updateCommentMutation.mutate({
        commentId: editingCommentId,
        content: editCommentContent,
      });
    }
  };

  const handleCancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  const handleEditKey = () => {
    setTempKey(issue?.key || '');
    setIsEditingKey(true);
  };

  const handleSaveKey = () => {
    if (tempKey.trim() && tempKey !== issue?.key) {
      // Validate format
      if (!/^[A-Z0-9]+-[A-Z0-9]+$/.test(tempKey)) {
        alert('Issue key must follow format: ALPHANUMERIC-ALPHANUMERIC (e.g., PROJ-123, EPIC01-GODJIRA)');
        return;
      }
      if (id) {
        updateMutation.mutate(
          { id, updates: { key: tempKey } },
          {
            onSuccess: () => {
              setIsEditingKey(false);
            },
            onError: (error: any) => {
              alert(error?.response?.data?.message || 'Failed to update issue key');
              setTempKey(issue?.key || '');
            },
          }
        );
      }
    } else {
      setIsEditingKey(false);
    }
  };

  const handleCancelKeyEdit = () => {
    setIsEditingKey(false);
    setTempKey('');
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

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0 text-center text-gray-500">Loading issue...</div>
        </div>
      </Layout>
    );
  }

  if (!issue) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0 text-center text-gray-500">Issue not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate(`/projects/${issue.projectId}/issues`)}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to Issues
            </button>
          </div>
          <div className="flex items-center gap-3">
            {isEditingKey ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value.toUpperCase())}
                  placeholder="PROJ-123 or EPIC01-GODJIRA"
                  className="text-2xl font-bold px-2 py-1 border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ width: '280px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveKey();
                    } else if (e.key === 'Escape') {
                      handleCancelKeyEdit();
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={handleSaveKey}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelKeyEdit}
                  className="px-3 py-1 text-sm text-gray-600 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 
                  className="text-3xl font-bold text-blue-600 hover:text-blue-800 cursor-pointer border-b-2 border-transparent hover:border-blue-600 transition-colors"
                  onClick={handleEditKey}
                  title="Click to edit issue key"
                >
                  {issue.key}
                </h1>
                <button
                  onClick={handleEditKey}
                  className="text-gray-400 hover:text-gray-600"
                  title="Edit issue key"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}
            {issue.parentIssueId && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800">
                SUB-TASK
              </span>
            )}
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${getIssueTypeBadgeColor(
                issue.type
              )}`}
            >
              {issue.type}
            </span>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${getIssueStatusBadgeColor(
                issue.status
              )}`}
            >
              {issue.status.replace('_', ' ')}
            </span>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityBadgeColor(
                issue.priority
              )}`}
            >
              {issue.priority}
            </span>
          </div>
        </div>
        <div>
          {!isEditing && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Issue Title and Description */}
          <div className="bg-white p-6 rounded-lg shadow">
            {isEditing ? (
              <form onSubmit={handleSubmit(onUpdate)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={6}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      {...register('type')}
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

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4">{issue.title}</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {issue.description || 'No description provided.'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Edit Button */}
          {!isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
              >
                Edit
              </button>
            </div>
          )}

          {/* Attachments Section */}
          {id && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Attachments</h3>
              
              {/* Upload Component */}
              <div className="mb-6">
                <AttachmentUpload issueId={id} />
              </div>

              {/* Attachments List */}
              <AttachmentList issueId={id} />
            </div>
          )}

          {/* Work Logs Section */}
          {id && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Time Tracking</h3>
                <button
                  onClick={() => setShowWorkLogModal(true)}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Log Work</span>
                </button>
              </div>
              
              <WorkLogsList issueId={id} />
            </div>
          )}

          {/* Sub-tasks - Only show for parent issues, not for sub-tasks */}
          {!issue.parentIssueId && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Sub-tasks ({subTasks.length})
                </h3>
                <button
                  onClick={() => setIsCreatingSubTask(true)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Sub-task
                </button>
              </div>

              {isCreatingSubTask && (
                <form
                  onSubmit={subTaskHandleSubmit(onCreateSubTask)}
                  className="mb-4 p-4 border rounded-md space-y-3"
                >
                  <div>
                    <input
                      {...subTaskRegister('title', {
                        required: 'Title is required',
                      })}
                      placeholder="Sub-task title"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                    {subTaskErrors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {subTaskErrors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <select
                      {...subTaskRegister('type')}
                      className="px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="TASK">Task</option>
                      <option value="BUG">Bug</option>
                    </select>

                    <select
                      {...subTaskRegister('priority')}
                      className="px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>

                    <select
                      {...subTaskRegister('assigneeId')}
                      disabled={usersLoading || users.length === 0}
                      className="px-3 py-2 border rounded-md text-sm disabled:bg-gray-100"
                    >
                      <option value="">Unassigned</option>
                      {users.map((user: any) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingSubTask(false);
                        subTaskReset();
                      }}
                      className="px-3 py-1 text-sm text-gray-700 border rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createSubTaskMutation.isPending}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {createSubTaskMutation.isPending ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              )}

              {subTasks.length === 0 ? (
                <p className="text-gray-500 text-sm">No sub-tasks yet.</p>
              ) : (
                <div className="space-y-2">
                  {subTasks.map((subTask) => (
                    <div
                      key={subTask.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-blue-600">
                          {subTask.key}
                        </span>
                        <span className="text-sm">{subTask.title}</span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${getIssueStatusBadgeColor(
                            subTask.status
                          )}`}
                        >
                          {subTask.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/issues/${subTask.id}`)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handlePromote(subTask.id)}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Promote
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Issue Links Section */}
          {id && <IssueLinkSection issueId={id} />}

          {/* Comments Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">
              Comments ({comments.length})
            </h3>

            {/* Add Comment Form */}
            <div className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleAddComment();
                  }
                }}
              />
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Press Ctrl+Enter to submit
                </span>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || createCommentMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                comments.map((comment: any) => (
                  <div
                    key={comment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                          {comment.author.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">
                            {comment.author.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                            {comment.createdAt !== comment.updatedAt && (
                              <span className="ml-1 px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-[10px] font-medium">
                                edited {new Date(comment.updatedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {currentUser?.id === comment.authorId && (
                        <div className="flex gap-2">
                          {editingCommentId !== comment.id && (
                            <>
                              <button
                                onClick={() => handleEditComment(comment.id, comment.content)}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this comment?')) {
                                    deleteCommentMutation.mutate(comment.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="pl-11 space-y-2">
                        <textarea
                          value={editCommentContent}
                          onChange={(e) => setEditCommentContent(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              handleSaveCommentEdit();
                            } else if (e.key === 'Escape') {
                              handleCancelCommentEdit();
                            }
                          }}
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={handleCancelCommentEdit}
                            className="px-3 py-1 text-sm text-gray-700 border rounded-md hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveCommentEdit}
                            disabled={!editCommentContent.trim() || updateCommentMutation.isPending}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            {updateCommentMutation.isPending ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700 whitespace-pre-wrap pl-11">
                        {comment.content}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Parent Issue Link */}
          {issue.parentIssueId && issue.parentIssue && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-3">Parent Issue</h3>
              <div
                onClick={() => navigate(`/issues/${issue.parentIssue!.id}`)}
                className="flex items-center gap-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
              >
                <span className="text-sm font-medium text-blue-600">
                  {issue.parentIssue.key}
                </span>
                <span className="text-sm">{issue.parentIssue.title}</span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${getIssueTypeBadgeColor(
                    issue.parentIssue.type
                  )}`}
                >
                  {issue.parentIssue.type}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

            {/* Status */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={issue.status}
                onChange={(e) => handleStatusChange(e.target.value as IssueStatus)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="SMOKE_TESTING">Smoke Testing</option>
                <option value="BLOCKED">Blocked</option>
                <option value="DONE">Done</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* Assignee */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignee
              </label>
              <select
                value={issue.assigneeId || ''}
                onChange={(e) => handleAssign(e.target.value)}
                disabled={usersLoading || users.length === 0}
                className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Unassigned</option>
                {users.length === 0 && !usersLoading && (
                  <option disabled>No users available</option>
                )}
                {users.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              {usersLoading && (
                <p className="text-xs text-gray-500 mt-1">Loading users...</p>
              )}
              {!usersLoading && users.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No users found</p>
              )}
            </div>

            {/* Sprint */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sprint
              </label>
              <select
                value={issue.sprintId || ''}
                onChange={(e) => handleSprintChange(e.target.value)}
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

            {/* Due Date - Editable for Managers and Admins only */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date {currentUser && !['MANAGER', 'ADMIN'].includes(currentUser.role) && '(Read-only)'}
              </label>
              {currentUser && ['MANAGER', 'ADMIN'].includes(currentUser.role) ? (
                <input
                  type="date"
                  value={issue.dueDate ? new Date(issue.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    console.log('Date changed:', e.target.value);
                    // Convert YYYY-MM-DD to ISO string at noon UTC to avoid timezone shifts
                    const newDate = e.target.value ? `${e.target.value}T12:00:00.000Z` : null;
                    console.log('Converted to ISO:', newDate);
                    if (id) {
                      console.log('Updating issue with dueDate:', newDate);
                      updateMutation.mutate(
                        { id, updates: { dueDate: newDate } },
                        {
                          onSuccess: () => {
                            console.log('Due date updated successfully!');
                          },
                          onError: (error: any) => {
                            console.error('Failed to update due date:', error);
                          }
                        }
                      );
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                />
              ) : (
                <div className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700">
                  {issue.dueDate ? (
                    <span className={new Date(issue.dueDate) < new Date() ? 'text-red-600 font-semibold' : ''}>
                      {new Date(issue.dueDate).toISOString().split('T')[0]}
                    </span>
                  ) : (
                    'Not set'
                  )}
                </div>
              )}
            </div>

            {/* Watchers */}
            {id && (
              <div className="mt-6 pt-6 border-t">
                <WatchersList issueId={id} />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Project</dt>
                <dd className="font-medium">{issue.project?.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Creator</dt>
                <dd className="font-medium">{issue.creator?.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Story Points</dt>
                <dd className="font-medium">{issue.storyPoints || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd className="font-medium">
                  {new Date(issue.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Updated</dt>
                <dd className="font-medium">
                  {new Date(issue.updatedAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Due By</dt>
                <dd className="font-medium">
                  {issue.dueDate ? (
                    <span className={new Date(issue.dueDate) < new Date() ? 'text-red-600 font-semibold' : ''}>
                      {new Date(issue.dueDate).toISOString().split('T')[0]}
                    </span>
                  ) : (
                    'Not set'
                  )}
                </dd>
              </div>
              {issue.labels && issue.labels.length > 0 && (
                <div>
                  <dt className="text-gray-500 mb-1">Labels</dt>
                  <dd className="flex flex-wrap gap-1">
                    {issue.labels.map((label) => (
                      <span
                        key={label}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {label}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
        </div>
      </div>

      {/* Work Log Modal */}
      {showWorkLogModal && issue && (
        <WorkLogModal
          issueId={issue.id}
          issueKey={issue.key}
          onClose={() => setShowWorkLogModal(false)}
        />
      )}
    </Layout>
  );
}
