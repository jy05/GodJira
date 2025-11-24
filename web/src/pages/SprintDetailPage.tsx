import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { sprintApi } from '@/services/sprint.service';
import { analyticsApi } from '@/services/analytics.service';
import { DateDisplay, DateRange } from '@/components/DateDisplay';
import { BurndownChartWithSummary } from '@/components/BurndownChart';

export const SprintDetailPage = () => {
  const { projectId, sprintId } = useParams<{ projectId: string; sprintId: string }>();
  const navigate = useNavigate();

  const { data: sprint, isLoading: sprintLoading } = useQuery({
    queryKey: ['sprint', sprintId],
    queryFn: () => sprintApi.getSprint(sprintId!),
    enabled: !!sprintId,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['sprint-stats', sprintId],
    queryFn: () => sprintApi.getSprintStatistics(sprintId!),
    enabled: !!sprintId,
  });

  const { data: burndown } = useQuery({
    queryKey: ['burndown', sprintId],
    queryFn: () => analyticsApi.getBurndownChart(sprintId!),
    enabled: !!sprintId && sprint?.status === 'ACTIVE',
  });

  if (sprintLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading sprint...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!sprint) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Sprint not found</h3>
            <button
              onClick={() => navigate(`/projects/${projectId}/sprints`)}
              className="mt-4 btn btn-primary"
            >
              Back to Sprints
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-gray-100 text-gray-800';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 sm:px-0 mb-6">
          <button
            onClick={() => navigate(`/projects/${projectId}/sprints`)}
            className="mb-4 text-sm text-primary-600 hover:text-primary-500 flex items-center"
          >
            ← Back to Sprints
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{sprint.name}</h1>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                    sprint.status
                  )}`}
                >
                  {sprint.status}
                </span>
              </div>
              {sprint.goal && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Goal:</span> {sprint.goal}
                </p>
              )}
              {sprint.startDate && sprint.endDate && (
                <p className="text-xs text-gray-500">
                  <DateRange start={sprint.startDate} end={sprint.endDate} format="short" />
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        {statsLoading ? (
          <div className="px-4 sm:px-0 mb-6">
            <div className="text-sm text-gray-500">Loading statistics...</div>
          </div>
        ) : stats ? (
          <>
            {/* Story Points Overview */}
            <div className="px-4 sm:px-0 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sprint Progress</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  title="Story Points"
                  value={`${stats.storyPoints.completed} / ${stats.storyPoints.total}`}
                  subtitle={`${stats.storyPoints.completionRate}% Complete`}
                  color="blue"
                  icon="📊"
                />
                <MetricCard
                  title="Issues"
                  value={`${stats.summary.completedIssues} / ${stats.summary.totalIssues}`}
                  subtitle={`${stats.summary.completionRate}% Complete`}
                  color="green"
                  icon="✓"
                />
                <MetricCard
                  title="In Progress"
                  value={stats.summary.inProgressIssues.toString()}
                  subtitle="Currently active"
                  color="yellow"
                  icon="🔄"
                />
                <MetricCard
                  title="To Do"
                  value={stats.summary.todoIssues.toString()}
                  subtitle="Not started"
                  color="gray"
                  icon="□"
                />
              </div>
            </div>

            {/* Burndown Chart */}
            {burndown && sprint.status === 'ACTIVE' && (
              <div className="px-4 sm:px-0 mb-6">
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Burndown Chart</h2>
                  <BurndownChartWithSummary 
                    data={burndown.dataPoints || []}
                    summary={burndown.summary ? {
                      totalStoryPoints: burndown.summary.totalStoryPoints,
                      completedStoryPoints: burndown.summary.completedStoryPoints,
                      remainingStoryPoints: burndown.summary.remainingStoryPoints,
                      percentComplete: burndown.summary.completionRate || 0,
                      daysRemaining: 0,
                      projectedCompletion: null,
                    } : undefined}
                  />
                </div>
              </div>
            )}

            {/* Issue Breakdown */}
            <div className="px-4 sm:px-0">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Issue Breakdown</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {/* By Status */}
                <div className="card">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">By Status</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.breakdown.byStatus).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{status.replace('_', ' ')}</span>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Priority */}
                <div className="card">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">By Priority</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.breakdown.byPriority).map(([priority, count]) => (
                      <div key={priority} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{priority}</span>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Type */}
                <div className="card">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">By Type</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.breakdown.byType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{type}</span>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="px-4 sm:px-0">
            <div className="text-sm text-gray-500">No statistics available</div>
          </div>
        )}

        {/* Info Section */}
        <div className="px-4 sm:px-0 mt-8">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sprint Information</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Sprint Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{sprint.name}</dd>
              </div>
              {sprint.goal && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Sprint Goal</dt>
                  <dd className="mt-1 text-sm text-gray-900">{sprint.goal}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">{sprint.status}</dd>
              </div>
              {sprint.startDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <DateDisplay date={sprint.startDate} format="medium" />
                  </dd>
                </div>
              )}
              {sprint.endDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">End Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <DateDisplay date={sprint.endDate} format="medium" />
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <DateDisplay date={sprint.createdAt} format="medium" />
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: 'blue' | 'green' | 'yellow' | 'gray';
  icon: string;
}

const MetricCard = ({ title, value, subtitle, color, icon }: MetricCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    gray: 'bg-gray-50 text-gray-600',
  };

  return (
    <div className="card">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-2xl font-semibold text-gray-900">{value}</dd>
            <dd className="text-xs text-gray-500">{subtitle}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
};
