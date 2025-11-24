import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface BurndownData {
  date: string;
  ideal: number;
  actual: number;
}

interface BurndownChartProps {
  data: BurndownData[];
  className?: string;
}

/**
 * Burndown Chart Component
 * Shows ideal vs actual story points remaining over time
 */
export const BurndownChart = ({ data, className = '' }: BurndownChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-sm text-gray-500">No burndown data available</p>
      </div>
    );
  }

  const formattedData = data.map(point => ({
    ...point,
    dateFormatted: format(new Date(point.date), 'MMM dd'),
  }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="dateFormatted" 
            label={{ value: 'Date', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value} pts`, '']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="ideal" 
            stroke="#94a3b8" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Ideal Burndown"
            dot={{ fill: '#94a3b8', r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Actual Progress"
            dot={{ fill: '#3b82f6', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium">How to read this chart:</p>
        <ul className="mt-2 space-y-1 text-xs">
          <li><span className="inline-block w-3 h-3 bg-gray-400 mr-2"></span>Ideal: Expected burndown at constant pace</li>
          <li><span className="inline-block w-3 h-3 bg-blue-500 mr-2"></span>Actual: Real story points remaining</li>
          <li className="mt-2">📈 Above ideal = Behind schedule | 📉 Below ideal = Ahead of schedule</li>
        </ul>
      </div>
    </div>
  );
};

interface BurndownSummary {
  totalStoryPoints: number;
  completedStoryPoints: number;
  remainingStoryPoints: number;
  percentComplete: number;
  daysRemaining: number;
  projectedCompletion: string | null;
}

interface BurndownChartWithSummaryProps {
  data: BurndownData[];
  summary?: BurndownSummary;
  className?: string;
}

/**
 * Burndown Chart with Summary Stats
 */
export const BurndownChartWithSummary = ({ 
  data, 
  summary, 
  className = '' 
}: BurndownChartWithSummaryProps) => {
  return (
    <div className={className}>
      <BurndownChart data={data} />
      
      {summary && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <dt className="text-xs text-gray-600">Total Points</dt>
            <dd className="mt-1 text-2xl font-semibold text-blue-900">
              {summary.totalStoryPoints}
            </dd>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <dt className="text-xs text-gray-600">Completed</dt>
            <dd className="mt-1 text-2xl font-semibold text-green-900">
              {summary.completedStoryPoints}
            </dd>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <dt className="text-xs text-gray-600">Remaining</dt>
            <dd className="mt-1 text-2xl font-semibold text-yellow-900">
              {summary.remainingStoryPoints}
            </dd>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <dt className="text-xs text-gray-600">Progress</dt>
            <dd className="mt-1 text-2xl font-semibold text-purple-900">
              {summary.percentComplete}%
            </dd>
          </div>
        </div>
      )}
    </div>
  );
};
