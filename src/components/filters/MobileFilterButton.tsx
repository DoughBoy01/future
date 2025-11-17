import { Filter } from 'lucide-react';

interface MobileFilterButtonProps {
  onClick: () => void;
  activeCount?: number;
}

/**
 * Mobile filter button with funnel icon
 *
 * Features:
 * - Funnel (Filter) icon for mobile devices
 * - Active filter count badge
 * - Touch-friendly size and spacing
 * - Responsive (hidden on desktop lg+)
 */
export function MobileFilterButton({ onClick, activeCount = 0 }: MobileFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden flex items-center gap-2 px-4 py-2 border-2 border-airbnb-grey-900 rounded-lg font-semibold hover:bg-airbnb-grey-900 hover:text-white transition-colors"
      aria-label="Open filters"
    >
      <Filter className="w-5 h-5" />
      Filters
      {activeCount > 0 && (
        <span className="bg-airbnb-pink-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
          {activeCount}
        </span>
      )}
    </button>
  );
}
