import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { UserRole } from '../../types';

export type DashboardRole = UserRole | 'guest';

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  end?: boolean;
  /** Sidebar section heading; consecutive items with the same group sit together. */
  group?: string;
}

/** People listed in the sidebar under their own heading (a learner's educators, an educator's learners). */
export interface SidebarPeople {
  title: string;
  people: Array<{ id: string; name: string; subtitle?: string; avatar_url?: string; href: string }>;
}

export interface DashboardShellProps {
  children: ReactNode;
  /** Override the role from AuthContext when rendering a preview or a shared route. */
  role?: DashboardRole;
  navItems?: DashboardNavItem[];
  sidebarPeople?: SidebarPeople;
  className?: string;
}
