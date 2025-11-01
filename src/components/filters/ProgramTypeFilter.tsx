import { PROGRAM_TYPES, type ProgramType } from '../../types/filters';
import { CheckboxFilter } from './CheckboxFilter';
import { GraduationCap, Rocket, BookOpen, Atom, Palette, Trophy, Mountain, Languages, Lightbulb } from 'lucide-react';

interface ProgramTypeFilterProps {
  selectedTypes: ProgramType[];
  onChange: (types: ProgramType[]) => void;
}

const PROGRAM_ICONS: Record<ProgramType, typeof GraduationCap> = {
  academic: GraduationCap,
  leadership: Rocket,
  'university-prep': BookOpen,
  stem: Atom,
  arts: Palette,
  sports: Trophy,
  adventure: Mountain,
  language: Languages,
  creative: Lightbulb,
};

export function ProgramTypeFilter({ selectedTypes, onChange }: ProgramTypeFilterProps) {
  const handleToggle = (type: ProgramType, checked: boolean) => {
    if (checked) {
      onChange([...selectedTypes, type]);
    } else {
      onChange(selectedTypes.filter((t) => t !== type));
    }
  };

  return (
    <div className="space-y-3">
      {Object.entries(PROGRAM_TYPES).map(([key, config]) => {
        const Icon = PROGRAM_ICONS[key as ProgramType];
        return (
          <CheckboxFilter
            key={key}
            label={config.label}
            checked={selectedTypes.includes(key as ProgramType)}
            onChange={(checked) => handleToggle(key as ProgramType, checked)}
            icon={<Icon className="w-4 h-4" />}
          />
        );
      })}
    </div>
  );
}
