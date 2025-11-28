import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { worklogApi, parseTimeStringToMinutes, formatMinutesToHours } from '@/services/worklog.service';

interface WorkLogModalProps {
  issueId: string;
  issueKey: string;
  onClose: () => void;
}

export const WorkLogModal: React.FC<WorkLogModalProps> = ({ issueId, issueKey, onClose }) => {
  const queryClient = useQueryClient();
  const [timeInput, setTimeInput] = useState('');
  const [description, setDescription] = useState('');
  const [loggedAt, setLoggedAt] = useState(new Date().toISOString().split('T')[0]);
  const [timeMinutes, setTimeMinutes] = useState(0);

  const createWorkLogMutation = useMutation({
    mutationFn: worklogApi.createWorkLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worklogs', issueId] });
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] });
      queryClient.invalidateQueries({ queryKey: ['issue-total-time', issueId] });
      toast.success('Work log added successfully');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to log work');
    },
  });

  const handleTimeInputChange = (value: string) => {
    setTimeInput(value);
    if (value) {
      const minutes = parseTimeStringToMinutes(value);
      setTimeMinutes(minutes);
    } else {
      setTimeMinutes(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (timeMinutes <= 0) {
      toast.error('Please enter a valid time amount');
      return;
    }

    createWorkLogMutation.mutate({
      issueId,
      timeSpentMinutes: timeMinutes,
      description: description.trim() || undefined,
      loggedAt: new Date(loggedAt).toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Log Work</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">{issueKey}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="label">Time Spent *</label>
            <input
              type="text"
              value={timeInput}
              onChange={(e) => handleTimeInputChange(e.target.value)}
              className="input w-full"
              placeholder="e.g., 2h 30m, 2.5h, or 150m"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {timeMinutes > 0 ? (
                <span className="text-green-600 font-medium">
                  = {formatMinutesToHours(timeMinutes)} ({timeMinutes} minutes)
                </span>
              ) : (
                'Enter time in hours (h) and/or minutes (m)'
              )}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {['15m', '30m', '1h', '2h', '4h', '8h'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleTimeInputChange(preset)}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="label">Date *</label>
            <input
              type="date"
              value={loggedAt}
              onChange={(e) => setLoggedAt(e.target.value)}
              className="input w-full"
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="mb-6">
            <label className="label">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input w-full"
              rows={3}
              placeholder="What did you work on?"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createWorkLogMutation.isPending || timeMinutes <= 0}
              className="flex-1 btn btn-primary"
            >
              {createWorkLogMutation.isPending ? 'Logging...' : 'Log Work'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
