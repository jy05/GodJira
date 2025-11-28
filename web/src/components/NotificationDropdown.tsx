import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { notificationApi, getNotificationColor } from '@/services/notification.service';
import { NotificationIcon } from './NotificationIcon';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown = ({ onClose }: NotificationDropdownProps) => {
  const queryClient = useQueryClient();

  // Fetch recent notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', { page: 1, limit: 10 }],
    queryFn: () => notificationApi.getNotifications({ page: 1, limit: 10 }),
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

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
    // Navigate to the notification link if available
    if (notification.link) {
      onClose();
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        {notifications && notifications.data.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-gray-500">
            Loading notifications...
          </div>
        ) : notifications && notifications.data.length > 0 ? (
          notifications.data.map((notification: any) => {
            const colorClass = getNotificationColor(notification.type);

            return (
              <div
                key={notification.id}
                className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                {notification.link ? (
                  <Link
                    to={notification.link}
                    onClick={() => handleNotificationClick(notification)}
                    className="block"
                  >
                    <NotificationContent
                      notification={notification}
                      colorClass={colorClass}
                      onDelete={handleDelete}
                    />
                  </Link>
                ) : (
                  <div onClick={() => handleNotificationClick(notification)}>
                    <NotificationContent
                      notification={notification}
                      colorClass={colorClass}
                      onDelete={handleDelete}
                    />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="px-4 py-8 text-center text-gray-500">
            No notifications yet
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 text-center">
        <Link
          to="/notifications"
          onClick={onClose}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
};

interface NotificationContentProps {
  notification: any;
  colorClass: string;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

const NotificationContent = ({ notification, colorClass, onDelete }: NotificationContentProps) => {
  return (
    <div className="flex items-start space-x-3">
      {/* Icon */}
      <div className={`flex-shrink-0 w-8 h-8 ${colorClass} rounded-full flex items-center justify-center`}>
        <NotificationIcon type={notification.type} className="w-4 h-4 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 font-medium">{notification.title}</p>
        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Delete Button */}
      <button
        onClick={(e) => onDelete(e, notification.id)}
        className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
        aria-label="Delete notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Unread Indicator */}
      {!notification.read && (
        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></div>
      )}
    </div>
  );
};
