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

              {/* Social Proof */}
              <div className="flex items-center gap-3 justify-center md:justify-start pt-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-500 border-2 border-white shadow-md"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <span className="text-sm md:text-base text-airbnb-grey-700">
                  Over <strong className="text-airbnb-pink-600 font-bold">3,200 parents</strong> found their perfect camp
                </span>
              </div>
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

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-airbnb-grey-200">
            <div className="text-center">
              <div className="text-2xl mb-1" aria-hidden="true">⚡</div>
              <p className="text-xs md:text-sm font-medium text-airbnb-grey-900">2-Minute Quiz</p>
              <p className="text-xs text-airbnb-grey-600 hidden md:block">Quick & easy</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1" aria-hidden="true">🎯</div>
              <p className="text-xs md:text-sm font-medium text-airbnb-grey-900">Personalized</p>
              <p className="text-xs text-airbnb-grey-600 hidden md:block">Just for your child</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1" aria-hidden="true">🔒</div>
              <p className="text-xs md:text-sm font-medium text-airbnb-grey-900">100% Free</p>
              <p className="text-xs text-airbnb-grey-600 hidden md:block">No commitment</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
