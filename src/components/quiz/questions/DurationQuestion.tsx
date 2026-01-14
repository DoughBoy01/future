import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Sunrise, Calendar, CalendarDays, Check } from 'lucide-react';

interface DurationQuestionProps {
  name?: string;
  value?: 'half-day' | 'full-day' | 'week' | 'multi-week';
  onChange: (duration: 'half-day' | 'full-day' | 'week' | 'multi-week') => void;
  onSelect?: () => void;
}

export function DurationQuestion({ name = 'your child', value, onChange, onSelect }: DurationQuestionProps) {
  const [selectedDuration, setSelectedDuration] = useState<string | undefined>(value);

  const durationOptions = [
    {
      key: 'half-day',
      label: 'Half-Day',
      description: 'Perfect for younger children or first-timers',
      timing: 'Mornings or afternoons',
      icon: Sunrise,
      color: 'from-orange-400 to-yellow-400',
    },
    {
      key: 'full-day',
      label: 'Full-Day',
      description: 'Complete daily programs with lunch',
      timing: '9am - 4pm typical',
      icon: Sun,
      color: 'from-blue-400 to-cyan-400',
    },
    {
      key: 'week',
      label: 'One Week',
      description: 'Dive deep into activities over 5 days',
      timing: 'Mon - Fri intensives',
      icon: Calendar,
      color: 'from-green-400 to-emerald-400',
    },
    {
      key: 'multi-week',
      label: 'Multi-Week',
      description: 'Extended programs for deeper learning',
      timing: '2+ weeks of fun',
      icon: CalendarDays,
      color: 'from-purple-400 to-pink-400',
    },
  ];

  const handleSelect = (key: string) => {
    setSelectedDuration(key);
    onChange(key as 'half-day' | 'full-day' | 'week' | 'multi-week');
    // Defer navigation to next tick to ensure state update completes
    setTimeout(() => {
      onSelect?.();
    }, 0);
  };

  return (
    <div className="space-y-10 pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {durationOptions.map((option) => {
          const isSelected = selectedDuration === option.key;
          const IconComponent = option.icon;

          return (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={option.key}
              onClick={() => handleSelect(option.key)}
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

              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-6 shadow-md`}>
                <IconComponent className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-1 text-left">
                <h3 className="text-xl font-black text-airbnb-grey-900 leading-tight">
                  {option.label}
                </h3>
                <p className="text-airbnb-grey-400 font-bold text-sm leading-relaxed">
                  {option.description}
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-airbnb-grey-100 text-[10px] font-black uppercase tracking-widest text-airbnb-grey-600">
                    {option.timing}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="p-6 bg-yellow-50 border-2 border-yellow-100 rounded-[2rem] flex items-start gap-4">
        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-xl flex-shrink-0">💡</div>
        <p className="text-sm text-yellow-800 font-bold leading-relaxed">
          Tip: Many camps offer both half-day and full-day options. Our AI will identify the best matches.
        </p>
      </div>
    </div>
  );
}
