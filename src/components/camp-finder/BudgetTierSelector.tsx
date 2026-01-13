import { useState } from 'react';
import { Check } from 'lucide-react';
import { BUDGET_TIERS, type BudgetTier } from './types';

interface BudgetTierSelectorProps {
  selected?: BudgetTier;
  onSelect: (tier: BudgetTier) => void;
  autoSubmit?: boolean;
}

export function BudgetTierSelector({
  selected,
  onSelect,
  autoSubmit = true,
}: BudgetTierSelectorProps) {
  const [selectedTier, setSelectedTier] = useState<BudgetTier | undefined>(selected);

  const handleSelect = (tier: BudgetTier) => {
    setSelectedTier(tier);

    if (autoSubmit) {
      // Small delay for visual feedback
      setTimeout(() => {
        onSelect(tier);
      }, 150);
    } else {
      onSelect(tier);
    }
  };

  const tiers: BudgetTier[] = [
    'BUDGET_FRIENDLY',
    'MID_RANGE',
    'PREMIUM',
    'LUXURY',
    'FLEXIBLE',
  ];

  return (
    <div className="space-y-3" role="radiogroup" aria-label="Select budget tier">
      {tiers.map((tier) => {
        const config = BUDGET_TIERS[tier];
        const isSelected = selectedTier === tier;

        return (
          <button
            key={tier}
            onClick={() => handleSelect(tier)}
            className={`
              w-full text-left rounded-2xl
              border-2 border-b-4 transition-all duration-200
              p-5
              ${
                isSelected
                  ? 'bg-[#FFE8EA] border-[#fe4d39] shadow-lg scale-[1.02] border-b-[#b13527]'
                  : 'bg-white border-[#DDDDDD] hover:border-[#fe4d39] hover:shadow-md active:scale-95 border-b-[#DDDDDD]'
              }
            `}
            role="radio"
            aria-checked={isSelected}
            aria-label={`${config.label}: ${config.description}`}
          >
            <div className="flex items-start gap-4">
              {/* Emoji Icon */}
              <div className="text-5xl flex-shrink-0">{config.emoji}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Tier Label */}
                <h3 className="text-2xl font-bold text-[#222222] mb-1">
                  {config.label}
                </h3>

                {/* Display Range (NO $ amounts) */}
                <p className="text-xs font-bold text-[#fe4d39] uppercase tracking-wider mb-2">
                  {config.displayRange}
                </p>

                {/* Description */}
                <p className="text-sm text-[#717171] leading-relaxed">
                  {config.description}
                </p>
              </div>

              {/* Check Icon */}
              {isSelected && (
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-[#fe4d39] rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          </button>
        );
      })}

      {/* Helper text */}
      <p className="text-xs text-center text-[#717171] px-4 py-2">
        Pricing details will be shown on individual camp pages
      </p>
    </div>
  );
}
