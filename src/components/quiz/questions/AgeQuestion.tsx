import { useState } from 'react';
import { motion } from 'framer-motion';

interface AgeQuestionProps {
  name?: string;
  value?: number;
  onChange: (age: number) => void;
  onSelect?: () => void;
}

export function AgeQuestion({ name = 'your child', value, onChange, onSelect }: AgeQuestionProps) {
  const [selectedAge, setSelectedAge] = useState<number | undefined>(value);

  const ages = Array.from({ length: 15 }, (_, i) => i + 4); // Ages 4 to 18

  const handleAgeClick = (age: number) => {
    setSelectedAge(age);
    onChange(age);
    // Call onSelect immediately - visual feedback from button animation is sufficient
    onSelect?.();
  };
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 max-w-2xl">
        {ages.map((age) => {
          const isSelected = selectedAge === age;
          return (
            <motion.button
              key={age}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAgeClick(age)}
              className={`
                flex items-center justify-center
                h-16 rounded-2xl font-black text-xl
                transition-all duration-100
                ${isSelected
                  ? 'bg-airbnb-pink-50 text-airbnb-pink-600 border-2 border-airbnb-pink-500 border-b-[6px] active:border-b-2'
                  : 'bg-white text-airbnb-grey-700 border-2 border-airbnb-grey-200 border-b-[6px] hover:bg-airbnb-grey-50 active:border-b-2'
                }
              `}
            >
              {age}
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-airbnb-grey-400 font-bold text-sm uppercase tracking-widest pt-4">
        <div className="w-10 h-10 bg-airbnb-grey-50 rounded-full flex items-center justify-center border border-airbnb-grey-100 italic font-serif">
          i
        </div>
        Ages 4 to 18 supported
      </div>
    </div>
  );
}
