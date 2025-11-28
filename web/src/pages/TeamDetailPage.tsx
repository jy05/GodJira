import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { teamApi, type Team, type TeamMemberRole } from '@/services/team.service';
import { userApi } from '@/services/user.service';
import { projectApi } from '@/services/project.service';

export const TeamDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedRole, setSelectedRole] = useState<TeamMemberRole>('MEMBER');

  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  // Fetch team details
  const { data: team, isLoading } = useQuery({
    queryKey: ['team', id],
    queryFn: () => teamApi.getTeam(id!),
    enabled: !!id,
  });

  // Fetch all users for add member dropdown
  const { data: usersResponse } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getUsers({ limit: 100 }),
    enabled: showAddMemberModal,
  });

  // Fetch all projects for add project dropdown
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getProjects({ take: 100 }),
    enabled: showAddProjectModal,
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: () =>
      teamApi.addMember(id!, { userId: selectedUserId, role: selectedRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      toast.success('Member added successfully');
      setShowAddMemberModal(false);
      setSelectedUserId('');
      setSelectedRole('MEMBER');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add member');
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => teamApi.removeMember(id!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      toast.success('Member removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    },
  });

  // Update member role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: TeamMemberRole }) =>
      teamApi.updateMemberRole(id!, userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      toast.success('Role updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update role');
    },
  });

  // Add project mutation
  const addProjectMutation = useMutation({
    mutationFn: () => teamApi.addProject(id!, { projectId: selectedProjectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      toast.success('Project added successfully');
      setShowAddProjectModal(false);
      setSelectedProjectId('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add project');
    },
  });

  // Remove project mutation
  const removeProjectMutation = useMutation({
    mutationFn: (projectId: string) => teamApi.removeProject(id!, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      toast.success('Project removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove project');
    },
  });

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: () => teamApi.deleteTeam(id!),
    onSuccess: () => {
      toast.success('Team deleted successfully');
      navigate('/teams');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete team');
    },
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }
    addMemberMutation.mutate();
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      toast.error('Please select a project');
      return;
    }
    addProjectMutation.mutate();
  };

  const handleRemoveMember = (userId: string, userName: string) => {
    if (window.confirm(`Remove ${userName} from this team? Their account will NOT be deleted.`)) {
      removeMemberMutation.mutate(userId);
    }
  };

  const handleRemoveProject = (projectId: string, projectName: string) => {
    if (window.confirm(`Remove "${projectName}" from this team?`)) {
      removeProjectMutation.mutate(projectId);
    }
  };

  const handleDeleteTeam = () => {
    if (window.confirm(`Are you sure you want to delete "${team?.name}"? Team members will NOT be deleted.`)) {
      deleteTeamMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!team) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Team not found</p>
          <Link to="/teams" className="text-primary-600 hover:underline mt-4 inline-block">
            Back to Teams
          </Link>
        </div>
      </Layout>
    );
  }

  // Filter out already added members and projects
  const availableUsers = usersResponse?.data?.filter(
    (u) => !team.members?.some((m) => m.userId === u.id)
  ) || [];

  const availableProjects = projects?.filter(
    (p) => !team.projects?.some((tp) => tp.projectId === p.id)
  ) || [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 sm:px-0 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link to="/teams" className="text-primary-600 hover:underline text-sm">
              ← Back to Teams
            </Link>
            {isAdminOrManager && (
              <button
                onClick={handleDeleteTeam}
                className="btn bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Team
              </button>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
          {team.description && (
            <p className="mt-2 text-gray-600">{team.description}</p>
          )}
        </div>

        <div className="px-4 sm:px-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Members Section */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Members ({team.members?.length || 0})
              </h2>
              {isAdminOrManager && (
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  + Add Member
                </button>
              )}
            </div>

            {!team.members || team.members.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No members yet</p>
            ) : (
              <div className="space-y-3">
                {team.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      {member.user.avatar ? (
                        <img
                          src={member.user.avatar}
                          alt={member.user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                          {member.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{member.user.name}</p>
                        <p className="text-sm text-gray-500">{member.user.email}</p>
                        {member.user.jobTitle && (
                          <p className="text-xs text-gray-400">{member.user.jobTitle}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isAdminOrManager ? (
                        <select
                          value={member.role}
                          onChange={(e) =>
                            updateRoleMutation.mutate({
                              userId: member.userId,
                              role: e.target.value as TeamMemberRole,
                            })
                          }
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="MEMBER">Member</option>
                          <option value="LEAD">Lead</option>
                        </select>
                      ) : (
                        <span
                          className={`text-sm px-2 py-1 rounded ${
                            member.role === 'LEAD'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {member.role}
                        </span>
                      )}
                      {isAdminOrManager && (
                        <button
                          onClick={() => handleRemoveMember(member.userId, member.user.name)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projects Section */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Projects ({team.projects?.length || 0})
              </h2>
              {isAdminOrManager && (
                <button
                  onClick={() => setShowAddProjectModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  + Add Project
                </button>
              )}
            </div>

            {!team.projects || team.projects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No projects yet</p>
            ) : (
              <div className="space-y-3">
                {team.projects.map((teamProject) => (
                  <div
                    key={teamProject.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <Link
                        to={`/projects/${teamProject.projectId}`}
                        className="font-medium text-primary-600 hover:underline"
                      >
                        {teamProject.project.key} - {teamProject.project.name}
                      </Link>
                      {teamProject.project.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {teamProject.project.description}
                        </p>
                      )}
                    </div>
                    {isAdminOrManager && (
                      <button
                        onClick={() =>
                          handleRemoveProject(
                            teamProject.projectId,
                            teamProject.project.name
                          )
                        }
                        className="ml-4 text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Team Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label className="label">Select User *</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="input w-full"
                  required
                >
                  <option value="">-- Select a user --</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="label">Role *</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as TeamMemberRole)}
                  className="input w-full"
                >
                  <option value="MEMBER">Member</option>
                  <option value="LEAD">Lead</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setSelectedUserId('');
                    setSelectedRole('MEMBER');
                  }}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMemberMutation.isPending}
                  className="flex-1 btn btn-primary"
                >
                  {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Project to Team</h2>
            <form onSubmit={handleAddProject}>
              <div className="mb-4">
                <label className="label">Select Project *</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="input w-full"
                  required
                >
                  <option value="">-- Select a project --</option>
                  {availableProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.key} - {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProjectModal(false);
                    setSelectedProjectId('');
                  }}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addProjectMutation.isPending}
                  className="flex-1 btn btn-primary"
                >
                  {addProjectMutation.isPending ? 'Adding...' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};
