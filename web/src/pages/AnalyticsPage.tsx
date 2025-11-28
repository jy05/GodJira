import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { analyticsApi, IssueAgingReport, TeamCapacityReport } from '@/services/analytics.service';
import { projectApi } from '@/services/project.service';
import { teamApi } from '@/services/team.service';

export const AnalyticsPage = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  // Fetch projects for dropdown
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getProjects({ skip: 0, take: 100 }),
  });

  // Fetch teams for dropdown
  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamApi.getTeams(),
  });

  // Fetch issue aging report
  const { data: issueAgingData, isLoading: isAgingLoading } = useQuery<IssueAgingReport>({
    queryKey: ['issue-aging', selectedProjectId],
    queryFn: () => analyticsApi.getIssueAgingReport(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  // Fetch team capacity report
  const { data: teamCapacityData, isLoading: isCapacityLoading } = useQuery<TeamCapacityReport>({
    queryKey: ['team-capacity', selectedTeamId],
    queryFn: () => analyticsApi.getTeamCapacityReport(selectedTeamId),
    enabled: !!selectedTeamId,
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Selector for Issue Aging */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Project (Issue Aging)
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a project...</option>
                {projects?.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.key})
                  </option>
                ))}
              </select>
            </div>

            {/* Team Selector for Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Team (Capacity)
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a team...</option>
                {teams?.map((team: any) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Issue Aging Report */}
        {selectedProjectId && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Issue Aging Report
            </h2>

            {isAgingLoading ? (
              <div className="text-center py-8 text-gray-500">Loading aging data...</div>
            ) : issueAgingData ? (
              <div>
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Issues</p>
                    <p className="text-2xl font-bold text-gray-900">{issueAgingData.totalIssues}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Average Age</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(issueAgingData.averageAgeDays)} days</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Median Age</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(issueAgingData.medianAgeDays)} days</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Stale Issues</p>
                    <p className="text-2xl font-bold text-gray-900">{issueAgingData.staleIssuesCount}</p>
                  </div>
                </div>

                {/* Age Distribution Chart */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Age Distribution</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>0-7 days</span>
                        <span className="font-medium">{issueAgingData.aged0to7Days.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full" 
                          style={{ width: `${(issueAgingData.aged0to7Days.length / issueAgingData.totalIssues) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>8-14 days</span>
                        <span className="font-medium">{issueAgingData.aged8to14Days.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full" 
                          style={{ width: `${(issueAgingData.aged8to14Days.length / issueAgingData.totalIssues) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>15-30 days</span>
                        <span className="font-medium">{issueAgingData.aged15to30Days.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-yellow-500 h-3 rounded-full" 
                          style={{ width: `${(issueAgingData.aged15to30Days.length / issueAgingData.totalIssues) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>30+ days (Stale)</span>
                        <span className="font-medium">{issueAgingData.aged30PlusDays.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-red-500 h-3 rounded-full" 
                          style={{ width: `${(issueAgingData.aged30PlusDays.length / issueAgingData.totalIssues) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stale Issues Table */}
                {issueAgingData.aged30PlusDays.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Stale Issues (30+ days old)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Update</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {issueAgingData.aged30PlusDays.slice(0, 10).map((issue: any) => (
                            <tr key={issue.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-primary-600">{issue.key}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{issue.title}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{issue.assigneeName || 'Unassigned'}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{issue.ageDays} days</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{issue.daysSinceUpdate} days ago</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select a project to view issue aging report
              </div>
            )}
          </div>
        )}

        {/* Team Capacity Report */}
        {selectedTeamId && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Team Capacity Report
            </h2>

            {isCapacityLoading ? (
              <div className="text-center py-8 text-gray-500">Loading capacity data...</div>
            ) : teamCapacityData ? (
              <div>
                {/* Team Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Team Size</p>
                    <p className="text-2xl font-bold text-gray-900">{teamCapacityData.teamSize}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Completed Points</p>
                    <p className="text-2xl font-bold text-gray-900">{teamCapacityData.totalCompletedPoints}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Team Utilization</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(teamCapacityData.teamUtilization)}%</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Avg Points/Member</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(teamCapacityData.averagePointsPerMember)}</p>
                  </div>
                </div>

                {/* Capacity Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Story Points Bar Chart */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Story Points by Member</h4>
                    <div className="space-y-3">
                      {teamCapacityData.members.map((member) => (
                        <div key={member.userId}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{member.userName}</span>
                            <span className="font-medium">{member.completedPoints + member.inProgressPoints} pts</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden">
                            <div 
                              className="bg-green-500 h-6 flex items-center justify-center text-xs text-white font-medium" 
                              style={{ width: `${(member.completedPoints / (member.completedPoints + member.inProgressPoints || 1)) * 100}%` }}
                            >
                              {member.completedPoints > 0 && member.completedPoints}
                            </div>
                            <div 
                              className="bg-blue-500 h-6 flex items-center justify-center text-xs text-white font-medium" 
                              style={{ width: `${(member.inProgressPoints / (member.completedPoints + member.inProgressPoints || 1)) * 100}%` }}
                            >
                              {member.inProgressPoints > 0 && member.inProgressPoints}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Completed</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span>In Progress</span>
                      </div>
                    </div>
                  </div>

                  {/* Utilization List */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Member Utilization</h4>
                    <div className="space-y-2">
                      {teamCapacityData.members.map((member) => (
                        <div key={member.userId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{member.userName}</span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              member.utilizationPercentage >= 80
                                ? 'bg-green-100 text-green-800'
                                : member.utilizationPercentage >= 50
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {Math.round(member.utilizationPercentage)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Member Details Table */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Member Capacity Details
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">In Progress</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Logged</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilization</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {teamCapacityData.members.map((member) => (
                          <tr key={member.userId} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{member.userName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{member.assignedPoints} pts</td>
                            <td className="px-4 py-3 text-sm text-green-600">{member.completedPoints} pts</td>
                            <td className="px-4 py-3 text-sm text-blue-600">{member.inProgressPoints} pts</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {Math.round(member.timeLoggedMinutes / 60)}h {member.timeLoggedMinutes % 60}m
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  member.utilizationPercentage >= 80
                                    ? 'bg-green-100 text-green-800'
                                    : member.utilizationPercentage >= 50
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {Math.round(member.utilizationPercentage)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select a team to view capacity report
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        {!selectedProjectId && !selectedTeamId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <svg
              className="w-12 h-12 text-blue-500 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Select Analytics to View
            </h3>
            <p className="text-gray-600">
              Choose a project to view issue aging analysis or select a team to view capacity reports.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};
