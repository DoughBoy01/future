import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, FileText, ArrowRight, PartyPopper, Gift, Users } from 'lucide-react';
import { api, fromCents, type Attendee, type BookingSummary } from '../lib/api';
import { formatCurrency } from '../utils/currency';

// Stripe's webhook can land a moment after the redirect; wait for it before giving up.
const POLL_MS = 1500;
const POLL_ATTEMPTS = 10;

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [state, setState] = useState<'checking' | 'confirmed' | 'delayed' | 'error'>('checking');

  useEffect(() => {
    if (!sessionId) return setState('error');
    let cancelled = false;

    (async () => {
      for (let attempt = 0; attempt < POLL_ATTEMPTS && !cancelled; attempt++) {
        try {
          const found = await api.bookings.bySession(sessionId);
          if (found.status === 'confirmed') {
            const detail = await api.bookings.get(found.id);
            if (cancelled) return;
            setBooking(detail.booking);
            setAttendees(detail.attendees);
            return setState('confirmed');
          }
        } catch {
          /* not visible yet: keep trying */
        }
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
      if (!cancelled) setState('delayed');
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (state === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center" role="status">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (state !== 'confirmed' || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {state === 'delayed' ? 'Still confirming your payment' : 'We could not find that booking'}
          </h1>
          <p className="text-gray-600 mb-6">
            {state === 'delayed'
              ? 'Your payment is taking longer than usual to confirm. If you were charged, your booking will appear in your dashboard shortly.'
              : 'Please check the link you followed, or contact support if you were charged.'}
          </p>
          <Link to="/dashboard" className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const places = attendees.length;
  const detailsUrl = `/registration/${booking.id}/child-details`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-green-200">
          <div className="bg-gradient-to-r from-green-500 via-emerald-600 to-green-500 text-white p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-3 flex items-center justify-center gap-3">
              <PartyPopper className="w-8 h-8 sm:w-10 sm:h-10" />
              Booking Confirmed!
            </h1>
            <p className="text-xl sm:text-2xl text-green-100 font-semibold mb-2">Welcome to {booking.camp.name}</p>
            <p className="text-lg text-green-100">
              {places} {places === 1 ? 'place' : 'places'} secured. We can't wait to see {places === 1 ? 'your child' : 'your children'}!
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-6 h-6 text-blue-600" />
                <h2 className="font-bold text-blue-900 text-xl">Booking Confirmation</h2>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap justify-between gap-2 pb-3 border-b border-blue-200">
                  <div>
                    <span className="text-sm text-gray-600">Camp:</span>
                    <p className="font-medium text-gray-900">{booking.camp.name}</p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-sm text-gray-600">Dates:</span>
                    <p className="font-medium text-gray-900 text-sm">
                      {new Date(booking.camp.startDate).toLocaleDateString()} - {new Date(booking.camp.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="pb-3 border-b border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">Registered ({places}):</span>
                  </div>
                  <ul className="space-y-1 ml-6">
                    {attendees.map((a, i) => (
                      <li key={a.id} className="text-gray-900 font-medium">
                        {i + 1}. {a.firstName} {a.lastName}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-gray-900">{booking.camp.location}</span>
                </div>

                <div className="flex justify-between pt-2 border-t border-blue-200">
                  <span className="text-gray-600">Total paid:</span>
                  <span className="font-bold text-green-600 text-lg">{formatCurrency(fromCents(booking.totalCents), booking.currency)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl p-6 sm:p-8 mb-6 text-white shadow-xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-xl flex-shrink-0">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3">One more step: tell us about {places === 1 ? 'your child' : 'your children'}</h2>
                  <p className="text-white/90 mb-6">
                    Allergies, medical needs and emergency contacts help the team look after {places === 1 ? 'them' : 'everyone'} properly. It takes 3-5 minutes
                    {places > 1 ? ' per child' : ''}.
                  </p>
                  <Link
                    to={detailsUrl}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-white text-orange-600 rounded-xl hover:bg-orange-50 transition-all font-bold text-lg shadow-lg"
                  >
                    <FileText className="w-5 h-5" />
                    Add details now
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/dashboard" className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all font-bold text-center">
                View my bookings
              </Link>
              <Link to="/camps" className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all font-bold text-center">
                Browse more camps
              </Link>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              Keep this page's address if you'd like to come back and finish the details later: {window.location.origin}{detailsUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
