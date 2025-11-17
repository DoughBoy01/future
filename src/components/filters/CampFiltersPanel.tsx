import { X, SlidersHorizontal } from 'lucide-react';
import { FilterSection } from './FilterSection';
import { PriceRangeFilter } from './PriceRangeFilter';
import { QualityTierFilter } from './QualityTierFilter';
import { ProgramTypeFilter } from './ProgramTypeFilter';
import { DietaryOptionsFilter } from './DietaryOptionsFilter';
import { LanguageSupportFilter } from './LanguageSupportFilter';
import { getActiveFilterCount, clearAllFilters } from '../../lib/filters';
import type { CampFilters } from '../../types/filters';

interface CampFiltersPanelProps {
  filters: CampFilters;
  onChange: (filters: CampFilters) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export function CampFiltersPanel({
  filters,
  onChange,
  onClose,
  isMobile = false
}: CampFiltersPanelProps) {
  const activeCount = getActiveFilterCount(filters);

  const handleClearAll = () => {
    onChange(clearAllFilters());
  };

  const content = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-airbnb-grey-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-airbnb-grey-600" />
          <h2 className="text-xl font-bold text-airbnb-grey-900">Filters</h2>
          {activeCount > 0 && (
            <span className="bg-airbnb-pink-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-airbnb-grey-100 rounded-full transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5 text-airbnb-grey-600" />
          </button>
        )}
      </div>

      {/* Filters Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Price Range */}
        <FilterSection title="Price Range" defaultOpen={true}>
          <PriceRangeFilter
            selectedRanges={filters.priceRanges}
            onChange={(priceRanges) => onChange({ ...filters, priceRanges })}
          />
        </FilterSection>

        {/* Quality Tier */}
        <FilterSection title="Organizer Quality" defaultOpen={true}>
          <QualityTierFilter
            selectedTiers={filters.qualityTiers}
            onChange={(qualityTiers) => onChange({ ...filters, qualityTiers })}
          />
        </FilterSection>

        {/* Program Type */}
        <FilterSection title="Program Type" defaultOpen={false}>
          <ProgramTypeFilter
            selectedTypes={filters.programTypes}
            onChange={(programTypes) => onChange({ ...filters, programTypes })}
          />
        </FilterSection>

        {/* Dietary Options */}
        <FilterSection title="Dietary Requirements" defaultOpen={false}>
          <DietaryOptionsFilter
            selectedOptions={filters.dietaryOptions}
            onChange={(dietaryOptions) => onChange({ ...filters, dietaryOptions })}
          />
        </FilterSection>

        {/* Language Support */}
        <FilterSection title="Language Support" defaultOpen={false}>
          <LanguageSupportFilter
            selectedLanguages={filters.languageSupport}
            onChange={(languageSupport) => onChange({ ...filters, languageSupport })}
          />
        </FilterSection>
      </div>

      {/* Footer with Clear All */}
      {activeCount > 0 && (
        <div className="p-6 border-t border-airbnb-grey-200">
          <button
            onClick={handleClearAll}
            className="w-full px-4 py-3 border-2 border-airbnb-grey-900 text-airbnb-grey-900 rounded-lg font-semibold hover:bg-airbnb-grey-900 hover:text-white transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    // When mobile, render just the content - the MobileFilterDrawer wrapper handles positioning
    return <>{content}</>;
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-airbnb-grey-200 overflow-hidden h-fit sticky top-24">
      {content}
    </div>
  );
}
