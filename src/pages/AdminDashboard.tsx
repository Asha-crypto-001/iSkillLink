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
  CheckCircle2, Sparkles, FileText, RefreshCw, TrendingUp
} from 'lucide-react';
import { AdminMetricsTab, NeedItem } from './admin/AdminMetricsTab';
import { formatUGX } from '../utils/formatters';
import { verificationProgress } from '../utils/verification';
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAction[]>([]);
  const [, setLoading] = useState(true);

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
      const [m, usersList, demand, queue, edus, suspended, reqs, bks, pays, logs] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminUsers(),
        api.getInterestsDemand(),
        api.getVerificationQueue(),
        api.getEducators({ status: undefined }),
        api.getEducators({ status: 'suspended' }),
        api.getLearnerRequests(),
        api.getBookings(),
        api.getPayments(),
        api.getAuditLogs()
      ]);

      setMetrics(m);
      setAllUsers(usersList);
      setDemandData(demand);
      setVerificationQueue(queue);
      // The educators endpoint only lists live educators by default; add applicants and suspended ones.
      const byId = new Map<string, Educator>();
      [...edus, ...queue, ...suspended].forEach((e: Educator) => byId.set(e.id, e));
      setAllEducators([...byId.values()]);
      setLearnerRequests(reqs);
      setBookings(bks);
      setPayments(pays);
      setAuditLogs(logs);

      if (reqs.length > 0 && !selectedRequest) {
        handleSelectRequestForMatching(reqs.find((r: LearnerRequest) => r.status === 'open') || reqs[0]);
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

  const handleReleasePayout = async (payment: Payment, booking?: Booking) => {
    const educatorName = booking?.educator?.user?.name || 'the educator';
    // The one action in the app that sends money out: confirm the amount and the recipient.
    if (!window.confirm(`Send ${formatUGX(payment.payout_amount_ugx)} to ${educatorName} for "${booking?.skill_name || 'this session'}"? This can't be undone.`)) return;
    try {
      await api.releasePayout(payment.id, user?.name || 'Administrator');
      loadAdminData();
    } catch (e: any) {
      console.error('Error releasing payout:', e);
      setActionError(e.message || 'The action could not be completed. Please try again.');
    }
  };

  const isLeadAdmin = user?.email === 'ashabahebwahassan665@gmail.com' || user?.role === 'admin';

  const TAB_HEADERS: Record<AdminTab, { label: string; title: string; description?: string }> = {
    metrics: { label: 'Overview', title: 'Operations' },
    users: { label: 'Users', title: 'People', description: 'Everyone on iSkillLink, how to reach them, and who has admin access.' },
    interests: { label: 'Interests', title: 'What people want to learn', description: 'Requests learners have sent and the interests they picked, so you know which skills to recruit for.' },
    verification: { label: 'Verification', title: 'Applicants', description: 'Each educator passes four checks before learners can book them.' },
    matchmaker: { label: 'Matchmaker', title: 'Match requests to educators', description: 'Live educators ranked by skill, teaching format, location, budget and experience. Matching tells the learner who you picked.' },
    educators: { label: 'Educators', title: 'Educators', description: 'Everyone who teaches or has applied to, and where each one stands.' },
    payments: { label: 'Payments', title: 'Payments & payouts' },
    audit: { label: 'Audit trail', title: 'Audit trail', description: 'Every admin action, newest first.' }
  };

  const daysSince = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
  const waitedFor = (iso: string) => {
    const days = daysSince(iso);
    return days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`;
  };

  // What needs an admin now, most urgent first: money owed, people waiting, then requests.
  const needs: NeedItem[] = [
    ...payments
      .filter(p => p.status === 'paid' && bookings.find(b => b.id === p.booking_id)?.status === 'completed')
      .map(p => {
        const booking = bookings.find(b => b.id === p.booking_id)!;
        return {
          key: `pay-${p.id}`, kind: 'money' as const, tab: 'payments' as const, actionLabel: 'Release payout',
          title: `Release ${formatUGX(p.payout_amount_ugx)} to ${booking.educator?.user?.name || 'an educator'}`,
          detail: `${booking.skill_name} with ${booking.learnerUser?.name || 'a learner'} is done`
        };
      }),
    ...[...verificationQueue]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map(e => ({
        key: `edu-${e.id}`, kind: 'applicant' as const, tab: 'verification' as const, actionLabel: 'Review',
        title: `${e.user?.name || 'An applicant'} applied ${waitedFor(e.created_at)}`,
        detail: `${e.title} · ${verificationProgress(e.verification).passed} of 4 checks passed`
      })),
    ...learnerRequests
      .filter(r => r.status === 'open')
      .map(r => ({
        key: `req-${r.id}`, kind: 'request' as const, tab: 'matchmaker' as const, actionLabel: 'Find a match',
        title: `${r.learner_name} wants to learn ${r.skill_name}`,
        detail: `${r.location} · budget ${formatUGX(r.budget_ugx)} · asked ${waitedFor(r.created_at)}`
      }))
  ];

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
        title={TAB_HEADERS[activeTab].title}
        description={TAB_HEADERS[activeTab].description}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Operations', href: '/dashboard/admin' }, { label: TAB_HEADERS[activeTab].label }]}
        actions={<button onClick={loadAdminData} className="inline-flex items-center min-h-[44px] rounded-control border border-ink-200 bg-white hover:bg-ink-50 px-4 text-xs font-semibold text-ink-800"><RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />Refresh</button>}
      />

      {assignActionMsg && (
        <Alert tone="success" onDismiss={() => setAssignActionMsg('')}>{assignActionMsg}</Alert>
      )}

      {actionError && (
        <Alert onDismiss={() => setActionError('')}>{actionError}</Alert>
      )}

      {/* Tab Panels */}
      {activeTab === 'metrics' && (
        <AdminMetricsTab
          metrics={metrics}
          totalUsersCount={allUsers.length}
          needs={needs}
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
          onFindMatch={(req) => { handleSelectRequestForMatching(req); setActiveTab('matchmaker'); }}
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
          bookings={bookings}
          onReleasePayout={handleReleasePayout}
        />
      )}

      {activeTab === 'audit' && (
        <AdminAuditTab auditLogs={auditLogs} />
      )}

    </div>
    </DashboardShell>
  );
};

export default AdminDashboard;
