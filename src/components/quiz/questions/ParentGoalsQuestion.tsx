import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface ParentGoalsQuestionProps {
  name?: string;
  value?: string[];
  onChange: (goals: string[]) => void;
}

const parentGoals = [
  {
    key: 'skill-development',
    label: 'Skill Development',
    emoji: '🎯',
    description: 'Learn new skills and build expertise',
    color: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      borderBottom: 'border-b-blue-700',
      text: 'text-blue-600',
    },
  },
  {
    key: 'social-connection',
    label: 'Social Connection',
    emoji: '🤝',
    description: 'Make friends and build confidence',
    color: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      borderBottom: 'border-b-green-700',
      text: 'text-green-600',
    },
  },
  {
    key: 'physical-activity',
    label: 'Physical Activity',
    emoji: '💪',
    description: 'Stay active and energized',
    color: {
      bg: 'bg-orange-50',
      border: 'border-orange-500',
      borderBottom: 'border-b-orange-700',
      text: 'text-orange-600',
    },
  },
  {
    key: 'creative-expression',
    label: 'Creative Expression',
    emoji: '🎨',
    description: 'Explore creativity and self-expression',
    color: {
      bg: 'bg-purple-50',
      border: 'border-purple-500',
      borderBottom: 'border-b-purple-700',
      text: 'text-purple-600',
    },
  },
  {
    key: 'academic-enrichment',
    label: 'Academic Enrichment',
    emoji: '📚',
    description: 'Keep learning and prepare for school',
    color: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-500',
      borderBottom: 'border-b-indigo-700',
      text: 'text-indigo-600',
    },
  },
  {
    key: 'fun-adventure',
    label: 'Fun & Adventure',
    emoji: '🚀',
    description: 'Just have a great time and make memories',
    color: {
      bg: 'bg-airbnb-pink-50',
      border: 'border-airbnb-pink-500',
      borderBottom: 'border-b-airbnb-pink-700',
      text: 'text-airbnb-pink-600',
    },
  },
];

export function ParentGoalsQuestion({
  name = 'your child',
  value = [],
  onChange,
}: ParentGoalsQuestionProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(value);

  const handleGoalClick = (goalKey: string) => {
    let newGoals: string[];

    if (selectedGoals.includes(goalKey)) {
      // Deselect if already selected
      newGoals = selectedGoals.filter((g) => g !== goalKey);
    } else {
      // Select if under max limit
      if (selectedGoals.length < 2) {
        newGoals = [...selectedGoals, goalKey];
      } else {
        // Replace oldest selection if at max
        newGoals = [...selectedGoals.slice(1), goalKey];
      }
    }

    setSelectedGoals(newGoals);
    onChange(newGoals);
  };

  return (
    <div className="space-y-10 pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {parentGoals.map((goal) => {
          const isSelected = selectedGoals.includes(goal.key);

          return (
            <motion.button
              key={goal.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleGoalClick(goal.key)}
              className={`
                relative flex flex-col items-start
                p-8 rounded-[2rem]
                border-2 border-b-[8px] transition-all duration-100
                ${
                  isSelected
                    ? `${goal.color.bg} ${goal.color.border} ${goal.color.borderBottom} active:border-b-2`
                    : 'bg-white border-airbnb-grey-200 hover:bg-airbnb-grey-50 active:border-b-2'
                }
              `}
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 45 }}
                    className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-[#58cc02] border-4 border-white flex items-center justify-center shadow-lg z-10"
                  >
                    <Check className="w-6 h-6 text-white stroke-[4px]" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-5xl mb-6">{goal.emoji}</div>

              <div className="space-y-1 text-left">
                <h3 className="text-xl font-black text-airbnb-grey-900 leading-tight">
                  {goal.label}
                </h3>
                <p className={`${goal.color.text} font-bold text-sm leading-relaxed`}>
                  {goal.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedGoals.length === 2 && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center font-black text-airbnb-pink-600 uppercase tracking-widest text-sm"
          >
            Maximum reached! Tap one to swap.
          </motion.p>
        )}
      </AnimatePresence>

      <div className="p-6 bg-blue-50 border-2 border-blue-100 rounded-[2rem] flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl flex-shrink-0">
          💡
        </div>
        <p className="text-sm text-blue-800 font-bold leading-relaxed">
          <strong>Pro tip:</strong> Select up to 2 goals that matter most to your family. This helps
          us find the perfect match for {name}!
        </p>
      </div>
    </div>
  );
}
