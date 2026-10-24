import React from 'react';
import { Search, Phone, MessageCircle, Mail, UserMinus, UserPlus } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { whatsappNumber } from '../../utils/formatters';

interface AdminUsersTabProps {
  users: any[];
  userSearchQuery: string;
  setUserSearchQuery: (query: string) => void;
  userRoleFilter: 'all' | 'admin' | 'secondary_admin' | 'educator' | 'learner';
  setUserRoleFilter: (role: 'all' | 'admin' | 'secondary_admin' | 'educator' | 'learner') => void;
  isLeadAdmin: boolean;
  onAssignSecondaryAdmin: (targetUser: any) => void;
  onRevokeSecondaryAdmin: (targetUser: any) => void;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Lead admin',
  secondary_admin: 'Admin',
  educator: 'Educator',
  learner: 'Learner'
};

const ROLE_CLASSES: Record<string, string> = {
  admin: 'bg-ink-900 text-white border-ink-900',
  secondary_admin: 'bg-ink-100 text-ink-900 border-ink-300',
  educator: 'bg-forest-50 text-forest-800 border-forest-200',
  learner: 'bg-white text-ink-700 border-ink-200'
};

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  userSearchQuery,
  setUserSearchQuery,
  userRoleFilter,
  setUserRoleFilter,
  isLeadAdmin,
  onAssignSecondaryAdmin,
  onRevokeSecondaryAdmin
}) => {
  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const q = userSearchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.location?.toLowerCase().includes(q) ||
      u.interests?.some((i: string) => i.toLowerCase().includes(q));
    return matchesRole && matchesSearch;
  });

  const counts: Record<string, number> = {
    all: users.length,
    learner: users.filter(u => u.role === 'learner').length,
    educator: users.filter(u => u.role === 'educator').length,
    secondary_admin: users.filter(u => u.role === 'secondary_admin').length,
    admin: users.filter(u => u.role === 'admin').length
  };

  const delegationControl = (u: any) => {
    const isFounder = u.role === 'admin';
    if (!isLeadAdmin || isFounder) return null;
    return u.role === 'secondary_admin' ? (
      <button onClick={() => onRevokeSecondaryAdmin(u)} className="px-3 min-h-[44px] md:min-h-[36px] rounded-control border border-rose-200 text-rose-800 hover:bg-rose-50 text-xs font-bold inline-flex items-center gap-1 whitespace-nowrap">
        <UserMinus className="w-3.5 h-3.5" aria-hidden="true" /> Remove admin
      </button>
    ) : (
      <button onClick={() => onAssignSecondaryAdmin(u)} className="px-3 min-h-[44px] md:min-h-[36px] rounded-control border border-ink-200 text-ink-800 hover:bg-ink-50 text-xs font-bold inline-flex items-center gap-1 whitespace-nowrap">
        <UserPlus className="w-3.5 h-3.5" aria-hidden="true" /> Make admin
      </button>
    );
  };

  const contactLinks = (u: any) => {
    const wa = whatsappNumber(u.phone);
    const link = 'w-11 h-11 md:w-9 md:h-9 rounded-control border border-ink-200 hover:bg-ink-50 inline-flex items-center justify-center text-ink-700';
    return (
      <div className="flex items-center gap-1.5">
        {u.phone && <a href={`tel:${u.phone}`} className={link} aria-label={`Call ${u.name}`} title={u.phone}><Phone className="w-4 h-4" aria-hidden="true" /></a>}
        {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className={link} aria-label={`WhatsApp ${u.name}`}><MessageCircle className="w-4 h-4" aria-hidden="true" /></a>}
        <a href={`mailto:${u.email}`} className={link} aria-label={`Email ${u.name}`} title={u.email}><Mail className="w-4 h-4" aria-hidden="true" /></a>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <label className="relative w-full sm:w-80">
          <span className="sr-only">Search people</span>
          <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            placeholder="Name, phone, email or trade"
            className="w-full text-base sm:text-sm min-h-[44px] pl-9 pr-3 rounded-control border border-ink-200 focus:outline-none focus:ring-2 focus:ring-forest-700 bg-white"
          />
        </label>

        <div className="flex flex-wrap gap-1 p-1 bg-ink-100 rounded-control text-xs font-semibold w-full sm:w-auto" role="group" aria-label="Filter by role">
          {(['all', 'learner', 'educator', 'secondary_admin', 'admin'] as const).map(id => (
            <button
              key={id}
              onClick={() => setUserRoleFilter(id)}
              aria-pressed={userRoleFilter === id}
              className={`px-3 min-h-[44px] md:min-h-[36px] shrink-0 rounded-[9px] whitespace-nowrap transition ${userRoleFilter === id ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-600 hover:text-ink-900'}`}
            >
              {id === 'all' ? 'Everyone' : id === 'admin' ? 'Lead admin' : ROLE_LABELS[id] + 's'} <span className="text-ink-500">{counts[id]}</span>
            </button>
          ))}
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-600">Nobody matches that search.</p>
      ) : (
        <>
          {/* Desktop: a table you can scan */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-ink-600 border-b border-ink-200">
                <tr>
                  <th scope="col" className="py-2 pr-3 font-semibold">Person</th>
                  <th scope="col" className="py-2 px-3 font-semibold">Role</th>
                  <th scope="col" className="py-2 px-3 font-semibold">Interested in / teaches</th>
                  <th scope="col" className="py-2 px-3 font-semibold">Contact</th>
                  <th scope="col" className="py-2 pl-3 font-semibold text-right"><span className="sr-only">Admin access</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="align-middle">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={u.avatar_url} name={u.name} className="w-9 h-9 rounded-full" />
                        <div className="min-w-0">
                          <div className="font-semibold text-ink-900 truncate">{u.name}</div>
                          <div className="text-xs text-ink-600 truncate">{u.location || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-pill border text-xs font-semibold whitespace-nowrap ${ROLE_CLASSES[u.role] || ROLE_CLASSES.learner}`}>{ROLE_LABELS[u.role] || u.role}</span>
                    </td>
                    <td className="py-3 px-3 text-xs text-ink-700 max-w-[16rem]">
                      {u.interests?.length ? <span className="line-clamp-2">{u.interests.join(' · ')}</span> : <span className="text-ink-500">—</span>}
                    </td>
                    <td className="py-3 px-3">{contactLinks(u)}</td>
                    <td className="py-3 pl-3 text-right">{delegationControl(u)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: one compact row per person */}
          <ul className="md:hidden divide-y divide-ink-100">
            {filteredUsers.map(u => (
              <li key={u.id} className="py-3 space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar src={u.avatar_url} name={u.name} className="w-9 h-9 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-ink-900 truncate">{u.name}</div>
                    <div className="text-xs text-ink-600 truncate">{ROLE_LABELS[u.role] || u.role} · {u.location || '—'}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {contactLinks(u)}
                  {delegationControl(u)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default AdminUsersTab;
