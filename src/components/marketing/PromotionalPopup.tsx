import { useState, useEffect } from 'react';
import { X, Mail, Gift } from 'lucide-react';

interface PromotionalPopupProps {
  /** Time in milliseconds before showing the popup (default: 5000ms / 5 seconds) */
  dwellTime?: number;
  /** Discount percentage to display (default: 15) */
  discountPercentage?: number;
  /** Custom offer text (optional) */
  offerText?: string;
}

export function PromotionalPopup({
  dwellTime = 5000,
  discountPercentage = 15,
  offerText,
}: PromotionalPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if user has already provided email or dismissed the popup
    const hasProvidedEmail = localStorage.getItem('userEmail');
    const hasDismissed = localStorage.getItem('promotionalPopupDismissed');

    if (hasProvidedEmail || hasDismissed) {
      return;
    }

    // Show popup after dwell time
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Slight delay for smooth animation
      setTimeout(() => setIsAnimatingIn(true), 50);
    }, dwellTime);

    return () => clearTimeout(timer);
  }, [dwellTime]);

  const handleClose = () => {
    setIsAnimatingIn(false);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem('promotionalPopupDismissed', 'true');
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call (replace with actual API integration)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Store email in localStorage
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userEmailTimestamp', new Date().toISOString());

    setIsSubmitting(false);
    setIsSuccess(true);

    // Close popup after showing success message
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  if (!isVisible) {
    return null;
  }

  const defaultOfferText = `Get ${discountPercentage}% off your first camp booking!`;
  const displayOfferText = offerText || defaultOfferText;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isAnimatingIn ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        className={`fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-50 transition-all duration-300 ${
          isAnimatingIn
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-airbnb-grey-700 hover:text-airbnb-grey-900 transition-all z-10"
            aria-label="Close popup"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-airbnb-pink-500 to-airbnb-pink-600 px-6 py-8 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Special Offer!
              </h2>
              <p className="text-white/95 text-lg font-medium">
                {displayOfferText}
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-6 py-8">
            {isSuccess ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-airbnb-grey-900 mb-2">
                  You're all set!
                </h3>
                <p className="text-airbnb-grey-600">
                  Check your email for your exclusive discount code.
                </p>
              </div>
            ) : (
              <>
                <p className="text-airbnb-grey-600 text-center mb-6">
                  Enter your email to receive your discount code and stay updated on new camp offerings.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="promo-email" className="sr-only">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-airbnb-grey-400" />
                      <input
                        id="promo-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className="w-full pl-12 pr-4 py-3 border border-airbnb-grey-300 rounded-lg focus:border-airbnb-pink-500 focus:ring-2 focus:ring-airbnb-pink-500/20 focus:outline-none transition-all text-airbnb-grey-900 placeholder:text-airbnb-grey-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="w-full bg-airbnb-pink-600 hover:bg-airbnb-pink-700 disabled:bg-airbnb-grey-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Claim My Discount'
                    )}
                  </button>
                </form>

                <p className="text-xs text-airbnb-grey-500 text-center mt-4">
                  By submitting, you agree to receive promotional emails. You can unsubscribe at any time.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
