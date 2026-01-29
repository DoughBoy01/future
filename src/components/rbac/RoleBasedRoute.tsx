import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';

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

  console.log('🔒 RoleBasedRoute check:', {
    loading,
    profile: profile?.role,
    allowedRoles,
    redirectTo
  });

  if (loading) {
    console.log('⏳ Still loading auth...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    console.log('❌ No profile found, redirecting to:', redirectTo);
    logger.warn('RoleBasedRoute: No profile found, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    console.log('❌ Role not allowed:', profile.role, 'allowed:', allowedRoles);
    logger.warn('RoleBasedRoute: User role not allowed', {
      userRole: profile.role,
      allowedRoles,
      redirectTo,
    });
    return <Navigate to={redirectTo} replace />;
  }

  console.log('✅ Access granted!');
  logger.debug('RoleBasedRoute: Access granted', {
    userRole: profile.role,
    allowedRoles,
  });

  return <>{children}</>;
}
