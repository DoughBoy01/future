import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, MapPin, Users, DollarSign, Clock, AlertCircle, CheckCircle, ExternalLink, MessageSquare, Zap } from 'lucide-react';
import { AvailabilityAlert } from '../components/urgency/AvailabilityAlert';
import { CountdownTimer } from '../components/urgency/CountdownTimer';
import { SocialProof } from '../components/urgency/SocialProof';
import { formatCurrency } from '../utils/currency';
import type { Database } from '../lib/database.types';

type Camp = Database['public']['Tables']['camps']['Row'];

interface EnquiryFormData {
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  subject: string;
  message: string;
}

export function CampDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [loading, setLoading] = useState(true);
  const [availablePlaces, setAvailablePlaces] = useState(0);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [bookingsLast24h, setBookingsLast24h] = useState(0);
  const [bookingsLastWeek, setBookingsLastWeek] = useState(0);
  const [stickyBookButton, setStickyBookButton] = useState(false);

  const [enquiryForm, setEnquiryForm] = useState<EnquiryFormData>({
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    if (id) {
      loadCamp();
    }
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setStickyBookButton(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function loadCamp() {
    try {
      const { data, error } = await supabase
        .from('camps')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setLoading(false);
        return;
      }

      setCamp(data);

      const enrolledCount = (data as any).enrolled_count || 0;
      setAvailablePlaces(data.capacity - enrolledCount);

      const { data: analyticsData } = await supabase
        .from('camp_analytics')
        .select('bookings_last_24h, bookings_last_week')
        .eq('camp_id', id)
        .maybeSingle();

      if (analyticsData) {
        setBookingsLast24h(analyticsData.bookings_last_24h || 0);
        setBookingsLastWeek(analyticsData.bookings_last_week || 0);
      }
    } catch (error) {
      console.error('Error loading camp:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!camp) return;

    setEnquirySubmitting(true);

    try {
      const { error } = await supabase.from('enquiries').insert({
        camp_id: camp.id,
        parent_name: enquiryForm.parent_name,
        parent_email: enquiryForm.parent_email,
        parent_phone: enquiryForm.parent_phone || null,
        subject: enquiryForm.subject,
        message: enquiryForm.message,
      });

      if (error) throw error;

      setEnquirySuccess(true);
      setEnquiryForm({
        parent_name: '',
        parent_email: '',
        parent_phone: '',
        subject: '',
        message: '',
      });

      setTimeout(() => {
        setShowEnquiryForm(false);
        setEnquirySuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      alert('Failed to submit enquiry. Please try again.');
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading camp details...</p>
        </div>
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Camp Not Found</h2>
          <p className="text-gray-600 mb-6">This camp may not exist or is no longer available.</p>
          <Link
            to="/camps"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Camps
          </Link>
        </div>
      </div>
    );
  }

  const availabilityStatus = availablePlaces <= 0 ? 'full' : availablePlaces <= 5 ? 'limited' : 'available';
  const earlyBirdActive = camp.early_bird_price && camp.early_bird_deadline && new Date(camp.early_bird_deadline) > new Date();

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {stickyBookButton && availabilityStatus !== 'full' && (
        <div className="fixed top-20 left-0 right-0 z-40 bg-white shadow-lg border-b border-gray-200 py-4 animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">{camp?.name}</h2>
              {availabilityStatus === 'limited' && (
                <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold animate-pulse">
                  Only {availablePlaces} spots left!
                </span>
              )}
            </div>
            <Link
              to={`/camps/${camp?.id}/register`}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-lg shadow-lg hover:scale-105"
            >
              <Zap className="w-5 h-5" />
              Book Now - {formatCurrency(earlyBirdActive ? (camp?.early_bird_price || camp?.price || 0) : (camp?.price || 0), camp?.currency || 'USD')}
            </Link>
          </div>
        </div>
      )}
      <div className="relative h-96 bg-gradient-to-br from-blue-600 to-blue-800">
        {camp.featured_image_url ? (
          <>
            <img
              src={camp.featured_image_url}
              alt={camp.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-32 h-32 text-white opacity-30" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm font-medium capitalize">
                {camp.category}
              </span>
              {camp.featured && (
                <span className="px-4 py-1.5 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold">
                  Featured
                </span>
              )}
              {availabilityStatus === 'full' ? (
                <span className="px-4 py-1.5 bg-red-500 text-white rounded-full text-sm font-bold">
                  Fully Booked
                </span>
              ) : availabilityStatus === 'limited' ? (
                <span className="px-4 py-1.5 bg-yellow-500 text-white rounded-full text-sm font-bold">
                  Limited Spots
                </span>
              ) : null}
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">{camp.name}</h1>
            <p className="text-xl text-white/90">Ages {camp.age_min}-{camp.age_max}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {(earlyBirdActive || bookingsLast24h > 0 || bookingsLastWeek > 0) && (
          <div className="mb-8 space-y-4">
            {earlyBirdActive && camp.early_bird_deadline && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-xl">
                <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                  <Zap className="w-6 h-6" />
                  Early Bird Special - Save {formatCurrency(camp.price - (camp.early_bird_price || camp.price), camp.currency)}!
                </h3>
                <CountdownTimer targetDate={camp.early_bird_deadline} label="Offer expires in" size="lg" />
              </div>
            )}
            {(bookingsLast24h > 0 || bookingsLastWeek > 0) && (
              <SocialProof
                bookingsLast24h={bookingsLast24h}
                bookingsLastWeek={bookingsLastWeek}
                showViewers={false}
              />
            )}
          </div>
        )}

        <div className="mb-8">
          <AvailabilityAlert
            spotsRemaining={availablePlaces}
            capacity={camp.capacity}
            threshold={5}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Camp</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {camp.description || 'No description available.'}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Camp Details</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Dates</p>
                    <p className="text-gray-900 font-medium">{formatDate(camp.start_date)}</p>
                    <p className="text-gray-600 text-sm">to {formatDate(camp.end_date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Location</p>
                    <p className="text-gray-900 font-medium">{camp.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Users className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Availability</p>
                    <p className="text-gray-900 font-medium">
                      {availablePlaces} of {camp.capacity} spots available
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Age Range</p>
                    <p className="text-gray-900 font-medium">
                      {camp.age_min} - {camp.age_max} years old
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {camp.what_to_bring && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What to Bring</h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {camp.what_to_bring}
                </p>
              </div>
            )}

            {camp.requirements && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {camp.requirements}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-4 space-y-6">
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatCurrency(earlyBirdActive ? (camp.early_bird_price || camp.price) : camp.price, camp.currency)}
                  </span>
                </div>
                {earlyBirdActive && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-800 mb-1">
                      Early Bird Pricing
                    </p>
                    <p className="text-xs text-green-700">
                      Regular price: {formatCurrency(camp.price, camp.currency)}
                    </p>
                    <p className="text-xs text-green-700">
                      Offer ends {new Date(camp.early_bird_deadline!).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {availabilityStatus === 'full' ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="font-semibold text-red-900 mb-1">Fully Booked</p>
                  <p className="text-sm text-red-700">This camp has reached capacity</p>
                </div>
              ) : (
                <>
                  <Link
                    to={`/camps/${camp.id}/register`}
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 animate-pulse"
                  >
                    <Zap className="w-6 h-6" />
                    Book Now - Secure Your Spot!
                  </Link>

                  {availabilityStatus === 'limited' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                      <p className="text-sm font-medium text-yellow-800">
                        Only {availablePlaces} spots remaining!
                      </p>
                    </div>
                  )}
                </>
              )}

              {(camp as any).enquiries_enabled && (
                <button
                  onClick={() => setShowEnquiryForm(!showEnquiryForm)}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium"
                >
                  <MessageSquare className="w-5 h-5" />
                  Have Questions?
                </button>
              )}

              {showEnquiryForm && (
                <div className="border-t-2 border-gray-100 pt-6">
                  {enquirySuccess ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-green-900 mb-1">Enquiry Sent!</p>
                      <p className="text-sm text-green-700">
                        We'll get back to you soon.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleEnquirySubmit} className="space-y-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Send an Enquiry</h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={enquiryForm.parent_name}
                          onChange={(e) => setEnquiryForm(prev => ({ ...prev, parent_name: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={enquiryForm.parent_email}
                          onChange={(e) => setEnquiryForm(prev => ({ ...prev, parent_email: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={enquiryForm.parent_phone}
                          onChange={(e) => setEnquiryForm(prev => ({ ...prev, parent_phone: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject *
                        </label>
                        <input
                          type="text"
                          required
                          value={enquiryForm.subject}
                          onChange={(e) => setEnquiryForm(prev => ({ ...prev, subject: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Question about dietary requirements"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message *
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={enquiryForm.message}
                          onChange={(e) => setEnquiryForm(prev => ({ ...prev, message: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ask us anything about this camp..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={enquirySubmitting}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {enquirySubmitting ? 'Sending...' : 'Send Enquiry'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
