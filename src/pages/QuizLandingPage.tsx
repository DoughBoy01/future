import { Clock, Shield, Star } from 'lucide-react';
import { QuizContainer } from '../components/quiz/QuizContainer';

export function QuizLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-airbnb-pink-50 to-white">
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-airbnb-pink-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-airbnb-pink-200 mb-6">
            <span className="text-2xl" aria-hidden="true">✨</span>
            <span className="text-sm font-medium text-airbnb-grey-900">Personalized Camp Finder</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-airbnb-grey-900 mb-6 leading-tight">
            Discover the Perfect Camp<br />
            <span className="bg-gradient-to-r from-airbnb-pink-600 to-purple-600 bg-clip-text text-transparent">
              in 2 Minutes
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-airbnb-grey-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Answer 5 quick questions and we'll match your child with camps they'll absolutely love.
            Personalized recommendations based on age, interests, and learning style.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <TrustBadge icon={Clock} text="2 min quiz" />
            <TrustBadge icon={Shield} text="Free & secure" />
            <TrustBadge icon={Star} text="Personalized" />
          </div>

          {/* Social Proof */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-500 border-2 border-white shadow-md"
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="text-sm md:text-base text-airbnb-grey-700">
              Join <strong className="text-airbnb-pink-600">3,200+ parents</strong> who found their perfect camp
            </p>
          </div>
        </div>
      </section>

      {/* Quiz Container */}
      <section className="pb-20">
        <QuizContainer autoStart={false} />
      </section>
    </div>
  );
}

// Trust Badge Component
interface TrustBadgeProps {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}

function TrustBadge({ icon: Icon, text }: TrustBadgeProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-airbnb-grey-200">
      <Icon className="w-5 h-5 text-airbnb-pink-600" aria-hidden="true" />
      <span className="text-sm font-medium text-airbnb-grey-900">{text}</span>
    </div>
  );
}
