import React from 'react';
import { AdminMetrics, AdminAction } from '../../types';
import { formatUGX, formatShortDate } from '../../utils/formatters';
import { StatRow } from '../../components/dashboard';
import { CreditCard, ShieldCheck, Users, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

export type AdminTabId = 'metrics' | 'users' | 'interests' | 'verification' | 'matchmaker' | 'educators' | 'payments' | 'audit';

/** Something an admin should act on, most urgent first. */
export interface NeedItem {
  key: string;
  kind: 'money' | 'applicant' | 'request';
  title: string;
  detail: string;
  actionLabel: string;
  tab: AdminTabId;
}

interface AdminMetricsTabProps {
  metrics: AdminMetrics | null;
  totalUsersCount: number;
  needs: NeedItem[];
  auditLogs: AdminAction[];
  onNavigateTab: (tabId: AdminTabId) => void;
}

const KIND_STYLES: Record<NeedItem['kind'], { dot: string; label: string }> = {
  money: { dot: 'bg-clay-600', label: 'Payout' },
  applicant: { dot: 'bg-amber-500', label: 'Applicant' },
  request: { dot: 'bg-forest-600', label: 'Request' }
};

export const AdminMetricsTab: React.FC<AdminMetricsTabProps> = ({
  metrics,
  totalUsersCount,
  needs,
  auditLogs,
  onNavigateTab
}) => {
  return (
    <div className="space-y-6">
      {/* Needs you — the queue, not the vanity numbers, comes first */}
      <section aria-labelledby="needs-heading" className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-4">
        <h2 id="needs-heading" className="text-lg font-bold text-ink-900 font-display">
          {needs.length > 0 ? `Needs you (${needs.length})` : 'Needs you'}
        </h2>
        {needs.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-ink-700">
            <CheckCircle2 className="w-4 h-4 text-forest-700" aria-hidden="true" />
            All clear — no payouts, applicants or requests waiting.
          </p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {needs.map(item => (
              <li key={item.key} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${KIND_STYLES[item.kind].dot}`} aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink-900">
                      <span className="sr-only">{KIND_STYLES[item.kind].label}: </span>{item.title}
                    </div>
                    <div className="text-xs text-ink-600">{item.detail}</div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab(item.tab)}
                  className="self-start sm:self-auto shrink-0 px-3 min-h-[40px] rounded-control border border-ink-200 hover:bg-ink-50 text-xs font-bold text-ink-800 inline-flex items-center gap-1"
                >
                  {item.actionLabel} <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <StatRow stats={[
        { label: 'People on iSkillLink', value: totalUsersCount, detail: 'Learners, educators and admins', icon: Users },
        { label: 'Live educators', value: metrics?.activeEducators || 0, detail: 'Passed all four checks', icon: ShieldCheck },
        { label: 'Applicants', value: metrics?.pendingApplications || 0, detail: 'Waiting for checks', icon: Clock, accent: 'amber' },
        { label: 'Paid through escrow', value: formatUGX(metrics?.totalVolumeUgx || 0), detail: 'All time', icon: CreditCard }
      ]} />

      <section aria-labelledby="recent-heading" className="bg-white p-6 rounded-card border border-ink-200 shadow-level-1 space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="recent-heading" className="text-base font-bold text-ink-900">Recent activity</h2>
          <button onClick={() => onNavigateTab('audit')} className="text-xs font-bold text-forest-700 hover:text-forest-800 min-h-[40px]">
            Full audit trail
          </button>
        </div>
        <ul className="divide-y divide-ink-100">
          {auditLogs.slice(0, 5).map(log => (
            <li key={log.id} className="py-2.5 text-sm flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="font-semibold text-ink-900">{log.admin_name}</span>{' '}
                <span className="text-ink-700">{log.details}</span>
              </div>
              <span className="text-xs text-ink-500 whitespace-nowrap">{formatShortDate(log.created_at)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminMetricsTab;
