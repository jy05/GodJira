import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/services/user.service';
import type { User, UserRole } from '@/types';
import type { CreateUserData, AdminResetPasswordData } from '@/services/user.service';

export const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const limit = 20;

  // Fetch users
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', page, search, roleFilter],
    queryFn: () => userApi.getUsers({ page, limit, search }),
    enabled: currentUser?.role === 'ADMIN',
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      userApi.updateUserRole(userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Deactivate user mutation
  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => userApi.deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Reactivate user mutation
  const reactivateMutation = useMutation({
    mutationFn: (userId: string) => userApi.reactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User reactivated successfully');
    },
    onError: () => {
      toast.error('Failed to reactivate user');
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: CreateUserData) => userApi.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowCreateModal(false);
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: AdminResetPasswordData }) =>
      userApi.adminResetPassword(userId, password),
    onSuccess: () => {
      setShowPasswordModal(false);
      setSelectedUser(null);
      toast.success('Password reset successfully');
    },
    onError: () => {
      toast.error('Failed to reset password');
    },
  });

  // Check if current user has permission
  const canManageUsers = currentUser?.role === 'ADMIN';

  if (!canManageUsers) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6">
            <div className="card bg-red-50 border-red-200">
              <h2 className="text-lg font-semibold text-red-800">Access Denied</h2>
              <p className="mt-2 text-sm text-red-700">
                You don't have permission to access this page. Only administrators can
                manage users.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Filter users by role on client side
  const filteredUsers =
    roleFilter === 'ALL'
      ? data?.data
      : data?.data.filter((user) => user.role === roleFilter);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage user accounts, roles, and permissions
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create User
            </button>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Users
                </label>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1); // Reset to first page on search
                  }}
                  className="input"
                />
              </div>

              {/* Role Filter */}
              <div>
                <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Role
                </label>
                <select
                  id="roleFilter"
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value as UserRole | 'ALL');
                    setPage(1);
                  }}
                  className="input"
                >
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="USER">User</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="card overflow-hidden">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-sm text-gray-500">Loading users...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-sm text-red-600">
                  Failed to load users. Please try again.
                </p>
              </div>
            ) : !filteredUsers || filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">No users found.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <UserRow
                          key={user.id}
                          user={user}
                          currentUser={currentUser!}
                          onUpdateRole={(role) =>
                            updateRoleMutation.mutate({ userId: user.id, role })
                          }
                          onDeactivate={() => deactivateMutation.mutate(user.id)}
                          onReactivate={() => reactivateMutation.mutate(user.id)}
                          onResetPassword={() => {
                            setSelectedUser(user);
                            setShowPasswordModal(true);
                          }}
                          isUpdating={
                            updateRoleMutation.isPending ||
                            deactivateMutation.isPending ||
                            reactivateMutation.isPending
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="btn btn-secondary"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                        disabled={page === data.totalPages}
                        className="btn btn-secondary ml-3"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{' '}
                          <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                          <span className="font-medium">
                            {Math.min(page * limit, data.total)}
                          </span>{' '}
                          of <span className="font-medium">{data.total}</span> users
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                            disabled={page === data.totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createUserMutation.mutate(data)}
          isLoading={createUserMutation.isPending}
        />
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && selectedUser && (
        <ResetPasswordModal
          user={selectedUser}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedUser(null);
          }}
          onSubmit={(password) => resetPasswordMutation.mutate({ userId: selectedUser.id, password })}
          isLoading={resetPasswordMutation.isPending}
        />
      )}
    </Layout>
  );
};

interface UserRowProps {
  user: User;
  currentUser: User;
  onUpdateRole: (role: UserRole) => void;
  onDeactivate: () => void;
  onReactivate: () => void;
  onResetPassword: () => void;
  isUpdating: boolean;
}

const UserRow = ({
  user,
  currentUser,
  onUpdateRole,
  onDeactivate,
  onReactivate,
  onResetPassword,
  isUpdating,
}: UserRowProps) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const isCurrentUser = user.id === currentUser.id;
  const canChangeRole = currentUser.role === 'ADMIN' && !isCurrentUser;

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800';
      case 'USER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr>
      {/* User Info */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-6 py-4 whitespace-nowrap">
        {canChangeRole ? (
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              disabled={isUpdating}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                user.role
              )} hover:opacity-80 transition-opacity`}
            >
              {user.role}
              <svg
                className="ml-1 h-3 w-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {showRoleMenu && (
              <div className="absolute z-10 mt-1 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  {(['ADMIN', 'MANAGER', 'USER'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        onUpdateRole(role);
                        setShowRoleMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
              user.role
            )}`}
          >
            {user.role}
          </span>
        )}
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>

      {/* Joined Date */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {!isCurrentUser && currentUser.role === 'ADMIN' && (
          <div className="flex justify-end gap-3">
            <button
              onClick={onResetPassword}
              disabled={isUpdating}
              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
              title="Reset Password"
            >
              Reset Password
            </button>
            <button
              onClick={user.isActive ? onDeactivate : onReactivate}
              disabled={isUpdating}
              className={`${
                user.isActive
                  ? 'text-red-600 hover:text-red-900'
                  : 'text-green-600 hover:text-green-900'
              } disabled:opacity-50`}
            >
              {user.isActive ? 'Deactivate' : 'Reactivate'}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

// Create User Modal Component
interface CreateUserModalProps {
  onClose: () => void;
  onSubmit: (data: CreateUserData) => void;
  isLoading: boolean;
}

const CreateUserModal = ({ onClose, onSubmit, isLoading }: CreateUserModalProps) => {
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    name: '',
    role: 'USER',
    isActive: true,
    isEmailVerified: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Create New User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
            </p>
          </div>

          <div>
            <label className="label">Job Title (Optional)</label>
            <input
              type="text"
              value={formData.jobTitle || ''}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Department (Optional)</label>
            <input
              type="text"
              value={formData.department || ''}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="input"
            >
              <option value="USER">User</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isEmailVerified"
              checked={formData.isEmailVerified}
              onChange={(e) => setFormData({ ...formData, isEmailVerified: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isEmailVerified" className="text-sm text-gray-700">
              Email Verified
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary flex-1"
            >
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reset Password Modal Component
interface ResetPasswordModalProps {
  user: User;
  onClose: () => void;
  onSubmit: (password: AdminResetPasswordData) => void;
  isLoading: boolean;
}

const ResetPasswordModal = ({ user, onClose, onSubmit, isLoading }: ResetPasswordModalProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    onSubmit({ newPassword });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <p className="text-gray-600 mb-4">
          Reset password for <strong>{user.name}</strong> ({user.email})
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
            </p>
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary flex-1"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
