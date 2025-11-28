import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { worklogApi, formatMinutesToHours, type WorkLog } from '@/services/worklog.service';
import { useAuth } from '@/contexts/AuthContext';

interface WorkLogsListProps {
  issueId: string;
}

export const WorkLogsList: React.FC<WorkLogsListProps> = ({ issueId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Fetch work logs for the issue
  const { data: workLogs, isLoading } = useQuery({
    queryKey: ['worklogs', issueId],
    queryFn: () => worklogApi.getIssueWorkLogs(issueId),
  });

  // Fetch total time for the issue
  const { data: totalTime } = useQuery({
    queryKey: ['issue-total-time', issueId],
    queryFn: () => worklogApi.getIssueTotalTime(issueId),
  });

  // Delete work log mutation
  const deleteMutation = useMutation({
    mutationFn: worklogApi.deleteWorkLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worklogs', issueId] });
      queryClient.invalidateQueries({ queryKey: ['issue-total-time', issueId] });
      toast.success('Work log deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete work log');
    },
  });

  // Update work log mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { timeSpentMinutes?: number; description?: string } }) =>
      worklogApi.updateWorkLog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worklogs', issueId] });
      queryClient.invalidateQueries({ queryKey: ['issue-total-time', issueId] });
      toast.success('Work log updated');
      setEditingId(null);
      setEditTime('');
      setEditDescription('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update work log');
    },
  });

  const handleDelete = (log: WorkLog) => {
    if (window.confirm('Are you sure you want to delete this work log?')) {
      deleteMutation.mutate(log.id);
    }
  };

  const startEdit = (log: WorkLog) => {
    setEditingId(log.id);
    setEditTime(formatMinutesToHours(log.timeSpentMinutes));
    setEditDescription(log.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTime('');
    setEditDescription('');
  };

  const saveEdit = (logId: string) => {
    // Parse time input (simple parsing for now)
    const hoursMatch = editTime.match(/(\d+)h/);
    const minutesMatch = editTime.match(/(\d+)m/);
    let totalMinutes = 0;
    if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60;
    if (minutesMatch) totalMinutes += parseInt(minutesMatch[1]);

    if (totalMinutes <= 0) {
      toast.error('Please enter a valid time');
      return;
    }

    updateMutation.mutate({
      id: logId,
      data: {
        timeSpentMinutes: totalMinutes,
        description: editDescription.trim() || undefined,
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Total Time Header */}
      {totalTime && totalTime.totalMinutes > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Time Logged:</span>
          <span className="text-lg font-bold text-blue-600">
            {formatMinutesToHours(totalTime.totalMinutes)}
          </span>
        </div>
      )}

      {/* Work Logs List */}
      {!workLogs || workLogs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>No work logged yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workLogs.map((log) => (
            <div
              key={log.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              {editingId === log.id ? (
                // Edit Mode
                <div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Time Spent</label>
                      <input
                        type="text"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="input w-full text-sm"
                        placeholder="e.g., 2h 30m"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Date</label>
                      <input
                        type="text"
                        value={formatDate(log.loggedAt)}
                        className="input w-full text-sm bg-gray-100"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="text-xs text-gray-600 block mb-1">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="input w-full text-sm"
                      rows={2}
                      placeholder="What did you work on?"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => saveEdit(log.id)}
                      className="btn btn-primary btn-sm"
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {log.user.avatar ? (
                        <img
                          src={log.user.avatar}
                          alt={log.user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-semibold">
                          {log.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{log.user.name}</p>
                        <p className="text-xs text-gray-500">{formatDate(log.loggedAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">
                        {formatMinutesToHours(log.timeSpentMinutes)}
                      </p>
                      {user?.id === log.userId && (
                        <div className="flex space-x-2 mt-1">
                          <button
                            onClick={() => startEdit(log)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(log)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {log.description && (
                    <p className="text-sm text-gray-700 ml-11 mt-2">{log.description}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
