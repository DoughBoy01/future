import { motion } from 'framer-motion';

interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
  questionLabels?: string[];
}

export function QuizProgress({
  currentStep,
  totalSteps,
  questionLabels = ['Name', 'Age', 'Interests', 'Budget', 'Duration', 'Special Needs'],
}: QuizProgressProps) {
  const percentage = (currentStep / totalSteps) * 100;
  const currentLabel = questionLabels[currentStep - 1] || '';

  return (
    <div className="w-full space-y-4" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps} aria-label={`Question ${currentStep} of ${totalSteps}: ${currentLabel}`}>
      {/* Progress Bar Container */}
      <div className="relative w-full h-6 bg-airbnb-grey-100 rounded-full border-b-4 border-airbnb-grey-200 overflow-hidden shadow-inner">
        {/* Animated Progress Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
        >
          {/* Shine/Glossy effect */}
          <div className="absolute top-1 left-2 right-2 h-1.5 bg-white/30 rounded-full" />

          {/* Animated Shine Streak */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 bottom-0 w-24 bg-white/20 skew-x-[-20deg]"
          />
        </motion.div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-airbnb-grey-600 font-black text-sm uppercase tracking-wider">
          {currentLabel}
        </span>
        <span className="text-airbnb-grey-400 font-black text-sm">
          {currentStep} / {totalSteps}
        </span>
      </div>
    </div>
  );
}
