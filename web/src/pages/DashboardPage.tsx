import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">GodJira</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, <span className="font-medium">{user?.name}</span>
              </span>
              <button
                onClick={logout}
                className="text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
            <div className="border-t border-gray-200 pt-4">
              <dl className="divide-y divide-gray-200">
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">User ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.id}</dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.name}</dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.email}</dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      user?.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user?.role}
                    </span>
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Email verified</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.isEmailVerified ? (
                      <span className="text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-yellow-600">✗ Not verified</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-medium text-gray-900">Projects</h3>
              <p className="mt-2 text-sm text-gray-500">
                Manage your projects and sprints
              </p>
              <div className="mt-4">
                <Link to="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  View projects →
                </Link>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-medium text-gray-900">Issues</h3>
              <p className="mt-2 text-sm text-gray-500">
                Track and manage issues
              </p>
              <div className="mt-4">
                <Link to="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  View issues →
                </Link>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-medium text-gray-900">Reports</h3>
              <p className="mt-2 text-sm text-gray-500">
                Analytics and insights
              </p>
              <div className="mt-4">
                <Link to="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  View reports →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
