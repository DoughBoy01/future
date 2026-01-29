import { useAuth } from '../../contexts/AuthContext';
import { OrganizerDashboardLayout } from '../../components/dashboard/OrganizerDashboardLayout';
import { StripeConnectOnboarding } from '../../components/stripe/StripeConnectOnboarding';
import {
  DollarSign,
  TrendingUp,
  Info,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function StripePaymentSettings() {
  const { profile, organization } = useAuth();
  const [platformCommissionRate, setPlatformCommissionRate] = useState<number>(0.15);
  const [isLoadingRate, setIsLoadingRate] = useState(true);

  useEffect(() => {
    async function fetchCommissionRate() {
      if (!organization?.id) {
        setIsLoadingRate(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('organisations')
          .select('default_commission_rate')
          .eq('id', organization.id)
          .single();

        if (error) throw error;

        setPlatformCommissionRate(data?.default_commission_rate ?? 0.15);
      } catch (error) {
        console.error('Error fetching commission rate:', error);
        setPlatformCommissionRate(0.15); // Default to 15%
      } finally {
        setIsLoadingRate(false);
      }
    }

    fetchCommissionRate();
  }, [organization?.id]);

  return (
    <OrganizerDashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Payment Settings</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your Stripe payment account to receive camp booking payments
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
            {/* Stripe Connection Card */}
            <StripeConnectOnboarding />

            {/* Complete Cost Breakdown Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 sm:p-3 rounded-lg bg-blue-50">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Complete Cost Breakdown</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Transparency of all fees and your net earnings
                    </p>
                  </div>
                </div>

                {/* Cost Components */}
                <div className="space-y-3 mb-6">
                  {/* Stripe Processing Fees */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-sm sm:text-base text-purple-900 block">Stripe Processing Fees</span>
                          <span className="text-xs text-purple-700">Charged by Stripe for payment processing</span>
                        </div>
                      </div>
                      <span className="text-lg sm:text-xl font-bold text-purple-900 whitespace-nowrap ml-2">2.9% + $0.30</span>
                    </div>
                    <p className="text-xs sm:text-sm text-purple-800 mt-2">
                      Standard Stripe fees for US cards. International cards may have higher rates. These fees go directly to Stripe.
                    </p>
                  </div>

                  {/* Platform Fee */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-sm sm:text-base text-gray-900 block">Platform Commission</span>
                          <span className="text-xs text-gray-600">Platform services and support</span>
                        </div>
                      </div>
                      {isLoadingRate ? (
                        <div className="animate-pulse bg-gray-300 h-7 w-16 rounded"></div>
                      ) : (
                        <span className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap ml-2">
                          {(platformCommissionRate * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">
                      Covers platform maintenance, customer support, marketing, and payment infrastructure.
                    </p>
                  </div>

                  {/* Your Net Earnings */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-sm sm:text-base text-green-900 block">Your Net Earnings</span>
                          <span className="text-xs text-green-700">After all fees are deducted</span>
                        </div>
                      </div>
                      {isLoadingRate ? (
                        <div className="animate-pulse bg-green-300 h-7 w-16 rounded"></div>
                      ) : (
                        <span className="text-lg sm:text-xl font-bold text-green-900 whitespace-nowrap ml-2">
                          {(100 - platformCommissionRate * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-green-800 mt-2">
                      This is deposited directly to your bank account via Stripe (minus Stripe's processing fees).
                    </p>
                  </div>
                </div>

                {/* Important Note */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 mb-6">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-amber-800">
                      <strong className="text-amber-900">Important:</strong> Stripe processing fees are deducted from your payout by Stripe automatically. The platform commission is collected as an application fee at the time of booking.
                    </div>
                  </div>
                </div>

                {/* Detailed Example Calculation */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Example: $500 Camp Booking</h3>
                  <div className="space-y-2">
                    {/* Gross Amount */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">Camp Price (Parent Pays)</span>
                        <span className="font-semibold text-gray-900">$500.00</span>
                      </div>
                    </div>

                    {/* Platform Commission */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">Platform Commission ({(platformCommissionRate * 100).toFixed(1)}%)</span>
                        <span className="font-semibold text-red-600">-${(500 * platformCommissionRate).toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-500">Collected automatically as application fee</div>
                    </div>

                    {/* Amount to Your Stripe Account */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-blue-900">Transferred to Your Stripe Account</span>
                        <span className="font-bold text-blue-900">${(500 * (1 - platformCommissionRate)).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Stripe Processing Fees */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">Stripe Processing Fee (2.9% + $0.30)</span>
                        <span className="font-semibold text-red-600">-${((500 * (1 - platformCommissionRate)) * 0.029 + 0.30).toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-500">Deducted by Stripe from your payout</div>
                    </div>

                    {/* Final Payout */}
                    <div className="bg-green-50 rounded-lg p-4 border-2 border-green-300 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-green-900 text-base">Your Final Payout</span>
                        <span className="font-bold text-green-600 text-xl">
                          ${((500 * (1 - platformCommissionRate)) - ((500 * (1 - platformCommissionRate)) * 0.029 + 0.30)).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-green-700 mt-1">Deposited to your bank account in 2-7 business days</div>
                    </div>
                  </div>

                  {/* Summary Breakdown */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Cost Summary</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-purple-50 rounded p-2">
                        <div className="text-purple-700 mb-1">Stripe Fees</div>
                        <div className="font-bold text-purple-900">${((500 * (1 - platformCommissionRate)) * 0.029 + 0.30).toFixed(2)}</div>
                        <div className="text-purple-600 text-[10px]">{(((500 * (1 - platformCommissionRate)) * 0.029 + 0.30) / 500 * 100).toFixed(2)}% of total</div>
                      </div>
                      <div className="bg-gray-100 rounded p-2">
                        <div className="text-gray-700 mb-1">Platform Fee</div>
                        <div className="font-bold text-gray-900">${(500 * platformCommissionRate).toFixed(2)}</div>
                        <div className="text-gray-600 text-[10px]">{(platformCommissionRate * 100).toFixed(1)}% of total</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Help & Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4 text-sm text-gray-600">
                  <div>
                    <strong className="text-gray-900">What is Stripe?</strong>
                    <p className="mt-1">
                      Stripe is a secure payment processing platform used by millions of businesses worldwide. It handles all payment transactions, security, and compliance.
                    </p>
                  </div>

                  <div>
                    <strong className="text-gray-900">What are Stripe's processing fees?</strong>
                    <p className="mt-1">
                      Stripe charges 2.9% + $0.30 per successful transaction for US cards. International cards and certain payment methods may have different rates. These fees are standard across the industry and are automatically deducted from your payouts.
                    </p>
                  </div>

                  <div>
                    <strong className="text-gray-900">When do I get paid?</strong>
                    <p className="mt-1">
                      Payments are automatically transferred to your bank account on a rolling basis (typically 2-7 business days after a booking is confirmed). Your first payout may take up to 14 days as Stripe verifies your account.
                    </p>
                  </div>

                  <div>
                    <strong className="text-gray-900">How is the platform commission collected?</strong>
                    <p className="mt-1">
                      The platform commission ({(platformCommissionRate * 100).toFixed(1)}%) is automatically deducted as an application fee when parents make a booking. You receive the remaining amount ({(100 - platformCommissionRate * 100).toFixed(1)}% of the camp price) minus Stripe's processing fees.
                    </p>
                  </div>

                  <div>
                    <strong className="text-gray-900">Can I see a detailed breakdown of fees?</strong>
                    <p className="mt-1">
                      Yes! Log in to your Stripe Dashboard to view detailed reports of all transactions, fees, and payouts. You can access your Stripe Dashboard from this page once connected.
                    </p>
                  </div>

                  <div>
                    <strong className="text-gray-900">Are there any hidden fees?</strong>
                    <p className="mt-1">
                      No. The only fees you pay are the platform commission ({(platformCommissionRate * 100).toFixed(1)}%) and Stripe's standard processing fees (2.9% + $0.30). There are no setup fees, monthly fees, or hidden charges.
                    </p>
                  </div>

                  <div>
                    <strong className="text-gray-900">Is my data secure?</strong>
                    <p className="mt-1">
                      Yes. Stripe is PCI-DSS Level 1 certified, the highest level of security certification. All sensitive payment information is handled exclusively by Stripe - we never store credit card details on our platform.
                    </p>
                  </div>

                  <div>
                    <strong className="text-gray-900">What if I need to issue a refund?</strong>
                    <p className="mt-1">
                      You can issue full or partial refunds through your dashboard. When you refund a booking, both the platform commission and Stripe fees are proportionally refunded. However, Stripe does not refund their processing fees.
                    </p>
                  </div>

                  <div>
                    <strong className="text-gray-900">Need help?</strong>
                    <p className="mt-1">
                      Contact our support team at{' '}
                      <a href="mailto:support@futureedge.com" className="text-blue-600 hover:text-blue-700 underline">
                        support@futureedge.com
                      </a>{' '}
                      for assistance with payment setup or questions about fees.
                    </p>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </OrganizerDashboardLayout>
  );
}
