import { Check } from 'lucide-react';

interface CheckboxFilterProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  count?: number;
  icon?: React.ReactNode;
}

export function CheckboxFilter({
  label,
  checked,
  onChange,
  count,
  icon
}: CheckboxFilterProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-5 h-5 border-2 border-airbnb-grey-400 rounded peer-checked:border-airbnb-pink-600 peer-checked:bg-airbnb-pink-600 transition-all peer-focus:ring-2 peer-focus:ring-airbnb-pink-200 flex items-center justify-center">
          {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-1">
        {icon && <span className="text-airbnb-grey-600">{icon}</span>}
        <span className="text-sm text-airbnb-grey-900 group-hover:text-airbnb-pink-600 transition-colors">
          {label}
        </span>
      </div>
      {count !== undefined && (
        <span className="text-xs text-airbnb-grey-500">({count})</span>
      )}
    </label>
  );
}
