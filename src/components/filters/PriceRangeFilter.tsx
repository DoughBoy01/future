import { PRICE_RANGES, type PriceRange } from '../../types/filters';
import { CheckboxFilter } from './CheckboxFilter';
import { DollarSign } from 'lucide-react';

interface PriceRangeFilterProps {
  selectedRanges: PriceRange[];
  onChange: (ranges: PriceRange[]) => void;
}

export function PriceRangeFilter({ selectedRanges, onChange }: PriceRangeFilterProps) {
  const handleToggle = (range: PriceRange, checked: boolean) => {
    if (checked) {
      onChange([...selectedRanges, range]);
    } else {
      onChange(selectedRanges.filter((r) => r !== range));
    }
  };

  const priceRangeOrder: PriceRange[] = [
    'under-500',
    '500-1000',
    '1000-2500',
    '2500-5000',
    '5000-plus'
  ];

  return (
    <div className="space-y-3">
      {priceRangeOrder.map((rangeKey) => {
        const range = PRICE_RANGES[rangeKey];
        return (
          <CheckboxFilter
            key={rangeKey}
            label={range.label}
            checked={selectedRanges.includes(rangeKey)}
            onChange={(checked) => handleToggle(rangeKey, checked)}
            icon={<DollarSign className="w-4 h-4" />}
          />
        );
      })}
    </div>
  );
}
