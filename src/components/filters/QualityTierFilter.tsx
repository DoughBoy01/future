import { CheckboxFilter } from './CheckboxFilter';
import { Shield, Award, Crown } from 'lucide-react';
import type { QualityTier } from '../../types/verification';

interface QualityTierFilterProps {
  selectedTiers: string[];
  onChange: (tiers: string[]) => void;
}

export function QualityTierFilter({ selectedTiers, onChange }: QualityTierFilterProps) {
  const handleToggle = (tier: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedTiers, tier]);
    } else {
      onChange(selectedTiers.filter((t) => t !== tier));
    }
  };

  const tiers: Array<{ key: QualityTier; label: string; icon: typeof Shield }> = [
    { key: 'elite', label: 'Elite Partners', icon: Crown },
    { key: 'premium', label: 'Premium Verified', icon: Award },
    { key: 'verified', label: 'Verified', icon: Shield },
  ];

  return (
    <div className="space-y-3">
      {tiers.map(({ key, label, icon: Icon }) => (
        <CheckboxFilter
          key={key}
          label={label}
          checked={selectedTiers.includes(key)}
          onChange={(checked) => handleToggle(key, checked)}
          icon={<Icon className="w-4 h-4" />}
        />
      ))}
    </div>
  );
}
