import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { UserPlus, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

interface InviteData {
  invite_id: string;
  email: string;
  organisation_id: string;
  organisation_name: string;
  invited_by_id: string;
  invited_by_name: string;
  is_valid: boolean;
  error_message: string;
}

export function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Invite-specific state
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [validatingInvite, setValidatingInvite] = useState(false);

  useEffect(() => {
    // Check for invite token in URL
    const token = searchParams.get('invite_token');

    if (token) {
      validateInvite(token);
    }
  }, [searchParams]);

  async function validateInvite(token: string) {
    setValidatingInvite(true);
    setInviteToken(token);

    try {
      const { data, error } = await supabase.rpc('validate_invite_token', {
        p_token: token
      });

      if (error) {
        console.error('Error validating invite:', error);
        setError('Failed to validate invitation');
        setValidatingInvite(false);
        return;
      }

      if (data && data.length > 0) {
        const invite = data[0];

        if (invite.is_valid) {
          setInviteData(invite);
          setEmail(invite.email); // Pre-fill email
          toast.success(`Welcome! You've been invited to join ${invite.organisation_name}`);
        } else {
          setError(invite.error_message || 'Invalid invitation');
          toast.error(invite.error_message || 'Invalid invitation');
        }
      } else {
        setError('Invalid invitation link');
        toast.error('Invalid invitation link');
      }
    } catch (err: any) {
      console.error('Error validating invite:', err);
      setError('Failed to validate invitation');
      toast.error('Failed to validate invitation');
    } finally {
      setValidatingInvite(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (inviteToken && inviteData) {
        // Camp organizer signup via invite
        await handleCampOrganizerSignup();
      } else {
        // Regular parent signup
        const { error } = await signUp(email, password, firstName, lastName);

        if (error) {
          setError(error.message);
          setLoading(false);
        } else {
          onSuccess?.();
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
      setLoading(false);
    }
  }

  async function handleCampOrganizerSignup() {
    if (!inviteData) {
      setError('Invite data not found');
      setLoading(false);
      return;
    }

    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from signup');

      // 2. Create profile with camp_organizer role
      const profileData: any = {
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        role: 'camp_organizer'
      };

      // Only set organisation_id if the invite includes one
      if (inviteData.organisation_id) {
        profileData.organisation_id = inviteData.organisation_id;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw new Error('Failed to create profile');
      }

      // 3. Mark invite as accepted
      const { error: inviteUpdateError } = await supabase
        .from('camp_organizer_invites')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          profile_id: authData.user.id
        })
        .eq('token', inviteToken);

      if (inviteUpdateError) {
        console.error('Error updating invite status:', inviteUpdateError);
        // Non-fatal error - continue anyway
      }

      // 4. Create organisation_member record (only if invite has organisation_id)
      if (inviteData.organisation_id) {
        const { error: memberError } = await supabase
          .from('organisation_members')
          .insert({
            organisation_id: inviteData.organisation_id,
            profile_id: authData.user.id,
            role: 'owner',
            status: 'active',
            invited_by: inviteData.invited_by_id,
            joined_at: new Date().toISOString()
          });

        if (memberError) {
          console.error('Error creating organisation member:', memberError);
          throw new Error('Failed to link to organisation');
        }
      }

      // Success!
      toast.success('Account created successfully! Welcome to the platform.');

      // Redirect to camp organizer dashboard
      setTimeout(() => {
        navigate('/organizer-dashboard');
      }, 1000);

    } catch (err: any) {
      console.error('Error in camp organizer signup:', err);
      setError(err.message || 'Failed to complete signup');
      setLoading(false);
    }
  }

  if (validatingInvite) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
          <p className="text-center mt-4 text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex items-center justify-center mb-8">
          <div className={`p-3 rounded-xl ${inviteData ? 'bg-blue-600' : 'bg-green-600'}`}>
            {inviteData ? (
              <Building2 className="w-6 h-6 text-white" />
            ) : (
              <UserPlus className="w-6 h-6 text-white" />
            )}
          </div>
        </div>

        {inviteData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">You've Been Invited!</h3>
                <p className="text-sm text-blue-800">
                  <span className="font-medium">{inviteData.invited_by_name}</span> has invited you
                  to join the platform as a camp organizer
                  {inviteData.organisation_name && inviteData.organisation_name !== 'N/A' && (
                    <> for <span className="font-medium">{inviteData.organisation_name}</span></>
                  )}.
                </p>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {inviteData ? 'Complete Your Registration' : 'Create Account'}
        </h2>
        <p className="text-gray-600 text-center mb-8">
          {inviteData
            ? 'Fill in your details to get started'
            : 'Join FutureEdge to register for camps'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="John"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!inviteData} // Disable if from invite
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="you@example.com"
            />
            {inviteData && (
              <p className="mt-1 text-xs text-gray-500">Email from invitation (cannot be changed)</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || (!!inviteToken && !inviteData)}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : inviteData ? 'Complete Registration' : 'Create Account'}
          </button>
        </form>

        {!inviteData && (
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
