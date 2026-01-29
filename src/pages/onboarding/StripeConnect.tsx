import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { StripeConnectOnboarding } from '../../components/stripe/StripeConnectOnboarding';
import { useAuth } from '../../contexts/AuthContext';
import { completeOnboarding } from '../../services/onboardingService';
import { supabase } from '../../lib/supabase';

export default function StripeConnect() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isSkipping, setIsSkipping] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isCheckingStatus) {
        console.error('[StripeConnect] Loading timeout - forcing display');
        setIsCheckingStatus(false);
        toast.error('Loading took too long. Please refresh if the page doesn\'t load.');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isCheckingStatus]);

  // Handler for successful Stripe connection
  const handleStripeSuccess = useCallback(async () => {
    if (!user) return;

    try {
      // Mark onboarding complete
      await completeOnboarding(user.id);

      toast.success('Payment account connected! You\'re all set.', {
        icon: '🎉',
        duration: 4000,
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/organizer-dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Connected successfully, but failed to update status. Please contact support.');
    }
  }, [user, navigate]);

  // Handler for skipping Stripe connection
  const handleSkip = useCallback(async () => {
    if (!user) return;

    setIsSkipping(true);
    try {
      // Still mark onboarding complete - they completed the wizard
      // Stripe connection can be done later from settings
      await completeOnboarding(user.id);

      toast.success('Onboarding complete! You can connect Stripe anytime from settings.');
      navigate('/organizer-dashboard');
    } catch (error) {
      console.error('Error skipping Stripe:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSkipping(false);
    }
  }, [user, navigate]);

  // Check if Stripe is already connected (edge case)
  useEffect(() => {
    async function checkStripeConnection() {
      console.log('[StripeConnect] Checking connection status', {
        profileLoaded: profile !== undefined,
        hasOrgId: !!profile?.organisation_id,
        userId: user?.id
      });

      // Wait for profile to load
      if (profile === undefined) {
        // Profile still loading
        console.log('[StripeConnect] Profile still loading...');
        return;
      }

      if (!profile?.organisation_id) {
        // Profile loaded but no org_id - redirect to organization setup
        console.error('[StripeConnect] No organization ID found for user');
        setIsCheckingStatus(false);
        toast.error('Please complete organization setup first.');
        setTimeout(() => {
          navigate('/onboarding/organization');
        }, 1500);
        return;
      }

      try {
        console.log('[StripeConnect] Fetching organization data...');
        const { data: org, error } = await supabase
          .from('organisations')
          .select('stripe_account_id')
          .eq('id', profile.organisation_id)
          .single();

        if (error) {
          console.error('[StripeConnect] Error fetching org:', error);
          throw error;
        }

        console.log('[StripeConnect] Organization data:', {
          hasStripeAccount: !!org?.stripe_account_id
        });

        // If already connected, mark onboarding complete and redirect
        if (org?.stripe_account_id) {
          console.log('[StripeConnect] Stripe already connected, completing onboarding');
          await completeOnboarding(user!.id);
          toast.success('Stripe already connected! Redirecting to dashboard...');
          navigate('/organizer-dashboard');
          return;
        }

        console.log('[StripeConnect] No Stripe account, showing connect UI');
      } catch (error) {
        console.error('[StripeConnect] Error checking Stripe connection:', error);
        toast.error('Failed to check Stripe status. Please try refreshing the page.');
      } finally {
        setIsCheckingStatus(false);
      }
    }

    checkStripeConnection();
  }, [profile, user, navigate]);

  // Auto-detect successful return from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Stripe returns with setup=success parameter
    if (params.get('setup') === 'success') {
      handleStripeSuccess();
    }
  }, [handleStripeSuccess]);

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-airbnb-grey-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-airbnb-pink-600 mx-auto mb-4"></div>
          <p className="text-airbnb-grey-600">Checking account status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-airbnb-grey-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-center items-center gap-2 mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-all ${
                  step === 4
                    ? 'bg-airbnb-pink-600 scale-125'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-airbnb-grey-600 font-medium">
            Step 4 of 4
          </p>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-airbnb-grey-900 mb-3">
            Almost There! Connect Stripe to Go Live
          </h1>
          <p className="text-airbnb-grey-600 text-lg max-w-2xl mx-auto">
            Your camp is pending approval. Set up payments now so you're ready to accept
            bookings the moment we approve your camp.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm mb-8 border border-airbnb-grey-200">
          <h2 className="font-semibold text-airbnb-grey-900 text-lg mb-4">
            Why Connect Stripe Now?
          </h2>
          <div className="space-y-3">
            {[
              'Publish camps immediately after approval',
              'Start accepting bookings instantly',
              'Automatic payouts to your bank',
              'Keep 85% of every booking',
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-airbnb-grey-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stripe Connect Component */}
        <div className="mb-8">
          <StripeConnectOnboarding />
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <button
            onClick={handleSkip}
            disabled={isSkipping}
            className="text-airbnb-grey-600 underline hover:text-airbnb-grey-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSkipping ? 'Completing onboarding...' : 'Skip for now, I\'ll do this later'}
          </button>
          <p className="text-xs text-airbnb-grey-500 mt-2">
            You can always connect Stripe from your payment settings
          </p>
        </div>

        {/* Progress Info */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 text-center">
            <span className="font-semibold">Note:</span> You'll need to connect Stripe before you can publish your camps.
            Camps must have payment processing set up to accept bookings.
          </p>
        </div>
      </div>
    </div>
  );
}
