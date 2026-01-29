import { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle2, AlertCircle, Loader2, Zap, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface StripeAccountStatus {
  stripeAccountId: string | null;
  stripeAccountStatus: string | null;
  payoutEnabled: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
  requiresAction: boolean;
  actionUrl: string | null;
  onboardingMode?: string;
  onboardingStep?: string;
  tempChargesEnabled?: boolean;
  pendingBalance?: number;
  restrictionsActive?: boolean;
  restrictionReason?: string | null;
}

export function StripeConnectOnboarding() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [accountStatus, setAccountStatus] = useState<StripeAccountStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onboardingMode, setOnboardingMode] = useState<'full' | 'deferred'>('deferred');

  useEffect(() => {
    if (profile?.organisation_id) {
      fetchAccountStatus();
    } else if (profile !== undefined) {
      // Profile loaded but user has no organization ID
      setLoading(false);
      setAccountStatus(null);
    }
  }, [profile?.organisation_id, profile]);

  const fetchAccountStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch organization Stripe account details
      const { data: org, error: orgError } = await supabase
        .from('organisations')
        .select('stripe_account_id, stripe_account_status, payout_enabled')
        .eq('id', profile?.organisation_id)
        .single();

      if (orgError) throw orgError;

      if (org.stripe_account_id) {
        // Fetch detailed account status from Edge Function
        const { data: statusData, error: statusError } = await supabase.functions.invoke(
          'stripe-connect-status',
          {
            body: { organisationId: profile?.organisation_id },
          }
        );

        if (statusError) throw statusError;

        setAccountStatus({
          stripeAccountId: org.stripe_account_id,
          stripeAccountStatus: org.stripe_account_status,
          payoutEnabled: org.payout_enabled || false,
          chargesEnabled: statusData.chargesEnabled || false,
          detailsSubmitted: statusData.detailsSubmitted || false,
          requiresAction: statusData.requiresAction || false,
          actionUrl: statusData.actionUrl || null,
          onboardingMode: statusData.onboardingMode,
          onboardingStep: statusData.onboardingStep,
          tempChargesEnabled: statusData.tempChargesEnabled,
          pendingBalance: statusData.pendingBalance,
          restrictionsActive: statusData.restrictionsActive,
          restrictionReason: statusData.restrictionReason,
        });
      } else {
        setAccountStatus(null);
      }
    } catch (err: any) {
      console.error('Error fetching account status:', err);
      setError(err.message || 'Failed to load account status');
    } finally {
      setLoading(false);
    }
  };

  const createConnectAccount = async () => {
    try {
      setCreating(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        body: {
          organisationId: profile?.organisation_id,
          refreshUrl: window.location.href,
          returnUrl: window.location.href,
          mode: onboardingMode,
        },
      });

      if (error) {
        // Try to extract the actual error message from the response body
        console.error('Edge Function error:', error);
        console.error('Error details:', { data, error });

        // The error context contains the Response object with the error details
        if (error.context && error.context instanceof Response) {
          try {
            const errorBody = await error.context.json();
            console.error('Error body:', errorBody);
            if (errorBody.error) {
              throw new Error(errorBody.error);
            }
          } catch (parseError) {
            console.error('Failed to parse error body:', parseError);
          }
        }

        throw error;
      }

      if (data?.error) {
        // Server returned an error in the data
        console.error('Server error:', data.error);
        throw new Error(data.error);
      }

      if (data.accountLinkUrl) {
        // Redirect to Stripe onboarding
        window.location.href = data.accountLinkUrl;
      } else {
        throw new Error('No account link URL returned from server');
      }
    } catch (err: any) {
      console.error('Error creating Connect account:', err);
      // Display the actual error message if available
      const errorMessage = err.message || 'Failed to create Stripe account';
      setError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const continueOnboarding = async () => {
    try {
      setCreating(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('create-connect-account-link', {
        body: {
          organisationId: profile?.organisation_id,
          refreshUrl: window.location.href,
          returnUrl: window.location.href,
        },
      });

      if (error) throw error;

      if (data.accountLinkUrl) {
        window.location.href = data.accountLinkUrl;
      }
    } catch (err: any) {
      console.error('Error continuing onboarding:', err);
      setError(err.message || 'Failed to continue onboarding');
    } finally {
      setCreating(false);
    }
  };

  const openStripeDashboard = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-login-link', {
        body: { organisationId: profile?.organisation_id },
      });

      if (error) throw error;

      if (data.loginUrl) {
        window.open(data.loginUrl, '_blank');
      }
    } catch (err: any) {
      console.error('Error opening Stripe dashboard:', err);
      setError(err.message || 'Failed to open Stripe dashboard');
    }
  };

  // Check if user has no organization
  if (!profile?.organisation_id && !loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">No Organization Found</p>
            <p>You need to set up your organization before connecting a Stripe account. Please complete your organization setup first.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-airbnb-pink-600" />
          <span className="ml-3 text-airbnb-grey-600">Loading account status...</span>
        </div>
      </div>
    );
  }

  if (!accountStatus) {
    // No Stripe account yet
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-airbnb-grey-900 mb-4">
          Connect Your Stripe Account
        </h3>
        <p className="text-airbnb-grey-600 mb-6">
          To receive payments from camp bookings, you need to connect a Stripe account. This
          allows us to automatically transfer funds to your bank account after deducting the
          platform commission.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <div className="mb-6 bg-airbnb-grey-50 rounded-lg p-6 border-2 border-airbnb-grey-200">
          <h3 className="text-lg font-semibold text-airbnb-grey-900 mb-4">
            Choose Your Onboarding Path
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Quick Start Option */}
            <button
              type="button"
              onClick={() => setOnboardingMode('deferred')}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                onboardingMode === 'deferred'
                  ? 'border-airbnb-pink-600 bg-pink-50 shadow-lg'
                  : 'border-airbnb-grey-300 hover:border-airbnb-pink-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-6 h-6 text-airbnb-pink-600" />
                <h4 className="font-bold text-lg">Quick Start</h4>
                <span className="ml-auto px-2 py-1 bg-airbnb-pink-600 text-white text-xs rounded-full">
                  5 mins
                </span>
              </div>
              <p className="text-sm text-airbnb-grey-700 mb-3">
                Start accepting bookings immediately with minimal setup
              </p>
              <ul className="text-xs text-airbnb-grey-600 space-y-1">
                <li>✓ Publish camps now</li>
                <li>✓ Accept bookings today</li>
                <li>✓ Complete verification anytime</li>
                <li className="text-amber-600">⚠ Funds held until verified</li>
              </ul>
            </button>

            {/* Full Setup Option */}
            <button
              type="button"
              onClick={() => setOnboardingMode('full')}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                onboardingMode === 'full'
                  ? 'border-blue-600 bg-blue-50 shadow-lg'
                  : 'border-airbnb-grey-300 hover:border-blue-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
                <h4 className="font-bold text-lg">Full Setup</h4>
                <span className="ml-auto px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                  20 mins
                </span>
              </div>
              <p className="text-sm text-airbnb-grey-700 mb-3">
                Complete all verification upfront for immediate payouts
              </p>
              <ul className="text-xs text-airbnb-grey-600 space-y-1">
                <li>✓ No deadlines or restrictions</li>
                <li>✓ Receive payouts immediately</li>
                <li>✓ Full account access</li>
                <li>✓ No pending balance</li>
              </ul>
            </button>
          </div>
        </div>

        <button
          onClick={createConnectAccount}
          disabled={creating}
          className="w-full bg-airbnb-pink-600 hover:bg-airbnb-pink-700 disabled:bg-airbnb-grey-400 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {creating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Connect with Stripe
              <ExternalLink className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-xs text-airbnb-grey-500 text-center mt-4">
          You'll be redirected to Stripe to complete the onboarding process
        </p>
      </div>
    );
  }

  // Account exists - show status
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-airbnb-grey-900 mb-4">Stripe Account Status</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Deferred Onboarding Info Banner */}
      {accountStatus.onboardingMode === 'deferred' && !accountStatus.payoutEnabled && (
        <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Zap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                Complete Verification to Receive Payouts
              </h3>
              <p className="text-blue-800 mb-4">
                You started with Quick Start - you can accept bookings now. {accountStatus.pendingBalance && accountStatus.pendingBalance > 0 ? (
                  <>Your pending balance of <strong>${accountStatus.pendingBalance.toFixed(2)}</strong> will be released once you complete verification.</>
                ) : (
                  <>Complete verification to withdraw your earnings.</>
                )}
              </p>
              <button
                onClick={continueOnboarding}
                disabled={creating}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-airbnb-grey-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Complete Verification
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restrictions Warning */}
      {accountStatus.restrictionsActive && accountStatus.restrictionReason && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 mb-2">
                Account Restricted
              </h3>
              <p className="text-red-800 mb-4">
                {accountStatus.restrictionReason}. You cannot accept new bookings until you complete verification.
              </p>
              <button
                onClick={continueOnboarding}
                disabled={creating}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-airbnb-grey-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Resolve Restrictions
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-4 bg-airbnb-grey-50 rounded-lg">
          <span className="text-sm text-airbnb-grey-700">Account ID</span>
          <code className="text-sm font-mono text-airbnb-grey-900">
            {accountStatus.stripeAccountId}
          </code>
        </div>

        <div className="flex items-center justify-between p-4 bg-airbnb-grey-50 rounded-lg">
          <span className="text-sm text-airbnb-grey-700">Details Submitted</span>
          {accountStatus.detailsSubmitted ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Complete</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Incomplete</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-airbnb-grey-50 rounded-lg">
          <span className="text-sm text-airbnb-grey-700">Charges Enabled</span>
          {accountStatus.chargesEnabled ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Enabled</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Disabled</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-airbnb-grey-50 rounded-lg">
          <span className="text-sm text-airbnb-grey-700">Payouts Enabled</span>
          {accountStatus.payoutEnabled ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Enabled</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Disabled</span>
            </div>
          )}
        </div>
      </div>

      {accountStatus.requiresAction && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900 mb-1">Action Required</h4>
              <p className="text-sm text-amber-800 mb-3">
                Your Stripe account requires additional information to enable payouts.
              </p>
              <button
                onClick={continueOnboarding}
                disabled={creating}
                className="bg-amber-600 hover:bg-amber-700 disabled:bg-airbnb-grey-400 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={openStripeDashboard}
          className="flex-1 bg-white hover:bg-airbnb-grey-50 border border-airbnb-grey-300 text-airbnb-grey-900 font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          Open Stripe Dashboard
          <ExternalLink className="w-5 h-5" />
        </button>

        <button
          onClick={fetchAccountStatus}
          className="bg-white hover:bg-airbnb-grey-50 border border-airbnb-grey-300 text-airbnb-grey-900 font-medium py-3 px-4 rounded-lg transition-all"
        >
          Refresh Status
        </button>
      </div>

      <p className="text-xs text-airbnb-grey-500 text-center mt-4">
        Powered by Stripe Connect
      </p>
    </div>
  );
}
