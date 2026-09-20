import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, BookOpen, CalendarDays, CreditCard, FileText, LayoutDashboard, MessageSquare, Settings, ShieldCheck, Users, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopbar } from './DashboardTopbar';
import { DashboardNavItem, DashboardRole, DashboardShellProps } from './dashboardTypes';

const roleItems: Record<DashboardRole, DashboardNavItem[]> = {
  learner: [
    { label: 'Overview', href: '/dashboard/learner', icon: LayoutDashboard, end: true },
    { label: 'My requests', href: '/dashboard/learner/requests', icon: FileText },
    { label: 'Bookings', href: '/dashboard/learner/bookings', icon: CalendarDays },
    { label: 'Messages', href: '/dashboard/learner/messages', icon: MessageSquare },
    { label: 'Payments', href: '/dashboard/learner/payments', icon: CreditCard },
  ],
  educator: [
    { label: 'Overview', href: '/dashboard/educator', icon: LayoutDashboard, end: true },
    { label: 'Bookings', href: '/dashboard/educator/bookings', icon: CalendarDays },
    { label: 'Leads', href: '/dashboard/educator/leads', icon: Users },
    { label: 'Earnings', href: '/dashboard/educator/earnings', icon: Wallet },
    { label: 'Reviews', href: '/dashboard/educator/reviews', icon: BarChart3 },
  ],
  admin: [
    { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard, end: true },
    { label: 'Users', href: '/dashboard/admin/users', icon: Users },
    { label: 'Verification', href: '/dashboard/admin/verification', icon: ShieldCheck },
    { label: 'Matchmaker', href: '/dashboard/admin/matchmaker', icon: BookOpen },
    { label: 'Payments', href: '/dashboard/admin/payments', icon: CreditCard },
  ],
  secondary_admin: [
    { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard, end: true },
    { label: 'Users', href: '/dashboard/admin/users', icon: Users },
    { label: 'Verification', href: '/dashboard/admin/verification', icon: ShieldCheck },
  ],
  guest: [],
};

export const DashboardShell: React.FC<DashboardShellProps> = ({ children, role: roleOverride, navItems, className }) => {
  const { activeRole } = useAuth();
  const role = roleOverride || activeRole;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const items = useMemo(() => navItems || roleItems[role], [navItems, role]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setSidebarOpen(false);
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [sidebarOpen]);

  return (
    <div className={cn('min-h-screen bg-ink-50', className)}>
      {sidebarOpen && <button type="button" className="fixed inset-0 z-40 bg-ink-950/40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation overlay" />}
      <div className="flex min-h-screen">
        <DashboardSidebar items={items} role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar onMenuClick={() => setSidebarOpen(true)} />
          <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
};

export type { DashboardNavItem, DashboardRole, DashboardShellProps } from './dashboardTypes';
