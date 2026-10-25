import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Educator } from '../../types';
import { formatUGX, formatShortDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';

interface AdminEducatorsTabProps {
  educators: Educator[];
}

type Group = 'live' | 'applicants' | 'suspended' | 'all';

const GROUP_LABELS: Record<Group, string> = {
  live: 'Live',
  applicants: 'Applicants',
  suspended: 'Suspended',
  all: 'All'
};

const groupOf = (e: Educator): Exclude<Group, 'all'> =>
  e.status === 'active' || e.status === 'approved' ? 'live'
    : e.status === 'suspended' || e.status === 'inactive' ? 'suspended'
    : 'applicants';

export const AdminEducatorsTab: React.FC<AdminEducatorsTabProps> = ({ educators }) => {
  const [group, setGroup] = useState<Group>('live');

  const counts: Record<Group, number> = {
    live: educators.filter(e => groupOf(e) === 'live').length,
    applicants: educators.filter(e => groupOf(e) === 'applicants').length,
    suspended: educators.filter(e => groupOf(e) === 'suspended').length,
    all: educators.length
  };
  const shown = educators.filter(e => group === 'all' || groupOf(e) === group);

  // Where an admin goes next from a row: the public profile once live, the checks before that.
  const nextStep = (e: Educator) => {
    const cls = 'px-3 min-h-[44px] md:min-h-[36px] rounded-control border border-ink-200 hover:bg-ink-50 text-xs font-bold text-ink-800 inline-flex items-center whitespace-nowrap';
    if (groupOf(e) === 'live') return <Link to={`/educators/${e.id}`} className={cls}>View profile</Link>;
    if (groupOf(e) === 'applicants') return <Link to="/dashboard/admin/verification" className={cls}>Review checks</Link>;
    return null;
  };

  const track = (e: Educator) => e.total_reviews > 0 ? (
    <span className="inline-flex items-center gap-1 tabular-nums">
      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
      {e.rating.toFixed(1)} <span className="text-ink-600">({e.total_reviews})</span>
    </span>
  ) : <span className="text-ink-600">No reviews yet</span>;

  return (
    <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-5">
      <div className="flex flex-wrap gap-1 p-1 bg-ink-100 rounded-control text-xs font-semibold w-full sm:w-auto sm:self-start" role="group" aria-label="Filter educators">
        {(Object.keys(GROUP_LABELS) as Group[]).map(id => (
          <button
            key={id}
            onClick={() => setGroup(id)}
            aria-pressed={group === id}
            className={`px-3 min-h-[44px] md:min-h-[40px] shrink-0 rounded-[9px] whitespace-nowrap transition ${group === id ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-600 hover:text-ink-900'}`}
          >
            {GROUP_LABELS[id]} <span className="text-ink-500">{counts[id]}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-600">
          {group === 'live' ? 'No educator is live yet. They appear here once all four checks pass.'
            : group === 'applicants' ? 'Nobody is waiting for checks.'
            : group === 'suspended' ? 'Nobody is suspended.'
            : 'No educators yet.'}
        </p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-ink-600 border-b border-ink-200">
                <tr>
                  <th scope="col" className="py-2 pr-3 font-semibold">Educator</th>
                  <th scope="col" className="py-2 px-3 font-semibold">Where</th>
                  <th scope="col" className="py-2 px-3 font-semibold text-right">Rate</th>
                  <th scope="col" className="py-2 px-3 font-semibold">Track record</th>
                  <th scope="col" className="py-2 px-3 font-semibold">Status</th>
                  <th scope="col" className="py-2 pl-3 font-semibold text-right"><span className="sr-only">Next step</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {shown.map(e => (
                  <tr key={e.id}>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={e.user?.avatar_url} name={e.user?.name} className="w-9 h-9 rounded-full shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-ink-900">{e.user?.name}</div>
                          <div className="text-xs text-ink-600">{e.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-ink-800">{e.location}</td>
                    <td className="py-3 px-3 text-right text-ink-900 tabular-nums whitespace-nowrap">{formatUGX(e.hourly_rate_ugx)}/hr</td>
                    <td className="py-3 px-3 text-xs">
                      {track(e)}
                      <div className="text-ink-600">{e.total_students} {e.total_students === 1 ? 'learner' : 'learners'} · joined {formatShortDate(e.created_at)}</div>
                    </td>
                    <td className="py-3 px-3"><StatusBadge status={e.status} /></td>
                    <td className="py-3 pl-3 text-right">{nextStep(e)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="md:hidden divide-y divide-ink-100">
            {shown.map(e => (
              <li key={e.id} className="py-3 space-y-2">
                <div className="flex items-start gap-3">
                  <Avatar src={e.user?.avatar_url} name={e.user?.name} className="w-9 h-9 rounded-full shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-ink-900">{e.user?.name}</div>
                    <div className="text-xs text-ink-600">{e.title} · {e.location}</div>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-ink-800 tabular-nums">{formatUGX(e.hourly_rate_ugx)}/hr · {track(e)}</span>
                  {nextStep(e)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default AdminEducatorsTab;
