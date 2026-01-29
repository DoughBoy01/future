import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';
import { getDashboardRoute } from '../utils/navigation';

type AuthMode = 'login' | 'signup' | 'reset';

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'signup') setMode('signup');
    else if (modeParam === 'reset') setMode('reset');
    else setMode('login');
  }, [searchParams]);

  useEffect(() => {
    if (user && profile) {
      // Check if camp organizer needs to complete onboarding
      if (profile.role === 'camp_organizer' && !profile.onboarding_completed && profile.onboarding_step) {
        // Redirect to appropriate onboarding step
        const stepRoutes = {
          'welcome': '/onboarding/welcome',
          'organization': '/onboarding/organization',
          'first_camp': '/onboarding/first-camp',
          'completed': '/organizer-dashboard'
        };
        const route = stepRoutes[profile.onboarding_step as keyof typeof stepRoutes] || '/organizer-dashboard';
        navigate(route);
      }
      // Redirect based on user role using utility function
      else {
        navigate(getDashboardRoute(profile.role));
      }
    }
  }, [user, profile, navigate]);

  const handleSuccess = () => {
    // Let the useEffect above handle navigation based on role
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
