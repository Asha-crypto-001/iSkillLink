import React from 'react';
import { Educator } from '../../types';
import { formatUGX, getStatusBadgeClass } from '../../utils/formatters';
import { Check, ShieldCheck, UserCheck } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';

interface AdminVerificationTabProps {
  verificationQueue: Educator[];
  onApproveEducator: (educatorId: string) => void;
  onSuspendEducator: (educatorId: string) => void;
  onVerifyStep: (educatorId: string, step: string) => void;
}

export const AdminVerificationTab: React.FC<AdminVerificationTabProps> = ({
  verificationQueue,
  onApproveEducator,
  onSuspendEducator,
  onVerifyStep
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-base font-bold text-gray-900">Educator Verification & Vetting Queue</h2>
        <p className="text-xs text-gray-500">
          Review applicant identity, trade tests, workshop readiness, and references before approving active status.
        </p>
      </div>

      <div className="space-y-6">
        {verificationQueue.length > 0 ? (
          verificationQueue.map(edu => {
            const v = edu.verification;
            return (
              <div
                key={edu.id}
                className="p-6 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={edu.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt={edu.user?.name}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-300"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-base">{edu.user?.name}</h3>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          {edu.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{edu.title} • {edu.location}</p>
                      <div className="text-[11px] text-gray-500 flex items-center gap-3 mt-1">
                        <span>Phone: {edu.user?.phone}</span>
                        <span>•</span>
                        <span>Rate: {formatUGX(edu.hourly_rate_ugx)}/hr</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApproveEducator(edu.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Activate</span>
                    </button>
                    <button
                      onClick={() => onSuspendEducator(edu.id)}
                      className="px-3 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition"
                    >
                      Hold
                    </button>
                  </div>
                </div>

                {/* Step Checks Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* Step 1 */}
                  <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">1. National ID (NIN)</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border capitalize ${getStatusBadgeClass(v?.national_id_status || 'pending')}`}>
                        {v?.national_id_status || 'pending'}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-gray-600">{v?.national_id_number || 'CM-NOT-SUBMITTED'}</div>
                    <button
                      onClick={() => onVerifyStep(edu.id, 'national_id')}
                      className="w-full py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                    >
                      Verify NIN
                    </button>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">2. Police / BG Check</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border capitalize ${getStatusBadgeClass(v?.background_check_status || 'pending')}`}>
                        {v?.background_check_status || 'pending'}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500">LC1 & Police clearance</div>
                    <button
                      onClick={() => onVerifyStep(edu.id, 'background_check')}
                      className="w-full py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                    >
                      Mark Cleared
                    </button>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">3. Practical Interview</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border capitalize ${getStatusBadgeClass(v?.interview_status || 'pending')}`}>
                        {v?.interview_status || 'pending'}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500">Phone or in-person review</div>
                    <button
                      onClick={() => onVerifyStep(edu.id, 'interview')}
                      className="w-full py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                    >
                      Pass Interview
                    </button>
                  </div>

                  {/* Step 4 */}
                  <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">4. Skill Assessment</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border capitalize ${getStatusBadgeClass(v?.skill_assessment_status || 'pending')}`}>
                        {v?.skill_assessment_status || 'pending'}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500">Workshop & tools review</div>
                    <button
                      onClick={() => onVerifyStep(edu.id, 'skill_assessment')}
                      className="w-full py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                    >
                      Approve Skill
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            icon={<ShieldCheck className="w-6 h-6" />}
            title="No pending verifications"
            description="All educator applications have been reviewed. New submissions will appear here for your 4-step vetting."
            action={<span className="text-xs text-slate-600 flex items-center gap-1.5"><UserCheck className="w-4 h-4 text-emerald-600" />Awaiting new artisan applications</span>}
          />
        )}
      </div>
    </div>
  );
};

export default AdminVerificationTab;
