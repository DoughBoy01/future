import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check, ShieldCheck } from 'lucide-react';

interface SpecialNeedsQuestionProps {
  name?: string;
  value?: {
    dietary?: string[];
    accessibility?: string[];
  };
  onChange: (needs: { dietary?: string[]; accessibility?: string[] }) => void;
}

export function SpecialNeedsQuestion({ name = 'your child', value, onChange }: SpecialNeedsQuestionProps) {
  const [dietary, setDietary] = useState<string[]>(value?.dietary || []);
  const [accessibility, setAccessibility] = useState<string[]>(value?.accessibility || []);
  const [noneSelected, setNoneSelected] = useState(
    (!value?.dietary || value.dietary.length === 0) &&
    (!value?.accessibility || value.accessibility.length === 0)
  );

  const [dietaryExpanded, setDietaryExpanded] = useState(false);
  const [accessibilityExpanded, setAccessibilityExpanded] = useState(false);

  const dietaryOptions = [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten-free', label: 'Gluten-Free' },
    { value: 'dairy-free', label: 'Dairy-Free' },
    { value: 'nut-allergies', label: 'Nut Allergies' },
    { value: 'halal', label: 'Halal' },
    { value: 'kosher', label: 'Kosher' },
  ];

  const accessibilityOptions = [
    { value: 'wheelchair', label: 'Wheelchair Access' },
    { value: 'sensory-friendly', label: 'Sensory-Friendly Environment' },
    { value: 'hearing-support', label: 'Hearing Support' },
    { value: 'visual-support', label: 'Visual Support' },
    { value: 'learning-support', label: 'Learning Support' },
  ];

  const toggleDietary = (value: string) => {
    let newDietary: string[];
    if (dietary.includes(value)) {
      newDietary = dietary.filter((item) => item !== value);
    } else {
      newDietary = [...dietary, value];
    }
    setDietary(newDietary);
    setNoneSelected(false);
    onChange({ dietary: newDietary, accessibility });
  };

  const toggleAccessibility = (value: string) => {
    let newAccessibility: string[];
    if (accessibility.includes(value)) {
      newAccessibility = accessibility.filter((item) => item !== value);
    } else {
      newAccessibility = [...accessibility, value];
    }
    setAccessibility(newAccessibility);
    setNoneSelected(false);
    onChange({ dietary, accessibility: newAccessibility });
  };

  const handleNoneClick = () => {
    setDietary([]);
    setAccessibility([]);
    setNoneSelected(true);
    setDietaryExpanded(false);
    setAccessibilityExpanded(false);
    onChange({ dietary: [], accessibility: [] });
  };

  return (
    <div className="space-y-4 md:space-y-6 pt-2">
      <div className="max-w-2xl space-y-3 md:space-y-4">
        {/* Dietary Restrictions */}
        <div className={`border-2 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white transition-all duration-200 border-b-[6px] md:border-b-[8px] active:border-b-2 ${dietaryExpanded ? 'border-orange-400 border-b-orange-500' : 'border-airbnb-grey-200 hover:bg-airbnb-grey-50'}`}>
          <button
            onClick={() => {
              setDietaryExpanded(!dietaryExpanded);
              if (noneSelected) setNoneSelected(false);
            }}
            className="w-full flex items-center justify-between p-5 md:p-8 focus:outline-none"
          >
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-orange-100 flex items-center justify-center text-2xl md:text-3xl">🥗</div>
              <div className="text-left">
                <h3 className="text-lg md:text-xl font-black text-airbnb-grey-900 uppercase tracking-tight">Dietary</h3>
                <p className="text-xs md:text-sm font-bold text-airbnb-grey-400">
                  {dietary.length > 0 ? `${dietary.length} selected` : 'Allergies, diets, etc.'}
                </p>
              </div>
            </div>
            {dietaryExpanded ? <ChevronUp className="w-6 h-6 md:w-8 md:h-8 text-airbnb-grey-400" /> : <ChevronDown className="w-6 h-6 md:w-8 md:h-8 text-airbnb-grey-400" />}
          </button>

          <AnimatePresence>
            {dietaryExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-5 pb-5 md:px-8 md:pb-8 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 pt-3 md:pt-4 border-t-2 border-orange-50">
                  {dietaryOptions.map((option) => {
                    const isSelected = dietary.includes(option.value);
                    return (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleDietary(option.value)}
                        className={`
                          flex items-center gap-4 p-4 rounded-[1.25rem] border-2 border-b-[4px] transition-all
                          ${isSelected ? 'bg-orange-50 border-orange-300 border-b-orange-400' : 'bg-white border-airbnb-grey-100 hover:bg-airbnb-grey-50'}
                        `}
                      >
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-airbnb-grey-300'}`}>
                          {isSelected && <Check className="w-4 h-4 text-white stroke-[4px]" />}
                        </div>
                        <span className="font-black text-airbnb-grey-800 text-sm uppercase tracking-tight">{option.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accessibility Needs */}
        <div className={`border-2 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white transition-all duration-200 border-b-[6px] md:border-b-[8px] active:border-b-2 ${accessibilityExpanded ? 'border-blue-400 border-b-blue-500' : 'border-airbnb-grey-200 hover:bg-airbnb-grey-50'}`}>
          <button
            onClick={() => {
              setAccessibilityExpanded(!accessibilityExpanded);
              if (noneSelected) setNoneSelected(false);
            }}
            className="w-full flex items-center justify-between p-5 md:p-8 focus:outline-none"
          >
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-blue-100 flex items-center justify-center text-2xl md:text-3xl">♿</div>
              <div className="text-left">
                <h3 className="text-lg md:text-xl font-black text-airbnb-grey-900 uppercase tracking-tight">Accessibility</h3>
                <p className="text-xs md:text-sm font-bold text-airbnb-grey-400">
                  {accessibility.length > 0 ? `${accessibility.length} selected` : 'Support, access, etc.'}
                </p>
              </div>
            </div>
            {accessibilityExpanded ? <ChevronUp className="w-6 h-6 md:w-8 md:h-8 text-airbnb-grey-400" /> : <ChevronDown className="w-6 h-6 md:w-8 md:h-8 text-airbnb-grey-400" />}
          </button>

          <AnimatePresence>
            {accessibilityExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-5 pb-5 md:px-8 md:pb-8 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 pt-3 md:pt-4 border-t-2 border-blue-50">
                  {accessibilityOptions.map((option) => {
                    const isSelected = accessibility.includes(option.value);
                    return (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleAccessibility(option.value)}
                        className={`
                          flex items-center gap-4 p-4 rounded-[1.25rem] border-2 border-b-[4px] transition-all
                          ${isSelected ? 'bg-blue-50 border-blue-300 border-b-blue-400' : 'bg-white border-airbnb-grey-100 hover:bg-airbnb-grey-50'}
                        `}
                      >
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-airbnb-grey-300'}`}>
                          {isSelected && <Check className="w-4 h-4 text-white stroke-[4px]" />}
                        </div>
                        <span className="font-black text-airbnb-grey-800 text-sm uppercase tracking-tight">{option.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* None of the Above */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNoneClick}
          className={`
            w-full flex items-center justify-between
            p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem]
            border-2 transition-all duration-100 border-b-[6px] md:border-b-[8px] active:border-b-2
            ${noneSelected
              ? 'bg-green-50 border-green-500 border-b-green-600'
              : 'bg-white border-airbnb-grey-200 hover:bg-airbnb-grey-50'
            }
          `}
        >
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-green-100 flex items-center justify-center text-2xl md:text-3xl">✅</div>
            <span className="text-lg md:text-xl font-black text-airbnb-grey-900 uppercase tracking-tight">
              None of the above
            </span>
          </div>
          <AnimatePresence>
            {noneSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="w-10 h-10 rounded-full bg-green-500 border-4 border-white flex items-center justify-center shadow-lg"
              >
                <Check className="w-6 h-6 text-white stroke-[4px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="p-4 md:p-6 bg-purple-50 border-2 border-purple-100 rounded-2xl md:rounded-[2rem] flex items-start gap-3 md:gap-4">
        <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-purple-400 flex-shrink-0" />
        <p className="text-xs md:text-sm text-purple-800 font-bold leading-snug md:leading-relaxed">
          <span className="hidden sm:inline">Privacy: Your information is secure. Our AI only uses this data to find the most inclusive environments for {name}.</span>
          <span className="sm:hidden">Your information is secure and private.</span>
        </p>
      </div>
    </div>
  );
}
