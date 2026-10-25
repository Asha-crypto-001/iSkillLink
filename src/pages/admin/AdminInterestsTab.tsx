import React from 'react';
import { Phone, MessageCircle, ArrowRight } from 'lucide-react';
import { LearnerRequest } from '../../types';
import { formatUGX, formatShortDate, whatsappNumber } from '../../utils/formatters';
import { StatusBadge } from '../../components/ui/Badge';

interface TradeDemand {
  trade: string;
  requestCount: number;
  averageBudgetUgx: number;
  topLocations?: string[];
}

interface DemandData {
  tradeDemand?: TradeDemand[];
  learnerInterests?: Record<string, number>;
}

interface AdminInterestsTabProps {
  demandData: DemandData | null;
  learnerRequests: LearnerRequest[];
  onFindMatch: (req: LearnerRequest) => void;
}

export const AdminInterestsTab: React.FC<AdminInterestsTabProps> = ({
  demandData,
  learnerRequests,
  onFindMatch
}) => {
  const open = learnerRequests.filter(r => r.status === 'open').length;
  const matched = learnerRequests.filter(r => r.status === 'matched' || r.status === 'fulfilled').length;

  const trades = demandData?.tradeDemand || [];
  const topCount = Math.max(1, ...trades.map(t => t.requestCount));

  const interests = Object.entries(demandData?.learnerInterests || {}).sort((a, b) => b[1] - a[1]);

  const contactLinks = (r: LearnerRequest) => {
    const wa = whatsappNumber(r.contact_phone);
    const link = 'w-11 h-11 md:w-9 md:h-9 rounded-control border border-ink-200 hover:bg-ink-50 inline-flex items-center justify-center text-ink-700';
    return (
      <div className="flex items-center gap-1.5">
        {r.contact_phone && <a href={`tel:${r.contact_phone}`} className={link} aria-label={`Call ${r.learner_name}`} title={r.contact_phone}><Phone className="w-4 h-4" aria-hidden="true" /></a>}
        {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className={link} aria-label={`WhatsApp ${r.learner_name}`}><MessageCircle className="w-4 h-4" aria-hidden="true" /></a>}
      </div>
    );
  };

  const matchControl = (r: LearnerRequest) => r.status === 'open' ? (
    <button
      onClick={() => onFindMatch(r)}
      className="px-3 min-h-[44px] md:min-h-[36px] rounded-control bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold inline-flex items-center gap-1 whitespace-nowrap"
    >
      Find a match <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
    </button>
  ) : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* What people ask for, ranked by real request counts */}
        <section aria-labelledby="demand-heading" className={`${interests.length ? 'lg:col-span-3' : 'lg:col-span-5'} bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-4`}>
          <div>
            <h2 id="demand-heading" className="text-base font-bold text-ink-900">Most asked for</h2>
            <p className="text-sm text-ink-600">
              {learnerRequests.length} {learnerRequests.length === 1 ? 'request' : 'requests'} · {open} waiting for a match · {matched} matched
            </p>
          </div>

          {trades.length === 0 ? (
            <p className="py-6 text-sm text-ink-600">Nobody has sent a request yet. They’ll be ranked here as they come in.</p>
          ) : (
            <ol className="space-y-4">
              {trades.map(t => (
                <li key={t.trade} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-semibold text-ink-900 min-w-0">{t.trade}</span>
                    <span className="text-ink-700 tabular-nums whitespace-nowrap">{t.requestCount} {t.requestCount === 1 ? 'request' : 'requests'}</span>
                  </div>
                  <div className="h-2 rounded-pill bg-ink-100 overflow-hidden" aria-hidden="true">
                    <div className="h-full rounded-pill bg-forest-600" style={{ width: `${(t.requestCount / topCount) * 100}%` }} />
                  </div>
                  <div className="text-xs text-ink-600">
                    Budget about {formatUGX(t.averageBudgetUgx)}
                    {t.topLocations?.length ? ` · ${t.topLocations.join(', ')}` : ''}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* What learners ticked when they signed up — only once someone has */}
        {interests.length > 0 && (
        <section aria-labelledby="signup-heading" className="lg:col-span-2 bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-4">
          <div>
            <h2 id="signup-heading" className="text-base font-bold text-ink-900">Picked at sign-up</h2>
            <p className="text-sm text-ink-600">Interests learners chose when they made an account.</p>
          </div>
          <ul className="flex flex-wrap gap-2">
            {interests.map(([name, count]) => (
              <li key={name} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill border border-ink-200 bg-ink-50 text-sm text-ink-800">
                {name} <span className="text-ink-500 tabular-nums">{count}</span>
              </li>
            ))}
          </ul>
        </section>
        )}
      </div>

      {/* Every request, with a way to reach the learner */}
      <section aria-labelledby="requests-heading" className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-4">
        <h2 id="requests-heading" className="text-base font-bold text-ink-900">Requests</h2>

        {learnerRequests.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-600">No requests yet.</p>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-ink-600 border-b border-ink-200">
                  <tr>
                    <th scope="col" className="py-2 pr-3 font-semibold">Learner</th>
                    <th scope="col" className="py-2 px-3 font-semibold">Wants to learn</th>
                    <th scope="col" className="py-2 px-3 font-semibold text-right">Budget</th>
                    <th scope="col" className="py-2 px-3 font-semibold">Contact</th>
                    <th scope="col" className="py-2 px-3 font-semibold">Status</th>
                    <th scope="col" className="py-2 pl-3 font-semibold text-right"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {learnerRequests.map(r => (
                    <tr key={r.id}>
                      <td className="py-3 pr-3">
                        <div className="font-semibold text-ink-900">{r.learner_name}</div>
                        <div className="text-xs text-ink-600">{r.location} · asked {formatShortDate(r.created_at)}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-ink-900">{r.skill_name}</div>
                        <div className="text-xs text-ink-600 capitalize">{r.skill_level}</div>
                      </td>
                      <td className="py-3 px-3 text-right text-ink-900 tabular-nums whitespace-nowrap">{formatUGX(r.budget_ugx)}</td>
                      <td className="py-3 px-3">{contactLinks(r)}</td>
                      <td className="py-3 px-3"><StatusBadge status={r.status} /></td>
                      <td className="py-3 pl-3 text-right">{matchControl(r)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="md:hidden divide-y divide-ink-100">
              {learnerRequests.map(r => (
                <li key={r.id} className="py-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-ink-900">{r.learner_name} · {r.skill_name}</div>
                      <div className="text-xs text-ink-600">{r.location} · {formatUGX(r.budget_ugx)} · {formatShortDate(r.created_at)}</div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {contactLinks(r)}
                    {matchControl(r)}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
};

export default AdminInterestsTab;
