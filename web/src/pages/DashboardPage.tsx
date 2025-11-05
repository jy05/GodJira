import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';

export const DashboardPage = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </Layout>
  );
};
