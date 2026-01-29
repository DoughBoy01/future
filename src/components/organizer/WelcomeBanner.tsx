import { useAuth } from '../../contexts/AuthContext';
import { Sparkles } from 'lucide-react';

export function WelcomeBanner() {
  const { profile, organization } = useAuth();

  return (
    <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl shadow p-4 md:p-5 text-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg md:text-xl font-bold mb-0.5">
            Welcome back, {profile?.first_name}
          </h1>
          <p className="text-pink-100 text-sm">
            {organization?.name || 'Your organization'}
          </p>
        </div>
      </div>
    </div>
  );
}
