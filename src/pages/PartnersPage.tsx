import { useState } from 'react';
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
  Headphones
} from 'lucide-react';

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
      icon: Users,
      title: 'Reach More Families',
      description: 'Connect with thousands of parents actively searching for quality educational experiences for their children.',
      stat: '10,000+',
      statLabel: 'Active Parents'
    },
    {
      icon: TrendingUp,
      title: 'Increase Bookings',
      description: 'Our platform drives an average 40% increase in enrollment for partner organizations.',
      stat: '40%',
      statLabel: 'Avg. Growth'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Built-in payment processing with instant payouts. We handle the transactions, you focus on the camps.',
      stat: '100%',
      statLabel: 'Secure'
    },
    {
      icon: Zap,
      title: 'Easy Management',
      description: 'Intuitive dashboard to manage camps, bookings, and communications all in one place.',
      stat: '< 5 min',
      statLabel: 'Setup Time'
    },
    {
      icon: Calendar,
      title: 'Flexible Scheduling',
      description: 'List unlimited camps with flexible dates, pricing, and capacity management tools.',
      stat: 'Unlimited',
      statLabel: 'Camp Listings'
    },
    {
      icon: BarChart3,
      title: 'Powerful Analytics',
      description: 'Track performance, understand your audience, and optimize your offerings with detailed insights.',
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
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Star className="w-4 h-4 fill-white" />
              <span className="text-sm font-semibold">Trusted by 500+ Camp Organizations</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Grow Your Education Business with FutureEdge
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-8 leading-relaxed">
              Join the leading platform connecting quality educational experiences with families worldwide.
              Increase your reach, streamline operations, and grow enrollment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#signup"
                className="inline-flex items-center justify-center gap-2 bg-white text-airbnb-pink-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-airbnb-grey-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Become a Partner
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#benefits"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/20 transition-all"
              >
                Learn More
              </a>
            </div>
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
              Everything You Need to Succeed
            </h2>
            <p className="text-lg sm:text-xl text-airbnb-grey-600 max-w-3xl mx-auto">
              Powerful tools and support to help you reach more families and grow your camp business
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

      {/* Features List */}
      <section className="py-16 sm:py-20 bg-white">
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
                    <div className="w-12 h-12 bg-airbnb-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
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

      {/* Testimonial */}
      <section className="py-16 sm:py-20 bg-airbnb-grey-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-xl border border-airbnb-grey-200">
            <div className="flex gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-6 h-6 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <blockquote className="text-xl sm:text-2xl text-airbnb-grey-700 mb-6 leading-relaxed">
              "Since partnering with FutureEdge, our enrollment has increased by 60%. The platform
              is incredibly easy to use, and the support team is fantastic. It's been a game-changer
              for our organization."
            </blockquote>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-airbnb-pink-500 to-airbnb-pink-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                SM
              </div>
              <div>
                <div className="font-bold text-airbnb-grey-900">Sarah Mitchell</div>
                <div className="text-airbnb-grey-600">Director, Adventure Quest Camps</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section id="signup" className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {!submitted ? (
            <div>
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-airbnb-grey-900 mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-airbnb-grey-600">
                  Fill out the form below and our partner team will reach out within 24 hours
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
      <section className="bg-gradient-to-r from-airbnb-pink-500 to-airbnb-pink-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <Heart className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Join the FutureEdge Community
          </h2>
          <p className="text-xl text-white/90 mb-8">
            500+ organizations trust us to help grow their camp business. You're next.
          </p>
          <a
            href="#signup"
            className="inline-flex items-center gap-2 bg-white text-airbnb-pink-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-airbnb-grey-50 transition-all shadow-xl hover:shadow-2xl"
          >
            Get Started Today
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
