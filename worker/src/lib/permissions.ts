import type { SessionUser } from '../env';

/**
 * The single place access is decided. Replaces the row-level-security policies:
 * routes ask `can(...)`, they never inspect roles themselves.
 */
export type Action =
  | 'camp:read-any'
  | 'camp:create'
  | 'camp:update'
  | 'camp:review'
  | 'organisation:update'
  | 'booking:read-all';

type Resource = { organisationId?: string | null };

export function can(user: SessionUser | null, action: Action, resource: Resource = {}): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const ownsOrg = !!user.organisationId && user.organisationId === resource.organisationId;
  switch (action) {
    case 'camp:create':
      return user.role === 'organizer' && !!user.organisationId;
    case 'camp:update':
    case 'camp:read-any':
    case 'organisation:update':
      return user.role === 'organizer' && ownsOrg;
    default:
      return false; // camp:review, booking:read-all → admin only
  }
}
