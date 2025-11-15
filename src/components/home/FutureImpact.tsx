import { TrendingUp, Users, Award, Sparkles, ArrowRight, Info, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FutureImpact() {
  const stats = [
    {
      icon: TrendingUp,
      value: '87%',
      label: 'of parents report their child gained confidence',
      color: 'text-airbnb-pink-500',
      bg: 'bg-airbnb-pink-50',
    },
    {
      icon: Users,
      value: '92%',
      label: 'of campers develop new friendships',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Award,
      value: '78%',
      label: 'discover a new passion or interest',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <section className="py-16 sm:py-20 md:py-28 lg:py-32 bg-gradient-to-b from-white to-airbnb-grey-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="text-center mb-12 sm:mb-16">
          {/* Why Camps Matter */}
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in-up">
            <Info className="w-4 h-4" />
            <span>Why Camps Matter</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-airbnb-grey-900 mb-4 sm:mb-6 px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            The Power of Purposeful Summer Experiences
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-airbnb-grey-600 max-w-3xl mx-auto mb-8 px-4 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            See how FutureEdge camps transform typical summer breaks into opportunities for growth,
            discovery, and meaningful connections.
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {/* Traditional Summer Card */}
          <div className="bg-white border-2 border-airbnb-grey-200 rounded-2xl p-6 sm:p-8 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-airbnb-grey-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <div className="relative">
              <h3 className="text-xl sm:text-2xl font-bold text-airbnb-grey-900 mb-4">
                Traditional summer
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-airbnb-grey-600">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Relaxation and free time at home</span>
                </li>
                <li className="flex items-start gap-3 text-airbnb-grey-600">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Casual play with neighborhood friends</span>
                </li>
                <li className="flex items-start gap-3 text-airbnb-grey-600">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Screen time and entertainment</span>
                </li>
                <li className="flex items-start gap-3 text-airbnb-grey-600">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Familiar routines and activities</span>
                </li>
                <li className="flex items-start gap-3 text-airbnb-grey-600">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Time to rest before school starts</span>
                </li>
              </ul>
            </div>
          </div>

          {/* With Camp Card */}
          <div className="bg-gradient-to-br from-airbnb-pink-500 to-airbnb-pink-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16 opacity-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12 opacity-10"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6" />
                <h3 className="text-xl sm:text-2xl font-bold">
                  With FutureEdge Camps
                </h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span>Build confidence through hands-on experiences</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span>Discover hidden talents and future career paths</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span>Form lasting friendships with like-minded peers</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span>Develop essential life skills and independence</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span>Return to school excited and ahead of the curve</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm font-medium opacity-90">
                  Give your child the advantage they deserve
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center animate-fade-in-up"
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 ${stat.bg} rounded-full mb-4`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-airbnb-grey-900 mb-2">
                {stat.value}
              </div>
              <p className="text-sm sm:text-base text-airbnb-grey-600 px-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <p className="text-lg sm:text-xl text-airbnb-grey-700 mb-6 font-medium">
            Ready to give your child an amazing summer?
          </p>
          <Link
            to="/camps"
            className="inline-flex items-center gap-2 bg-airbnb-pink-500 hover:bg-airbnb-pink-600 text-white px-8 py-4 rounded-lg text-base sm:text-lg font-medium transition-airbnb shadow-md hover:shadow-lg"
          >
            Explore Camps Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
