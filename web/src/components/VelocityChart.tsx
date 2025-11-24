import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';

interface VelocityData {
  sprintName: string;
  planned: number;
  completed: number;
}

interface VelocityChartProps {
  data: VelocityData[];
  average?: number;
  trend?: 'INCREASING' | 'DECREASING' | 'STABLE';
  className?: string;
}

/**
 * Velocity Chart Component
 * Shows planned vs completed story points per sprint
 */
export const VelocityChart = ({ 
  data, 
  average, 
  trend,
  className = '' 
}: VelocityChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-sm text-gray-500">No velocity data available</p>
      </div>
    );
  }

  // Prepare data with average line
  const chartData = data.map(point => ({
    ...point,
    average: average || 0,
  }));

  const getTrendEmoji = (trend?: string) => {
    switch (trend) {
      case 'INCREASING': return '📈';
      case 'DECREASING': return '📉';
      case 'STABLE': return '➡️';
      default: return '';
    }
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="sprintName" 
            label={{ value: 'Sprint', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'average') return [`${value} pts (avg)`, 'Average'];
              return [`${value} pts`, name === 'planned' ? 'Planned' : 'Completed'];
            }}
          />
          <Legend />
          <Bar 
            dataKey="planned" 
            fill="#94a3b8" 
            name="Planned"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="completed" 
            fill="#3b82f6" 
            name="Completed"
            radius={[4, 4, 0, 0]}
          />
          {average && (
            <Line 
              type="monotone" 
              dataKey="average" 
              stroke="#10b981" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Average Velocity"
              dot={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {average && (
          <div className="p-3 bg-green-50 rounded-lg">
            <dt className="text-xs text-gray-600">Average Velocity</dt>
            <dd className="text-2xl font-semibold text-green-900">
              {average.toFixed(1)} pts/sprint
            </dd>
          </div>
        )}
        {trend && (
          <div className={`p-3 rounded-lg ${
            trend === 'INCREASING' ? 'bg-blue-50' : 
            trend === 'DECREASING' ? 'bg-orange-50' : 'bg-gray-50'
          }`}>
            <dt className="text-xs text-gray-600">Trend</dt>
            <dd className={`text-2xl font-semibold ${
              trend === 'INCREASING' ? 'text-blue-900' : 
              trend === 'DECREASING' ? 'text-orange-900' : 'text-gray-900'
            }`}>
              {getTrendEmoji(trend)} {trend}
            </dd>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium">Velocity Metrics:</p>
        <ul className="mt-2 space-y-1 text-xs">
          <li><span className="inline-block w-3 h-3 bg-gray-400 mr-2"></span>Planned: Story points committed at sprint start</li>
          <li><span className="inline-block w-3 h-3 bg-blue-500 mr-2"></span>Completed: Story points finished by sprint end</li>
          {average && <li><span className="inline-block w-3 h-3 bg-green-500 mr-2"></span>Average: Team's typical velocity (for planning)</li>}
          <li className="mt-2">💡 Use velocity to plan future sprints more accurately</li>
        </ul>
      </div>
    </div>
  );
};

interface CommitmentAccuracy {
  sprints: number;
  averageCommitment: number;
  averageCompletion: number;
  accuracyRate: number;
}

interface VelocityChartWithInsightsProps {
  data: VelocityData[];
  average?: number;
  trend?: 'INCREASING' | 'DECREASING' | 'STABLE';
  commitmentAccuracy?: CommitmentAccuracy;
  className?: string;
}

/**
 * Velocity Chart with Team Insights
 */
export const VelocityChartWithInsights = ({ 
  data, 
  average, 
  trend,
  commitmentAccuracy,
  className = '' 
}: VelocityChartWithInsightsProps) => {
  return (
    <div className={className}>
      <VelocityChart data={data} average={average} trend={trend} />
      
      {commitmentAccuracy && (
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
          <h4 className="text-sm font-semibold text-indigo-900 mb-3">Team Commitment Accuracy</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <dt className="text-xs text-indigo-700">Sprints Analyzed</dt>
              <dd className="text-lg font-semibold text-indigo-900">{commitmentAccuracy.sprints}</dd>
            </div>
            <div>
              <dt className="text-xs text-indigo-700">Avg Planned</dt>
              <dd className="text-lg font-semibold text-indigo-900">
                {commitmentAccuracy.averageCommitment.toFixed(1)} pts
              </dd>
            </div>
            <div>
              <dt className="text-xs text-indigo-700">Avg Delivered</dt>
              <dd className="text-lg font-semibold text-indigo-900">
                {commitmentAccuracy.averageCompletion.toFixed(1)} pts
              </dd>
            </div>
            <div>
              <dt className="text-xs text-indigo-700">Accuracy Rate</dt>
              <dd className="text-lg font-semibold text-indigo-900">
                {commitmentAccuracy.accuracyRate.toFixed(0)}%
              </dd>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
