import { Calendar, Users, DollarSign, Shield, CreditCard, Zap, AlertCircle, MessageSquare, Star, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/currency';
import { formatPrice, getConvertedPrice, detectUserCurrency } from '../../lib/currency';
import { CountdownTimer } from '../urgency/CountdownTimer';

interface EnhancedBookingWidgetProps {
  campId: string;
  price: number;
  currency: string;
  earlyBirdPrice?: number;
  earlyBirdDeadline?: string;
  availablePlaces: number;
  capacity: number;
  startDate: string;
  endDate: string;
  averageRating?: number;
  totalReviews?: number;
  cancellationPolicy?: string;
  onEnquiryClick: () => void;
}

export function EnhancedBookingWidget({
  campId,
  price,
  currency,
  earlyBirdPrice,
  earlyBirdDeadline,
  availablePlaces,
  capacity,
  startDate,
  endDate,
  averageRating,
  totalReviews,
  cancellationPolicy,
  onEnquiryClick,
}: EnhancedBookingWidgetProps) {
  // Initialize user's preferred currency from localStorage
  const [userCurrency, setUserCurrency] = useState<string>(() => {
    return localStorage.getItem('preferredCurrency') || detectUserCurrency();
  });

  // Listen for currency changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newCurrency = localStorage.getItem('preferredCurrency') || detectUserCurrency();
      setUserCurrency(newCurrency);
    };

    const handleCurrencyChanged = (event: any) => {
      setUserCurrency(event.detail.currency);
    };

    // Listen for storage events from other tabs
    window.addEventListener('storage', handleStorageChange);
    // Listen for custom currency change events from same tab
    window.addEventListener('currencyChanged', handleCurrencyChanged);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('currencyChanged', handleCurrencyChanged);
    };
  }, []);

  const availabilityStatus = availablePlaces <= 0 ? 'full' : availablePlaces <= 5 ? 'limited' : 'available';
  const earlyBirdActive = earlyBirdPrice && earlyBirdDeadline && new Date(earlyBirdDeadline) > new Date();
  const currentPrice = earlyBirdActive ? earlyBirdPrice : price;
  const savings = earlyBirdActive ? price - earlyBirdPrice : 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-airbnb-grey-200 overflow-hidden w-full">
      {/* Price Section */}
      <div className="p-6 border-b border-airbnb-grey-200">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-airbnb-grey-900">{formatPrice(currentPrice, currency)}</span>
          <span className="text-base text-airbnb-grey-500">/ camper</span>
          {earlyBirdActive && (
            <span className="text-lg text-airbnb-grey-400 line-through ml-2">{formatPrice(price, currency)}</span>
          )}
        </div>
        {/* Show converted price in user's preferred currency */}
        {userCurrency !== currency && (
          <div className="text-sm text-airbnb-grey-600 mt-1">
            ≈ {formatPrice(getConvertedPrice(currentPrice, currency, userCurrency).amount, userCurrency)} / camper
          </div>
        )}

        {earlyBirdActive && earlyBirdDeadline && (
          <div className="bg-gradient-to-r from-airbnb-pink-50 to-airbnb-pink-100 border border-airbnb-pink-200 rounded-lg p-4 mt-4">
            <div className="flex items-center gap-2 text-airbnb-pink-800 font-semibold mb-2">
              <Zap className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm">Early Bird Special - Save {formatCurrency(savings, currency)}!</span>
            </div>
            <CountdownTimer targetDate={earlyBirdDeadline} label="Offer expires in" size="sm" />
          </div>
        )}

        {averageRating && totalReviews && totalReviews > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mt-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex gap-0.5" role="img" aria-label={`${averageRating.toFixed(1)} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-airbnb-grey-300'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="font-bold text-airbnb-grey-900">{averageRating.toFixed(1)}</span>
            </div>
            <p className="text-sm text-airbnb-grey-700 font-medium">
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
            {averageRating >= 4.5 && (
              <div className="flex items-center gap-2 mt-2 text-green-700">
                <ThumbsUp className="w-4 h-4" aria-hidden="true" />
                <span className="text-xs font-semibold">Highly Recommended</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dates and Availability Section */}
      <div className="p-6 space-y-4 border-b border-airbnb-grey-200">
        <div>
          <label className="block text-sm font-medium text-airbnb-grey-700 mb-2" htmlFor="camp-dates">
            Dates
          </label>
          <div
            id="camp-dates"
            className="flex items-center gap-3 p-4 border border-airbnb-grey-300 rounded-lg bg-airbnb-grey-50 transition-airbnb hover:border-airbnb-grey-400"
          >
            <Calendar className="w-5 h-5 text-airbnb-pink-500 flex-shrink-0" aria-hidden="true" />
            <div className="text-sm min-w-0">
              <div className="font-medium text-airbnb-grey-900">{formatDate(startDate)}</div>
              <div className="text-airbnb-grey-600">to {formatDate(endDate)}</div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-airbnb-grey-700 mb-2" htmlFor="camp-availability">
            Availability
          </label>
          <div
            id="camp-availability"
            className="flex items-center gap-3 p-4 border border-airbnb-grey-300 rounded-lg bg-airbnb-grey-50 transition-airbnb hover:border-airbnb-grey-400"
          >
            <Users className="w-5 h-5 text-airbnb-pink-500 flex-shrink-0" aria-hidden="true" />
            <div className="text-sm flex-1 min-w-0">
              <div className="font-medium text-airbnb-grey-900">
                {availablePlaces} of {capacity} spots available
              </div>
              {availabilityStatus === 'limited' && (
                <div className="text-orange-600 font-medium mt-1">Filling fast!</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="p-6 space-y-4">
        {availabilityStatus === 'full' ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-5 text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" aria-hidden="true" />
            <p className="font-semibold text-red-900 mb-1">Fully Booked</p>
            <p className="text-sm text-red-700">This camp has reached capacity</p>
          </div>
        ) : (
          <>
            <Link
              to={`/camps/${campId}/register`}
              className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-airbnb-pink-500 to-airbnb-pink-600 text-white rounded-lg font-semibold text-base shadow-md hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-airbnb-pink-500 focus:ring-offset-2 transition-all"
            >
              Reserve Your Spot
            </Link>

            {availabilityStatus === 'limited' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-yellow-800">
                  Only {availablePlaces} {availablePlaces === 1 ? 'spot' : 'spots'} remaining!
                </p>
              </div>
            )}
          </>
        )}

        <button
          onClick={onEnquiryClick}
          type="button"
          className="flex items-center justify-center gap-2 w-full px-6 py-3 border border-airbnb-grey-300 text-airbnb-grey-700 rounded-lg font-medium hover:border-airbnb-grey-900 hover:bg-airbnb-grey-50 focus:outline-none focus:ring-2 focus:ring-airbnb-grey-900 focus:ring-offset-2 transition-airbnb"
        >
          <MessageSquare className="w-5 h-5" aria-hidden="true" />
          Ask a Question
        </button>
      </div>

      {/* Price Breakdown Section */}
      <div className="p-6 pt-0 space-y-3 border-b border-airbnb-grey-200">
        <h3 className="font-semibold text-airbnb-grey-900 text-base mb-3">Price Breakdown</h3>

        <div className="flex justify-between items-center text-sm">
          <span className="text-airbnb-grey-600">Base price</span>
          <div className="text-right">
            <div className="font-medium text-airbnb-grey-900">{formatPrice(currentPrice, currency)}</div>
            {userCurrency !== currency && (
              <div className="text-xs text-airbnb-grey-500">
                ≈ {formatPrice(getConvertedPrice(currentPrice, currency, userCurrency).amount, userCurrency)}
              </div>
            )}
          </div>
        </div>

        {earlyBirdActive && (
          <div className="flex justify-between items-center text-sm text-green-600">
            <span>Early bird discount</span>
            <div className="text-right">
              <div className="font-medium">-{formatPrice(savings, currency)}</div>
              {userCurrency !== currency && (
                <div className="text-xs text-green-600/80">
                  ≈ -{formatPrice(getConvertedPrice(savings, currency, userCurrency).amount, userCurrency)}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-airbnb-grey-200 flex justify-between items-center font-bold">
          <span className="text-airbnb-grey-900">Total</span>
          <div className="text-right">
            <div className="text-airbnb-pink-600">{formatPrice(currentPrice, currency)}</div>
            {userCurrency !== currency && (
              <div className="text-sm text-airbnb-grey-600 font-normal">
                ≈ {formatPrice(getConvertedPrice(currentPrice, currency, userCurrency).amount, userCurrency)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trust & Policy Section */}
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm min-w-0">
            <p className="font-medium text-airbnb-grey-900 mb-1">Secure Booking</p>
            <p className="text-airbnb-grey-600">Your payment information is encrypted and secure</p>
          </div>
        </div>

        {cancellationPolicy && (
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-airbnb-pink-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm min-w-0">
              <p className="font-medium text-airbnb-grey-900 mb-1">Flexible Cancellation</p>
              <p className="text-airbnb-grey-600 line-clamp-2">{cancellationPolicy}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 text-sm text-airbnb-grey-600">
          <CreditCard className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <span className="min-w-0">We accept all major credit cards</span>
        </div>
      </div>
    </div>
  );
}
