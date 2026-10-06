import { createAuthClient } from 'better-auth/react';

// Same origin as the app: the Worker serves both, so cookies need no CORS handling.
export const authClient = createAuthClient({ basePath: '/api/auth' });
