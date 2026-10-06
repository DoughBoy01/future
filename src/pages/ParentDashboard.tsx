import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api, fromCents, type BookingSummary } from '../lib/api';
import { formatCurrency } from '../utils/currency';
import { Calendar, MapPin, Clock, AlertCircle, FileText, Ticket } from 'lucide-react';

const STATUS_STYLES: Record<BookingSummary['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-700',
  refunded: 'bg-blue-100 text-blue-800',
};

const STATUS_LABELS: Record<BookingSummary['status'], string> = {
  pending: 'Awaiting payment',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  expired: 'Payment not completed',
  refunded: 'Refunded',
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function BookingCard({ booking }: { booking: BookingSummary }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <Link to={`/camps/${booking.camp.slug}`} className="font-semibold text-gray-900 hover:text-blue-600">
          {booking.camp.name}
        </Link>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_STYLES[booking.status]}`}>
          {STATUS_LABELS[booking.status]}
        </span>
      </div>
      <div className="space-y-1 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          {formatDate(booking.camp.startDate)} - {formatDate(booking.camp.endDate)}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          {booking.camp.location}
        </div>
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 flex-shrink-0" />
          {formatCurrency(fromCents(booking.totalCents), booking.currency)}
        </div>
      </div>
    </div>
  );
}

export function ParentDashboard() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.bookings
      .mine()
      .then(setBookings)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const confirmed = bookings.filter((b) => b.status === 'confirmed');
  const needsDetails = confirmed.filter((b) => !b.detailsCompletedAt);
  const upcoming = bookings.filter((b) => (b.status === 'confirmed' || b.status === 'pending') && b.camp.endDate >= today);
  const past = bookings.filter((b) => !upcoming.includes(b));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center" role="status">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Welcome back, {profile?.firstName}!</h1>
          <p className="text-base sm:text-lg md:text-xl text-blue-100">Your camp bookings in one place</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {error && (
          <div role="alert" className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            We could not load your bookings. Please refresh to try again.
          </div>
        )}

        {needsDetails.length > 0 && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg flex-shrink-0">
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="flex-1 w-full">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">A few details are still needed</h2>
                <p className="text-sm sm:text-base text-orange-100 mb-4">
                  Add health and emergency information so the camp team can look after your {needsDetails.length > 1 ? 'children' : 'child'}.
                </p>
                <div className="space-y-3">
                  {needsDetails.map((b) => (
                    <div key={b.id} className="bg-white/10 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="font-semibold text-base sm:text-lg">{b.camp.name}</p>
                        <p className="text-orange-100 text-xs sm:text-sm">Starts {formatDate(b.camp.startDate)}</p>
                      </div>
                      <Link
                        to={`/registration/${b.id}/child-details`}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold text-sm w-full sm:w-auto"
                      >
                        <FileText className="w-4 h-4" />
                        Add details
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Upcoming Camps</h3>
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{upcoming.length}</div>
            <Link to="/camps" className="text-sm text-green-600 hover:text-green-700 font-medium mt-2 inline-block">
              Browse camps →
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Confirmed Bookings</h3>
              <Ticket className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{confirmed.length}</div>
            <p className="text-sm text-gray-500 mt-2">Paid and secured</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">All Bookings</h3>
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{bookings.length}</div>
            <p className="text-sm text-gray-500 mt-2">All time</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <section className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Upcoming</h2>
            {upcoming.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No camps booked yet. Find one your child will love.</p>
                <Link to="/camps" className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Explore camps
                </Link>
              </div>
            ) : (
              <div className="space-y-3">{upcoming.map((b) => <BookingCard key={b.id} booking={b} />)}</div>
            )}
          </section>

          <section className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Past</h2>
            {past.length === 0 ? (
              <p className="text-gray-600 py-8 text-center">Your past bookings will appear here.</p>
            ) : (
              <div className="space-y-3">{past.map((b) => <BookingCard key={b.id} booking={b} />)}</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
