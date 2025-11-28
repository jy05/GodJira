import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { notificationApi, getNotificationColor, NotificationType, Notification } from '@/services/notification.service';
import { NotificationIcon } from '@/components/NotificationIcon';
import { Layout } from '@/components/Layout';
import { formatDistanceToNow } from 'date-fns';

export const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<NotificationType | 'ALL'>('ALL');
  const [filterRead, setFilterRead] = useState<'ALL' | 'READ' | 'UNREAD'>('ALL');
  const limit = 20;

  // Build filters
  const filters: any = { skip: (page - 1) * limit, take: limit };
  if (filterType !== 'ALL') filters.type = filterType;
  if (filterRead !== 'ALL') filters.isRead = filterRead === 'READ';

  // Fetch notifications
  const { data, isLoading } = useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationApi.getNotifications(filters),
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this notification?')) {
      deleteMutation.mutate(id);
    }
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          {data && data.data.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as NotificationType | 'ALL');
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="ALL">All Types</option>
                <option value="ISSUE_ASSIGNED">Issue Assigned</option>
                <option value="ISSUE_UPDATED">Issue Updated</option>
                <option value="ISSUE_COMMENTED">Issue Commented</option>
                <option value="ISSUE_MENTIONED">Issue Mentioned</option>
                <option value="ISSUE_STATUS_CHANGED">Status Changed</option>
                <option value="SPRINT_STARTED">Sprint Started</option>
                <option value="SPRINT_COMPLETED">Sprint Completed</option>
                <option value="TEAM_ADDED">Team Added</option>
                <option value="WATCHER_ADDED">Watcher Added</option>
              </select>
            </div>

            {/* Read Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterRead}
                onChange={(e) => {
                  setFilterRead(e.target.value as 'ALL' | 'READ' | 'UNREAD');
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="ALL">All</option>
                <option value="UNREAD">Unread</option>
                <option value="READ">Read</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading notifications...
            </div>
          ) : data && data.data.length > 0 ? (
            <>
              <div className="divide-y divide-gray-200">
                {data.data.map((notification: Notification) => {
                  const colorClass = getNotificationColor(notification.type);
                  const linkTo = notification.metadata?.issueKey
                    ? `/issues/${notification.metadata.issueKey}`
                    : notification.metadata?.sprintId
                    ? `/sprints/${notification.metadata.sprintId}`
                    : notification.metadata?.teamId
                    ? `/teams/${notification.metadata.teamId}`
                    : null;

                  const content = (
                    <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 ${colorClass} rounded-full flex items-center justify-center`}>
                        <NotificationIcon type={notification.type} className="w-5 h-5 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full" title="Unread"></div>
                            )}
                            <button
                              onClick={(e) => handleDelete(e, notification.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              aria-label="Delete notification"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );

                  if (linkTo) {
                    return (
                      <Link
                        key={notification.id}
                        to={linkTo}
                        onClick={() => handleNotificationClick(notification)}
                        className={!notification.isRead ? 'bg-blue-50' : ''}
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={!notification.isRead ? 'bg-blue-50' : ''}
                    >
                      {content}
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {page} of {totalPages} ({data.total} total notifications)
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No notifications found
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
