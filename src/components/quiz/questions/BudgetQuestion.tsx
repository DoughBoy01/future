import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';

interface BudgetQuestionProps {
  name?: string;
  value?: { min: number; max: number };
  onChange: (budget: { min: number; max: number }) => void;
}

const budgetRanges = [
  {
    key: 'budget',
    label: 'Budget-Friendly',
    range: 'Under $500',
    min: 0,
    max: 500,
    emoji: '💰',
    description: 'Great value programs',
  },
  {
    key: 'moderate',
    label: 'Moderate',
    range: '$500 - $1,000',
    min: 500,
    max: 1000,
    emoji: '✨',
    description: 'Quality experiences',
  },
  {
    key: 'premium',
    label: 'Premium',
    range: '$1,000 - $2,000',
    min: 1000,
    max: 2000,
    emoji: '⭐',
    description: 'Enhanced programs',
  },
  {
    key: 'luxury',
    label: 'Luxury',
    range: '$2,000+',
    min: 2000,
    max: 10000,
    emoji: '👑',
    description: 'Elite experiences',
  },
];

function getBudgetRangeKey(budget: { min: number; max: number }): string | null {
  const range = budgetRanges.find(
    (r) => r.min === budget.min && r.max === budget.max
  );
  return range ? range.key : null;
}

export function BudgetQuestion({ name = 'your child', value, onChange }: BudgetQuestionProps) {
  const [selectedRange, setSelectedRange] = useState<string | null>(
    value ? getBudgetRangeKey(value) : null
  );
  const [isFlexible, setIsFlexible] = useState(false);

  const handleRangeClick = (budget: typeof budgetRanges[0]) => {
    setSelectedRange(budget.key);
    setIsFlexible(false);
    onChange({ min: budget.min, max: budget.max });
  };

  const handleFlexibleClick = () => {
    setIsFlexible(true);
    setSelectedRange(null);
    onChange({ min: 0, max: 10000 });
  };

  return (
    <div className="space-y-10 pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {budgetRanges.map((budget) => {
          const isSelected = selectedRange === budget.key;

          return (
            <motion.button
              key={budget.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRangeClick(budget)}
              className={`
                relative flex flex-col items-start
                p-8 rounded-[2rem]
                border-2 border-b-[8px] transition-all duration-100
                ${isSelected
                  ? 'bg-airbnb-pink-50 border-airbnb-pink-500 border-b-airbnb-pink-700 active:border-b-2'
                  : 'bg-white border-airbnb-grey-200 hover:bg-airbnb-grey-50 active:border-b-2'
                }
              `}
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-airbnb-pink-600 border-4 border-white flex items-center justify-center shadow-lg z-10"
                  >
                    <Check className="w-6 h-6 text-white stroke-[4px]" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-5xl mb-6">{budget.emoji}</div>

              <div className="space-y-1 text-left">
                <h3 className="text-xl font-black text-airbnb-grey-900 leading-tight">
                  {budget.label}
                </h3>
                <p className="text-airbnb-pink-600 font-black text-sm uppercase tracking-widest">
                  {budget.range}
                </p>
                <p className="text-airbnb-grey-400 font-bold text-sm">
                  {budget.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleFlexibleClick}
        className={`
          w-full flex items-center justify-center gap-4
          px-10 py-6 rounded-[1.5rem]
          border-2 border-b-[6px] transition-all duration-100 font-black text-lg uppercase tracking-widest
          ${isFlexible
            ? 'bg-purple-50 border-purple-500 text-purple-700'
            : 'bg-white border-airbnb-grey-200 text-airbnb-grey-900 hover:bg-airbnb-grey-50'
          }
          active:border-b-2
        `}
      >
        <Sparkles className={`w-8 h-8 ${isFlexible ? 'text-purple-600' : 'text-airbnb-grey-300'}`} />
        I'm flexible with budget
      </motion.button>

      <div className="p-6 bg-blue-50 border-2 border-blue-100 rounded-[2rem] flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl flex-shrink-0">ℹ️</div>
        <p className="text-sm text-blue-800 font-bold leading-relaxed">
          Prices are per week. Many camps offer early bird discounts and sibling rates.
        </p>
      </div>
    </div>
  );
}
