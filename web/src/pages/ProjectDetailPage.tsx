import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { projectApi } from '@/services/project.service';
import { analyticsApi } from '@/services/analytics.service';

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectApi.getProject(id!),
    enabled: !!id,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['project-stats', id],
    queryFn: () => projectApi.getProjectStatistics(id!),
    enabled: !!id,
  });

  const { data: projectSummary } = useQuery({
    queryKey: ['project-summary', id],
    queryFn: () => analyticsApi.getProjectSummary(id!),
    enabled: !!id,
  });

  if (projectLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading project...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Project not found</h3>
            <button
              onClick={() => navigate('/projects')}
              className="mt-4 btn btn-primary"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 sm:px-0 mb-6">
          <button
            onClick={() => navigate('/projects')}
            className="mb-4 text-sm text-primary-600 hover:text-primary-500 flex items-center"
          >
            ← Back to Projects
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-primary-100 text-primary-800">
                  {project.key}
                </span>
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              </div>
              {project.description && (
                <p className="mt-2 text-sm text-gray-600">{project.description}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Created on {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => navigate(`/projects/${id}/sprints`)}
              className="btn btn-primary"
            >
              View Sprints
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="px-4 sm:px-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Statistics</h2>
          {statsLoading ? (
            <div className="text-sm text-gray-500">Loading statistics...</div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  title="Total Issues"
                  value={stats.totalIssues}
                  icon="📋"
                  color="blue"
                />
                <StatCard
                  title="Completed Issues"
                  value={stats.completedIssues}
                  icon="✅"
                  color="green"
                />
                <StatCard
                  title="Active Issues"
                  value={stats.activeIssues}
                  icon="🔄"
                  color="yellow"
                />
                <StatCard
                  title="Total Sprints"
                  value={stats.totalSprints}
                  icon="🏃"
                  color="purple"
                />
                <StatCard
                  title="Active Sprints"
                  value={stats.activeSprints}
                  icon="⚡"
                  color="indigo"
                />
                <StatCard
                  title="Completed Sprints"
                  value={stats.completedSprints}
                  icon="🏁"
                  color="green"
                />
              </div>

              {/* Velocity & AGILE Metrics */}
              {projectSummary && (
                <div className="mt-6 card">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">AGILE Metrics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <dt className="text-gray-500">Average Velocity</dt>
                      <dd className="mt-1 text-2xl font-semibold text-gray-900">
                        {projectSummary.velocity.average.toFixed(1)} pts/sprint
                      </dd>
                      <dd className="text-xs text-gray-500">
                        Trend: <span className={projectSummary.velocity.trend === 'INCREASING' ? 'text-green-600' : projectSummary.velocity.trend === 'DECREASING' ? 'text-red-600' : 'text-gray-600'}>
                          {projectSummary.velocity.trend}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Commitment Accuracy</dt>
                      <dd className="mt-1 text-2xl font-semibold text-gray-900">
                        {projectSummary.completionRate.toFixed(0)}%
                      </dd>
                      <dd className="text-xs text-gray-500">
                        How well we estimate
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Issue Health</dt>
                      <dd className="mt-1 text-2xl font-semibold text-gray-900">
                        {projectSummary.issues.averageAge.toFixed(0)} days
                      </dd>
                      <dd className="text-xs text-gray-500">
                        Average issue age ({projectSummary.issues.staleCount} stale)
                      </dd>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-500">No statistics available</div>
          )}
        </div>

        {/* Project Info */}
        <div className="px-4 sm:px-0 mt-8">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Project Key</dt>
                <dd className="mt-1 text-sm text-gray-900">{project.key}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Project Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{project.name}</dd>
              </div>
              {project.description && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{project.description}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(project.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(project.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'indigo';
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
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
          </dl>
        </div>
      </div>
    </div>
  );
};
