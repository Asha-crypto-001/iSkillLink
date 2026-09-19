import React from 'react';
import { LearnerRequest, MatchEvaluation } from '../../types';
import { formatUGX } from '../../utils/formatters';
import { StatusBadge } from '../../components/ui/Badge';
import { CheckCircle2 } from 'lucide-react';

interface AdminMatchmakerTabProps {
  learnerRequests: LearnerRequest[];
  selectedRequest: LearnerRequest | null;
  onSelectRequest: (req: LearnerRequest) => void;
  evaluatedMatches: MatchEvaluation[];
  isMatchingLoading: boolean;
  matchSuccessMsg: string;
  onAssignMatch: (educatorId: string) => void;
}

export const AdminMatchmakerTab: React.FC<AdminMatchmakerTabProps> = ({
  learnerRequests,
  selectedRequest,
  onSelectRequest,
  evaluatedMatches,
  isMatchingLoading,
  matchSuccessMsg,
  onAssignMatch
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-base font-bold text-gray-900">Rule-Based Matchmaker Oversight</h2>
        <p className="text-xs text-gray-500">
          Review custom learning goals submitted by students and evaluate ranked educator matches with rule-based scoring.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Requests List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Custom Skill Inquiries ({learnerRequests.length})
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {learnerRequests.map(req => (
              <div
                key={req.id}
                onClick={() => onSelectRequest(req)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                  selectedRequest?.id === req.id
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm ring-1 ring-emerald-500'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>{req.skill_name}</span>
                  <StatusBadge status={req.status} />
                </div>
                <div className="text-[11px] text-gray-600 mt-1">
                  {req.learner_name} • {req.location}
                </div>
                <div className="text-[11px] text-emerald-800 font-semibold mt-1">
                  Budget: {formatUGX(req.budget_ugx)} ({req.format_preference})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Evaluated Matches */}
        <div className="lg:col-span-2 space-y-4">
          {selectedRequest ? (
            <>
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Evaluating Request: #{selectedRequest.id}
                  </span>
                  <span className="text-xs font-bold bg-emerald-800 px-2.5 py-0.5 rounded">
                    Budget: {formatUGX(selectedRequest.budget_ugx)}
                  </span>
                </div>
                <h3 className="text-base font-bold">{selectedRequest.skill_name} ({selectedRequest.skill_level})</h3>
                <p className="text-xs text-slate-300 leading-relaxed">"{selectedRequest.learning_goal}"</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1 border-t border-slate-800">
                  <span>Learner: {selectedRequest.learner_name}</span>
                  <span>•</span>
                  <span>Location: {selectedRequest.location}</span>
                  <span>•</span>
                  <span>Schedule: {selectedRequest.preferred_schedule}</span>
                </div>
              </div>

              {matchSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{matchSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Rule-Based Ranked Matches ({evaluatedMatches.length})
                </h4>

                {isMatchingLoading ? (
                  <div className="text-center py-12 text-xs text-gray-500">Evaluating matching algorithm criteria...</div>
                ) : evaluatedMatches.length > 0 ? (
                  evaluatedMatches.map(m => (
                    <div
                      key={m.educator.id}
                      className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-white hover:border-emerald-600 transition space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.educator.user?.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'}
                            alt={m.educator.user?.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-300"
                          />
                          <div>
                            <div className="font-bold text-gray-900 text-sm">{m.educator.user?.name}</div>
                            <div className="text-xs text-gray-600">{m.educator.title} • {m.educator.location}</div>
                            <div className="text-[11px] text-emerald-800 font-bold mt-0.5">
                              Rate: {formatUGX(m.educator.hourly_rate_ugx)}/hr
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-black text-emerald-700">{m.match_score}%</div>
                          <span className="text-[10px] text-gray-500 font-semibold">Match Score</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Match Factors:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.match_reasons.map((r, idx) => (
                            <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-200 flex justify-end">
                        <button
                          onClick={() => onAssignMatch(m.educator.id)}
                          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
                        >
                          Assign & Introduce Match
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-gray-400">No matching educators found for this request.</div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-xs text-gray-400">
              Select a learner request on the left to evaluate matches.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMatchmakerTab;
