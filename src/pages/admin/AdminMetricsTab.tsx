import React from 'react';
import { AdminMetrics, LearnerRequest, AdminAction } from '../../types';
import { formatUGX, formatShortDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/ui/Badge';
import { SectionHeader, StatRow } from '../../components/dashboard';
import { CreditCard, ShieldCheck, Users, Clock } from 'lucide-react';

interface AdminMetricsTabProps {
  metrics: AdminMetrics | null;
  totalUsersCount: number;
  learnerRequests: LearnerRequest[];
  auditLogs: AdminAction[];
  onNavigateTab: (tabId: 'matchmaker' | 'audit') => void;
}

export const AdminMetricsTab: React.FC<AdminMetricsTabProps> = ({
  metrics,
  totalUsersCount,
  learnerRequests,
  auditLogs,
  onNavigateTab
}) => {
  return (
    <div className="space-y-6">
      <StatRow stats={[
        { label: 'Registered platform users', value: totalUsersCount, detail: 'Learners, educators & admins', icon: Users },
        { label: 'Active educators', value: metrics?.activeEducators || 0, detail: 'Verified and available', icon: ShieldCheck },
        { label: 'Pending verification', value: metrics?.pendingApplications || 0, detail: 'Requires admin review', icon: Clock, accent: 'amber' },
        { label: 'Escrow volume', value: formatUGX(metrics?.totalVolumeUgx || 0), detail: 'Protected learner payments', icon: CreditCard }
      ]} />

      {/* Quick Operations Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Open Custom Skill Requests ({learnerRequests.filter(r => r.status === 'open').length})
            </h3>
            <button
              onClick={() => onNavigateTab('matchmaker')}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Open Matchmaker
            </button>
          </div>

          <div className="space-y-3">
            {learnerRequests.slice(0, 3).map(r => (
              <div key={r.id} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900">{r.skill_name}</div>
                  <div className="text-gray-500 text-[11px]">{r.learner_name} • {r.location} • Budget: {formatUGX(r.budget_ugx)}</div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Recent Audit Actions
            </h3>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs font-bold text-slate-700 hover:underline"
            >
              View Full Audit
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 3).map(log => (
              <div key={log.id} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-gray-900">
                  <span>{log.action_type.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] text-gray-400">{formatShortDate(log.created_at)}</span>
                </div>
                <p className="text-gray-600 text-[11px]">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMetricsTab;
