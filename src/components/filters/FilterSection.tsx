import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function FilterSection({
  title,
  children,
  defaultOpen = true,
  className = ''
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border-b border-airbnb-grey-200 pb-6 mb-6 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-4 hover:text-airbnb-pink-500 transition-colors"
      >
        <h3 className="text-base font-semibold text-airbnb-grey-900">{title}</h3>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-airbnb-grey-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-airbnb-grey-600" />
        )}
      </button>
      {isOpen && <div className="space-y-3">{children}</div>}
    </div>
  );
}
