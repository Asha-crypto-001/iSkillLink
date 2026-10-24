import React from 'react';
import { AdminAction } from '../../types';

interface AdminAuditTabProps {
  auditLogs: AdminAction[];
}

// Plain names for the action codes the server writes. Unknown codes fall back to a readable form.
const ACTION_LABELS: Record<string, string> = {
  INITIALIZE_PLATFORM_OPERATIONS: 'Platform set up',
  EDUCATOR_APPLICATION_SUBMITTED: 'Application received',
  UPDATE_VERIFICATION_STEP: 'Check updated',
  UPDATE_EDUCATOR_STATUS: 'Educator status changed',
  ASSIGN_EDUCATOR_MATCH: 'Request matched',
  RELEASE_EDUCATOR_PAYOUT: 'Payout released',
  ASSIGN_SECONDARY_ADMIN: 'Admin added',
  REVOKE_SECONDARY_ADMIN: 'Admin removed',
  INQUIRY_RECEIVED: 'Contact message'
};

const actionLabel = (code: string) =>
  ACTION_LABELS[code] || code.toLowerCase().replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());

// Money keeps the clay accent; everything else stays neutral so payouts stand out in the log.
const dotClass = (code: string) =>
  code === 'RELEASE_EDUCATOR_PAYOUT' ? 'bg-clay-600'
    : code.includes('ADMIN') ? 'bg-ink-900'
    : 'bg-forest-600';

const dayKey = (iso: string) => new Date(iso).toDateString();

const dayHeading = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86_400_000);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
    year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric'
  });
};

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export const AdminAuditTab: React.FC<AdminAuditTabProps> = ({ auditLogs }) => {
  const sorted = [...auditLogs].sort((a, b) => b.created_at.localeCompare(a.created_at));

  // Group by day, and fold back-to-back entries by the same admin about the same thing
  // (four checks on one applicant, say) into one row so the log stays scannable.
  const days: { key: string; heading: string; entries: AdminAction[][] }[] = [];
  sorted.forEach(log => {
    const key = dayKey(log.created_at);
    let day = days[days.length - 1];
    if (day?.key !== key) {
      day = { key, heading: dayHeading(log.created_at), entries: [] };
      days.push(day);
    }
    const prev = day.entries[day.entries.length - 1]?.[0];
    if (prev && prev.action_type === log.action_type && prev.target_id === log.target_id && prev.admin_id === log.admin_id) {
      day.entries[day.entries.length - 1].push(log);
    } else {
      day.entries.push([log]);
    }
  });

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6">
        <p className="py-10 text-center text-sm text-ink-600">Nothing recorded yet. Approvals, matches, payouts and admin changes will be listed here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-6">
      {days.map(day => (
        <section key={day.key} aria-label={day.heading}>
          <h2 className="text-sm font-bold text-ink-900 pb-2 border-b border-ink-200">{day.heading}</h2>
          <ol className="divide-y divide-ink-100">
            {day.entries.map(group => {
              const log = group[0];
              return (
                <li key={log.id} className="py-3 grid grid-cols-[3.25rem_1fr] gap-x-3">
                  <time dateTime={log.created_at} className="text-xs text-ink-600 tabular-nums pt-0.5">{timeOf(log.created_at)}</time>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass(log.action_type)}`} aria-hidden="true" />
                      <span className="font-semibold text-ink-900">
                        {actionLabel(log.action_type)}{group.length > 1 && <span className="text-ink-600 font-normal"> ×{group.length}</span>}
                      </span>
                      <span className="text-ink-600">by {log.admin_name}</span>
                    </div>
                    {group.length === 1 ? (
                      <p className="text-sm text-ink-800 max-w-prose">{log.details}</p>
                    ) : (
                      <ul className="text-sm text-ink-800 max-w-prose list-disc pl-5">
                        {group.map(g => <li key={g.id}>{g.details}</li>)}
                      </ul>
                    )}
                    <p className="font-mono text-[12px] text-ink-500 break-all">{log.target_entity} {log.target_id}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
};

export default AdminAuditTab;
