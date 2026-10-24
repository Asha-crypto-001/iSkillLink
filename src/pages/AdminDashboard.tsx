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
import { DashboardHeader, DashboardShell } from '../components/dashboard';
import { Alert } from '../components/ui/Alert';

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
  const [actionError, setActionError] = useState('');

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
    } catch (e: any) {
      console.error('Error assigning secondary admin:', e);
      setActionError(e.message || 'The action could not be completed. Please try again.');
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
    } catch (e: any) {
      console.error('Error revoking secondary admin:', e);
      setActionError(e.message || 'The action could not be completed. Please try again.');
    }
  };

  const handleSelectRequestForMatching = async (req: LearnerRequest) => {
    setSelectedRequest(req);
    setIsMatchingLoading(true);
    setMatchSuccessMsg('');
    try {
      const res = await api.getMatchesForRequest(req.id);
      setEvaluatedMatches(res.matches);
    } catch (e: any) {
      console.error('Error computing matches:', e);
      setActionError(e.message || 'The action could not be completed. Please try again.');
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
    } catch (e: any) {
      console.error('Failed to assign match:', e);
      setActionError(e.message || 'The action could not be completed. Please try again.');
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
    } catch (e: any) {
      console.error('Error updating verification step:', e);
      setActionError(e.message || 'The action could not be completed. Please try again.');
    }
  };

  const handleSuspendEducator = async (educatorId: string) => {
    try {
      await api.updateEducatorStatus(educatorId, 'suspended', 'Administrative hold pending inquiry', 'Ashabahebwa Hassan');
      loadAdminData();
    } catch (e: any) {
      console.error('Error suspending educator:', e);
      setActionError(e.message || 'The action could not be completed. Please try again.');
    }
  };

  const handleReleasePayout = async (paymentId: string) => {
    try {
      await api.releasePayout(paymentId, 'Ashabahebwa Hassan (Admin & Founder)');
      loadAdminData();
    } catch (e: any) {
      console.error('Error releasing payout:', e);
      setActionError(e.message || 'The action could not be completed. Please try again.');
    }
  };

  const isLeadAdmin = user?.email === 'ashabahebwahassan665@gmail.com' || user?.role === 'admin';

  return (
    <DashboardShell role="admin" navItems={[
      { label: 'Overview', href: '/dashboard/admin', icon: ShieldCheck, end: true },
      { label: 'Users', href: '/dashboard/admin/users', icon: Users },
      { label: 'Interests', href: '/dashboard/admin/interests', icon: TrendingUp },
      { label: 'Verification', href: '/dashboard/admin/verification', icon: CheckCircle2 },
      { label: 'Matchmaker', href: '/dashboard/admin/matchmaker', icon: Sparkles },
      { label: 'Educators', href: '/dashboard/admin/educators', icon: GraduationCap },
      { label: 'Payments', href: '/dashboard/admin/payments', icon: CreditCard },
      { label: 'Audit trail', href: '/dashboard/admin/audit', icon: FileText }
    ]}>
    <div className="max-w-7xl mx-auto space-y-6">
      <DashboardHeader
        eyebrow="Platform operations & trust center"
        title="iSkillLink Operations Dashboard"
        description="Admin oversight for verification queues, user directory, demand intelligence, delegation, and escrow."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Operations', href: '/dashboard/admin' }, { label: activeTab }]}
        actions={<button onClick={loadAdminData} className="rounded-card bg-forest-700 px-4 py-2 text-xs font-semibold text-white"><RefreshCw className="mr-2 inline h-4 w-4" />Refresh Data</button>}
      />

      {/* Admin Profile & Lead Badge */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-ink-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
              alt={user?.name || 'Ashabahebwa Hassan'}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-forest-600 shadow-sm"
            />
            <button
              onClick={() => setShowPhotoModal(true)}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-forest-700 text-white shadow hover:bg-forest-800 transition"
              title="Change Profile Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-ink-900">{user?.name || 'Ashabahebwa Hassan'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-ink-900 text-white flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-forest-400" />
                {user?.role === 'admin' ? 'Founder & Primary Admin' : 'Secondary Administrator'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-ink-400" />
                {user?.email || 'ashabahebwahassan665@gmail.com'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-ink-400" />
                {user?.phone || '+256 744 024 529'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-ink-400" />
                Mbarara City HQ
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowPhotoModal(true)}
          className="px-4 py-2 bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-200 rounded-xl text-xs font-bold transition flex items-center gap-2"
        >
          <Camera className="w-4 h-4 text-forest-700" />
          <span>Update Profile Picture</span>
        </button>
      </div>

      {assignActionMsg && (
        <div className="p-3.5 rounded-xl bg-forest-50 border border-forest-200 text-forest-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
          <span>{assignActionMsg}</span>
        </div>
      )}

      {actionError && (
        <Alert onDismiss={() => setActionError('')}>{actionError}</Alert>
      )}

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
    </DashboardShell>
  );
};

export default AdminDashboard;
