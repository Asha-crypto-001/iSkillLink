import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AdminMetrics, Educator, LearnerRequest, Booking,
  Payment, AdminAction, MatchEvaluation
} from '../types';
import { api } from '../services/api';
import {
  ShieldCheck, Users, GraduationCap, CreditCard,
  CheckCircle2, Sparkles, FileText, RefreshCw,
  Camera, Phone, Mail, MapPin, UserCheck, TrendingUp
} from 'lucide-react';
import { ProfilePhotoUploadModal } from '../components/ProfilePhotoUploadModal';
import { AdminMetricsTab } from './admin/AdminMetricsTab';
import { AdminUsersTab } from './admin/AdminUsersTab';
import { AdminInterestsTab } from './admin/AdminInterestsTab';
import { AdminVerificationTab } from './admin/AdminVerificationTab';
import { AdminMatchmakerTab } from './admin/AdminMatchmakerTab';
import { AdminEducatorsTab } from './admin/AdminEducatorsTab';
import { AdminPaymentsTab } from './admin/AdminPaymentsTab';
import { AdminAuditTab } from './admin/AdminAuditTab';

type AdminTab =
  | 'metrics'
  | 'users'
  | 'interests'
  | 'verification'
  | 'matchmaker'
  | 'educators'
  | 'payments'
  | 'audit';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const getActiveTab = (): AdminTab => {
    const seg = location.pathname.split('/')[3] as AdminTab;
    if (['metrics','users','interests','verification','matchmaker','educators','payments','audit'].includes(seg)) return seg;
    return 'metrics';
  };
  const activeTab = getActiveTab();
  const setActiveTab = (tab: AdminTab) => {
    if (tab === 'metrics') navigate('/dashboard/admin');
    else navigate(`/dashboard/admin/${tab}`);
  };
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [demandData, setDemandData] = useState<any>(null);
  const [verificationQueue, setVerificationQueue] = useState<Educator[]>([]);
  const [allEducators, setAllEducators] = useState<Educator[]>([]);
  const [learnerRequests, setLearnerRequests] = useState<LearnerRequest[]>([]);
  const [, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAction[]>([]);
  const [, setLoading] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // User directory search & filter state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'secondary_admin' | 'educator' | 'learner'>('all');
  const [assignActionMsg, setAssignActionMsg] = useState('');

  // Matchmaker interactive state
  const [selectedRequest, setSelectedRequest] = useState<LearnerRequest | null>(null);
  const [evaluatedMatches, setEvaluatedMatches] = useState<MatchEvaluation[]>([]);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);
  const [matchSuccessMsg, setMatchSuccessMsg] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [m, usersList, demand, queue, edus, reqs, bks, pays, logs] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminUsers(),
        api.getInterestsDemand(),
        api.getVerificationQueue(),
        api.getEducators({ status: undefined }),
        api.getLearnerRequests(),
        api.getBookings(),
        api.getPayments(),
        api.getAuditLogs()
      ]);

      setMetrics(m);
      setAllUsers(usersList);
      setDemandData(demand);
      setVerificationQueue(queue);
      setAllEducators(edus);
      setLearnerRequests(reqs);
      setBookings(bks);
      setPayments(pays);
      setAuditLogs(logs);

      if (reqs.length > 0 && !selectedRequest) {
        handleSelectRequestForMatching(reqs[0]);
      }
    } catch (err) {
      console.error('Failed to load admin operations data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleAssignSecondaryAdmin = async (targetUser: any) => {
    const confirmMsg = `Promote ${targetUser.name} (${targetUser.email}) to Secondary Administrator? They will be granted operational access to verification queues and platform oversight.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.assignSecondaryAdmin(targetUser.id, user?.id, user?.name || 'Ashabahebwa Hassan');
      setAssignActionMsg(`Successfully assigned ${targetUser.name} as Secondary Administrator.`);
      setTimeout(() => setAssignActionMsg(''), 4000);
      loadAdminData();
    } catch (e) {
      console.error('Error assigning secondary admin:', e);
    }
  };

  const handleRevokeSecondaryAdmin = async (targetUser: any) => {
    const confirmMsg = `Revoke Secondary Administrator privileges for ${targetUser.name}? Their account will return to regular permissions.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.revokeSecondaryAdmin(targetUser.id, user?.id, user?.name || 'Ashabahebwa Hassan');
      setAssignActionMsg(`Revoked secondary administrator privileges for ${targetUser.name}.`);
      setTimeout(() => setAssignActionMsg(''), 4000);
      loadAdminData();
    } catch (e) {
      console.error('Error revoking secondary admin:', e);
    }
  };

  const handleSelectRequestForMatching = async (req: LearnerRequest) => {
    setSelectedRequest(req);
    setIsMatchingLoading(true);
    setMatchSuccessMsg('');
    try {
      const res = await api.getMatchesForRequest(req.id);
      setEvaluatedMatches(res.matches);
    } catch (e) {
      console.error('Error computing matches:', e);
    } finally {
      setIsMatchingLoading(false);
    }
  };

  const handleAssignMatch = async (educatorId: string) => {
    if (!selectedRequest) return;
    try {
      await api.assignMatch(selectedRequest.id, educatorId, 'Ashabahebwa Hassan (Admin & Founder)');
      setMatchSuccessMsg('Match successfully assigned! Learner and educator notified.');
      loadAdminData();
    } catch (e) {
      console.error('Failed to assign match:', e);
    }
  };

  const handleVerifyStep = async (educatorId: string, step: 'national_id' | 'background_check' | 'interview' | 'skill_assessment') => {
    try {
      await api.updateVerificationStep({
        educator_id: educatorId,
        step,
        status: step === 'interview' ? 'completed' : 'verified',
        admin_name: 'Ashabahebwa Hassan'
      });
      loadAdminData();
    } catch (e) {
      console.error('Error updating verification step:', e);
    }
  };

  const handleApproveEducator = async (educatorId: string) => {
    try {
      await api.updateEducatorStatus(educatorId, 'active', 'Approved following complete verification & trade review', 'Ashabahebwa Hassan');
      loadAdminData();
    } catch (e) {
      console.error('Error approving educator:', e);
    }
  };

  const handleSuspendEducator = async (educatorId: string) => {
    try {
      await api.updateEducatorStatus(educatorId, 'suspended', 'Administrative hold pending inquiry', 'Ashabahebwa Hassan');
      loadAdminData();
    } catch (e) {
      console.error('Error suspending educator:', e);
    }
  };

  const handleReleasePayout = async (paymentId: string) => {
    try {
      await api.releasePayout(paymentId, 'Ashabahebwa Hassan (Admin & Founder)');
      loadAdminData();
    } catch (e) {
      console.error('Error releasing payout:', e);
    }
  };

  const isLeadAdmin = user?.email === 'ashabahebwahassan665@gmail.com' || user?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <nav aria-label="Breadcrumb" className="text-xs">
        <ol className="flex items-center gap-1.5 text-gray-500">
          <li><a href="/" onClick={(e)=>{e.preventDefault(); navigate('/');}} className="hover:text-emerald-700 font-medium">Home</a></li>
          <li className="text-gray-400">›</li>
          <li><a href="/dashboard/admin" onClick={(e)=>{e.preventDefault(); navigate('/dashboard/admin');}} className="hover:text-emerald-700 font-medium">Operations</a></li>
          <li className="text-gray-400">›</li>
          <li className="text-gray-900 font-semibold capitalize">{activeTab}</li>
        </ol>
      </nav>
      {/* Operations Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-md border border-white/20 p-1.5 flex items-center justify-center shrink-0">
            <img
              src="./logo.png"
              alt="iSkillLink Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Platform Operations & Trust Center
              </span>
              <span className="text-xs text-slate-400">Mbarara HQ, Western Uganda</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              iSkillLink Operations Dashboard
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Admin oversight: Verification queues, user directory & contacts, demand intelligence, secondary admin delegation, and escrow ledger.
            </p>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Admin Profile & Lead Badge */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
              alt={user?.name || 'Ashabahebwa Hassan'}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-600 shadow-sm"
            />
            <button
              onClick={() => setShowPhotoModal(true)}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-emerald-700 text-white shadow hover:bg-emerald-800 transition"
              title="Change Profile Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-900">{user?.name || 'Ashabahebwa Hassan'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-emerald-400" />
                {user?.role === 'admin' ? 'Founder & Primary Admin' : 'Secondary Administrator'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {user?.email || 'ashabahebwahassan665@gmail.com'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {user?.phone || '+256 744 024 529'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                Mbarara City HQ
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowPhotoModal(true)}
          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-2"
        >
          <Camera className="w-4 h-4 text-emerald-700" />
          <span>Update Profile Picture</span>
        </button>
      </div>

      {assignActionMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{assignActionMsg}</span>
        </div>
      )}

      {/* Navigation Tabs — Phase 4: 44px, snap, no squeeze */}
      <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-sm overflow-x-auto flex space-x-1 no-scrollbar snap-x-mandatory" role="tablist" aria-label="Admin operations sections">
        {[
          { id: 'metrics', label: 'Platform Metrics', icon: ShieldCheck },
          { id: 'users', label: `User Directory & Contacts (${allUsers.length})`, icon: Users },
          { id: 'interests', label: `Demands & User Interests`, icon: TrendingUp },
          { id: 'verification', label: `Verification Queue (${verificationQueue.length})`, icon: CheckCircle2 },
          { id: 'matchmaker', label: `Rule-Based Matchmaker`, icon: Sparkles },
          { id: 'educators', label: `Educators Directory (${allEducators.length})`, icon: GraduationCap },
          { id: 'payments', label: `Escrow Ledger (${payments.length})`, icon: CreditCard },
          { id: 'audit', label: `Audit Trail (${auditLogs.length})`, icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`snap-start-item px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'metrics' && (
        <AdminMetricsTab
          metrics={metrics}
          totalUsersCount={allUsers.length}
          learnerRequests={learnerRequests}
          auditLogs={auditLogs}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'users' && (
        <AdminUsersTab
          users={allUsers}
          userSearchQuery={userSearchQuery}
          setUserSearchQuery={setUserSearchQuery}
          userRoleFilter={userRoleFilter}
          setUserRoleFilter={setUserRoleFilter}
          isLeadAdmin={isLeadAdmin}
          onAssignSecondaryAdmin={handleAssignSecondaryAdmin}
          onRevokeSecondaryAdmin={handleRevokeSecondaryAdmin}
        />
      )}

      {activeTab === 'interests' && (
        <AdminInterestsTab
          demandData={demandData}
          learnerRequests={learnerRequests}
        />
      )}

      {activeTab === 'verification' && (
        <AdminVerificationTab
          verificationQueue={verificationQueue}
          onApproveEducator={handleApproveEducator}
          onSuspendEducator={handleSuspendEducator}
          onVerifyStep={handleVerifyStep}
        />
      )}

      {activeTab === 'matchmaker' && (
        <AdminMatchmakerTab
          learnerRequests={learnerRequests}
          selectedRequest={selectedRequest}
          onSelectRequest={handleSelectRequestForMatching}
          evaluatedMatches={evaluatedMatches}
          isMatchingLoading={isMatchingLoading}
          matchSuccessMsg={matchSuccessMsg}
          onAssignMatch={handleAssignMatch}
        />
      )}

      {activeTab === 'educators' && (
        <AdminEducatorsTab educators={allEducators} />
      )}

      {activeTab === 'payments' && (
        <AdminPaymentsTab
          payments={payments}
          onReleasePayout={handleReleasePayout}
        />
      )}

      {activeTab === 'audit' && (
        <AdminAuditTab auditLogs={auditLogs} />
      )}

      {/* Profile Photo Upload Modal */}
      <ProfilePhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />
    </div>
  );
};

export default AdminDashboard;
