import React from 'react';
import { AdminAction } from '../../types';
import { formatShortDate } from '../../utils/formatters';

interface AdminAuditTabProps {
  auditLogs: AdminAction[];
}

export const AdminAuditTab: React.FC<AdminAuditTabProps> = ({ auditLogs }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-base font-bold text-gray-900">Administrative Audit Trail & Security Logs</h2>
        <p className="text-xs text-gray-500">
          Immutable operational record of all verification decisions, matches, and secondary admin appointments.
        </p>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Admin</th>
              <th className="p-3">Action Type</th>
              <th className="p-3">Entity Target</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {auditLogs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50/50">
                <td className="p-3 text-gray-500">{formatShortDate(log.created_at)}</td>
                <td className="p-3 font-semibold text-gray-900">{log.admin_name}</td>
                <td className="p-3 font-mono font-bold text-slate-800">{log.action_type}</td>
                <td className="p-3 text-gray-600">{log.target_entity} #{log.target_id}</td>
                <td className="p-3 text-gray-700 max-w-sm">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="md:hidden space-y-3">
        {auditLogs.map(log => (
          <div key={log.id} className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-slate-800">{log.action_type}</span>
              <span className="text-gray-500">{formatShortDate(log.created_at)}</span>
            </div>
            <div className="text-xs"><span className="text-gray-500">Admin:</span> <span className="font-semibold text-gray-900">{log.admin_name}</span> • <span className="text-gray-600">{log.target_entity} #{log.target_id}</span></div>
            <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">{log.details}</div>
          </div>
        ))}
        {auditLogs.length===0 && <div className="text-center py-8 text-xs text-gray-400">No audit records yet.</div>}
      </div>
    </div>
  );
};

export default AdminAuditTab;
