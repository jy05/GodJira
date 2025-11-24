import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/services/user.service';
import { DateDisplay } from './DateDisplay';

interface UserStatsModalProps {
  userId: string;
  onClose: () => void;
}

/**
 * Modal displaying comprehensive user statistics
 * Shows issues created/assigned, work logs, and comment activity
 */
export const UserStatsModal = ({ userId, onClose }: UserStatsModalProps) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats', userId],
    queryFn: () => userApi.getUserStatistics(userId),
  });

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900">User Statistics</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading statistics...</p>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Issues Created"
                value={stats.issuesCreated}
                icon="➕"
                color="blue"
              />
              <StatCard
                title="Issues Assigned"
                value={stats.issuesAssigned}
                icon="📌"
                color="purple"
              />
              <StatCard
                title="Work Logs"
                value={stats.workLogsCount}
                icon="⏱️"
                color="green"
              />
              <StatCard
                title="Comments"
                value={stats.commentsCount}
                icon="💬"
                color="yellow"
              />
            </div>

            {/* Work Time Summary */}
            {stats.totalTimeLogged && (
              <div className="card bg-indigo-50 border-indigo-200">
                <h3 className="text-md font-semibold text-indigo-900 mb-3">Time Tracking</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <dt className="text-sm text-indigo-700">Total Hours Logged</dt>
                    <dd className="text-2xl font-semibold text-indigo-900">
                      {(stats.totalTimeLogged / 60).toFixed(1)}h
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-indigo-700">Average per Work Log</dt>
                    <dd className="text-2xl font-semibold text-indigo-900">
                      {stats.workLogsCount > 0 
                        ? (stats.totalTimeLogged / stats.workLogsCount / 60).toFixed(1)
                        : '0'
                      }h
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-indigo-700">Total Work Logs</dt>
                    <dd className="text-2xl font-semibold text-indigo-900">
                      {stats.workLogsCount}
                    </dd>
                  </div>
                </div>
              </div>
            )}

            {/* Issue Breakdown */}
            <div className="card">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Issue Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-medium text-gray-700">Issues Created</span>
                  <span className="text-lg font-semibold text-gray-900">{stats.issuesCreated}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-medium text-gray-700">Issues Assigned</span>
                  <span className="text-lg font-semibold text-gray-900">{stats.issuesAssigned}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-medium text-gray-700">Active Issues</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {stats.activeIssuesCount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Completed Issues</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {stats.completedIssuesCount || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="card">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Engagement</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">💬</span>
                    <span className="text-sm text-gray-700">Comments</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{stats.commentsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">📝</span>
                    <span className="text-sm text-gray-700">Work Log Entries</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{stats.workLogsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🔗</span>
                    <span className="text-sm text-gray-700">Issue Links Created</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {stats.issueLinksCount || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            {stats.recentActivity && stats.recentActivity.length > 0 && (
              <div className="card">
                <h3 className="text-md font-semibold text-gray-900 mb-3">Recent Activity</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {stats.recentActivity.map((activity: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm py-2 border-b last:border-b-0">
                      <span className="text-gray-700">{activity.description}</span>
                      <DateDisplay date={activity.timestamp} format="relative" className="text-gray-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No statistics available</p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
  };

  return (
    <div className={`card border ${colorClasses[color]}`}>
      <div className="flex items-center">
        <span className="text-3xl mr-3">{icon}</span>
        <div className="flex-1">
          <dt className="text-xs font-medium opacity-75">{title}</dt>
          <dd className="text-2xl font-bold">{value}</dd>
        </div>
      </div>
    </div>
  );
};
