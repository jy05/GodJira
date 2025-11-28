import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import {
  auditApi,
  AuditLog,
  AuditAction,
  AuditEntityType,
  getActionText,
  getEntityDisplayName,
  getActionColor,
} from '@/services/audit.service';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export const AuditLogsPage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState<AuditAction | 'ALL'>('ALL');
  const [filterEntityType, setFilterEntityType] = useState<AuditEntityType | 'ALL'>('ALL');
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const limit = 20;

  // Check if user is admin
  if (user?.role !== 'ADMIN') {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto text-center py-12">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            You must be an administrator to view audit logs.
          </p>
        </div>
      </Layout>
    );
  }

  // Build filters
  const filters: any = { skip: (page - 1) * limit, take: limit };
  if (filterAction !== 'ALL') filters.action = filterAction;
  if (filterEntityType !== 'ALL') filters.entityType = filterEntityType;
  if (filterUserId) filters.userId = filterUserId;

  // Fetch audit logs
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditApi.getAuditLogs(filters),
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
  };

  const parseChanges = (changesStr: string) => {
    try {
      return JSON.parse(changesStr);
    } catch {
      return null;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600 mt-1">
              Track all system changes and user activities
            </p>
          </div>
          {data && (
            <div className="text-sm text-gray-600">
              {data.total} total logs
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <select
                value={filterAction}
                onChange={(e) => {
                  setFilterAction(e.target.value as AuditAction | 'ALL');
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="ALL">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="STATUS_CHANGE">Status Change</option>
                <option value="ASSIGN">Assign</option>
                <option value="COMMENT">Comment</option>
              </select>
            </div>

            {/* Entity Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entity Type
              </label>
              <select
                value={filterEntityType}
                onChange={(e) => {
                  setFilterEntityType(e.target.value as AuditEntityType | 'ALL');
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="ALL">All Types</option>
                <option value="ISSUE">Issue</option>
                <option value="PROJECT">Project</option>
                <option value="SPRINT">Sprint</option>
                <option value="USER">User</option>
                <option value="TEAM">Team</option>
                <option value="COMMENT">Comment</option>
                <option value="WORKLOG">Work Log</option>
                <option value="ATTACHMENT">Attachment</option>
              </select>
            </div>

            {/* User ID Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID (optional)
              </label>
              <input
                type="text"
                value={filterUserId}
                onChange={(e) => {
                  setFilterUserId(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter by user ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading audit logs...
            </div>
          ) : data && data.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Timestamp
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Entity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        IP Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.data.map((log: AuditLog) => {
                      const color = getActionColor(log.action);
                      return (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                            <div className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                color === 'green'
                                  ? 'bg-green-100 text-green-800'
                                  : color === 'blue'
                                  ? 'bg-blue-100 text-blue-800'
                                  : color === 'red'
                                  ? 'bg-red-100 text-red-800'
                                  : color === 'yellow'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : color === 'purple'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {getActionText(log.action)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div className="font-medium">{getEntityDisplayName(log.entityType)}</div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {log.entityId}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                            {log.userName || log.userId}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {log.ipAddress || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            <button
                              onClick={() => handleViewDetails(log)}
                              className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {page} of {totalPages} ({data.total} total logs)
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">No audit logs found</div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Audit Log Details
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                <p className="text-sm text-gray-900 font-mono">{selectedLog.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                  <p className="text-sm text-gray-900">{getActionText(selectedLog.action)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
                  <p className="text-sm text-gray-900">{getEntityDisplayName(selectedLog.entityType)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entity ID</label>
                <p className="text-sm text-gray-900 font-mono">{selectedLog.entityId}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                  <p className="text-sm text-gray-900">{selectedLog.userName}</p>
                  <p className="text-xs text-gray-500 font-mono">{selectedLog.userId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                  <p className="text-sm text-gray-900">{selectedLog.ipAddress || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                <p className="text-sm text-gray-900">
                  {format(new Date(selectedLog.createdAt), 'MMMM d, yyyy HH:mm:ss')}
                </p>
              </div>

              {selectedLog.userAgent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Agent</label>
                  <p className="text-sm text-gray-600 break-all">{selectedLog.userAgent}</p>
                </div>
              )}

              {selectedLog.changes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Changes</label>
                  <pre className="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto">
                    {typeof selectedLog.changes === 'string'
                      ? JSON.stringify(parseChanges(selectedLog.changes), null, 2)
                      : JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
