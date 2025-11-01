import { DIETARY_OPTIONS, type DietaryOption } from '../../types/filters';
import { CheckboxFilter } from './CheckboxFilter';
import { Leaf, Apple } from 'lucide-react';

interface DietaryOptionsFilterProps {
  selectedOptions: DietaryOption[];
  onChange: (options: DietaryOption[]) => void;
}

export function DietaryOptionsFilter({ selectedOptions, onChange }: DietaryOptionsFilterProps) {
  const handleToggle = (option: DietaryOption, checked: boolean) => {
    if (checked) {
      onChange([...selectedOptions, option]);
    } else {
      onChange(selectedOptions.filter((o) => o !== option));
    }
  };

  return (
    <div className="space-y-3">
      {Object.entries(DIETARY_OPTIONS).map(([key, config]) => (
        <CheckboxFilter
          key={key}
          label={config.label}
          checked={selectedOptions.includes(key as DietaryOption)}
          onChange={(checked) => handleToggle(key as DietaryOption, checked)}
          icon={config.important ? <Apple className="w-4 h-4" /> : <Leaf className="w-4 h-4" />}
        />
      ))}
    </div>
  );
}
