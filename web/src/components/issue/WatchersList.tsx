import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import watcherApi, { type Watcher } from '@/services/watcher.service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface WatchersListProps {
  issueId: string;
}

export const WatchersList: React.FC<WatchersListProps> = ({ issueId }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showWatchers, setShowWatchers] = useState(false);

  // Fetch watcher count (used when collapsed)
  const { data: watcherCount = 0 } = useQuery<number>({
    queryKey: ['watcher-count', issueId],
    queryFn: () => watcherApi.getWatcherCount(issueId),
    enabled: !showWatchers, // Only fetch count when collapsed
  });

  // Fetch full watcher list (only when expanded)
  const { data: watchers = [], isLoading: watchersLoading } = useQuery<Watcher[]>({
    queryKey: ['watchers', issueId],
    queryFn: () => watcherApi.getIssueWatchers(issueId),
    enabled: showWatchers, // Only fetch full list when expanded
  });

  const { data: isWatching = false } = useQuery<boolean>({
    queryKey: ['is-watching', issueId],
    queryFn: () => watcherApi.isWatching(issueId),
  });

  // Watch mutation
  const watchMutation = useMutation({
    mutationFn: () => watcherApi.watchIssue(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchers', issueId] });
      queryClient.invalidateQueries({ queryKey: ['is-watching', issueId] });
      queryClient.invalidateQueries({ queryKey: ['watcher-count', issueId] });
      toast.success('You are now watching this issue');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to watch issue');
    },
  });

  // Unwatch mutation
  const unwatchMutation = useMutation({
    mutationFn: () => watcherApi.unwatchIssue(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchers', issueId] });
      queryClient.invalidateQueries({ queryKey: ['is-watching', issueId] });
      queryClient.invalidateQueries({ queryKey: ['watcher-count', issueId] });
      toast.success('You are no longer watching this issue');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unwatch issue');
    },
  });

  const toggleWatch = () => {
    if (isWatching) {
      unwatchMutation.mutate();
    } else {
      watchMutation.mutate();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h4 className="font-medium text-gray-900">
            Watchers ({showWatchers ? watchers.length : watcherCount})
          </h4>
        </div>
        <button
          onClick={() => setShowWatchers(!showWatchers)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {showWatchers ? 'Hide' : 'Show'}
        </button>
      </div>

      {/* Watch/Unwatch Button */}
      <button
        onClick={toggleWatch}
        disabled={watchMutation.isPending || unwatchMutation.isPending}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isWatching
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {isWatching ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Watching
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
            Watch
          </>
        )}
      </button>

      {/* Watchers List */}
      {showWatchers && (
        <div className="mt-4 space-y-2">
          {watchersLoading ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              Loading watchers...
            </div>
          ) : watchers.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              No watchers yet
            </div>
          ) : (
            watchers.map((watcher) => (
              <div
                key={watcher.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {watcher.user.avatar ? (
                    <img
                      src={watcher.user.avatar}
                      alt={watcher.user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                      {getInitials(watcher.user.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {watcher.user.name}
                    </p>
                    {watcher.user.jobTitle && (
                      <p className="text-xs text-gray-500 truncate">
                        {watcher.user.jobTitle}
                      </p>
                    )}
                  </div>
                </div>
                {user?.id === watcher.userId && (
                  <button
                    onClick={() => unwatchMutation.mutate()}
                    disabled={unwatchMutation.isPending}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Remove yourself as watcher"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Watcher Count Badge (when collapsed) */}
      {!showWatchers && watcherCount > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-sm text-gray-600">
              {watcherCount} {watcherCount === 1 ? 'person' : 'people'} watching
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
