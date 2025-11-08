import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import watcherApi from '@/services/watcher.service';

interface WatchedIssue {
  id: string;
  key: string;
  title: string;
  status: string; // IssueStatus enum
  priority: string; // IssuePriority enum
  assignee?: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

const getPriorityColor = (priority?: string) => {
  if (!priority) return 'bg-gray-100 text-gray-800';
  
  const lower = priority.toLowerCase();
  if (lower === 'critical' || lower === 'highest') return 'bg-red-100 text-red-800';
  if (lower === 'high') return 'bg-orange-100 text-orange-800';
  if (lower === 'medium') return 'bg-yellow-100 text-yellow-800';
  if (lower === 'low' || lower === 'lowest') return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-800';
};

const getStatusColor = (status: string) => {
  const lower = status.toLowerCase();
  if (lower === 'todo' || lower === 'backlog') return 'bg-gray-100 text-gray-800';
  if (lower === 'in_progress' || lower.includes('progress')) return 'bg-blue-100 text-blue-800';
  if (lower === 'done' || lower === 'completed') return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-800';
};

export const MyWatchedIssues: React.FC = () => {
  const { data: watchedIssues = [], isLoading } = useQuery<WatchedIssue[]>({
    queryKey: ['my-watched-issues'],
    queryFn: () => watcherApi.getMyWatchedIssues(),
  });

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">My Watched Issues</h3>
          </div>
        </div>
        <div className="text-center py-8 text-gray-500">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">My Watched Issues</h3>
          <span className="text-sm text-gray-500">({watchedIssues.length})</span>
        </div>
      </div>

      {watchedIssues.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <p className="text-sm">You're not watching any issues yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Click the watch button on any issue to get notifications about updates
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {watchedIssues.map((issue) => (
            <Link
              key={issue.id}
              to={`/issues/${issue.id}`}
              className="block p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-500 font-medium">
                      {issue.key}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(issue.status)}`}>
                      {issue.status}
                    </span>
                    {issue.priority && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {issue.title}
                  </h4>
                </div>
                {issue.assignee && (
                  <div className="flex-shrink-0">
                    {issue.assignee.avatar ? (
                      <img
                        src={issue.assignee.avatar}
                        alt={issue.assignee.name}
                        title={`Assigned to ${issue.assignee.name}`}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-medium"
                        title={`Assigned to ${issue.assignee.name}`}
                      >
                        {issue.assignee.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {watchedIssues.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            to="/issues?filter=watched"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all watched issues →
          </Link>
        </div>
      )}
    </div>
  );
};
