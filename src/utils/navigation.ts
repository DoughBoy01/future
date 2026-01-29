/**
 * Navigation utility functions
 * Helpers for determining correct routes based on user roles and context
 */

type UserRole =
  | 'parent'
  | 'camp_organizer'
  | 'super_admin'
  | 'school_admin'
  | 'marketing'
  | 'operations'
  | 'risk';

/**
 * Get the appropriate dashboard route for a user based on their role
 * @param role - The user's role
 * @returns The dashboard route path
 */
export function getDashboardRoute(role: string | null | undefined): string {
  if (!role) {
    return '/dashboard'; // Default to parent dashboard
  }

  // Camp organizers go to their dedicated dashboard
  if (role === 'camp_organizer') {
    return '/organizer-dashboard';
  }

  // Admin roles go to admin dashboard
  if (['super_admin', 'school_admin', 'marketing', 'operations', 'risk'].includes(role)) {
    return '/admin/dashboard';
  }

  // Default to parent dashboard for parent role or unknown roles
  return '/dashboard';
}

/**
 * Check if a user has admin-level access
 * @param role - The user's role
 * @returns True if user has admin access
 */
export function isAdminRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return ['super_admin', 'school_admin', 'marketing', 'operations', 'risk'].includes(role);
}

/**
 * Check if a user is a camp organizer
 * @param role - The user's role
 * @returns True if user is a camp organizer
 */
export function isCampOrganizerRole(role: string | null | undefined): boolean {
  return role === 'camp_organizer';
}

/**
 * Check if a user is a parent
 * @param role - The user's role
 * @returns True if user is a parent
 */
export function isParentRole(role: string | null | undefined): boolean {
  return role === 'parent' || !role;
}
