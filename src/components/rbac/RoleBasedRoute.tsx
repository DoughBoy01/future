import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export function RoleBasedRoute({
  children,
  allowedRoles,
  redirectTo = '/',
}: RoleBasedRouteProps) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    console.warn('[RoleBasedRoute] No profile found, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    console.warn('[RoleBasedRoute] User role not allowed:', {
      userRole: profile.role,
      allowedRoles,
      redirectTo,
    });
    return <Navigate to={redirectTo} replace />;
  }

  console.log('[RoleBasedRoute] Access granted:', {
    userRole: profile.role,
    allowedRoles,
  });

  return <>{children}</>;
}
