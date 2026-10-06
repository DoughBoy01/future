import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { DEFAULT_COMMISSION_RATE } from '../../../shared/constants';
import { UserPlus, AlertCircle } from 'lucide-react';

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const MIN_PASSWORD_LENGTH = 8;

export function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const { signUp, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCampOwnerSignup = searchParams.get('role') === 'camp_owner';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < MIN_PASSWORD_LENGTH) {
      return setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }

    setLoading(true);
    const { error: signUpError } = await signUp(email, password, firstName, lastName);
    if (signUpError) {
      setError(signUpError.message);
      return setLoading(false);
    }

    if (!isCampOwnerSignup) {
      onSuccess?.();
      return;
    }

    try {
      // The server creates the organisation and promotes this account to organizer together.
      await api.organisations.create(organizationName.trim() || `${firstName} ${lastName}'s Camps`);
      await refreshProfile();
      navigate('/organizer-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Your account was created, but we could not set up your organisation.');
      setLoading(false);
    }
  }

  const accent = isCampOwnerSignup ? 'focus:ring-pink-500' : 'focus:ring-green-500';
  const inputClass = `w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ${accent} focus:border-transparent transition-all`;

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="p-3 rounded-xl bg-green-600">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {isCampOwnerSignup ? 'Start Growing Your Camp Business' : 'Create Account'}
        </h2>
        <p className="text-gray-600 text-center mb-8">
          {isCampOwnerSignup
            ? 'Create your account and list your first camp in minutes'
            : 'Join FutureEdge to register for camps'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                required autoComplete="given-name" className={inputClass} placeholder="John" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                required autoComplete="family-name" className={inputClass} placeholder="Doe" />
            </div>
          </div>

          {isCampOwnerSignup && (
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input id="organizationName" type="text" value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)} className={inputClass}
                placeholder="Summer Adventure Camps" />
              <p className="mt-1 text-xs text-gray-500">You can change this later</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required autoComplete="email" className={inputClass} placeholder="you@example.com" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" className={inputClass}
              placeholder="••••••••" />
            <p className="mt-1 text-xs text-gray-500">At least {MIN_PASSWORD_LENGTH} characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input id="confirmPassword" type="password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password"
              className={inputClass} placeholder="••••••••" />
          </div>

          {isCampOwnerSignup && (
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <p className="text-xs text-pink-900">
                By creating an account, you agree to our standard {Math.round(DEFAULT_COMMISSION_RATE * 100)}% commission on
                bookings. No setup fees, no monthly costs — you only pay when you get paid.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              isCampOwnerSignup
                ? 'bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 focus:ring-pink-500'
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
            } text-white py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Creating account...' : isCampOwnerSignup ? 'Get Started Free' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-green-600 hover:text-green-700 font-medium transition-colors">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
