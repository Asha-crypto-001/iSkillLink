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
}

export interface DashboardShellProps {
  children: ReactNode;
  /** Override the role from AuthContext when rendering a preview or a shared route. */
  role?: DashboardRole;
  navItems?: DashboardNavItem[];
  className?: string;
}
