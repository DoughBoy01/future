import { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  Shield,
  Zap,
  DollarSign,
  Calendar,
  BarChart3,
  Heart,
  CheckCircle2,
  ArrowRight,
  Star,
  Globe,
  Headphones,
  Clock,
  CreditCard,
  FileText
} from 'lucide-react';
import { RevenueCalculator } from '../components/campowner/RevenueCalculator';
import { ComparisonTable } from '../components/campowner/ComparisonTable';
import { getCurrentAutoApplyOffer, formatOfferDisplay } from '../services/promotionalOfferService';
import type { PromotionalOffer } from '../services/promotionalOfferService';

export function PartnersPage() {
  const [formData, setFormData] = useState({
    organizationName: '',
    contactName: '',
    email: '',
    phone: '',
    campTypes: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeOffer, setActiveOffer] = useState<PromotionalOffer | null>(null);
  const [offerLoading, setOfferLoading] = useState(true);

  useEffect(() => {
    async function loadOffer() {
      try {
        const offer = await getCurrentAutoApplyOffer();
        setActiveOffer(offer);
      } catch (error) {
        console.error('Error loading promotional offer:', error);
      } finally {
        setOfferLoading(false);
      }
    }
    loadOffer();
  }, []);

  const offerText = activeOffer ? formatOfferDisplay(activeOffer) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setSubmitted(true);
    setLoading(false);
  };

  const benefits = [
    {
      icon: DollarSign,
      title: 'Instant Payments',
      description: 'Get paid instantly when parents book. Money splits automatically: 85% to you, 15% to us. No invoicing, no waiting 30-60 days.',
      stat: '85%',
      statLabel: 'To You'
    },
    {
      icon: Users,
      title: 'Smart Matching',
      description: 'Our quiz system matches parents with camps that fit their needs. Get discovered by qualified leads who are ready to book.',
      stat: '10,000+',
      statLabel: 'Active Parents'
    },
    {
      icon: FileText,
      title: 'Zero Paperwork',
      description: 'All registration forms, medical info, and waivers collected automatically. Everything organized in one dashboard.',
      stat: 'Auto',
      statLabel: 'Collection'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Built-in Stripe payment processing with bank-level security. We handle compliance, you focus on camps.',
      stat: '100%',
      statLabel: 'Secure'
    },
    {
      icon: TrendingUp,
      title: 'Increase Bookings',
      description: 'Our platform drives an average 40% increase in enrollment. Beautiful camp pages convert browsers into bookers.',
      stat: '40%',
      statLabel: 'Avg. Growth'
    },
    {
      icon: BarChart3,
      title: 'Powerful Analytics',
      description: 'Track performance, understand your audience, and optimize your offerings with real-time insights.',
      stat: 'Real-time',
      statLabel: 'Data Insights'
    }
  ];

  const features = [
    'Zero upfront cost packages - only pay when you get bookings',
    'Dedicated partner success manager',
    'Marketing support and featured placement',
    'Automated booking confirmations',
    'Parent review management',
    'Mobile-optimized camp pages',
    'Flexible cancellation policy management',
  ];

  const stats = [
    { value: '500+', label: 'Partner Organizations' },
    { value: '10,000+', label: 'Camps Listed' },
    { value: '100,000+', label: 'Happy Campers' },
    { value: '4.9/5', label: 'Partner Rating' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-airbnb-pink-500 via-airbnb-pink-600 to-airbnb-pink-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1920')] opacity-10 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-airbnb-pink-700/90 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 md:py-32">
          <div className="max-w-3xl">
            {/* Special Offer Badge */}
            {offerText && !offerLoading && (
              <div className="inline-flex items-center gap-2 px-6 py-3 mb-6 rounded-full bg-gradient-to-r from-amber-100 to-pink-100 border-2 border-white/50 shadow-lg animate-pulse">
                <Zap className="w-5 h-5 text-pink-600" />
                <span className="font-medium text-pink-900">
                  {offerText}
                </span>
              </div>
            )}

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Fill Your Camps Faster.
              <br />
              Get Paid Instantly.
              <br />
              Zero Paperwork.
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-8 leading-relaxed">
              Join the platform that helps camp owners increase bookings, automate admin work, and get paid in minutes — not weeks.
            </p>

            {/* Value Proposition Pills */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Only 15% commission</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">No setup fees</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">No monthly costs</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/auth?mode=signup&role=camp_owner"
                className="inline-flex items-center justify-center gap-2 bg-white text-airbnb-pink-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-airbnb-grey-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                List Your First Camp Free
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/20 transition-all"
              >
                See How It Works
              </a>
            </div>

            <p className="mt-8 text-sm text-white/80">
              <Shield className="inline w-4 h-4 mr-1" />
              Stripe-secured payments • PCI compliant • Trusted by 100+ camp organizers
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-airbnb-grey-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-airbnb-pink-400 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-airbnb-grey-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 sm:py-20 bg-airbnb-grey-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-airbnb-grey-900 mb-4">
              Why Camp Owners Love Us
            </h2>
            <p className="text-lg sm:text-xl text-airbnb-grey-600 max-w-3xl mx-auto">
              Everything you need to run a successful camp business — in one simple platform
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all border border-airbnb-grey-200 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-airbnb-pink-500 to-airbnb-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-airbnb-grey-900 mb-3">
                  {benefit.title}
                </h3>

                <p className="text-airbnb-grey-600 mb-4 leading-relaxed">
                  {benefit.description}
                </p>

                <div className="pt-4 border-t border-airbnb-grey-100">
                  <div className="text-2xl font-bold text-airbnb-pink-600">
                    {benefit.stat}
                  </div>
                  <div className="text-sm text-airbnb-grey-500">
                    {benefit.statLabel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Calculator */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-airbnb-grey-900 mb-4">
                Calculate Your Potential Earnings
              </h2>
              <p className="text-lg sm:text-xl text-airbnb-grey-600">
                See how much you could earn with our platform
              </p>
            </div>
            <RevenueCalculator />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-airbnb-grey-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-airbnb-grey-900 mb-4">
              Get Started in 4 Simple Steps
            </h2>
            <p className="text-lg sm:text-xl text-airbnb-grey-600 max-w-2xl mx-auto">
              From signup to your first booking in less than 30 minutes
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            {/* Step 1 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-airbnb-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold text-airbnb-grey-900 mb-2">Create Your Account</h3>
                <p className="text-airbnb-grey-600 text-lg">
                  Sign up in 2 minutes with just your email. No credit card required.
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-sm text-airbnb-pink-600 font-medium">
                  <Clock className="w-4 h-4" />
                  Takes 2 minutes
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-airbnb-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold text-airbnb-grey-900 mb-2">List Your First Camp</h3>
                <p className="text-airbnb-grey-600 text-lg">
                  Add camp details, photos, and pricing. Our guided wizard makes it easy.
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-sm text-airbnb-pink-600 font-medium">
                  <Clock className="w-4 h-4" />
                  Takes 10 minutes
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-airbnb-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold text-airbnb-grey-900 mb-2">Get Discovered by Parents</h3>
                <p className="text-airbnb-grey-600 text-lg">
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
              <div className="flex-shrink-0 w-12 h-12 bg-airbnb-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                4
              </div>
              <div>
                <h3 className="text-2xl font-bold text-airbnb-grey-900 mb-2">Get Paid Instantly</h3>
                <p className="text-airbnb-grey-600 text-lg">
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
            <a
              href="/auth?mode=signup&role=camp_owner"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-airbnb-pink-600 to-airbnb-pink-500 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Start Your Free Listing
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-airbnb-grey-900 mb-4">
              See How We Compare
            </h2>
            <p className="text-lg sm:text-xl text-airbnb-grey-600">
              Why camp owners choose us over alternatives
            </p>
          </div>
          <ComparisonTable />
        </div>
      </section>

      {/* Features List */}
      <section className="py-16 sm:py-20 bg-airbnb-grey-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-airbnb-grey-900 mb-6">
                Everything Included in Your Partnership
              </h2>
              <p className="text-lg text-airbnb-grey-600 mb-8">
                We've built a complete platform to help you succeed. No hidden fees,
                no complicated setup. Just powerful tools that work.
              </p>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-airbnb-grey-700 text-base">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-airbnb-pink-50 to-white rounded-2xl p-8 border-2 border-airbnb-pink-200">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-airbnb-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-airbnb-grey-900">Simple Pricing</div>
                      <div className="text-sm text-airbnb-grey-600">Packages that help you grow</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-airbnb-grey-900">Global Reach</div>
                      <div className="text-sm text-airbnb-grey-600">Marketing across 50+ countries</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-airbnb-grey-900">24/7 Support</div>
                      <div className="text-sm text-airbnb-grey-600">Dedicated partner success team</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-airbnb-grey-900 mb-4">
              Trusted by Camp Owners Nationwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="p-8 bg-airbnb-grey-50 rounded-xl">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-airbnb-grey-700 mb-6 leading-relaxed">
                "We filled our summer camp 3 weeks faster than last year. The instant payments alone save us so much time."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-airbnb-grey-300 rounded-full flex items-center justify-center text-airbnb-grey-600 font-bold">
                  JD
                </div>
                <div>
                  <div className="font-semibold text-airbnb-grey-900">Jane Doe</div>
                  <div className="text-sm text-airbnb-grey-500">Adventure Quest Camps</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 bg-airbnb-grey-50 rounded-xl">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-airbnb-grey-700 mb-6 leading-relaxed">
                "The smart quiz brings us qualified leads. Parents who book through the quiz are much more likely to complete registration."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-airbnb-grey-300 rounded-full flex items-center justify-center text-airbnb-grey-600 font-bold">
                  MS
                </div>
                <div>
                  <div className="font-semibold text-airbnb-grey-900">Michael Smith</div>
                  <div className="text-sm text-airbnb-grey-500">STEM Academy Summer</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-8 bg-airbnb-grey-50 rounded-xl">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-airbnb-grey-700 mb-6 leading-relaxed">
                "No more chasing parents for forms. Everything is collected automatically and organized perfectly."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-airbnb-grey-300 rounded-full flex items-center justify-center text-airbnb-grey-600 font-bold">
                  SR
                </div>
                <div>
                  <div className="font-semibold text-airbnb-grey-900">Sarah Rodriguez</div>
                  <div className="text-sm text-airbnb-grey-500">Creative Arts Camp</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 bg-airbnb-grey-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-airbnb-grey-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <details className="group bg-white rounded-lg shadow-md overflow-hidden">
              <summary className="p-6 cursor-pointer font-semibold text-lg text-airbnb-grey-900 hover:text-airbnb-pink-600 transition-colors">
                How much does it cost?
              </summary>
              <div className="px-6 pb-6 text-airbnb-grey-600">
                We only charge 15% commission on successful bookings. No setup fees, no monthly fees, no hidden costs. You keep 85% of every booking.
              </div>
            </details>

            <details className="group bg-white rounded-lg shadow-md overflow-hidden">
              <summary className="p-6 cursor-pointer font-semibold text-lg text-airbnb-grey-900 hover:text-airbnb-pink-600 transition-colors">
                How and when do I get paid?
              </summary>
              <div className="px-6 pb-6 text-airbnb-grey-600">
                Payments are processed through Stripe and deposited directly to your bank account. When a parent books, the payment is split automatically: 85% to you, 15% to us. Payouts typically arrive in 2-3 business days.
              </div>
            </details>

            <details className="group bg-white rounded-lg shadow-md overflow-hidden">
              <summary className="p-6 cursor-pointer font-semibold text-lg text-airbnb-grey-900 hover:text-airbnb-pink-600 transition-colors">
                What if I already have a website?
              </summary>
              <div className="px-6 pb-6 text-airbnb-grey-600">
                Perfect! We're not replacing your website — we're adding a discovery channel. Most of our bookings come from parents who've never heard of specific camps before. We bring you new customers through our smart matching quiz.
              </div>
            </details>

            <details className="group bg-white rounded-lg shadow-md overflow-hidden">
              <summary className="p-6 cursor-pointer font-semibold text-lg text-airbnb-grey-900 hover:text-airbnb-pink-600 transition-colors">
                Can I try it for free?
              </summary>
              <div className="px-6 pb-6 text-airbnb-grey-600">
                Yes! There are no upfront costs. List your camp for free, and only pay our 15% commission when you actually get bookings. {offerText && `Plus, we're currently offering: ${offerText}`}
              </div>
            </details>

            <details className="group bg-white rounded-lg shadow-md overflow-hidden">
              <summary className="p-6 cursor-pointer font-semibold text-lg text-airbnb-grey-900 hover:text-airbnb-pink-600 transition-colors">
                How long does it take to get set up?
              </summary>
              <div className="px-6 pb-6 text-airbnb-grey-600">
                Most camp owners have their first camp listed in under 30 minutes. Our guided wizard walks you through every step, and you can save drafts if you need to come back later.
              </div>
            </details>

            <details className="group bg-white rounded-lg shadow-md overflow-hidden">
              <summary className="p-6 cursor-pointer font-semibold text-lg text-airbnb-grey-900 hover:text-airbnb-pink-600 transition-colors">
                Do parents need to create accounts?
              </summary>
              <div className="px-6 pb-6 text-airbnb-grey-600">
                Nope! Parents can book as guests in just 2 minutes. They provide basic info, pay, and then complete detailed forms later. This makes the booking process fast and frictionless.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Partnership Enquiry Form */}
      <section id="signup" className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {!submitted ? (
            <div>
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-airbnb-grey-900 mb-4">
                  Other Partnership Opportunities
                </h2>
                <p className="text-lg text-airbnb-grey-600">
                  Schools, corporate partners, and other education providers — let's talk.
                  Fill out the form below and our team will reach out within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-airbnb-grey-900 mb-2">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all"
                      placeholder="Your camp organization"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-airbnb-grey-900 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-airbnb-grey-900 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all"
                      placeholder="you@organization.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-airbnb-grey-900 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-airbnb-grey-900 mb-2">
                    Types of Camps You Offer
                  </label>
                  <input
                    type="text"
                    value={formData.campTypes}
                    onChange={(e) => setFormData({ ...formData, campTypes: e.target.value })}
                    className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all"
                    placeholder="e.g., Summer day camps, STEM programs, Sports camps"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-airbnb-grey-900 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-airbnb-grey-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us about your organization and goals..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-airbnb-pink-500 to-airbnb-pink-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Partnership Request
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-airbnb-grey-500">
                  By submitting this form, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-airbnb-grey-900 mb-4">
                Thank You!
              </h3>
              <p className="text-lg text-airbnb-grey-600 mb-6">
                We've received your partnership request. Our team will review your information
                and reach out to discuss next steps.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-airbnb-pink-600 hover:text-airbnb-pink-700 font-semibold"
              >
                Submit another request
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-airbnb-pink-500 to-airbnb-pink-600 py-20 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Fill Your Camps?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Join 100+ camp owners who are getting more bookings and saving 10+ hours per week on admin work.
          </p>
          <a
            href="/auth?mode=signup&role=camp_owner"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-airbnb-pink-600 text-xl font-bold rounded-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200"
          >
            List Your First Camp Free
            <ArrowRight className="w-6 h-6" />
          </a>
          <p className="mt-6 text-sm opacity-75">
            No credit card required • Set up in 30 minutes • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}
