import { useState } from 'react';
import { CampFiltersPanel } from '../components/filters/CampFiltersPanel';
import { MobileFilterDrawer } from '../components/filters/MobileFilterDrawer';
import { MobileFilterButton } from '../components/filters/MobileFilterButton';
import { CampCard } from '../components/home/CampCard';
import { SlidersHorizontal } from 'lucide-react';
import { filterCamps, clearAllFilters, getActiveFilterCount } from '../lib/filters';
import { MOCK_CAMPS } from '../data/mockCampData';
import type { CampFilters } from '../types/filters';

/**
 * Demo page showcasing the new filtering system
 *
 * This page demonstrates how the filters will work once connected to the database.
 * Currently uses mock data from mockCampData.ts
 *
 * When ready to connect to database:
 * 1. Replace MOCK_CAMPS with actual Supabase query
 * 2. Update filterCamps() in lib/filters.ts to work with database fields
 * 3. Add filter parameters to Supabase query for server-side filtering (optional optimization)
 */

export function FilterDemoPage() {
  const [filters, setFilters] = useState<CampFilters>(clearAllFilters());
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter camps using the mock data
  const filteredCamps = filterCamps(MOCK_CAMPS as any[], filters);
  const activeFilterCount = getActiveFilterCount(filters);

  return (
    <div className="min-h-screen bg-airbnb-grey-100">
      {/* Header */}
      <div className="bg-white border-b border-airbnb-grey-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-airbnb-grey-900">Premium Camp Discovery</h1>
              <p className="text-airbnb-grey-600 mt-1">
                {filteredCamps.length} camps found
                {activeFilterCount > 0 && ` · ${activeFilterCount} filters active`}
              </p>
            </div>
            <MobileFilterButton
              onClick={() => setShowMobileFilters(true)}
              activeCount={activeFilterCount}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <CampFiltersPanel
              filters={filters}
              onChange={setFilters}
            />
          </div>

          {/* Camp Grid */}
          <div className="lg:col-span-3">
            {filteredCamps.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <SlidersHorizontal className="w-12 h-12 text-airbnb-grey-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-airbnb-grey-900 mb-2">No camps match your filters</h3>
                <p className="text-airbnb-grey-600 mb-6">
                  Try adjusting your filters to see more results
                </p>
                <button
                  onClick={() => setFilters(clearAllFilters())}
                  className="px-6 py-3 bg-airbnb-pink-600 text-white rounded-lg font-semibold hover:bg-airbnb-pink-600 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCamps.map((camp) => (
                  <CampCard
                    key={camp.id}
                    id={camp.id}
                    image={camp.image}
                    location={camp.location}
                    rating={camp.rating}
                    reviewCount={camp.reviewCount}
                    title={camp.name}
                    category={camp.category}
                    ageRange={`${camp.ageMin}-${camp.ageMax} years`}
                    ageMin={camp.ageMin}
                    ageMax={camp.ageMax}
                    price={camp.price}
                    verificationLevel={camp.verificationLevel}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <MobileFilterDrawer
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
      >
        <CampFiltersPanel
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowMobileFilters(false)}
          isMobile={true}
        />
      </MobileFilterDrawer>

      {/* Demo Notice */}
      <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
        <p className="text-sm font-semibold mb-1">Demo Page</p>
        <p className="text-xs opacity-90">
          Using mock data. Ready to connect to database when available.
        </p>
      </div>
    </div>
  );
}
