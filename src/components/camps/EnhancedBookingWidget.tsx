import { Calendar, Users, DollarSign, Shield, CreditCard, Zap, AlertCircle, MessageSquare, Star, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';
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
    <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 space-y-6">
      <div className="pb-6 border-b border-gray-200">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-gray-900">{formatCurrency(currentPrice, currency)}</span>
          {earlyBirdActive && (
            <span className="text-lg text-gray-400 line-through">{formatCurrency(price, currency)}</span>
          )}
        </div>

        {earlyBirdActive && earlyBirdDeadline && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
              <Zap className="w-4 h-4" />
              <span>Early Bird Special - Save {formatCurrency(savings, currency)}!</span>
            </div>
            <CountdownTimer targetDate={earlyBirdDeadline} label="Offer expires in" size="sm" />
          </div>
        )}

        {averageRating && totalReviews && totalReviews > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mt-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-gray-900">{averageRating.toFixed(1)}</span>
            </div>
            <p className="text-sm text-gray-700 font-medium">
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
            {averageRating >= 4.5 && (
              <div className="flex items-center gap-2 mt-2 text-green-700">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-xs font-semibold">Highly Recommended</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dates</label>
          <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
            <Calendar className="w-5 h-5 text-gray-600" />
            <div className="text-sm">
              <div className="font-medium text-gray-900">{formatDate(startDate)}</div>
              <div className="text-gray-600">to {formatDate(endDate)}</div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
          <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
            <Users className="w-5 h-5 text-gray-600" />
            <div className="text-sm flex-1">
              <div className="font-medium text-gray-900">
                {availablePlaces} of {capacity} spots available
              </div>
              {availabilityStatus === 'limited' && (
                <div className="text-orange-600 font-medium">Filling fast!</div>
              )}
            </div>
          </div>
        </div>
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
            to={`/camps/${campId}/register`}
            className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transform"
          >
            <Zap className="w-6 h-6" />
            Reserve Your Spot
          </Link>

          {availabilityStatus === 'limited' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-yellow-800">
                ⚡ Only {availablePlaces} spots remaining!
              </p>
            </div>
          )}
        </>
      )}

      <button
        onClick={onEnquiryClick}
        className="flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium"
      >
        <MessageSquare className="w-5 h-5" />
        Ask a Question
      </button>

      <div className="pt-6 border-t border-gray-200 space-y-3">
        <h3 className="font-semibold text-gray-900 mb-3">Price Breakdown</h3>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Base price</span>
          <span className="font-medium text-gray-900">{formatCurrency(currentPrice, currency)}</span>
        </div>

        {earlyBirdActive && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Early bird discount</span>
            <span className="font-medium">-{formatCurrency(savings, currency)}</span>
          </div>
        )}

        <div className="pt-3 border-t border-gray-200 flex justify-between font-bold">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">{formatCurrency(currentPrice, currency)}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 space-y-3">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-gray-900 mb-1">Secure Booking</p>
            <p className="text-gray-600">Your payment information is encrypted and secure</p>
          </div>
        </div>

        {cancellationPolicy && (
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-gray-900 mb-1">Flexible Cancellation</p>
              <p className="text-gray-600 line-clamp-2">{cancellationPolicy}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 text-sm text-gray-600 pt-3">
          <CreditCard className="w-5 h-5" />
          <span>We accept all major credit cards</span>
        </div>
      </div>
    </div>
  );
}
