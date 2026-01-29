/**
 * Skeleton loading component for CampCard
 * Displays a placeholder while camp data is loading
 * Mirrors the structure and dimensions of CampCard component
 */

export function CampCardSkeleton() {
  return (
    <div
      className="bg-white rounded-lg shadow-airbnb-md hover:shadow-airbnb-lg transition-airbnb overflow-hidden flex flex-col w-full min-w-[280px] sm:min-w-[320px] lg:min-w-[340px] animate-pulse"
      role="status"
      aria-label="Loading camp..."
    >
      {/* Image skeleton - matches CampCard image section height */}
      <div className="relative h-48 sm:h-52 bg-gradient-to-r from-airbnb-grey-200 via-airbnb-grey-300 to-airbnb-grey-200 overflow-hidden rounded-t-lg">
        {/* Shimmer effect overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          style={{
            animation: 'shimmer 2s infinite',
            backgroundSize: '200% 100%'
          }}
        />

        {/* Top badge skeleton */}
        <div className="absolute top-3 left-3 bg-airbnb-grey-300 h-6 w-16 rounded-full" />

        {/* Action buttons skeleton */}
        <div className="absolute top-3 right-3 flex gap-2">
          <div className="bg-white/90 p-1.5 rounded-full w-8 h-8" />
          <div className="bg-white/90 p-1.5 rounded-full w-8 h-8" />
        </div>

        {/* Category and age pills skeleton */}
        <div className="absolute bottom-14 left-3 flex flex-col gap-1">
          <div className="bg-white/90 h-5 w-20 rounded-full" />
          <div className="bg-white/90 h-5 w-16 rounded-full" />
        </div>

        {/* Date badge skeleton */}
        <div className="absolute bottom-3 left-3 bg-airbnb-grey-300 h-7 w-40 rounded-full" />
      </div>

      {/* Content section - matches CampCard padding */}
      <div className="p-5 sm:p-6 flex flex-col flex-grow">
        {/* Title skeleton - 2 lines */}
        <div className="mb-2 space-y-2">
          <div className="h-5 bg-airbnb-grey-200 rounded w-full" />
          <div className="h-5 bg-airbnb-grey-200 rounded w-3/4" />
        </div>

        {/* Description skeleton - 2 lines */}
        <div className="mb-3 space-y-2">
          <div className="h-3 bg-airbnb-grey-200 rounded w-full" />
          <div className="h-3 bg-airbnb-grey-200 rounded w-5/6" />
        </div>

        {/* Rating badge skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-20 bg-airbnb-grey-200 rounded-full" />
        </div>

        {/* Location skeleton */}
        <div className="mb-4">
          <div className="h-3 bg-airbnb-grey-200 rounded w-32" />
        </div>

        {/* Spacer to push footer to bottom */}
        <div className="flex-grow"></div>

        {/* Footer with price and button skeleton */}
        <div className="flex items-end justify-between gap-3 mt-auto pt-3 border-t border-airbnb-grey-100">
          <div className="flex flex-col gap-1">
            <div className="h-6 bg-airbnb-grey-200 rounded w-20" />
            <div className="h-3 bg-airbnb-grey-200 rounded w-16" />
          </div>
          <div className="h-9 w-20 bg-airbnb-grey-200 rounded-md" />
        </div>
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading camp information...</span>
    </div>
  );
}

/**
 * Custom shimmer animation keyframes
 * Add this to your tailwind.config.js if not already present:
 *
 * keyframes: {
 *   shimmer: {
 *     '0%': { backgroundPosition: '-200% 0' },
 *     '100%': { backgroundPosition: '200% 0' }
 *   }
 * },
 * animation: {
 *   shimmer: 'shimmer 2s infinite'
 * }
 */
