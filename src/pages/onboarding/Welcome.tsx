import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, ArrowRight, Zap, DollarSign, Users } from 'lucide-react';
import { updateOnboardingStep } from '../../services/onboardingService';
import { getDashboardRoute } from '../../utils/navigation';
import { useCommissionRate } from '../../hooks/useCommissionRate';
import { usePromotionalOffer } from '../../hooks/usePromotionalOffer';
import { formatCommissionSplit } from '../../utils/commissionRateFormatting';

export default function Welcome() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { rate, loading: rateLoading } = useCommissionRate();
  const { offer, isActive: hasActiveOffer } = usePromotionalOffer();

  useEffect(() => {
    console.log('🎯 Welcome page - user:', user?.id, 'profile role:', profile?.role);

    // Redirect if not logged in or not a camp organizer
    if (!user || !profile) {
      console.log('⚠️ No user or profile, redirecting to auth');
      navigate('/auth');
      return;
    }

    if (profile.role !== 'camp_organizer') {
      console.log('⚠️ Not a camp organizer, redirecting to appropriate dashboard');
      navigate(getDashboardRoute(profile.role));
      return;
    }

    // Update onboarding step
    console.log('✅ Updating onboarding step to welcome');
    updateOnboardingStep(user.id, 'welcome').catch(console.error);
  }, [user, profile, navigate]);

  const handleGetStarted = () => {
    navigate('/onboarding/organization');
  };

  const userName = profile?.first_name || 'there';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
            Welcome, {userName}! 🎉
          </h1>
          <p className="text-xl text-gray-600 text-center mb-10">
            You're on your way to filling your camps faster and getting paid instantly.
          </p>

          {/* What's Next Section */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Complete these simple steps to go live:</h2>
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4 items-start p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg border-2 border-pink-200">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Set up your organization</h3>
                  <p className="text-sm text-gray-600">
                    Add your basic contact information (takes 2 minutes)
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Create your first camp</h3>
                  <p className="text-sm text-gray-600">
                    Our guided wizard makes it easy (about 10 minutes)
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Connect Stripe for payments</h3>
                  <p className="text-sm text-gray-600">
                    Set up instant payouts to receive your earnings (5 minutes)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Reminder */}
          <div className="mb-10 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-4">What you'll get:</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="font-medium text-gray-900 text-sm">Instant Payouts</div>
                {rateLoading ? (
                  <div className="text-xs text-gray-400 mt-1">Loading...</div>
                ) : hasActiveOffer && offer ? (
                  <div className="text-xs text-green-600 font-semibold mt-1">
                    🎉 {offer.display_text}
                  </div>
                ) : (
                  <div className="text-xs text-gray-600 mt-1">
                    {formatCommissionSplit(rate || 0.15)}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="font-medium text-gray-900 text-sm">More Bookings</div>
                <div className="text-xs text-gray-600 mt-1">Smart parent matching</div>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div className="font-medium text-gray-900 text-sm">Zero Paperwork</div>
                <div className="text-xs text-gray-600 mt-1">All forms automated</div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleGetStarted}
            className="w-full bg-gradient-to-r from-pink-600 to-pink-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-pink-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
          >
            Let's Get Started
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Footer Note */}
          <p className="text-center text-sm text-gray-500 mt-6">
            This will only take about 15 minutes total
          </p>
        </div>

        {/* Optional: Skip for now link (if you want to allow skipping) */}
        {/* <div className="text-center mt-6">
          <button
            onClick={() => navigate('/organizer-dashboard')}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Skip for now, go to dashboard
          </button>
        </div> */}
      </div>
    </div>
  );
}
