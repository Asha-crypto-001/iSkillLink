import React from 'react';
import { Educator } from '../../types';
import { formatUGX } from '../../utils/formatters';
import { StatusBadge } from '../../components/ui/Badge';
import { Check, ShieldCheck, UserCheck } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';
import { VERIFICATION_STEPS, hasSubmittedNationalId, isStepPassed, verificationProgress } from '../../utils/verification';
import { Avatar } from '../../components/ui/Avatar';

interface AdminVerificationTabProps {
  verificationQueue: Educator[];
  onSuspendEducator: (educatorId: string) => void;
  onVerifyStep: (educatorId: string, step: string) => void;
}

// Waiting time is shown prominently: an applicant who has waited a week should be noticed.
function appliedAgo(iso: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
  return days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`;
}

export const AdminVerificationTab: React.FC<AdminVerificationTabProps> = ({
  verificationQueue,
  onSuspendEducator,
  onVerifyStep
}) => {
  return (
    <div className="bg-white rounded-2xl border border-ink-200 shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-base font-bold text-ink-900">Educator Verification & Vetting Queue</h2>
        <p className="text-xs text-ink-500">
          Review applicant identity, trade tests, workshop readiness, and references before approving active status.
        </p>
      </div>

      <div className="space-y-6">
        {verificationQueue.length > 0 ? (
          verificationQueue.map(edu => {
            const v = edu.verification;
            const progress = verificationProgress(v);
            return (
              <div
                key={edu.id}
                className="p-6 rounded-2xl border border-ink-200 bg-ink-50/50 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-200 pb-4">
                  <div className="flex items-center gap-4">
                    <Avatar src={edu.user?.avatar_url} name={edu.user?.name} className="w-14 h-14 rounded-xl border border-ink-300" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-ink-900 text-base">{edu.user?.name}</h3>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          {edu.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-ink-600 mt-0.5">{edu.title} • {edu.location}</p>
                      <p className="text-xs font-semibold text-ink-800 mt-0.5">Applied {appliedAgo(edu.created_at)}</p>
                      <div className="text-[12px] text-ink-500 flex items-center gap-3 mt-1">
                        <span>Phone: {edu.user?.phone}</span>
                        <span>•</span>
                        <span>Rate: {formatUGX(edu.hourly_rate_ugx)}/hr</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <p className="text-xs text-ink-600" aria-live="polite">
                      <strong className="text-ink-900">{progress.passed} of {progress.total}</strong> checks passed
                      <span className="block text-[12px] text-ink-500">Goes live automatically after the last check</span>
                    </p>
                    <button
                      onClick={() => onSuspendEducator(edu.id)}
                      className="px-3 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition"
                    >
                      Put on hold
                    </button>
                  </div>
                </div>

                {/* Step checks — defined once in utils/verification and shared with the applicant's view */}
                <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {VERIFICATION_STEPS.map((step, index) => {
                    const passed = isStepPassed(v, step);
                    return (
                      <li key={step.key} className={`p-3.5 rounded-xl border bg-white space-y-2 ${passed ? 'border-forest-200' : 'border-ink-200'}`}>
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <span className="font-semibold text-ink-700">{index + 1}. {step.label}</span>
                          <StatusBadge status={v?.[step.field] || 'pending'} />
                        </div>
                        {step.key === 'national_id' ? (
                          <div className="font-mono text-[12px] text-ink-600">{hasSubmittedNationalId(v) ? v!.national_id_number : 'Not submitted yet'}</div>
                        ) : (
                          <div className="text-[12px] text-ink-500">{step.adminDetail}</div>
                        )}
                        {passed ? (
                          <div className="flex items-center gap-1 py-1 text-[12px] font-semibold text-forest-800">
                            <Check className="w-3.5 h-3.5" aria-hidden="true" /> Passed
                          </div>
                        ) : (
                          <button
                            onClick={() => onVerifyStep(edu.id, step.key)}
                            className="w-full py-1.5 text-[12px] font-semibold text-forest-800 bg-forest-50 hover:bg-forest-100 rounded border border-forest-200 transition"
                          >
                            {step.adminAction}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
          })
        ) : (
          <EmptyState
            icon={<ShieldCheck className="w-6 h-6" />}
            title="No pending verifications"
            description="All educator applications have been reviewed. New submissions will appear here for your 4-step vetting."
            action={<span className="text-xs text-ink-600 flex items-center gap-1.5"><UserCheck className="w-4 h-4 text-forest-600" />Awaiting new artisan applications</span>}
          />
        )}
      </div>
    </div>
  );
};

export default AdminVerificationTab;
