import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { authClient } from '../lib/auth-client';
import { api, type MeDto, type OrganisationDto } from '../lib/api';
import type { Role } from '../../shared/me';

export interface Profile {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  organisationId: string | null;
  createdAt: string;
  /** Set by the organizer onboarding flow; undefined until that is migrated. */
  onboardingStep?: string;
  onboardingCompleted?: boolean;
}

interface AuthResult {
  error: { message: string } | null;
}

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  organization: OrganisationDto | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updateProfile: (updates: { firstName?: string; lastName?: string; phone?: string | null; avatarUrl?: string | null }) => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toProfile = (me: MeDto): Profile => {
  const [firstName, ...rest] = me.name.trim().split(/\s+/);
  return {
    id: me.id,
    email: me.email,
    name: me.name,
    firstName: firstName ?? '',
    lastName: rest.join(' '),
    phone: me.phone,
    avatarUrl: me.image,
    role: me.role,
    organisationId: me.organisationId,
    createdAt: me.createdAt,
  };
};

const failure = (error: unknown): AuthResult => ({
  error: { message: error instanceof Error ? error.message : 'Something went wrong. Please try again.' },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<OrganisationDto | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const { user, organisation } = await api.me.get();
      setProfile(user ? toProfile(user) : null);
      setOrganization(organisation);
    } catch {
      setProfile(null);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const value = useMemo<AuthContextType>(
    () => ({
      user: profile ? { id: profile.id, email: profile.email } : null,
      profile,
      organization,
      loading,
      refreshProfile,

      async signUp(email, password, firstName, lastName) {
        try {
          const { error } = await authClient.signUp.email({
            email,
            password,
            name: `${firstName} ${lastName}`.trim(),
          });
          if (error) return { error: { message: error.message ?? 'Could not create your account.' } };
          await refreshProfile();
          return { error: null };
        } catch (e) {
          return failure(e);
        }
      },

      async signIn(email, password) {
        try {
          const { error } = await authClient.signIn.email({ email, password });
          if (error) return { error: { message: error.message ?? 'Invalid email or password.' } };
          await refreshProfile();
          return { error: null };
        } catch (e) {
          return failure(e);
        }
      },

      async signOut() {
        await authClient.signOut().catch(() => undefined);
        setProfile(null);
        setOrganization(null);
      },

      async resetPassword(email) {
        try {
          const { error } = await authClient.requestPasswordReset({ email, redirectTo: '/reset-password' });
          return { error: error ? { message: error.message ?? 'Could not send the reset email.' } : null };
        } catch (e) {
          return failure(e);
        }
      },

      async updateProfile({ firstName, lastName, phone, avatarUrl }) {
        try {
          const name = [firstName ?? profile?.firstName, lastName ?? profile?.lastName].filter(Boolean).join(' ');
          await api.me.update({ name: name || undefined, phone, image: avatarUrl });
          await refreshProfile();
          return { error: null };
        } catch (e) {
          return failure(e);
        }
      },
    }),
    [profile, organization, loading, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
