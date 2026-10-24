import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface RequireAuthProps {
  children: ReactNode;
  /** Roles allowed through; any signed-in user when omitted. */
  roles?: UserRole[];
  /** Shown to signed-in users without an allowed role. */
  denied?: ReactNode;
}

/**
 * Route guard: waits for the session to load, sends signed-out visitors to sign in
 * (returning them here afterwards), and shows `denied` to users without an allowed role.
 * Declared at module level so guarded pages are not remounted on every App render.
 */
export const RequireAuth: React.FC<RequireAuthProps> = ({ children, roles, denied = null }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading && !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-live="polite">
        <span className="w-6 h-6 border-2 border-forest-700 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading your account…</span>
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?next=${next}`} replace />;
  }

  if (roles && !roles.includes(user.role)) return <>{denied}</>;

  return <>{children}</>;
};

export default RequireAuth;
