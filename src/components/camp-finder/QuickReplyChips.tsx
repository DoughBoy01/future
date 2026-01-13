import { useState } from 'react';
import { Check } from 'lucide-react';

interface ChipOption {
  value: string | number;
  label: string;
}

interface QuickReplyChipsProps {
  options: ChipOption[];
  onSelect: (value: string | number) => void;
  selected?: string | number;
  autoSubmit?: boolean;
}

export function QuickReplyChips({
  options,
  onSelect,
  selected,
  autoSubmit = true,
}: QuickReplyChipsProps) {
  const [selectedValue, setSelectedValue] = useState<string | number | undefined>(selected);

  const handleSelect = (value: string | number) => {
    setSelectedValue(value);

    if (autoSubmit) {
      // Small delay for visual feedback
      setTimeout(() => {
        onSelect(value);
      }, 150);
    } else {
      onSelect(value);
    }
  };

  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
      role="radiogroup"
      style={{
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {options.map((option) => {
        const isSelected = selectedValue === option.value;

        return (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`
              flex-shrink-0 px-6 py-3 rounded-full
              font-medium text-sm
              border-2 transition-all duration-200
              whitespace-nowrap
              min-h-[44px] flex items-center gap-2
              ${
                isSelected
                  ? 'bg-[#fe4d39] border-[#fe4d39] text-white shadow-lg scale-105'
                  : 'bg-white border-[#DDDDDD] text-[#222222] hover:border-[#fe4d39] hover:bg-[#FFE8EA] active:scale-95'
              }
            `}
            role="radio"
            aria-checked={isSelected}
            aria-label={option.label}
          >
            <span>{option.label}</span>
            {isSelected && <Check className="w-4 h-4" />}
          </button>
        );
      })}
    </div>
  );
}
