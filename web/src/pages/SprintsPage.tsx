import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Layout } from '@/components/Layout';
import { Breadcrumbs, BreadcrumbItem } from '@/components/Breadcrumbs';
import { sprintApi } from '@/services/sprint.service';
import { projectApi } from '@/services/project.service';
import type {
  Sprint,
  CreateSprintRequest,
  UpdateSprintRequest,
  SprintStatus,
} from '@/types';

export const SprintsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [statusFilter, setStatusFilter] = useState<SprintStatus | 'ALL'>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>(''); // For filtering when viewing all sprints

  // Fetch project (only if we have a projectId from route)
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getProject(projectId!),
    enabled: !!projectId,
  });

  // Fetch all projects (for filtering when viewing all sprints)
  const { data: allProjects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getProjects(),
    enabled: !projectId, // Only fetch when not in a specific project context
  });

  // Fetch sprints
  const { data: sprints, isLoading } = useQuery({
    queryKey: ['sprints', projectId, projectFilter, statusFilter],
    queryFn: () =>
      sprintApi.getSprints({
        projectId: projectId || projectFilter || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      }),
  });

  // Create sprint mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateSprintRequest) => sprintApi.createSprint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      setShowCreateModal(false);
      toast.success('Sprint created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create sprint');
    },
  });

  // Update sprint mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSprintRequest }) =>
      sprintApi.updateSprint(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      setShowEditModal(false);
      setSelectedSprint(null);
      toast.success('Sprint updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update sprint');
    },
  });

  // Start sprint mutation
  const startMutation = useMutation({
    mutationFn: (id: string) => sprintApi.startSprint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      toast.success('Sprint started successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to start sprint');
    },
  });

  // Complete sprint mutation
  const completeMutation = useMutation({
    mutationFn: (id: string) => sprintApi.completeSprint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      toast.success('Sprint completed successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to complete sprint');
    },
  });

  // Cancel sprint mutation
  const cancelMutation = useMutation({
    mutationFn: (id: string) => sprintApi.cancelSprint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      toast.success('Sprint cancelled successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to cancel sprint');
    },
  });

  // Delete sprint mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => sprintApi.deleteSprint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      setShowDeleteModal(false);
      setSelectedSprint(null);
      toast.success('Sprint deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete sprint');
    },
  });

  // Build breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
  ];
  
  if (projectId && project) {
    breadcrumbs.push(
      { label: 'Projects', href: '/projects' },
      { label: project.name, href: `/projects/${projectId}` },
      { label: 'Sprints' }
    );
  } else {
    breadcrumbs.push({ label: 'All Sprints' });
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="px-4 sm:px-0">
          <Breadcrumbs items={breadcrumbs} />
        </div>
        
        {/* Header */}
        <div className="px-4 sm:px-0 mb-6">
          {projectId && (
            <button
              onClick={() => navigate(`/projects/${projectId}`)}
              className="mb-4 text-sm text-primary-600 hover:text-primary-500 flex items-center"
            >
              ← Back to Project
            </button>
          )}

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {projectId ? 'Sprints' : 'All Sprints'}
              </h1>
              {project && (
                <p className="mt-2 text-sm text-gray-600">
                  Project: {project.name} ({project.key})
                </p>
              )}
              {!projectId && (
                <p className="mt-2 text-sm text-gray-600">
                  Manage sprints across all projects
                </p>
              )}
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              + New Sprint
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-0 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Filter - Only show when viewing all sprints */}
            {!projectId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Project
                </label>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="input w-full"
                >
                  <option value="">All Projects</option>
                  {allProjects.map((proj: any) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SprintStatus | 'ALL')}
                className="input w-full"
              >
                <option value="ALL">All Sprints</option>
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sprints List */}
        <div className="px-4 sm:px-0">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading sprints...</p>
            </div>
          ) : !sprints || sprints.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No sprints</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new sprint.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary"
                >
                  + New Sprint
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {sprints.map((sprint) => (
                <SprintCard
                  key={sprint.id}
                  sprint={sprint}
                  projectId={projectId}
                  showProjectBadge={!projectId}
                  onEdit={(s) => {
                    setSelectedSprint(s);
                    setShowEditModal(true);
                  }}
                  onDelete={(s) => {
                    setSelectedSprint(s);
                    setShowDeleteModal(true);
                  }}
                  onStart={(s) => startMutation.mutate(s.id)}
                  onComplete={(s) => completeMutation.mutate(s.id)}
                  onCancel={(s) => cancelMutation.mutate(s.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <CreateSprintModal
            projectId={projectId}
            projects={allProjects}
            onClose={() => setShowCreateModal(false)}
            onSubmit={(data) => createMutation.mutate(data)}
            isLoading={createMutation.isPending}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && selectedSprint && (
          <EditSprintModal
            sprint={selectedSprint}
            onClose={() => {
              setShowEditModal(false);
              setSelectedSprint(null);
            }}
            onSubmit={(data) =>
              updateMutation.mutate({ id: selectedSprint.id, data })
            }
            isLoading={updateMutation.isPending}
          />
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedSprint && (
          <DeleteSprintModal
            sprint={selectedSprint}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedSprint(null);
            }}
            onConfirm={() => deleteMutation.mutate(selectedSprint.id)}
            isLoading={deleteMutation.isPending}
          />
        )}
      </div>
    </Layout>
  );
};

// Sprint Card Component
interface SprintCardProps {
  sprint: Sprint;
  projectId?: string;
  showProjectBadge?: boolean;
  onEdit: (sprint: Sprint) => void;
  onDelete: (sprint: Sprint) => void;
  onStart: (sprint: Sprint) => void;
  onComplete: (sprint: Sprint) => void;
  onCancel: (sprint: Sprint) => void;
}

const SprintCard = ({
  sprint,
  projectId,
  showProjectBadge = false,
  onEdit,
  onDelete,
  onStart,
  onComplete,
  onCancel,
}: SprintCardProps) => {
  const navigate = useNavigate();
  const statusColors = {
    PLANNED: 'bg-gray-100 text-gray-800',
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const canEdit = sprint.status === 'PLANNED' || sprint.status === 'ACTIVE';
  const canStart = sprint.status === 'PLANNED';
  const canComplete = sprint.status === 'ACTIVE';
  const canCancel = sprint.status === 'PLANNED' || sprint.status === 'ACTIVE';
  const canDelete = sprint.status !== 'ACTIVE';

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{sprint.name}</h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                statusColors[sprint.status]
              }`}
            >
              {sprint.status}
            </span>
            {showProjectBadge && sprint.project && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {sprint.project.name}
              </span>
            )}
          </div>

          {sprint.goal && (
            <p className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Goal:</span> {sprint.goal}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            {sprint.startDate && (
              <div>
                <span className="text-gray-500">Start:</span>{' '}
                <span className="text-gray-900">
                  {new Date(sprint.startDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {sprint.endDate && (
              <div>
                <span className="text-gray-500">End:</span>{' '}
                <span className="text-gray-900">
                  {new Date(sprint.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="ml-4 flex flex-col space-y-2">
          <button
            onClick={() => navigate(`/projects/${projectId || sprint.projectId}/sprints/${sprint.id}`)}
            className="btn btn-primary btn-sm"
          >
            View Details
          </button>
          {canStart && (
            <button
              onClick={() => onStart(sprint)}
              className="btn bg-green-600 text-white hover:bg-green-700 btn-sm"
            >
              Start Sprint
            </button>
          )}
          {canComplete && (
            <button
              onClick={() => onComplete(sprint)}
              className="btn bg-blue-600 text-white hover:bg-blue-700 btn-sm"
            >
              Complete Sprint
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => onEdit(sprint)}
              className="btn btn-secondary btn-sm text-blue-600 hover:bg-blue-50"
            >
              Edit
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => onCancel(sprint)}
              className="btn btn-secondary btn-sm text-orange-600 hover:bg-orange-50"
            >
              Cancel
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(sprint)}
              className="btn btn-secondary btn-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Create Sprint Modal
interface CreateSprintModalProps {
  projectId?: string;
  projects?: any[];
  onClose: () => void;
  onSubmit: (data: CreateSprintRequest) => void;
  isLoading: boolean;
}

const CreateSprintModal = ({
  projectId,
  projects = [],
  onClose,
  onSubmit,
  isLoading,
}: CreateSprintModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSprintRequest>({
    defaultValues: {
      projectId: projectId || '',
    },
  });

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Sprint</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Project Selection - Only show when not in project context */}
          {!projectId && projects.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                {...register('projectId', {
                  required: 'Project is required',
                })}
                className="input mt-1"
              >
                <option value="">Select a project</option>
                {projects.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="mt-1 text-sm text-red-600">{errors.projectId.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sprint Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name', {
                required: 'Sprint name is required',
              })}
              className="input mt-1"
              placeholder="e.g., Sprint 1"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Goal</label>
            <textarea
              {...register('goal')}
              rows={2}
              className="input mt-1"
              placeholder="Sprint goal..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="datetime-local"
              {...register('startDate')}
              className="input mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="datetime-local"
              {...register('endDate')}
              className="input mt-1"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Sprint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Sprint Modal
interface EditSprintModalProps {
  sprint: Sprint;
  onClose: () => void;
  onSubmit: (data: UpdateSprintRequest) => void;
  isLoading: boolean;
}

const EditSprintModal = ({
  sprint,
  onClose,
  onSubmit,
  isLoading,
}: EditSprintModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateSprintRequest>({
    defaultValues: {
      name: sprint.name,
      goal: sprint.goal || '',
      startDate: sprint.startDate
        ? new Date(sprint.startDate).toISOString().slice(0, 16)
        : '',
      endDate: sprint.endDate
        ? new Date(sprint.endDate).toISOString().slice(0, 16)
        : '',
    },
  });

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Sprint</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sprint Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name', {
                required: 'Sprint name is required',
              })}
              className="input mt-1"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Goal</label>
            <textarea
              {...register('goal')}
              rows={2}
              className="input mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="datetime-local"
              {...register('startDate')}
              className="input mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="datetime-local"
              {...register('endDate')}
              className="input mt-1"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Sprint Modal
interface DeleteSprintModalProps {
  sprint: Sprint;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const DeleteSprintModal = ({
  sprint,
  onClose,
  onConfirm,
  isLoading,
}: DeleteSprintModalProps) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete Sprint</h2>

        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete sprint{' '}
          <span className="font-semibold">{sprint.name}</span>?
        </p>

        {sprint.status === 'ACTIVE' && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> Cannot delete an active sprint. Please complete or
              cancel it first.
            </p>
          </div>
        )}

        {sprint.status !== 'ACTIVE' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> This action cannot be undone. All issues in this
              sprint will be moved to the backlog.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn bg-red-600 text-white hover:bg-red-700"
            disabled={isLoading || sprint.status === 'ACTIVE'}
          >
            {isLoading ? 'Deleting...' : 'Delete Sprint'}
          </button>
        </div>
      </div>
    </div>
  );
};
