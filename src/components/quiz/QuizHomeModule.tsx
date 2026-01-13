import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuizHomeModule() {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    navigate('/find-your-camp');
  };

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-airbnb-pink-50 via-purple-50 to-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border-2 border-airbnb-pink-200 hover:border-airbnb-pink-300 transition-all">
          <div className="grid md:grid-cols-[auto_1fr_auto] gap-6 items-center">
            {/* Icon */}
            <div className="flex justify-center md:justify-start">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-airbnb-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" aria-hidden="true" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center md:text-left space-y-3">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-airbnb-grey-900">
                Find Your Perfect Camp
              </h2>
              <p className="text-base md:text-lg text-airbnb-grey-600 leading-relaxed">
                Answer a few quick questions and get personalized camp recommendations tailored to your child's interests and needs.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center md:justify-end">
              <button
                onClick={handleStartQuiz}
                className="group bg-airbnb-pink-600 hover:bg-airbnb-pink-700 text-white px-8 py-4 rounded-lg font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-airbnb-pink-600 focus:ring-offset-2 flex items-center gap-2 whitespace-nowrap"
                aria-label="Start camp finder quiz"
              >
                Find My Camp
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
