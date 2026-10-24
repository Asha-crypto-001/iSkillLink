import React from 'react';
import { CheckCircle2, SearchX } from 'lucide-react';
import { LearnerRequest, MatchEvaluation } from '../../types';
import { formatUGX, formatShortDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { cn } from '../../utils/cn';

interface AdminMatchmakerTabProps {
  learnerRequests: LearnerRequest[];
  selectedRequest: LearnerRequest | null;
  onSelectRequest: (req: LearnerRequest) => void;
  evaluatedMatches: MatchEvaluation[];
  isMatchingLoading: boolean;
  matchSuccessMsg: string;
  onAssignMatch: (educatorId: string) => void;
}

const firstName = (name?: string) => (name || '').split(' ')[0] || 'this educator';

export const AdminMatchmakerTab: React.FC<AdminMatchmakerTabProps> = ({
  learnerRequests,
  selectedRequest,
  onSelectRequest,
  evaluatedMatches,
  isMatchingLoading,
  matchSuccessMsg,
  onAssignMatch
}) => {
  // Open requests first: they are the ones waiting on an admin.
  const requests = [...learnerRequests].sort((a, b) =>
    (a.status === 'open' ? 0 : 1) - (b.status === 'open' ? 0 : 1) || b.created_at.localeCompare(a.created_at)
  );
  const isOpen = selectedRequest?.status === 'open';

  if (learnerRequests.length === 0) {
    return (
      <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6">
        <p className="py-10 text-center text-sm text-ink-600">No requests to match yet. When a learner asks for a skill nobody lists, it shows up here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Requests */}
      <section aria-labelledby="mm-requests-heading" className="bg-white rounded-card border border-ink-200 shadow-level-1 p-4 space-y-3">
        <h2 id="mm-requests-heading" className="px-2 text-base font-bold text-ink-900">
          Requests <span className="text-ink-500 font-semibold">{learnerRequests.length}</span>
        </h2>
        <ul className="space-y-1 max-h-[560px] overflow-y-auto">
          {requests.map(req => {
            const selected = selectedRequest?.id === req.id;
            return (
              <li key={req.id}>
                <button
                  onClick={() => onSelectRequest(req)}
                  aria-current={selected ? 'true' : undefined}
                  className={cn(
                    'w-full text-left p-3 rounded-control border transition',
                    selected ? 'bg-forest-50 border-forest-600' : 'border-transparent hover:bg-ink-50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-ink-900">{req.skill_name}</span>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="text-xs text-ink-600 mt-0.5">
                    {req.learner_name} · {req.location} · {formatShortDate(req.created_at)}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* The selected request and who could teach it */}
      <section aria-labelledby="mm-detail-heading" className="lg:col-span-2 space-y-4">
        {!selectedRequest ? (
          <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6">
            <p className="py-10 text-center text-sm text-ink-600">Pick a request to see who could teach it.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 id="mm-detail-heading" className="text-lg font-bold text-ink-900 font-display">
                    {selectedRequest.learner_name} wants to learn {selectedRequest.skill_name}
                  </h2>
                  <p className="text-sm text-ink-600 capitalize">{selectedRequest.skill_level} · {selectedRequest.format_preference}</p>
                </div>
                <StatusBadge status={selectedRequest.status} />
              </div>
              {selectedRequest.learning_goal && (
                <blockquote className="border-l-2 border-ink-300 pl-3 text-sm text-ink-800 leading-relaxed">
                  {selectedRequest.learning_goal}
                </blockquote>
              )}
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-ink-100 text-sm">
                <div><dt className="text-xs text-ink-600">Where</dt><dd className="text-ink-900">{selectedRequest.location}</dd></div>
                <div><dt className="text-xs text-ink-600">When</dt><dd className="text-ink-900">{selectedRequest.preferred_schedule || '—'}</dd></div>
                <div><dt className="text-xs text-ink-600">How often</dt><dd className="text-ink-900">{selectedRequest.frequency || '—'}</dd></div>
                <div><dt className="text-xs text-ink-600">Budget</dt><dd className="text-ink-900 tabular-nums">{formatUGX(selectedRequest.budget_ugx)}</dd></div>
              </dl>
            </div>

            {matchSuccessMsg && (
              <div role="status" className="p-3.5 rounded-control bg-forest-50 border border-forest-200 text-forest-900 text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" aria-hidden="true" />
                <span>{matchSuccessMsg}</span>
              </div>
            )}

            {!isOpen && !matchSuccessMsg && (
              <p className="text-sm text-ink-600">This request is already {selectedRequest.status.replace('_', ' ')}. The list below is for reference.</p>
            )}

            <div className="space-y-3">
              <h3 className="text-base font-bold text-ink-900">
                Best fits {!isMatchingLoading && <span className="text-ink-500 font-semibold">{evaluatedMatches.length}</span>}
              </h3>

              {isMatchingLoading ? (
                <div className="space-y-3" aria-busy="true" aria-label="Finding educators">
                  {[0, 1].map(i => (
                    <div key={i} className="bg-white rounded-card border border-ink-200 p-5 flex gap-3">
                      <Skeleton variant="avatar" className="w-12 h-12 rounded-control shrink-0" />
                      <div className="flex-1 space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-56" /></div>
                    </div>
                  ))}
                </div>
              ) : evaluatedMatches.length === 0 ? (
                <div className="bg-white rounded-card border border-dashed border-ink-300 p-8 text-center space-y-2">
                  <SearchX className="w-6 h-6 text-ink-500 mx-auto" aria-hidden="true" />
                  <p className="text-sm font-semibold text-ink-900">No live educator teaches this yet</p>
                  <p className="text-sm text-ink-600">Call {firstName(selectedRequest.learner_name)} to say you’re looking, and check Applicants for someone close to being verified.</p>
                </div>
              ) : (
                <ol className="space-y-3">
                  {evaluatedMatches.map((m, idx) => (
                    <li key={m.educator.id} className="bg-white rounded-card border border-ink-200 shadow-level-1 p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar src={m.educator.user?.avatar_url} name={m.educator.user?.name} className="w-12 h-12 rounded-control shrink-0" />
                          <div className="min-w-0">
                            <div className="font-semibold text-ink-900">
                              <span className="sr-only">Number {idx + 1}: </span>{m.educator.user?.name}
                            </div>
                            <div className="text-xs text-ink-600">{m.educator.title} · {m.educator.location}</div>
                            <div className="text-xs text-ink-800 tabular-nums mt-0.5">{formatUGX(m.educator.hourly_rate_ugx)}/hr</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 w-20">
                          <div className="text-lg font-bold text-ink-900 tabular-nums">{m.match_score}%</div>
                          <div className="h-1.5 rounded-pill bg-ink-100 overflow-hidden mt-1" aria-hidden="true">
                            <div className="h-full bg-forest-600" style={{ width: `${Math.min(100, m.match_score)}%` }} />
                          </div>
                          <div className="text-[12px] text-ink-600 mt-1">fit</div>
                        </div>
                      </div>

                      {m.match_reasons.length > 0 && (
                        <ul className="text-sm text-ink-700 list-disc pl-5 space-y-0.5">
                          {m.match_reasons.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      )}

                      {isOpen && (
                        <div className="pt-3 border-t border-ink-100 flex justify-end">
                          <button
                            onClick={() => onAssignMatch(m.educator.id)}
                            className="px-4 min-h-[44px] bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm rounded-control transition"
                          >
                            Match with {firstName(m.educator.user?.name)}
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default AdminMatchmakerTab;
