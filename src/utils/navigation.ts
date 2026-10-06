/**
 * Navigation helpers: map a user's role to where they belong in the app.
 */
export type UserRole = 'parent' | 'organizer' | 'admin';

export function getDashboardRoute(role: string | null | undefined): string {
  if (role === 'organizer') return '/organizer-dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/dashboard';
}

export const isAdminRole = (role: string | null | undefined) => role === 'admin';
export const isCampOrganizerRole = (role: string | null | undefined) => role === 'organizer';
export const isParentRole = (role: string | null | undefined) => role === 'parent' || !role;
