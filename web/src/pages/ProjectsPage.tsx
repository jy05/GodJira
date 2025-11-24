import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { projectApi } from '@/services/project.service';
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '@/types';
import { useForm } from 'react-hook-form';
import { DateDisplay } from '@/components/DateDisplay';

export const ProjectsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', search],
    queryFn: () => projectApi.getProjects({ search }),
  });

  // Ensure projects is always an array
  const projectsList = Array.isArray(projects) ? projects : [];

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateProjectRequest) => projectApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowCreateModal(false);
      toast.success('Project created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create project');
    },
  });

  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) =>
      projectApi.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowEditModal(false);
      setSelectedProject(null);
      toast.success('Project updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update project');
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowDeleteModal(false);
      setSelectedProject(null);
      toast.success('Project deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete project');
    },
  });

  const handleViewProject = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const handleViewSprints = (project: Project) => {
    navigate(`/projects/${project.id}/sprints`);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 sm:px-0 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
              <p className="mt-2 text-sm text-gray-600">
                Projects are containers that organize your team's work. Each project contains sprints, 
                issues (stories, tasks, bugs, spikes), and tracks overall progress.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              + New Project
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 sm:px-0 mb-6">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input max-w-md"
          />
        </div>

        {/* Projects List */}
        <div className="px-4 sm:px-0">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading projects...</p>
            </div>
          ) : projectsList.length === 0 ? (
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
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new project.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary"
                >
                  + New Project
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projectsList.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  currentUser={user}
                  onView={handleViewProject}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  onViewSprints={handleViewSprints}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <CreateProjectModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={(data) => createMutation.mutate(data)}
            isLoading={createMutation.isPending}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && selectedProject && (
          <EditProjectModal
            project={selectedProject}
            onClose={() => {
              setShowEditModal(false);
              setSelectedProject(null);
            }}
            onSubmit={(data) =>
              updateMutation.mutate({ id: selectedProject.id, data })
            }
            isLoading={updateMutation.isPending}
          />
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedProject && (
          <DeleteProjectModal
            project={selectedProject}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedProject(null);
            }}
            onConfirm={() => deleteMutation.mutate(selectedProject.id)}
            isLoading={deleteMutation.isPending}
          />
        )}
      </div>
    </Layout>
  );
};

// Project Card Component
interface ProjectCardProps {
  project: Project;
  currentUser: any;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onViewSprints: (project: Project) => void;
}

const ProjectCard = ({
  project,
  currentUser,
  onView,
  onEdit,
  onDelete,
  onViewSprints,
}: ProjectCardProps) => {
  const isOwner = currentUser?.id === project.ownerId;
  const canEdit = isOwner || currentUser?.role === 'ADMIN';

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-primary-100 text-primary-800">
              {project.key}
            </span>
            {isOwner && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                Owner
              </span>
            )}
          </div>
          <h3 className="mt-2 text-lg font-semibold text-gray-900">
            {project.name}
          </h3>
          {project.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>Created <DateDisplay date={project.createdAt} format="short" /></span>
      </div>

      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => onView(project)}
          className="flex-1 btn btn-secondary text-sm"
        >
          View Details
        </button>
        <button
          onClick={() => onViewSprints(project)}
          className="flex-1 btn btn-secondary text-sm"
        >
          Sprints
        </button>
      </div>

      {canEdit && (
        <div className="mt-2 flex space-x-2">
          <button
            onClick={() => onEdit(project)}
            className="flex-1 btn btn-secondary text-sm text-blue-600 hover:bg-blue-50"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(project)}
            className="flex-1 btn btn-secondary text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

// Create Project Modal
interface CreateProjectModalProps {
  onClose: () => void;
  onSubmit: (data: CreateProjectRequest) => void;
  isLoading: boolean;
}

const CreateProjectModal = ({
  onClose,
  onSubmit,
  isLoading,
}: CreateProjectModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectRequest>();

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Project</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('key', {
                required: 'Project key is required',
                minLength: { value: 2, message: 'Key must be 2-10 characters' },
                maxLength: { value: 10, message: 'Key must be 2-10 characters' },
                pattern: {
                  value: /^[A-Z]+$/,
                  message: 'Key must contain only uppercase letters',
                },
              })}
              className="input mt-1"
              placeholder="e.g., WEB"
              maxLength={10}
            />
            {errors.key && (
              <p className="mt-1 text-sm text-red-600">{errors.key.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              2-10 uppercase letters (e.g., WEB, API, MOBILE)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name', {
                required: 'Project name is required',
              })}
              className="input mt-1"
              placeholder="e.g., Website Redesign"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input mt-1"
              placeholder="Describe your project..."
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
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Project Modal
interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSubmit: (data: UpdateProjectRequest) => void;
  isLoading: boolean;
}

const EditProjectModal = ({
  project,
  onClose,
  onSubmit,
  isLoading,
}: EditProjectModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProjectRequest>({
    defaultValues: {
      name: project.name,
      description: project.description || '',
    },
  });

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Project</h2>

        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <span className="text-sm text-gray-500">Project Key: </span>
          <span className="text-sm font-medium text-gray-900">{project.key}</span>
          <p className="text-xs text-gray-500 mt-1">Key cannot be changed</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name', {
                required: 'Project name is required',
              })}
              className="input mt-1"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
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

// Delete Project Modal
interface DeleteProjectModalProps {
  project: Project;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const DeleteProjectModal = ({
  project,
  onClose,
  onConfirm,
  isLoading,
}: DeleteProjectModalProps) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete Project</h2>

        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete project{' '}
          <span className="font-semibold">{project.name}</span> ({project.key})?
        </p>

        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-sm text-red-800">
            <strong>Warning:</strong> This action cannot be undone. All sprints, issues,
            and related data will be permanently deleted.
          </p>
        </div>

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
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  );
};
