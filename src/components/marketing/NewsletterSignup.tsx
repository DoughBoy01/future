import { useState } from 'react';
import { Mail, Gift, Bell, Sparkles, ArrowRight } from 'lucide-react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call (replace with actual newsletter API integration)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Store in localStorage (in production, this would be sent to your newsletter service)
    localStorage.setItem('newsletterEmail', email);
    localStorage.setItem('newsletterSignupDate', new Date().toISOString());

    setIsSubmitting(false);
    setIsSuccess(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setEmail('');
      setIsSuccess(false);
    }, 3000);
  };

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-airbnb-pink-50 via-white to-airbnb-pink-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-airbnb-pink-100 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-airbnb-pink-100 rounded-full blur-3xl opacity-30 translate-x-1/3 translate-y-1/3" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left side - Benefits */}
            <div className="bg-gradient-to-br from-airbnb-pink-500 to-airbnb-pink-600 p-8 sm:p-10 text-white flex flex-col justify-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-full mb-6">
                <Bell className="w-7 h-7 text-white" />
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                Stay in the Loop
              </h2>

              <p className="text-white/95 text-base sm:text-lg mb-8 leading-relaxed">
                Join thousands of parents receiving exclusive camp updates, early-bird discounts, and expert tips for your child's development.
              </p>

              {/* Benefits list */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                    <Gift className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Exclusive Discounts</h3>
                    <p className="text-white/90 text-sm">First access to special offers and early-bird pricing</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">New Camp Launches</h3>
                    <p className="text-white/90 text-sm">Be the first to know about exciting new programs</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Expert Parenting Tips</h3>
                    <p className="text-white/90 text-sm">Curated advice to help your child thrive</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="p-8 sm:p-10 flex flex-col justify-center bg-white">
              {isSuccess ? (
                <div className="text-center py-8">
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
                  <h3 className="text-2xl font-bold text-airbnb-grey-900 mb-2">
                    Welcome Aboard!
                  </h3>
                  <p className="text-airbnb-grey-600">
                    Check your inbox for a special welcome offer.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-airbnb-grey-900 mb-2">
                      Join Our Community
                    </h3>
                    <p className="text-airbnb-grey-600 text-sm sm:text-base">
                      Get weekly insights and special offers delivered to your inbox.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="newsletter-email" className="block text-sm font-medium text-airbnb-grey-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-airbnb-grey-400" />
                        <input
                          id="newsletter-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          required
                          className="w-full pl-12 pr-4 py-3.5 border border-airbnb-grey-300 rounded-lg focus:border-airbnb-pink-500 focus:ring-2 focus:ring-airbnb-pink-500/20 focus:outline-none transition-all text-airbnb-grey-900 placeholder:text-airbnb-grey-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !email}
                      className="w-full bg-airbnb-pink-500 hover:bg-airbnb-pink-600 disabled:bg-airbnb-grey-300 disabled:cursor-not-allowed text-white font-medium py-3.5 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                    >
                      {isSubmitting ? (
                        <>
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
                          <span>Subscribing...</span>
                        </>
                      ) : (
                        <>
                          <span>Subscribe Now</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-xs text-airbnb-grey-500 text-center mt-4 leading-relaxed">
                    By subscribing, you agree to receive promotional emails. Unsubscribe anytime. We respect your privacy.
                  </p>

                  {/* Social proof */}
                  <div className="mt-6 pt-6 border-t border-airbnb-grey-200">
                    <div className="flex items-center justify-center gap-2 text-sm text-airbnb-grey-600">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-airbnb-pink-400 to-airbnb-pink-600 border-2 border-white" />
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white" />
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white" />
                      </div>
                      <span className="font-medium">
                        Join <span className="text-airbnb-pink-600 font-bold">5,000+</span> parents
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
