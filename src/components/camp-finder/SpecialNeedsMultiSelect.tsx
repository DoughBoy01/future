import { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { COMMON_DIETARY_NEEDS, COMMON_ACCESSIBILITY_NEEDS, type SpecialNeeds } from './types';

interface SpecialNeedsMultiSelectProps {
  value: SpecialNeeds;
  onChange: (needs: SpecialNeeds) => void;
}

export function SpecialNeedsMultiSelect({
  value,
  onChange,
}: SpecialNeedsMultiSelectProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [customCategory, setCustomCategory] = useState<'dietary' | 'accessibility'>('dietary');

  const handleToggle = (need: string, category: 'dietary' | 'accessibility') => {
    const currentList = value[category] || [];
    let newList: string[];

    if (currentList.includes(need)) {
      newList = currentList.filter((item) => item !== need);
    } else {
      newList = [...currentList, need];
    }

    onChange({
      ...value,
      [category]: newList.length > 0 ? newList : undefined,
    });
  };

  const handleAddCustom = () => {
    if (customValue.trim()) {
      const currentList = value[customCategory] || [];
      onChange({
        ...value,
        [customCategory]: [...currentList, customValue.trim()],
      });
      setCustomValue('');
      setShowCustomInput(false);
    }
  };

  const handleSkip = () => {
    onChange({ dietary: undefined, accessibility: undefined });
  };

  const hasSelections = (value.dietary?.length || 0) + (value.accessibility?.length || 0) > 0;

  return (
    <div className="space-y-6">
      {/* Dietary Needs */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-[#222222]">Dietary Requirements</h4>
        <div className="flex flex-wrap gap-2">
          {COMMON_DIETARY_NEEDS.map((need) => {
            const isSelected = value.dietary?.includes(need) || false;

            return (
              <button
                key={need}
                onClick={() => handleToggle(need, 'dietary')}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium
                  border-2 transition-all duration-200
                  flex items-center gap-2
                  ${
                    isSelected
                      ? 'bg-[#dcfce7] border-[#58cc02] text-[#166534]'
                      : 'bg-white border-[#DDDDDD] text-[#222222] hover:border-[#fe4d39] hover:bg-[#FFE8EA]'
                  }
                `}
                aria-pressed={isSelected}
              >
                <span>{need}</span>
                {isSelected && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accessibility Needs */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-[#222222]">Accessibility Support</h4>
        <div className="flex flex-wrap gap-2">
          {COMMON_ACCESSIBILITY_NEEDS.map((need) => {
            const isSelected = value.accessibility?.includes(need) || false;

            return (
              <button
                key={need}
                onClick={() => handleToggle(need, 'accessibility')}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium
                  border-2 transition-all duration-200
                  flex items-center gap-2
                  ${
                    isSelected
                      ? 'bg-[#dcfce7] border-[#58cc02] text-[#166534]'
                      : 'bg-white border-[#DDDDDD] text-[#222222] hover:border-[#fe4d39] hover:bg-[#FFE8EA]'
                  }
                `}
                aria-pressed={isSelected}
              >
                <span>{need}</span>
                {isSelected && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Custom */}
      {!showCustomInput ? (
        <button
          onClick={() => setShowCustomInput(true)}
          className="text-sm text-[#fe4d39] hover:text-[#b13527] font-medium flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          <span>Add other requirement</span>
        </button>
      ) : (
        <div className="flex gap-2 items-start">
          <select
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value as 'dietary' | 'accessibility')}
            className="px-3 py-2 rounded-lg border-2 border-[#DDDDDD] text-sm focus:outline-none focus:border-[#fe4d39]"
          >
            <option value="dietary">Dietary</option>
            <option value="accessibility">Accessibility</option>
          </select>
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
            placeholder="Enter requirement"
            className="flex-1 px-4 py-2 rounded-lg border-2 border-[#DDDDDD] text-sm focus:outline-none focus:border-[#fe4d39]"
            autoFocus
          />
          <button
            onClick={handleAddCustom}
            disabled={!customValue.trim()}
            className="px-4 py-2 bg-[#fe4d39] text-white rounded-lg text-sm font-medium hover:bg-[#b13527] disabled:bg-[#DDDDDD] disabled:cursor-not-allowed"
          >
            Add
          </button>
          <button
            onClick={() => {
              setShowCustomInput(false);
              setCustomValue('');
            }}
            className="p-2 text-[#717171] hover:text-[#222222]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Selected count */}
      {hasSelections && (
        <div className="text-sm text-[#717171]">
          {(value.dietary?.length || 0) + (value.accessibility?.length || 0)} requirement(s)
          selected
        </div>
      )}

      {/* Skip button */}
      {!hasSelections && (
        <button
          onClick={handleSkip}
          className="text-sm text-[#717171] hover:text-[#222222] font-medium"
        >
          No special requirements → Skip
        </button>
      )}
    </div>
  );
}
