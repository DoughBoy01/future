import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Users,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  Shield,
  TrendingUp,
  ArrowRight,
  Star,
  CreditCard,
} from 'lucide-react';
import { RevenueCalculator } from '../components/campowner/RevenueCalculator';
import { ComparisonTable } from '../components/campowner/ComparisonTable';
import { getCurrentAutoApplyOffer, formatOfferDisplay } from '../services/promotionalOfferService';
import type { PromotionalOffer } from '../services/promotionalOfferService';

export default function CampOwnerLanding() {
  const [activeOffer, setActiveOffer] = useState<PromotionalOffer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOffer() {
      try {
        const offer = await getCurrentAutoApplyOffer();
        setActiveOffer(offer);
      } catch (error) {
        console.error('Error loading promotional offer:', error);
      } finally {
        setLoading(false);
      }
    }

    loadOffer();
  }, []);

  const offerText = activeOffer ? formatOfferDisplay(activeOffer) : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-amber-50 pt-20 pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Special Offer Badge */}
            {offerText && !loading && (
              <div className="inline-flex items-center gap-2 px-6 py-3 mb-8 rounded-full bg-gradient-to-r from-amber-100 to-pink-100 border-2 border-pink-300 shadow-lg animate-pulse">
                <Zap className="w-5 h-5 text-pink-600" />
                <span className="font-medium text-pink-900">
                  {offerText}
                </span>
              </div>
            )}

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Fill Your Camps Faster.
              <br />
              <span className="text-pink-600">Get Paid Instantly.</span>
              <br />
              Zero Paperwork.
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Join the platform that helps camp owners increase bookings, automate admin work, and get paid in minutes — not weeks.
            </p>

            {/* Value Proposition Pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-gray-200">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Only 15% commission</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-gray-200">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">No setup fees</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-gray-200">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">No monthly costs</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/auth?mode=signup&role=camp_owner"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-500 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                List Your First Camp Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 text-lg font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all duration-200"
              >
                See How It Works
              </a>
            </div>

            {/* Trust Badge */}
            <p className="mt-8 text-sm text-gray-500">
              <Shield className="inline w-4 h-4 mr-1" />
              Stripe-secured payments • PCI compliant • Trusted by 100+ camp organizers
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-pink-200 rounded-full opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-200 rounded-full opacity-20 blur-3xl translate-x-1/2 translate-y-1/2" />
      </section>

      {/* Feature Showcase */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Why Camp Owners Love Us
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Everything you need to run a successful camp business — in one simple platform
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="p-8 rounded-xl border-2 border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all duration-200">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center mb-6">
                <DollarSign className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Instant Payments</h3>
              <p className="text-gray-600 leading-relaxed">
                Get paid instantly when parents book. Money splits automatically: 85% to you, 15% to us. No invoicing, no waiting 30-60 days.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-xl border-2 border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all duration-200">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Smart Matching</h3>
              <p className="text-gray-600 leading-relaxed">
                Our quiz system matches parents with camps that fit their needs. Get discovered by qualified leads who are ready to book.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-xl border-2 border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all duration-200">
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Zero Paperwork</h3>
              <p className="text-gray-600 leading-relaxed">
                All registration forms, medical info, and waivers collected automatically. Everything organized in one dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Calculator */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
              Calculate Your Potential Earnings
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              See how much you could earn with our platform
            </p>
            <RevenueCalculator />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Get Started in 4 Simple Steps
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            From signup to your first booking in less than 30 minutes
          </p>

          <div className="max-w-4xl mx-auto space-y-12">
            {/* Step 1 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h3>
                <p className="text-gray-600 text-lg">
                  Sign up in 2 minutes with just your email. No credit card required.
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-sm text-pink-600 font-medium">
                  <Clock className="w-4 h-4" />
                  Takes 2 minutes
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">List Your First Camp</h3>
                <p className="text-gray-600 text-lg">
                  Add camp details, photos, and pricing. Our guided wizard makes it easy.
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-sm text-pink-600 font-medium">
                  <Clock className="w-4 h-4" />
                  Takes 10 minutes
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Get Discovered by Parents</h3>
                <p className="text-gray-600 text-lg">
                  Parents find you through our smart quiz and search. Beautiful camp pages convert browsers into bookers.
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-sm text-amber-600 font-medium">
                  <TrendingUp className="w-4 h-4" />
                  40% higher conversion than DIY websites
                </span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                4
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Get Paid Instantly</h3>
                <p className="text-gray-600 text-lg">
                  Parent books and pays. 85% goes directly to your bank account. We keep 15% as our fee.
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-sm text-green-600 font-medium">
                  <CreditCard className="w-4 h-4" />
                  Instant payouts via Stripe
                </span>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <Link
              to="/auth?mode=signup&role=camp_owner"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-500 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Start Your Free Listing
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            See How We Compare
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Why camp owners choose us over alternatives
          </p>
          <ComparisonTable />
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Trusted by Camp Owners Nationwide
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Testimonial 1 - Placeholder */}
            <div className="p-8 bg-gray-50 rounded-xl">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "We filled our summer camp 3 weeks faster than last year. The instant payments alone save us so much time."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                  JD
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Jane Doe</div>
                  <div className="text-sm text-gray-500">Adventure Quest Camps</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 - Placeholder */}
            <div className="p-8 bg-gray-50 rounded-xl">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The smart quiz brings us qualified leads. Parents who book through the quiz are much more likely to complete registration."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                  MS
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Michael Smith</div>
                  <div className="text-sm text-gray-500">STEM Academy Summer</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 - Placeholder */}
            <div className="p-8 bg-gray-50 rounded-xl">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "No more chasing parents for forms. Everything is collected automatically and organized perfectly."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                  SR
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Rodriguez</div>
                  <div className="text-sm text-gray-500">Creative Arts Camp</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto space-y-6">
            <details className="group bg-white rounded-lg shadow-md overflow-hidden">
              <summary className="p-6 cursor-pointer font-semibold text-lg text-gray-900 hover:text-pink-600 transition-colors">
                How much does it cost?
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                We only charge 15% commission on successful bookings. No setup fees, no monthly fees, no hidden costs. You keep 85% of every booking.
              </div>
            </details>

            <details className="group bg-white rounded-lg shadow-md overflow-hidden">
              <summary className="p-6 cursor-pointer font-semibold text-lg text-gray-900 hover:text-pink-600 transition-colors">
                How and when do I get paid?
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Payments are processed through Stripe and deposited directly to your bank account. When a parent books, the payment is split automatically: 85% to you, 15% to us. Payouts typically arrive in 2-3 business days.
              </div>
            </details>

            <details className="group bg-white rounded-lg shadow-md overflow-hidden">
              <summary className="p-6 cursor-pointer font-semibold text-lg text-gray-900 hover:text-pink-600 transition-colors">
                What if I already have a website?
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Perfect! We're not replacing your website — we're adding a discovery channel. Most of our bookings come from parents who've never heard of specific camps before. We bring you new customers through our smart matching quiz.
              </div>
            </details>

            <details className="group bg-white rounded-lg shadow-md overflow-hidden">
              <summary className="p-6 cursor-pointer font-semibold text-lg text-gray-900 hover:text-pink-600 transition-colors">
                Can I try it for free?
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Yes! There are no upfront costs. List your camp for free, and only pay our 15% commission when you actually get bookings. {offerText && `Plus, we're currently offering: ${offerText}`}
              </div>
            </details>

            <details className="group bg-white rounded-lg shadow-md overflow-hidden">
              <summary className="p-6 cursor-pointer font-semibold text-lg text-gray-900 hover:text-pink-600 transition-colors">
                How long does it take to get set up?
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Most camp owners have their first camp listed in under 30 minutes. Our guided wizard walks you through every step, and you can save drafts if you need to come back later.
              </div>
            </details>

            <details className="group bg-white rounded-lg shadow-md overflow-hidden">
              <summary className="p-6 cursor-pointer font-semibold text-lg text-gray-900 hover:text-pink-600 transition-colors">
                Do parents need to create accounts?
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Nope! Parents can book as guests in just 2 minutes. They provide basic info, pay, and then complete detailed forms later. This makes the booking process fast and frictionless.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-pink-500 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Fill Your Camps?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Join 100+ camp owners who are getting more bookings and saving 10+ hours per week on admin work.
          </p>
          <Link
            to="/auth?mode=signup&role=camp_owner"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-pink-600 text-xl font-bold rounded-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200"
          >
            List Your First Camp Free
            <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="mt-6 text-sm opacity-75">
            No credit card required • Set up in 30 minutes • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}
