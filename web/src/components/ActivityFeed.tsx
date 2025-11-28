import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { auditApi, getActionText, getEntityDisplayName, getActionColor } from '@/services/audit.service';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  limit?: number;
  projectId?: string;
}

export const ActivityFeed = ({ limit = 10, projectId }: ActivityFeedProps) => {
  // Fetch recent activity
  const { data, isLoading } = useQuery({
    queryKey: ['activity-feed', { limit, projectId }],
    queryFn: () => auditApi.getActivityFeed({ take: limit, projectId }),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-4 text-gray-500">Loading activity...</div>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-4 text-gray-500">No recent activity</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Link
          to="/audit"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {data.data.map((activity: any) => {
          const color = getActionColor(activity.action);
          const actionText = getActionText(activity.action);
          const entityName = getEntityDisplayName(activity.entityType);

          return (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {/* Action Badge */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  color === 'green'
                    ? 'bg-green-100'
                    : color === 'blue'
                    ? 'bg-blue-100'
                    : color === 'red'
                    ? 'bg-red-100'
                    : color === 'yellow'
                    ? 'bg-yellow-100'
                    : color === 'purple'
                    ? 'bg-purple-100'
                    : 'bg-gray-100'
                }`}
              >
                {color === 'green' ? (
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                ) : color === 'blue' ? (
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ) : color === 'red' ? (
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : color === 'yellow' ? (
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              {/* Activity Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.userName}</span>
                  {' '}
                  <span className="text-gray-600">{actionText}</span>
                  {' '}
                  <span className="font-medium">{entityName.toLowerCase()}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
