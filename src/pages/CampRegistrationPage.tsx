import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar, MapPin, AlertCircle, User, Tag, Zap, Shield, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { AvailabilityAlert } from '../components/urgency/AvailabilityAlert';
import { CountdownTimer } from '../components/urgency/CountdownTimer';
import { formatCurrency } from '../utils/currency';
import type { Database } from '../lib/database.types';
import { createMultiChildRegistration, validateDiscountCode } from '../services/registrationService';
import { createStripeCheckoutSession, redirectToStripeCheckout } from '../services/stripeService';

type Camp = Database['public']['Tables']['camps']['Row'];

interface ChildEntry {
  firstName: string;
  lastName: string;
  age: string;
}

interface GuestInfo {
  name: string;
  email: string;
  phone: string;
}

export function CampRegistrationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [numberOfPlaces, setNumberOfPlaces] = useState(1);
  const [childrenEntries, setChildrenEntries] = useState<ChildEntry[]>([{ firstName: '', lastName: '', age: '' }]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState<any>(null);
  const [discountError, setDiscountError] = useState('');
  const [error, setError] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [showDiscountSection, setShowDiscountSection] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState(0);
  const [isGuest, setIsGuest] = useState(false);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (!id) {
      setError('Invalid camp URL');
      setLoading(false);
      return;
    }

    if (!user) {
      setIsGuest(true);
      setLoading(false);
      loadCampData();
    } else {
      setIsGuest(false);
      loadData();
    }
  }, [user, id]);

  useEffect(() => {
    const newEntries = Array.from({ length: numberOfPlaces }, (_, i) =>
      childrenEntries[i] || { firstName: '', lastName: '', age: '' }
    );
    setChildrenEntries(newEntries);
  }, [numberOfPlaces]);

  async function loadCampData() {
    if (!id) return;
    try {
      const { data: campData, error: campError } = await supabase
        .from('camps')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle();

      if (campError) throw campError;
      if (!campData) {
        setError('Camp not found or no longer available');
        setLoading(false);
        return;
      }

      setCamp(campData);
      const enrolledCount = (campData as any).enrolled_count || 0;
      setAvailablePlaces(campData.capacity - enrolledCount);
    } catch (err) {
      console.error('Error loading camp:', err);
      setError('Failed to load camp information');
    } finally {
      setLoading(false);
    }
  }

  async function loadData() {
    if (!id) return;
    try {
      const [campResult, parentResult] = await Promise.all([
        supabase
          .from('camps')
          .select('*')
          .eq('id', id)
          .eq('status', 'published')
          .maybeSingle(),
        supabase.functions.invoke('get-or-create-parent'),
      ]);

      if (campResult.error) throw campResult.error;
      if (!campResult.data) {
        setError('Camp not found or no longer available');
        setLoading(false);
        return;
      }

      setCamp(campResult.data);
      const enrolledCount = (campResult.data as any).enrolled_count || 0;
      setAvailablePlaces(campResult.data.capacity - enrolledCount);

      if (parentResult.error) {
        console.error('Error fetching/creating parent:', parentResult.error);
        throw new Error('Failed to initialize registration profile');
      }

      if (parentResult.data) {
        setParentId(parentResult.data.id);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load registration information');
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyDiscount() {
    if (!discountCode.trim() || !camp) return;

    setDiscountError('');
    try {
      const discount = await validateDiscountCode(discountCode.trim(), camp.id);

      if (!discount) {
        setDiscountError('Invalid or expired discount code');
        setDiscountApplied(null);
        return;
      }

      setDiscountApplied(discount);
    } catch (err) {
      setDiscountError('Failed to validate discount code');
    }
  }

  const updateChildEntry = (index: number, field: 'firstName' | 'lastName' | 'age', value: string) => {
    const newEntries = [...childrenEntries];
    newEntries[index][field] = value;
    setChildrenEntries(newEntries);
  };

  const isAgeAppropriate = (age: string): boolean | null => {
    if (!age || !camp) return null;
    const ageNum = parseInt(age);
    if (isNaN(ageNum)) return null;
    return ageNum >= camp.age_min && ageNum <= camp.age_max;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const allFilled = childrenEntries.every(entry => entry.firstName.trim() && entry.lastName.trim() && entry.age.trim());
    if (!allFilled) {
      setError('Please enter all child information including ages');
      return;
    }

    // Validate ages
    const invalidAges = childrenEntries.filter(entry => {
      const age = parseInt(entry.age);
      return isNaN(age) || age < 1 || age > 100;
    });

    if (invalidAges.length > 0) {
      setError('Please enter valid ages for all children (1-100)');
      return;
    }

    // Check for age appropriateness
    const inappropriateAges = childrenEntries.filter(entry => !isAgeAppropriate(entry.age));
    if (inappropriateAges.length > 0 && camp) {
      setError(`This camp is designed for ages ${camp.age_min}-${camp.age_max}. Some children may not meet the age requirements.`);
      return;
    }

    if (isGuest) {
      if (!guestInfo.name.trim() || !guestInfo.email.trim()) {
        setError('Please enter your name and email');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email)) {
        setError('Please enter a valid email address');
        return;
      }
    }

    if (!camp || (!parentId && !isGuest)) return;

    setProcessing(true);
    setError('');

    try {
      const earlyBirdActive = camp.early_bird_price &&
        camp.early_bird_deadline &&
        new Date(camp.early_bird_deadline) > new Date();

      let unitPrice = earlyBirdActive && camp.early_bird_price ? camp.early_bird_price : camp.price;
      let subtotal = unitPrice * numberOfPlaces;
      let totalDiscountAmount = 0;

      if (discountApplied) {
        if (discountApplied.discount_type === 'percentage') {
          totalDiscountAmount = (subtotal * discountApplied.discount_value) / 100;
        } else {
          totalDiscountAmount = discountApplied.discount_value;
        }
      }

      const finalAmount = Math.max(0, subtotal - totalDiscountAmount);

      const result = await createMultiChildRegistration({
        campId: camp.id,
        parentId: isGuest ? undefined : parentId!,
        children: childrenEntries,
        unitPrice: unitPrice,
        totalAmount: finalAmount,
        discountCode: discountApplied?.code,
        discountAmount: totalDiscountAmount,
        guestInfo: isGuest ? guestInfo : undefined,
      });

      const checkoutSession = await createStripeCheckoutSession({
        campId: camp.id,
        campName: camp.name,
        childId: result.childIds[0],
        amount: finalAmount,
        currency: camp.currency,
        registrationId: result.bookingIds[0],
      });

      await Promise.all(
        result.bookingIds.map(bookingId =>
          supabase
            .from('bookings')
            // @ts-ignore
            .update({ stripe_checkout_session_id: checkoutSession.sessionId })
            .eq('id', bookingId)
        )
      );

      redirectToStripeCheckout(checkoutSession.url);
    } catch (err: any) {
      console.error('Error creating registration:', err);
      setError(err.message || 'Failed to process registration. Please try again.');
      setProcessing(false);
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-airbnb-grey-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-airbnb-pink-500 mx-auto mb-4"></div>
          <p className="text-airbnb-grey-600">Loading registration form...</p>
        </div>
      </div>
    );
  }

  if (error && !camp) {
    return (
      <div className="min-h-screen bg-airbnb-grey-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-airbnb-grey-900 mb-2">Unable to Load Registration</h2>
          <p className="text-airbnb-grey-600 mb-6">{error}</p>
          <Link
            to="/camps"
            className="inline-flex items-center px-6 py-3 bg-airbnb-pink-600 text-white rounded-lg hover:bg-airbnb-pink-700 transition-airbnb"
          >
            Browse Camps
          </Link>
        </div>
      </div>
    );
  }

  if (!camp) return null;

  const earlyBirdActive = camp.early_bird_price &&
    camp.early_bird_deadline &&
    new Date(camp.early_bird_deadline) > new Date();

  let unitPrice = earlyBirdActive && camp.early_bird_price ? camp.early_bird_price : camp.price;
  let subtotal = unitPrice * numberOfPlaces;
  let totalDiscountAmount = 0;

  if (discountApplied) {
    if (discountApplied.discount_type === 'percentage') {
      totalDiscountAmount = (subtotal * discountApplied.discount_value) / 100;
    } else {
      totalDiscountAmount = discountApplied.discount_value;
    }
  }

  const finalPrice = Math.max(0, subtotal - totalDiscountAmount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-airbnb-grey-50 via-white to-airbnb-pink-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to={`/camps/${id}`} className="text-airbnb-pink-500 hover:text-airbnb-pink-600 font-medium transition-standard">
            ← Back to camp details
          </Link>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-airbnb-grey-200">
          <div className="bg-gradient-to-r from-airbnb-pink-500 via-airbnb-pink-600 to-airbnb-pink-500 text-white p-5 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <Zap className="w-6 sm:w-8 h-6 sm:h-8 animate-pulse" />
                <h1 className="text-2xl sm:text-4xl font-bold">Quick Booking!</h1>
              </div>
              <p className="text-base sm:text-xl text-white/90">Secure your spot in just 2 quick steps</p>
              <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-semibold">Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-semibold">Instant Confirmation</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 md:p-8">
            {availablePlaces <= 5 && availablePlaces > 0 && (
              <div className="mb-6">
                <AvailabilityAlert
                  spotsRemaining={availablePlaces}
                  capacity={camp.capacity}
                  threshold={5}
                />
              </div>
            )}

            {earlyBirdActive && camp.early_bird_deadline && (
              <div className="bg-gradient-to-r from-airbnb-pink-500 to-airbnb-pink-600 text-white p-5 sm:p-6 rounded-xl shadow-lg mb-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Early Bird Special Active!</h3>
                    <p className="text-white/90 mb-3">Save ${(camp.price - (camp.early_bird_price || camp.price)).toFixed(0)} per child when you book now</p>
                    <CountdownTimer targetDate={camp.early_bird_deadline} label="Offer expires in" size="md" />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-airbnb-grey-50 to-airbnb-pink-50 rounded-xl p-5 sm:p-6 mb-6 sm:mb-8 border-2 border-airbnb-grey-200">
              <h2 className="text-lg sm:text-xl font-bold text-airbnb-grey-900 mb-4">{camp.name}</h2>
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div className="flex items-center gap-2 text-airbnb-grey-700">
                  <Calendar className="w-5 h-5 text-airbnb-pink-500" />
                  <span>{formatDate(camp.start_date)} - {formatDate(camp.end_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-airbnb-grey-700">
                  <MapPin className="w-5 h-5 text-airbnb-pink-500" />
                  <span>{camp.location}</span>
                </div>
                <div className="flex items-center gap-2 text-airbnb-grey-700">
                  <Tag className="w-5 h-5 text-airbnb-pink-500" />
                  <span className="font-semibold">${unitPrice} per child</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {isGuest && (
                <div className="bg-airbnb-grey-50 border-2 border-airbnb-grey-200 rounded-xl p-5 sm:p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <User className="w-6 h-6 text-airbnb-pink-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-bold text-airbnb-grey-900 mb-1">Guest Checkout</h3>
                      <p className="text-sm text-airbnb-grey-600">
                        Book as a guest or{' '}
                        <Link to="/auth" state={{ returnTo: `/camps/${id}/register` }} className="text-airbnb-pink-500 hover:text-airbnb-pink-600 font-semibold transition-standard">
                          sign in
                        </Link>
                        {' '}to manage your bookings
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-airbnb-grey-900 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={guestInfo.name}
                        onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Full name"
                        className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-standard"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-airbnb-grey-900 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-standard"
                      />
                      <p className="mt-1 text-xs text-airbnb-grey-500">
                        We'll send your booking confirmation here
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-airbnb-grey-900 mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={guestInfo.phone}
                        onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-standard"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-xl font-bold text-airbnb-grey-900">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-airbnb-pink-600 text-white rounded-full text-sm mr-3">{isGuest ? '1' : '1'}</span>
                    Booking Details
                  </label>
                  <span className="text-sm text-airbnb-grey-500">Required</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-airbnb-grey-900 mb-2">
                      Number of Places
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-airbnb-grey-400" />
                      <input
                        type="number"
                        min="1"
                        max={Math.min(availablePlaces, 10)}
                        value={numberOfPlaces}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          setNumberOfPlaces(Math.max(1, Math.min(value, availablePlaces)));
                        }}
                        className="w-full pl-10 pr-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent text-lg font-semibold transition-standard"
                      />
                    </div>
                    <p className="mt-1 text-xs text-airbnb-grey-500">
                      {availablePlaces} {availablePlaces === 1 ? 'spot' : 'spots'} available
                    </p>
                  </div>

                  <div className="border-t border-airbnb-grey-200 pt-6">
                    <h3 className="text-lg font-bold text-airbnb-grey-900 mb-4">Child Names</h3>
                    <div className="space-y-4">
                      {childrenEntries.map((entry, index) => (
                        <div key={index} className="bg-airbnb-grey-50 rounded-lg p-4 sm:p-5 border border-airbnb-grey-200">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex-shrink-0 w-7 h-7 bg-airbnb-pink-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <span className="font-semibold text-airbnb-grey-700">Child {index + 1}</span>
                          </div>
                          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-airbnb-grey-700 mb-1">
                                First Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={entry.firstName}
                                onChange={(e) => updateChildEntry(index, 'firstName', e.target.value)}
                                placeholder="First name"
                                className="w-full px-3 py-2 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-standard"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-airbnb-grey-700 mb-1">
                                Last Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={entry.lastName}
                                onChange={(e) => updateChildEntry(index, 'lastName', e.target.value)}
                                placeholder="Last name"
                                className="w-full px-3 py-2 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-standard"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-airbnb-grey-700 mb-1">
                                Age *
                              </label>
                              <input
                                type="number"
                                required
                                min="1"
                                max="100"
                                value={entry.age}
                                onChange={(e) => updateChildEntry(index, 'age', e.target.value)}
                                placeholder="Age"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 transition-standard ${entry.age && isAgeAppropriate(entry.age) === false
                                  ? 'border-orange-500 bg-orange-50 focus:ring-orange-500'
                                  : entry.age && isAgeAppropriate(entry.age) === true
                                    ? 'border-green-500 bg-green-50 focus:ring-green-500'
                                    : 'border-airbnb-grey-300 focus:ring-airbnb-pink-500 focus:border-transparent'
                                  }`}
                              />
                              {entry.age && isAgeAppropriate(entry.age) === false && camp && (
                                <div className="mt-1 flex items-start gap-1 text-xs text-orange-700">
                                  <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                  <span>This camp is for ages {camp.age_min}-{camp.age_max}</span>
                                </div>
                              )}
                              {entry.age && isAgeAppropriate(entry.age) === true && (
                                <div className="mt-1 flex items-center gap-1 text-xs text-green-700">
                                  <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                                  <span>Age appropriate</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setShowDiscountSection(!showDiscountSection)}
                    className="text-airbnb-pink-500 hover:text-airbnb-pink-600 font-semibold text-sm flex items-center gap-2 transition-standard"
                  >
                    <Tag className="w-4 h-4" />
                    {showDiscountSection ? 'Hide' : 'Have a'} discount code?
                  </button>
                </div>
                {showDiscountSection && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-airbnb-grey-700 mb-2">
                      Discount Code
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-airbnb-grey-400" />
                        <input
                          type="text"
                          value={discountCode}
                          onChange={(e) => {
                            setDiscountCode(e.target.value.toUpperCase());
                            setDiscountError('');
                          }}
                          placeholder="Enter code"
                          className="w-full pl-10 pr-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-standard"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyDiscount}
                        className="px-6 py-3 bg-airbnb-grey-200 text-airbnb-grey-700 rounded-lg hover:bg-airbnb-grey-300 transition-airbnb font-medium"
                      >
                        Apply
                      </button>
                    </div>
                    {discountError && (
                      <p className="mt-2 text-sm text-red-600">{discountError}</p>
                    )}
                    {discountApplied && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                        <span className="font-medium">✓ Discount applied: {discountApplied.code}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setDiscountApplied(null);
                            setDiscountCode('');
                          }}
                          className="text-red-600 hover:text-red-700 transition-standard"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-airbnb-grey-50 to-airbnb-pink-50 rounded-xl p-6 border-2 border-airbnb-grey-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-airbnb-grey-900">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-airbnb-pink-600 text-white rounded-full text-sm mr-3">{isGuest ? '2' : '2'}</span>
                    Review & Pay
                  </h3>
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="space-y-2">
                  {earlyBirdActive && (
                    <div className="flex justify-between text-sm">
                      <span className="text-airbnb-grey-600">Original Price:</span>
                      <span className="text-airbnb-grey-400 line-through">${camp.price} × {numberOfPlaces}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-airbnb-grey-600">
                      {earlyBirdActive ? 'Early Bird Price:' : 'Price per child:'}
                    </span>
                    <span className="text-airbnb-grey-900 font-medium">${unitPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-airbnb-grey-600">Number of children:</span>
                    <span className="text-airbnb-grey-900 font-medium">{numberOfPlaces}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-airbnb-grey-600">Subtotal:</span>
                    <span className="text-airbnb-grey-900 font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  {discountApplied && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">
                        Discount ({discountApplied.discount_type === 'percentage'
                          ? `${discountApplied.discount_value}%`
                          : `$${discountApplied.discount_value}`}):
                      </span>
                      <span className="text-green-600 font-medium">-${totalDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-airbnb-grey-300 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-airbnb-grey-900">Total Due:</span>
                      <span className="text-2xl font-bold text-airbnb-pink-600">
                        {formatCurrency(finalPrice, camp.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              )}

              <div className="bg-gradient-to-r from-airbnb-grey-50 to-airbnb-pink-50 border-2 border-airbnb-grey-200 rounded-xl p-6">
                <h4 className="font-bold text-airbnb-grey-900 mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-airbnb-pink-500" />
                  What Happens Next:
                </h4>
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-airbnb-pink-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <span className="text-airbnb-grey-700 font-medium">Complete secure payment (takes 30 seconds)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-airbnb-pink-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <span className="text-airbnb-grey-700 font-medium">Get instant booking confirmation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-airbnb-pink-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <span className="text-airbnb-grey-700 font-medium">Complete child details at your convenience</span>
                  </li>
                </ol>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-airbnb-pink-500 via-airbnb-pink-600 to-airbnb-pink-500 text-white rounded-xl hover:from-airbnb-pink-600 hover:via-airbnb-pink-700 hover:to-airbnb-pink-600 transition-all font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-105 transform"
              >
                <Zap className="w-7 h-7" />
                {processing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Securing Your Spot{numberOfPlaces > 1 ? 's' : ''}...
                  </span>
                ) : (
                  `Book Now - ${formatCurrency(finalPrice, camp.currency)}`
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-sm text-airbnb-grey-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Secured by Stripe</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>256-bit Encryption</span>
                </div>
              </div>
              <div className="text-center pt-4 border-t border-airbnb-grey-200">
                <p className="text-sm text-airbnb-grey-600 mb-2">Questions? We're here to help!</p>
                <a href="mailto:support@example.com" className="text-airbnb-pink-500 hover:text-airbnb-pink-600 font-semibold text-sm transition-standard">
                  Contact Support →
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
