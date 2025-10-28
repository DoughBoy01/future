import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';

type AuthMode = 'login' | 'signup' | 'reset';

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'signup') setMode('signup');
    else if (modeParam === 'reset') setMode('reset');
    else setMode('login');
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {mode === 'login' && (
        <LoginForm
          onSuccess={handleSuccess}
          onSwitchToSignup={() => setMode('signup')}
          onSwitchToReset={() => setMode('reset')}
        />
      )}
      {mode === 'signup' && (
        <SignupForm
          onSuccess={handleSuccess}
          onSwitchToLogin={() => setMode('login')}
        />
      )}
      {mode === 'reset' && (
        <ResetPasswordForm
          onSuccess={handleSuccess}
          onSwitchToLogin={() => setMode('login')}
        />
      )}
    </div>
  );
}
