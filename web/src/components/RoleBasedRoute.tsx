import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export const RoleBasedRoute = ({
  children,
  allowedRoles,
  redirectTo = '/dashboard',
}: RoleBasedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

// Hook for checking permissions in components
export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const isAdmin = (): boolean => hasRole('ADMIN');
  const isManager = (): boolean => hasRole('MANAGER');
  const isUser = (): boolean => hasRole('USER');
  const canManageUsers = (): boolean => hasRole(['ADMIN', 'MANAGER']);
  const canManageProjects = (): boolean => hasRole(['ADMIN', 'MANAGER']);

  return {
    user,
    hasRole,
    isAdmin,
    isManager,
    isUser,
    canManageUsers,
    canManageProjects,
  };
};
