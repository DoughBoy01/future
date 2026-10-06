import type { Context } from 'hono';
import type { AppEnv, SessionUser } from '../env';

/** Returns the signed-in user, or a 401 response for the route to return. */
export function requireUser(c: Context<AppEnv>): SessionUser | Response {
  const user = c.get('user');
  return user ?? c.json({ error: 'Please sign in to continue.' }, 401);
}
