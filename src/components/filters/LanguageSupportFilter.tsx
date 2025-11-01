import { LANGUAGE_SUPPORT, type LanguageSupport } from '../../types/filters';
import { CheckboxFilter } from './CheckboxFilter';

interface LanguageSupportFilterProps {
  selectedLanguages: LanguageSupport[];
  onChange: (languages: LanguageSupport[]) => void;
}

export function LanguageSupportFilter({ selectedLanguages, onChange }: LanguageSupportFilterProps) {
  const handleToggle = (language: LanguageSupport, checked: boolean) => {
    if (checked) {
      onChange([...selectedLanguages, language]);
    } else {
      onChange(selectedLanguages.filter((l) => l !== language));
    }
  };

  return (
    <div className="space-y-3">
      {Object.entries(LANGUAGE_SUPPORT).map(([key, config]) => (
        <CheckboxFilter
          key={key}
          label={config.label}
          checked={selectedLanguages.includes(key as LanguageSupport)}
          onChange={(checked) => handleToggle(key as LanguageSupport, checked)}
          icon={<span className="text-base">{config.flag}</span>}
        />
      ))}
    </div>
  );
}
