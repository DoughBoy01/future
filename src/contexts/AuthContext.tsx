import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { authLogger } from '../utils/logger';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Organization = Database['public']['Tables']['organisations']['Row'];

/**
 * Sends welcome email to new users
 * Non-blocking - doesn't prevent signup if email fails
 */
async function sendWelcomeEmail(
  userId: string,
  email: string,
  firstName: string,
  role: 'parent' | 'camp_organizer'
) {
  const dashboardUrl = role === 'parent'
    ? `${window.location.origin}/dashboard`
    : `${window.location.origin}/organizer-dashboard`;

  const template = role === 'parent'
    ? 'signup-welcome-parent'
    : 'signup-welcome-organizer';

  try {
    await supabase.functions.invoke('send-email', {
      body: {
        template,
        to: { email, name: firstName },
        data: { firstName, email, dashboardUrl },
        context: { type: 'signup', id: userId, profile_id: userId },
      },
    });
  } catch (err) {
    console.error('Failed to send welcome email:', err);
    // Non-blocking - don't prevent signup if email fails
  }
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  organization: Organization | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: (userId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          authLogger.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        authLogger.error('Fatal error in auth initialization:', err);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        try {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await loadProfile(session.user.id);
          } else {
            setProfile(null);
            setOrganization(null);
            setLoading(false);
          }
        } catch (err) {
          authLogger.error('Error in auth state change:', err);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    try {
      authLogger.debug('Loading profile for user:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        authLogger.error('Error loading profile:', error);
        throw error;
      }

      if (!data) {
        authLogger.warn('No profile found for user:', userId);
        setProfile(null);
        setOrganization(null);
      } else {
        authLogger.info('Profile loaded successfully:', {
          id: data.id,
          role: data.role,
          name: `${data.first_name} ${data.last_name}`,
        });
        setProfile(data);

        // Load organization if profile has one
        if (data.organisation_id) {
          const { data: orgData, error: orgError } = await supabase
            .from('organisations')
            .select('*')
            .eq('id', data.organisation_id)
            .maybeSingle();

          if (orgError) {
            authLogger.error('Error loading organization:', orgError);
            setOrganization(null);
          } else if (orgData) {
            authLogger.info('Organization loaded:', orgData.name);
            setOrganization(orgData);
          }
        } else {
          setOrganization(null);
        }
      }
    } catch (error) {
      authLogger.error('Failed to load profile:', error);
      setProfile(null);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, firstName: string, lastName: string) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) return { error: authError };
      if (!authData.user) return { error: new Error('No user returned') as AuthError };

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          role: 'parent',
        });

      if (profileError) {
        authLogger.error('Error creating profile:', profileError);
      }

      // Send welcome email (non-blocking)
      if (!profileError) {
        sendWelcomeEmail(
          authData.user.id,
          email,
          firstName,
          'parent'
        ).catch(err => console.error('Failed to send welcome email:', err));
      }

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }

  async function signOut() {
    try {
      authLogger.debug('Signing out user');
      const { error } = await supabase.auth.signOut();
      if (error) {
        authLogger.error('Error signing out:', error);
        throw error;
      }
      setProfile(null);
      setOrganization(null);
      setUser(null);
      setSession(null);
      authLogger.info('User signed out successfully');
    } catch (error) {
      authLogger.error('Failed to sign out:', error);
    }
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function refreshProfile(userId?: string) {
    const targetUserId = userId || user?.id;
    if (!targetUserId) {
      authLogger.warn('Cannot refresh profile: no user ID provided or logged in');
      return;
    }
    authLogger.debug('Refreshing profile for user:', targetUserId);
    await loadProfile(targetUserId);
  }

  const value = {
    user,
    profile,
    organization,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
