import { useState, useEffect } from 'react';
import { PartyPopper, Mail, RotateCcw, Sparkles, ChevronRight, BrainCircuit } from 'lucide-react';
import { QuizResultCard } from './QuizResultCard';
import { QuizEmailCapture } from './QuizEmailCapture';
import { trackCampClick, type CampWithScore } from '../../services/quizService';

interface QuizResultsProps {
  results: CampWithScore[];
  sessionId: string;
  childName?: string;
  onStartOver: () => void;
}

export function QuizResults({ results, sessionId, childName, onStartOver }: QuizResultsProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleCampClick = async (campId: string, responseId: string) => {
    await trackCampClick(responseId, campId);
  };

  const handleEmailSuccess = () => {
    setEmailCaptured(true);
    setShowEmailModal(false);
  };

  if (results.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-airbnb-grey-50 rounded-[2rem] flex items-center justify-center border-2 border-airbnb-grey-200">
            <BrainCircuit className="w-12 h-12 text-airbnb-grey-400" />
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-6 border-b-8 border-orange-100">
          <h2 className="text-3xl font-black text-airbnb-grey-900">Let's Refine Your Search</h2>
          <p className="text-lg text-airbnb-grey-600">
            We couldn't find a perfect match with your current preferences. Try broadening your selections to discover more amazing camp options for {childName || 'your child'}!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button onClick={onStartOver} className="bg-airbnb-pink-600 hover:bg-airbnb-pink-700 text-white px-8 py-4 rounded-2xl font-black text-lg border-b-4 border-airbnb-pink-800 active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center gap-2">
              <RotateCcw className="w-6 h-6" /> Try Again
            </button>
            <button onClick={() => (window.location.href = '/camps')} className="bg-airbnb-grey-100 hover:bg-airbnb-grey-200 text-airbnb-grey-900 px-8 py-4 rounded-2xl font-black text-lg border-b-4 border-airbnb-grey-300 active:border-b-0 active:translate-y-[4px] transition-all">
              Browse All Camps
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12 relative overflow-hidden">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-sm animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                backgroundColor: ['#FF385C', '#00A699', '#FC642D', '#484848', '#767676'][i % 5],
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="text-center space-y-6 relative z-10">
        <div className="flex justify-center mb-6">
          <PartyPopper className="w-16 h-16 text-airbnb-pink-600 animate-bounce" />
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-airbnb-grey-900 tracking-tight">
          We Found <span className="text-airbnb-pink-600">{results.length} Perfect Match{results.length !== 1 ? 'es' : ''}</span> {childName ? `for ${childName}` : 'for Your Family'}!
        </h2>
        <p className="text-xl text-airbnb-grey-600 max-w-2xl mx-auto font-medium">
          These camps align beautifully with what you're looking for. Each one has been carefully matched to your family's goals and preferences.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
        {!emailCaptured ? (
          <button onClick={() => setShowEmailModal(true)} className="group bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-lg border-b-4 border-indigo-800 active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center gap-2 shadow-xl">
            <Mail className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            Email Results Report
          </button>
        ) : (
          <div className="bg-green-50 border-2 border-green-500 text-green-700 px-8 py-4 rounded-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6" /> Results Saved!
          </div>
        )}
        <button onClick={onStartOver} className="bg-airbnb-grey-100 hover:bg-airbnb-grey-200 text-airbnb-grey-900 px-8 py-4 rounded-2xl font-black text-lg border-b-4 border-airbnb-grey-300 active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center gap-2">
          <RotateCcw className="w-6 h-6" /> Start New Search
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {results.map((result, index) => (
          <div key={result.camp.id} className="animate-reveal" style={{ animationDelay: `${0.5 + index * 0.2}s` }}>
            <QuizResultCard
              camp={result.camp}
              matchLabel={result.matchLabel}
              matchReasons={result.matchReasons}
              ranking={result.ranking}
              onCampClick={() => handleCampClick(result.camp.id, sessionId)}
            />
          </div>
        ))}
      </div>

      <div className="text-center pt-8">
        <button onClick={() => (window.location.href = '/camps')} className="group inline-flex items-center gap-3 text-airbnb-pink-600 font-black text-2xl hover:gap-5 transition-all">
          Explore All Camps <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {showEmailModal && (
        <QuizEmailCapture sessionId={sessionId} onClose={() => setShowEmailModal(false)} onSuccess={handleEmailSuccess} />
      )}

      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes reveal {
          from { opacity: 0; transform: scale(0.9) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-confetti { animation: confetti linear forwards; }
        .animate-reveal { opacity: 0; animation: reveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </div>
  );
}
