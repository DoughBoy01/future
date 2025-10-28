import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, FileText, ArrowRight, Sparkles, PartyPopper, Gift, Users } from 'lucide-react';

interface RegistrationWithDetails {
  id: string;
  camps: {
    name: string;
    start_date: string;
    end_date: string;
    location: string;
  };
  children: {
    first_name: string;
    last_name: string;
  };
  amount_paid: number;
  amount_due: number;
}

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registrations, setRegistrations] = useState<RegistrationWithDetails[]>([]);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!sessionId) {
      setError('Invalid payment session');
      setLoading(false);
      return;
    }

    verifyPayment();
  }, [user, sessionId]);

  async function verifyPayment() {
    try {
      const { data: regs, error: regError } = await supabase
        .from('registrations')
        .select(`
          *,
          camps(name, start_date, end_date, location),
          children(first_name, last_name)
        `)
        .eq('stripe_checkout_session_id', sessionId);

      if (regError) throw regError;

      if (!regs || regs.length === 0) {
        setError('Registration not found');
        setLoading(false);
        return;
      }

      setRegistrations(regs as unknown as RegistrationWithDetails[]);

      const { data: paymentRecord } = await supabase
        .from('payment_records')
        .select('status')
        .eq('stripe_checkout_session_id', sessionId)
        .maybeSingle();

      if (!paymentRecord || paymentRecord.status !== 'succeeded') {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const { data: retryPayment } = await supabase
          .from('payment_records')
          .select('status')
          .eq('stripe_checkout_session_id', sessionId)
          .maybeSingle();

        if (!retryPayment || retryPayment.status !== 'succeeded') {
          setError('Payment verification in progress. Please check your email for confirmation.');
        }
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError('Failed to verify payment. Please contact support if you were charged.');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
            <p className="text-sm text-gray-500">
              If you have any issues, please contact support with your session ID: {sessionId?.substring(0, 20)}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (registrations.length === 0) {
    return null;
  }

  const camp = registrations[0].camps;
  const totalAmount = registrations.reduce((sum, reg) => sum + (reg.amount_paid || reg.amount_due), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              animationDelay: `${Math.random() * 2}s`,
              fontSize: `${Math.random() * 20 + 10}px`,
            }}
          >
            {['🎉', '🎊', '⭐', '✨', '🎈'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-green-200 relative z-10">
          <div className="bg-gradient-to-r from-green-500 via-emerald-600 to-green-500 text-white p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6 animate-bounce">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h1 className="text-5xl font-bold mb-3 flex items-center justify-center gap-3">
                <PartyPopper className="w-10 h-10" />
                Booking Confirmed!
                <Sparkles className="w-10 h-10" />
              </h1>
              <p className="text-2xl text-green-100 font-semibold mb-2">
                Welcome to {camp.name}
              </p>
              <p className="text-lg text-green-100">
                {registrations.length} {registrations.length === 1 ? 'spot' : 'spots'} secured - we can't wait to see your {registrations.length === 1 ? 'child' : 'children'}!
              </p>
            </div>
          </div>

          <div className="p-8">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl p-6 mb-8 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-6 h-6 text-blue-600" />
                <h2 className="font-bold text-blue-900 text-xl">Booking Confirmation</h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start pb-3 border-b border-blue-200">
                  <div>
                    <span className="text-sm text-gray-600">Camp:</span>
                    <p className="font-medium text-gray-900">{camp.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-600">Dates:</span>
                    <p className="font-medium text-gray-900 text-sm">
                      {new Date(camp.start_date).toLocaleDateString()} - {new Date(camp.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="pb-3 border-b border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      Registered Children ({registrations.length}):
                    </span>
                  </div>
                  <div className="space-y-2 ml-6">
                    {registrations.map((reg, index) => (
                      <div key={reg.id} className="flex items-center justify-between">
                        <span className="text-gray-900 font-medium">
                          {index + 1}. {reg.children.first_name} {reg.children.last_name}
                        </span>
                        <Link
                          to={`/registration/${reg.id}/child-details`}
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          Complete Details →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-gray-900">{camp.location}</span>
                </div>

                <div className="flex justify-between pt-2 border-t border-blue-200">
                  <span className="text-gray-600">Total Amount Paid:</span>
                  <span className="font-bold text-green-600 text-lg">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl p-8 mb-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
              <div className="relative z-10 flex items-start gap-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl flex-shrink-0 animate-bounce">
                  <FileText className="w-10 h-10" />
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold mb-3">
                    <Sparkles className="w-4 h-4" />
                    ACTION REQUIRED
                  </div>
                  <h3 className="text-3xl font-bold mb-3">
                    {registrations.length === 1 ? 'One Quick Step' : `${registrations.length} Quick Steps`} to Complete!
                  </h3>
                  <p className="text-white/90 mb-6 text-lg">
                    Help us prepare the best experience for your {registrations.length === 1 ? 'child' : 'children'} by completing the child information {registrations.length === 1 ? 'form' : 'forms'}.
                    This ensures their safety, dietary needs, and special requirements are all taken care of.
                  </p>
                  <Link
                    to={`/registration/${registrations[0].id}/child-details`}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-orange-600 rounded-xl hover:bg-orange-50 transition-all font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transform"
                  >
                    <FileText className="w-6 h-6" />
                    Complete Information {registrations.length === 1 ? 'Form' : 'Forms'} Now
                    <ArrowRight className="w-6 h-6" />
                  </Link>
                  <p className="text-white/80 text-sm mt-4">
                    Takes only 3-5 minutes per child
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                What Happens Next?
              </h3>
              <ol className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">1</span>
                  <div>
                    <span className="font-semibold text-gray-900">Complete Child Information {registrations.length === 1 ? 'Form' : 'Forms'}</span>
                    <p className="text-sm text-gray-600 mt-1">Required before camp starts - takes 3-5 minutes each</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">2</span>
                  <div>
                    <span className="font-semibold text-gray-900">Check Your Email</span>
                    <p className="text-sm text-gray-600 mt-1">Confirmation and camp details sent to your inbox</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">3</span>
                  <div>
                    <span className="font-semibold text-gray-900">Prepare for Camp</span>
                    <p className="text-sm text-gray-600 mt-1">Review the "What to Bring" list and get ready for an amazing experience</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">4</span>
                  <div>
                    <span className="font-semibold text-gray-900">Stay Updated</span>
                    <p className="text-sm text-gray-600 mt-1">We'll send important updates as the camp date approaches</p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={`/registration/${registrations[0].id}/child-details`}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                <FileText className="w-6 h-6" />
                Complete {registrations.length === 1 ? 'Form' : 'Forms'} Now
              </Link>
              <Link
                to="/dashboard"
                className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all font-bold text-lg text-center"
              >
                View Dashboard
              </Link>
            </div>

            <div className="mt-8 text-center p-6 bg-green-50 border-2 border-green-200 rounded-xl">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-green-900 mb-1">
                Confirmation Email Sent!
              </p>
              <p className="text-xs text-green-700">
                Check your inbox for all the details and next steps
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
