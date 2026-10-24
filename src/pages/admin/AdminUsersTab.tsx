import React from 'react';
import {
  Search, MapPin, Phone, MessageCircle, Mail,
  UserCheck, UserMinus, UserPlus
} from 'lucide-react';

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

  return (
    <div className="bg-white rounded-2xl border border-ink-200 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-100">
        <div>
          <h2 className="text-base font-bold text-ink-900">
            User Directory, Direct Contacts & Admin Delegation
          </h2>
          <p className="text-xs text-ink-500">
            Inspect registered members, view their verified contact details and learning/teaching interests, and appoint Secondary Administrators.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg">
            Secondary Admins: {users.filter(u => u.role === 'secondary_admin').length}
          </span>
          <span className="px-2.5 py-1 bg-forest-50 text-forest-900 border border-forest-200 rounded-lg">
            Educators: {users.filter(u => u.role === 'educator').length}
          </span>
          <span className="px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg">
            Learners: {users.filter(u => u.role === 'learner').length}
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            placeholder="Search name, phone, email, skill..."
            className="w-full text-xs p-2.5 pl-9 rounded-xl border border-ink-300 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
          />
          <Search className="w-4 h-4 text-ink-400 absolute left-3 top-3" />
        </div>

        {/* Role Filter Pills */}
        <div className="flex p-1 bg-ink-100 rounded-xl text-xs font-bold w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Users' },
            { id: 'secondary_admin', label: 'Secondary Admins' },
            { id: 'educator', label: 'Educators' },
            { id: 'learner', label: 'Learners' },
            { id: 'admin', label: 'Lead Admin' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setUserRoleFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                userRoleFilter === f.id ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u) => {
            const isThisLeadAdmin = u.email === 'ashabahebwahassan665@gmail.com';
            const isSecAdmin = u.role === 'secondary_admin';
            const cleanPhone = (u.phone || '').replace(/[^0-9]/g, '');
            const waNumber = cleanPhone.startsWith('256') ? cleanPhone : `256${cleanPhone.replace(/^0/, '')}`;

            return (
              <div
                key={u.id}
                className={`p-5 rounded-2xl border transition space-y-4 ${
                  isThisLeadAdmin
                    ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-400/30'
                    : isSecAdmin
                    ? 'bg-ink-50 border-ink-300 ring-1 ring-ink-400/30'
                    : 'bg-white border-ink-200 hover:border-ink-300'
                }`}
              >
                {/* Top Identity Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt={u.name}
                      className="w-12 h-12 rounded-xl object-cover border border-ink-300 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-ink-900">{u.name}</span>
                        {isThisLeadAdmin ? (
                          <span className="px-2 py-0.5 rounded text-[12px] font-bold bg-ink-900 text-amber-300">
                            Lead Admin (Founder)
                          </span>
                        ) : isSecAdmin ? (
                          <span className="px-2 py-0.5 rounded text-[12px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            Secondary Admin
                          </span>
                        ) : u.role === 'educator' ? (
                          <span className="px-2 py-0.5 rounded text-[12px] font-bold bg-forest-100 text-forest-900 border border-forest-300">
                            Educator
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[12px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                            Learner
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] text-ink-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-ink-400" />
                        <span>{u.location || 'Mbarara, Uganda'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Contact Information Box */}
                <div className="p-3 bg-ink-50 rounded-xl border border-ink-100 space-y-2 text-xs">
                  <div className="text-[12px] font-bold uppercase tracking-wider text-ink-500">
                    Direct Contact Channels:
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Phone Call */}
                    <a
                      href={`tel:${u.phone}`}
                      className="px-2.5 py-1 bg-white hover:bg-ink-100 border border-ink-300 rounded-lg text-ink-800 font-semibold text-[12px] flex items-center gap-1 transition"
                    >
                      <Phone className="w-3 h-3 text-forest-700" />
                      <span>{u.phone || 'No phone'}</span>
                    </a>

                    {/* WhatsApp Direct Link */}
                    <a
                      href={`https://wa.me/${waNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-forest-700 hover:bg-forest-800 text-white rounded-lg font-bold text-[12px] flex items-center gap-1 transition shadow-xs"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Email */}
                    <a
                      href={`mailto:${u.email}`}
                      className="px-2.5 py-1 bg-white hover:bg-ink-100 border border-ink-300 rounded-lg text-ink-700 font-medium text-[12px] flex items-center gap-1 transition truncate max-w-full"
                    >
                      <Mail className="w-3 h-3 text-ink-400" />
                      <span className="truncate">{u.email}</span>
                    </a>
                  </div>
                </div>

                {/* Interests & Demands Tag Area */}
                <div className="space-y-1.5 text-xs">
                  <div className="text-[12px] font-bold uppercase tracking-wider text-ink-500">
                    What this user is interested in / offering:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {u.interests && u.interests.length > 0 ? (
                      u.interests.map((interest: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-ink-100 border border-ink-200 text-ink-800 text-[12px] font-medium"
                        >
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span className="text-[12px] text-ink-400 italic">No specific trade tagged yet</span>
                    )}
                  </div>
                </div>

                {/* Admin Promotion / Delegation Controls */}
                {isLeadAdmin && !isThisLeadAdmin && (
                  <div className="pt-2 border-t border-ink-100 flex items-center justify-between">
                    <span className="text-[12px] text-ink-500 font-medium">
                      {isSecAdmin
                        ? `Assigned by: ${u.admin_assigned_by || 'Founder'}`
                        : 'Standard user access'}
                    </span>

                    {isSecAdmin ? (
                      <button
                        onClick={() => onRevokeSecondaryAdmin(u)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Revoke Admin Access</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onAssignSecondaryAdmin(u)}
                        className="px-3 py-1.5 bg-ink-900 hover:bg-ink-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-amber-300" />
                        <span>Assign as Secondary Admin</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-12 text-xs text-ink-500">
            No users found matching your search query.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersTab;
