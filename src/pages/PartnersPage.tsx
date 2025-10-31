import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  Target,
  Shield,
  Globe,
  Star,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Heart,
  Award,
  MessageSquare
} from 'lucide-react';

export function PartnersPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const reasons = [
    {
      icon: Users,
      title: 'Reach More Families',
      description: 'Connect with thousands of families actively searching for quality camp experiences for their children.',
      color: 'blue'
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Business',
      description: 'Increase bookings and revenue with our proven marketing platform and dedicated family audience.',
      color: 'green'
    },
    {
      icon: Target,
      title: 'Targeted Marketing',
      description: 'Your camps are shown to families based on age, interests, location, and specific preferences.',
      color: 'purple'
    },
    {
      icon: Shield,
      title: 'Trusted Platform',
      description: 'Benefit from our verified reviews system and trusted brand that families rely on.',
      color: 'indigo'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track performance with detailed insights on views, clicks, bookings, and conversion rates.',
      color: 'orange'
    },
    {
      icon: Globe,
      title: 'Easy Management',
      description: 'Simple tools to manage listings, update availability, process bookings, and communicate with families.',
      color: 'teal'
    }
  ];

  const successStories = [
    {
      organisation: 'Adventure Quest Camps',
      logo: '🏕️',
      result: '350% increase in bookings',
      quote: 'Partnering with Future has transformed our business. We went from struggling to fill camps to having a waitlist every season.',
      author: 'Sarah Mitchell',
      position: 'Founder & Director',
      stats: {
        bookings: '+350%',
        revenue: '$125K',
        satisfaction: '4.9/5'
      },
      color: 'blue'
    },
    {
      organisation: 'Tech Innovators Academy',
      logo: '💻',
      result: 'Filled all summer programs in 6 weeks',
      quote: 'The platform is incredibly easy to use, and the families we connect with are genuinely interested in what we offer. Best decision we made.',
      author: 'Marcus Chen',
      position: 'Program Director',
      stats: {
        bookings: '+280%',
        revenue: '$95K',
        satisfaction: '4.8/5'
      },
      color: 'purple'
    },
    {
      organisation: 'Creative Arts Summer Camp',
      logo: '🎨',
      result: 'Reached families across 3 states',
      quote: 'We expanded our reach beyond our local area and attracted families from surrounding states. The exposure has been incredible.',
      author: 'Jessica Torres',
      position: 'Owner',
      stats: {
        bookings: '+420%',
        revenue: '$150K',
        satisfaction: '5.0/5'
      },
      color: 'pink'
    }
  ];

  const benefits = [
    'Dedicated partner support team',
    'Professional photography assistance',
    'Featured placement opportunities',
    'Social media promotion',
    'Email marketing to our database',
    'Flexible commission structure',
    'No upfront fees or commitments',
    'Training and best practices guidance'
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Sign Up',
      description: 'Create your organization profile in minutes with our simple onboarding process.',
      icon: Users
    },
    {
      step: 2,
      title: 'List Your Camps',
      description: 'Add your camps with photos, descriptions, schedules, and pricing. We help you showcase what makes you special.',
      icon: Star
    },
    {
      step: 3,
      title: 'Get Discovered',
      description: 'Families find your camps through search, recommendations, and our marketing efforts.',
      icon: Globe
    },
    {
      step: 4,
      title: 'Grow Together',
      description: 'Receive bookings, manage enrollments, and watch your business thrive.',
      icon: TrendingUp
    }
  ];

  const colorClasses: Record<string, { bg: string; text: string; icon: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'text-orange-600' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-700', icon: 'text-teal-600' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-700', icon: 'text-pink-600' }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium">Trusted by 500+ Camp Organizations</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Partner with Future
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 leading-relaxed">
              Connect with families searching for amazing camp experiences.
              Grow your enrollment and make a lasting impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-xl"
              >
                Become a Partner
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#success-stories"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-colors border border-white/20"
              >
                View Success Stories
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6">
                <div className="text-3xl sm:text-4xl font-bold mb-2">500+</div>
                <div className="text-blue-100 text-sm sm:text-base">Partner Camps</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6">
                <div className="text-3xl sm:text-4xl font-bold mb-2">50K+</div>
                <div className="text-blue-100 text-sm sm:text-base">Active Families</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6">
                <div className="text-3xl sm:text-4xl font-bold mb-2">300%</div>
                <div className="text-blue-100 text-sm sm:text-base">Avg. Growth</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6">
                <div className="text-3xl sm:text-4xl font-bold mb-2">4.8★</div>
                <div className="text-blue-100 text-sm sm:text-base">Partner Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reasons to Partner Section */}
      <div className="py-16 sm:py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Partner with Us?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Join a thriving community of camp providers reaching more families than ever before
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              const colors = colorClasses[reason.color];
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className={`inline-flex p-3 rounded-lg ${colors.bg} mb-4`}>
                    <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${colors.icon}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{reason.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{reason.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Success Stories Section */}
      <div id="success-stories" className="py-16 sm:py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full mb-4">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-medium">Partner Success Stories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Real Results from Real Partners
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              See how camp organizations like yours are growing with Future
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {successStories.map((story, index) => {
              const colors = colorClasses[story.color];
              return (
                <div
                  key={index}
                  className="bg-gray-50 rounded-2xl p-6 sm:p-8 border-2 border-gray-200 hover:border-blue-500 transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-4xl">{story.logo}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {story.organisation}
                      </h3>
                      <div className={`inline-flex items-center gap-1 ${colors.bg} ${colors.text} px-3 py-1 rounded-full text-sm font-semibold`}>
                        <TrendingUp className="w-4 h-4" />
                        {story.result}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 italic leading-relaxed mb-4">
                      "{story.quote}"
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {story.author.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{story.author}</div>
                        <div className="text-sm text-gray-600">{story.position}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{story.stats.bookings}</div>
                      <div className="text-xs text-gray-600">Bookings</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{story.stats.revenue}</div>
                      <div className="text-xs text-gray-600">Revenue</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{story.stats.satisfaction}</div>
                      <div className="text-xs text-gray-600">Rating</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 sm:py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and start connecting with families today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="relative">
                  <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {item.step}
                    </div>
                    <div className="mt-4">
                      <Icon className="w-12 h-12 text-blue-600 mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 sm:py-20 md:py-28 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What You Get as a Partner
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to succeed, included with your partnership
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white rounded-lg p-4 sm:p-5 shadow-sm hover:shadow-md transition-all"
              >
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 sm:py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 sm:p-12 md:p-16 text-white shadow-2xl">
            <MessageSquare className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Ready to Grow Your Camp?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl mx-auto">
              Join hundreds of successful camp organizations and start reaching more families today.
              No upfront costs, no commitments—just growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-xl"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="mailto:partners@future.com"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-colors border border-white/20"
              >
                Contact Our Team
              </a>
            </div>
            <p className="mt-6 text-blue-100 text-sm">
              Questions? Email us at partners@future.com or call 1-800-FUTURE-CAMP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
