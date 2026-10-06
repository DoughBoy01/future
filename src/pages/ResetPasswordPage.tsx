import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { authClient } from '../lib/auth-client';

const MIN_PASSWORD_LENGTH = 8;

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const linkInvalid = !token || params.get('error') === 'INVALID_TOKEN';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    if (password.length < MIN_PASSWORD_LENGTH) return setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);

    setLoading(true);
    const { error: resetError } = await authClient.resetPassword({ newPassword: password, token: token! });
    if (resetError) {
      setError(resetError.message ?? 'This reset link has expired. Please request a new one.');
      return setLoading(false);
    }
    navigate('/auth');
  }

  const inputClass = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-green-600 p-3 rounded-xl"><KeyRound className="w-6 h-6 text-white" /></div>
        </div>

        {linkInvalid ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">This link has expired</h1>
            <p className="text-gray-600 mb-6">Reset links work once and expire quickly. Request a fresh one to continue.</p>
            <Link to="/auth?mode=reset" className="text-green-600 hover:text-green-700 font-medium">Request a new link</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Choose a new password</h1>
            <p className="text-gray-600 text-center mb-8">Then sign in as usual.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">New password</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" className={inputClass} />
              </div>
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
                <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  required autoComplete="new-password" className={inputClass} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50">
                {loading ? 'Saving...' : 'Update password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
