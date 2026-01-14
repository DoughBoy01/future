import { useState, useEffect } from 'react';
import { ChevronRight, Sparkles, X, BrainCircuit, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { QuizProgress } from './QuizProgress';
import { NameQuestion } from './questions/NameQuestion';
import { AgeQuestion } from './questions/AgeQuestion';
import { ParentGoalsQuestion } from './questions/ParentGoalsQuestion';
import { InterestsQuestion } from './questions/InterestsQuestion';
import { BudgetQuestion } from './questions/BudgetQuestion';
import { DurationQuestion } from './questions/DurationQuestion';
import { SpecialNeedsQuestion } from './questions/SpecialNeedsQuestion';
import { QuizResults } from './QuizResults';
import {
  getRecommendations,
  generateSessionId,
  type CampWithScore,
} from '../../services/quizService';

interface QuizState {
  currentStep: number;
  responses: {
    childName?: string;
    childAge?: number;
    parentGoals?: string[];
    interests?: string[];
    budgetRange?: { min: number; max: number };
    duration?: 'half-day' | 'full-day' | 'week' | 'multi-week';
    specialNeeds?: { dietary?: string[]; accessibility?: string[] };
  };
  results: CampWithScore[] | null;
  isComplete: boolean;
  sessionId: string;
}

interface QuizContainerProps {
  autoStart?: boolean;
  onComplete?: (results: CampWithScore[]) => void;
}

const TOTAL_STEPS = 7;
const STORAGE_KEY = 'camp_quiz_state';

export function QuizContainer({ autoStart, onComplete }: QuizContainerProps) {
  const [state, setState] = useState<QuizState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const savedTime = parsed.savedAt || 0;
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          if (savedTime > sevenDaysAgo) {
            return { ...parsed, savedAt: undefined };
          }
        } catch (e) {
          console.error('Failed to parse saved quiz state:', e);
        }
      }
    }

    return {
      currentStep: autoStart ? 1 : 0,
      responses: {},
      results: null,
      isComplete: false,
      sessionId: generateSessionId(),
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (state.currentStep > 0 && !state.isComplete) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...state, savedAt: Date.now() })
      );
    }
  }, [state]);

  useEffect(() => {
    if (state.isComplete) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [state.isComplete]);

  const handleStart = () => {
    setState((prev) => ({ ...prev, currentStep: 1 }));
  };

  const handleNext = async () => {
    if (!isCurrentStepValid() || isTransitioning || isLoading) return;

    if (state.currentStep < TOTAL_STEPS) {
      setIsTransitioning(true);
      setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
      setTimeout(() => setIsTransitioning(false), 500);
    } else if (state.currentStep === TOTAL_STEPS) {
      await fetchResults();
    }
  };

  // Special handler for auto-advance questions (Age, Duration) that bypasses validation
  const handleAutoAdvance = () => {
    if (isTransitioning || isLoading) return;

    if (state.currentStep < TOTAL_STEPS) {
      setIsTransitioning(true);
      setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const handleBack = () => {
    if (state.currentStep > 1 && !isTransitioning && !isLoading) {
      setIsTransitioning(true);
      setState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }));
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const isCurrentStepValid = (): boolean => {
    switch (state.currentStep) {
      case 1: return !!state.responses.childName && state.responses.childName.length >= 2;
      case 2: return !!state.responses.childAge;
      case 3: return !!state.responses.parentGoals && state.responses.parentGoals.length > 0;
      case 4: return !!state.responses.interests && state.responses.interests.length > 0;
      case 5: return !!state.responses.budgetRange;
      case 6: return !!state.responses.duration;
      case 7: return true; // Special needs is optional
      default: return false;
    }
  };

  const fetchResults = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const recommendations = await getRecommendations({
        childAge: state.responses.childAge!,
        parentGoals: state.responses.parentGoals,
        interests: state.responses.interests!,
        budgetRange: state.responses.budgetRange,
        duration: state.responses.duration,
        specialNeeds: state.responses.specialNeeds,
      });

      // Save to localStorage (responses already persisted via useEffect)
      // Database save disabled - using local storage only for now
      // const deviceType =
      //   window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
      // await saveQuizResponse(...);

      // Staggered triple confetti burst for extra excitement!
      // Burst 1: Center explosion
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF385C', '#00A699', '#FC642D', '#58cc02']
      });

      // Burst 2: Left side (200ms delay)
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#FF385C', '#00A699', '#FC642D', '#58cc02']
        });
      }, 200);

      // Burst 3: Right side (400ms delay)
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#FF385C', '#00A699', '#FC642D', '#58cc02']
        });
      }, 400);

      setState((prev) => ({
        ...prev,
        results: recommendations,
        isComplete: true,
      }));

      onComplete?.(recommendations);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Sorry, something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExit = () => {
    // Clear localStorage and reset to welcome screen
    localStorage.removeItem(STORAGE_KEY);
    setState({
      currentStep: 0,
      responses: {},
      results: null,
      isComplete: false,
      sessionId: generateSessionId(),
    });
  };

  const handleStartOver = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      currentStep: 1,
      responses: {},
      results: null,
      isComplete: false,
      sessionId: generateSessionId(),
    });
  };

  if (state.currentStep === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-16 text-center space-y-10 border-b-[12px] border-airbnb-grey-100"
        >
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-airbnb-pink-50 rounded-[2rem] flex items-center justify-center border-2 border-airbnb-pink-200">
                <BrainCircuit className="w-12 h-12 text-airbnb-pink-600" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-airbnb-grey-100">
                <Search className="w-6 h-6 text-airbnb-pink-600" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-airbnb-grey-900 tracking-tight">
              Let's Find the Perfect <span className="text-airbnb-pink-600">Summer Adventure</span>
            </h1>
            <p className="text-xl md:text-2xl text-airbnb-grey-600 leading-relaxed max-w-2xl mx-auto font-medium">
              We'll ask a few friendly questions to understand what your family is looking for. Think of this as a chat with a camp advisor who really gets it.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="group relative bg-[#58cc02] hover:bg-[#46a302] text-white px-16 py-6 rounded-3xl font-black text-2xl shadow-[0_8px_0_#46a302] hover:shadow-[0_6px_0_#46a302] active:shadow-none active:translate-y-[8px] transition-all flex items-center gap-4 mx-auto"
          >
            LET'S GET STARTED
            <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
          </motion.button>

          <div className="flex items-center justify-center gap-2 text-airbnb-grey-400 font-bold uppercase tracking-widest text-sm">
            <Sparkles className="w-4 h-4" />
            Smart Matching
          </div>
        </motion.div>
      </div>
    );
  }

  if (state.isComplete && state.results) {
    return (
      <QuizResults
        results={state.results}
        sessionId={state.sessionId}
        childName={state.responses.childName}
        onStartOver={handleStartOver}
      />
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white md:relative md:inset-auto md:min-h-screen">
      <div className="max-w-4xl mx-auto px-4 w-full flex-1 flex flex-col overflow-hidden md:overflow-visible">
        {/* Header Area */}
        <div className="flex items-center gap-4 py-4 flex-shrink-0">
          <button
            onClick={handleExit}
            className="p-2 hover:bg-airbnb-grey-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-airbnb-grey-400" />
          </button>
          <QuizProgress currentStep={state.currentStep} totalSteps={TOTAL_STEPS} />
        </div>

        <div className="flex-1 max-w-2xl mx-auto w-full flex flex-col overflow-y-auto md:overflow-visible md:py-8">
          {/* Chat Thread Aesthetic */}
          <div className="flex-1 space-y-6 md:space-y-8 px-1">
          {/* AI Advisor "Message" */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-3 md:gap-4"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-airbnb-pink-50 rounded-2xl flex items-center justify-center border-2 border-airbnb-pink-100 flex-shrink-0 mt-1">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-airbnb-pink-600" />
            </div>

            <div className="relative bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] rounded-tl-none shadow-sm border border-airbnb-grey-100 max-w-full md:max-w-[90%]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={state.currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-4 py-2">
                      <div className="flex gap-1">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-airbnb-pink-200 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-airbnb-pink-300 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-airbnb-pink-400 rounded-full" />
                      </div>
                      <span className="font-bold text-airbnb-grey-400 text-sm">Finding the perfect matches for {state.responses.childName || 'your family'}...</span>
                    </div>
                  ) : (
                    <>
                      {state.currentStep === 1 && <span className="text-base md:text-lg font-bold text-airbnb-grey-700 leading-relaxed">First things first - what's your child's name? We'll use this to personalize our recommendations.</span>}
                      {state.currentStep === 2 && <span className="text-base md:text-lg font-bold text-airbnb-grey-700 leading-relaxed">How old is {state.responses.childName} right now? This helps us match them with age-appropriate programs where they'll thrive.</span>}
                      {state.currentStep === 3 && <span className="text-base md:text-lg font-bold text-airbnb-grey-700 leading-relaxed">What are you hoping {state.responses.childName} will gain from camp this summer? Select up to 2 goals that matter most to your family.</span>}
                      {state.currentStep === 4 && <span className="text-base md:text-lg font-bold text-airbnb-grey-700 leading-relaxed">What gets {state.responses.childName} excited? Pick up to 3 interests - tap any card to see real examples of what kids do!</span>}
                      {state.currentStep === 5 && <span className="text-base md:text-lg font-bold text-airbnb-grey-700 leading-relaxed">Let's talk budget. What feels right for your family this summer? (Many camps offer early bird discounts and sibling rates!)</span>}
                      {state.currentStep === 6 && <span className="text-base md:text-lg font-bold text-airbnb-grey-700 leading-relaxed">What kind of schedule works for your family? Half-day? Full-day? Week-long intensives?</span>}
                      {state.currentStep === 7 && <span className="text-base md:text-lg font-bold text-airbnb-grey-700 leading-relaxed">Last question! Does {state.responses.childName} have any dietary needs or accessibility requirements we should prioritize?</span>}
                      {state.currentStep > 7 && <span className="text-base md:text-lg font-bold text-airbnb-grey-700 leading-relaxed">Preparing your results...</span>}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* User Response Area */}
          <AnimatePresence mode="wait">
            {!isLoading && (
              <motion.div
                key={state.currentStep}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="w-full pb-4"
              >
                {state.currentStep === 1 && (
                  <NameQuestion
                    value={state.responses.childName}
                    onEnter={handleNext}
                    onChange={(name) =>
                      setState((prev) => ({
                        ...prev,
                        responses: { ...prev.responses, childName: name },
                      }))
                    }
                  />
                )}

                {state.currentStep === 2 && (
                  <AgeQuestion
                    name={state.responses.childName}
                    value={state.responses.childAge}
                    onSelect={handleAutoAdvance}
                    onChange={(age) =>
                      setState((prev) => ({
                        ...prev,
                        responses: { ...prev.responses, childAge: age },
                      }))
                    }
                  />
                )}

                {state.currentStep === 3 && (
                  <ParentGoalsQuestion
                    name={state.responses.childName}
                    value={state.responses.parentGoals}
                    onChange={(parentGoals) =>
                      setState((prev) => ({
                        ...prev,
                        responses: { ...prev.responses, parentGoals },
                      }))
                    }
                  />
                )}

                {state.currentStep === 4 && (
                  <InterestsQuestion
                    name={state.responses.childName}
                    value={state.responses.interests}
                    onChange={(interests) =>
                      setState((prev) => ({
                        ...prev,
                        responses: { ...prev.responses, interests },
                      }))
                    }
                  />
                )}

                {state.currentStep === 5 && (
                  <BudgetQuestion
                    name={state.responses.childName}
                    value={state.responses.budgetRange}
                    onChange={(budgetRange) =>
                      setState((prev) => ({
                        ...prev,
                        responses: { ...prev.responses, budgetRange },
                      }))
                    }
                  />
                )}

                {state.currentStep === 6 && (
                  <DurationQuestion
                    name={state.responses.childName}
                    value={state.responses.duration}
                    onSelect={handleAutoAdvance}
                    onChange={(duration) =>
                      setState((prev) => ({
                        ...prev,
                        responses: { ...prev.responses, duration },
                      }))
                    }
                  />
                )}

                {state.currentStep === 7 && (
                  <SpecialNeedsQuestion
                    name={state.responses.childName}
                    value={state.responses.specialNeeds}
                    onChange={(specialNeeds) =>
                      setState((prev) => ({
                        ...prev,
                        responses: { ...prev.responses, specialNeeds },
                      }))
                    }
                  />
                )}

                {state.currentStep > 7 && (
                  <div className="text-center text-airbnb-grey-400 font-bold">
                    Loading...
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

          {error && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-6 bg-red-50 border-b-4 border-red-200 rounded-[2rem] flex items-center gap-4 mt-6 w-full"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">⚠️</div>
              <p className="font-bold text-red-800 text-lg">{error}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation Footer - Only show if current step is not an auto-advance step OR it's the final results step */}
      {/* Manual steps: Name (1), Parent Goals (3), Interests (4), Budget (5), Special Needs (7) */}
      {/* Auto-advance steps: Age (2), Duration (6) */}
      {[1, 3, 4, 5, 7].includes(state.currentStep) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t-2 border-airbnb-grey-100 pb-safe">
          <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 flex items-center justify-between gap-3 md:gap-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBack}
              disabled={state.currentStep === 1 || isLoading}
              className={`
                flex items-center gap-2 px-6 py-3 md:px-10 md:py-5 rounded-xl md:rounded-2xl font-black text-base md:text-xl transition-all min-h-[44px]
                ${state.currentStep === 1
                  ? 'opacity-0 pointer-events-none'
                  : 'text-airbnb-grey-700 bg-white border-2 border-airbnb-grey-200 border-b-[3px] md:border-b-4 hover:bg-airbnb-grey-50 active:border-b-2 active:translate-y-[2px]'
                }
              `}
            >
              BACK
            </motion.button>

            <motion.button
              whileHover={isCurrentStepValid() && !isLoading ? { scale: 1.02 } : {}}
              whileTap={isCurrentStepValid() && !isLoading ? { scale: 0.98 } : {}}
              onClick={handleNext}
              disabled={!isCurrentStepValid() || isLoading}
              className={`
                flex-1 md:flex-none md:min-w-[240px] flex items-center justify-center gap-2 md:gap-3 px-8 py-3 md:px-12 md:py-5 rounded-xl md:rounded-[1.5rem] font-black text-base md:text-xl transition-all min-h-[44px]
                ${!isCurrentStepValid() || isLoading
                  ? 'bg-airbnb-grey-100 text-airbnb-grey-400 cursor-not-allowed border-b-[3px] md:border-b-4 border-airbnb-grey-200'
                  : 'bg-[#58cc02] hover:bg-[#46a302] text-white border-b-4 md:border-b-[6px] border-[#46a302] active:border-b-0 active:translate-y-[4px] md:active:translate-y-[6px]'
                }
              `}
            >
              {state.currentStep === TOTAL_STEPS ? (
                <>
                  <span className="hidden sm:inline">FIND PERFECT MATCHES</span>
                  <span className="sm:hidden">FIND MATCHES</span>
                  <span>🎉</span>
                </>
              ) : (
                <>CONTINUE</>
              )}
            </motion.button>
          </div>
        </div>
      )}

      {/* Small Back button for auto-advancing steps */}
      {[2, 6].includes(state.currentStep) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/50 backdrop-blur-sm pb-safe">
          <div className="max-w-2xl mx-auto px-4 py-3 md:py-4">
            <button
              onClick={handleBack}
              className="text-airbnb-grey-400 hover:text-airbnb-grey-900 font-bold text-xs md:text-sm uppercase tracking-widest transition-colors flex items-center gap-2 min-h-[44px]"
            >
              ← Back to previous question
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
