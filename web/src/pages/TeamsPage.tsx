import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { teamApi, type Team } from '@/services/team.service';

export const TeamsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  // Fetch all teams
  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamApi.getTeams(),
  });

  // Create team mutation
  const createMutation = useMutation({
    mutationFn: teamApi.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create team');
    },
  });

  // Update team mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) =>
      teamApi.updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team updated successfully');
      setShowEditModal(false);
      setSelectedTeam(null);
      setFormData({ name: '', description: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update team');
    },
  });

  // Delete team mutation
  const deleteMutation = useMutation({
    mutationFn: teamApi.deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete team');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Team name is required');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !formData.name.trim()) {
      toast.error('Team name is required');
      return;
    }
    updateMutation.mutate({ id: selectedTeam.id, data: formData });
  };

  const handleDelete = (team: Team) => {
    if (window.confirm(`Are you sure you want to delete "${team.name}"? Team members will NOT be deleted.`)) {
      deleteMutation.mutate(team.id);
    }
  };

  const openEditModal = (team: Team) => {
    setSelectedTeam(team);
    setFormData({ name: team.name, description: team.description || '' });
    setShowEditModal(true);
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 sm:px-0 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
            <p className="mt-2 text-sm text-gray-600">
              Organize your team members and projects
            </p>
          </div>
          {isAdminOrManager && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              + Create Team
            </button>
          )}
        </div>

        {/* Teams Grid */}
        <div className="px-4 sm:px-0">
          {!teams || teams.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-gray-400 text-5xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
              <p className="text-gray-500 mb-4">
                {isAdminOrManager
                  ? 'Create your first team to get started'
                  : 'No teams available'}
              </p>
              {isAdminOrManager && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary"
                >
                  Create Team
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <div key={team.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        <Link
                          to={`/teams/${team.id}`}
                          className="hover:text-primary-600"
                        >
                          {team.name}
                        </Link>
                      </h3>
                      {team.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {team.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {team._count?.members || 0} members
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      {team._count?.projects || 0} projects
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to={`/teams/${team.id}`}
                      className="flex-1 btn btn-secondary text-sm py-2"
                    >
                      View Details
                    </Link>
                    {isAdminOrManager && (
                      <>
                        <button
                          onClick={() => openEditModal(team)}
                          className="btn btn-secondary text-sm py-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(team)}
                          className="btn bg-red-600 hover:bg-red-700 text-white text-sm py-2"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Team</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="label">Team Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  placeholder="Enter team name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input w-full"
                  rows={3}
                  placeholder="Enter team description (optional)"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', description: '' });
                  }}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 btn btn-primary"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Team</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="label">Team Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  placeholder="Enter team name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input w-full"
                  rows={3}
                  placeholder="Enter team description (optional)"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTeam(null);
                    setFormData({ name: '', description: '' });
                  }}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 btn btn-primary"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};
