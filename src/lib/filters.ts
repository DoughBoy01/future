/**
 * Filter utility functions for camp discovery
 */

import type { Camp } from '../types/camp';
import type { CampFilters, PriceRange, PRICE_RANGES } from '../types/filters';
import { PRICE_RANGES as RANGES } from '../types/filters';

/**
 * Check if a camp's price falls within a given price range
 */
export function matchesPriceRange(price: number, range: PriceRange): boolean {
  const { min, max } = RANGES[range];
  if (max === null) {
    return price >= min;
  }
  return price >= min && price < max;
}

/**
 * Filter camps based on selected filters
 */
export function filterCamps(camps: any[], filters: CampFilters): any[] {
  return camps.filter((camp) => {
    // Price range filter
    if (filters.priceRanges.length > 0) {
      const matchesAnyRange = filters.priceRanges.some((range) =>
        matchesPriceRange(camp.price, range)
      );
      if (!matchesAnyRange) return false;
    }

    // Quality tier filter
    if (filters.qualityTiers.length > 0 && camp.quality_tier) {
      if (!filters.qualityTiers.includes(camp.quality_tier)) return false;
    }

    // Program type filter
    if (filters.programTypes.length > 0 && camp.program_types) {
      const campTypes = Array.isArray(camp.program_types)
        ? camp.program_types
        : [];
      const hasMatchingType = filters.programTypes.some((type) =>
        campTypes.includes(type)
      );
      if (!hasMatchingType) return false;
    }

    // Dietary options filter
    if (filters.dietaryOptions.length > 0 && camp.dietary_options) {
      const campDietary = Array.isArray(camp.dietary_options)
        ? camp.dietary_options
        : [];
      const hasMatchingDietary = filters.dietaryOptions.some((option) =>
        campDietary.includes(option)
      );
      if (!hasMatchingDietary) return false;
    }

    // Language support filter
    if (filters.languageSupport.length > 0 && camp.language_support) {
      const campLanguages = Array.isArray(camp.language_support)
        ? camp.language_support
        : [];
      const hasMatchingLanguage = filters.languageSupport.some((lang) =>
        campLanguages.includes(lang)
      );
      if (!hasMatchingLanguage) return false;
    }

    // Duration filter
    if (filters.durations.length > 0) {
      const campDuration = calculateDuration(camp.start_date, camp.end_date);
      const matchesDuration = filters.durations.some((duration) =>
        matchesDurationFilter(campDuration, duration)
      );
      if (!matchesDuration) return false;
    }

    // Age filter
    if (filters.ageMin !== undefined && camp.age_max < filters.ageMin) {
      return false;
    }
    if (filters.ageMax !== undefined && camp.age_min > filters.ageMax) {
      return false;
    }

    // Search term filter
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        camp.name?.toLowerCase().includes(searchLower) ||
        camp.description?.toLowerCase().includes(searchLower) ||
        camp.location?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Categories filter (existing)
    if (filters.categories && filters.categories.length > 0) {
      const campCategories = camp.category_slugs || [];
      const hasMatchingCategory = filters.categories.some((cat) =>
        campCategories.includes(cat)
      );
      if (!hasMatchingCategory) return false;
    }

    // Locations filter (existing)
    if (filters.locations && filters.locations.length > 0) {
      if (!filters.locations.includes(camp.location)) return false;
    }

    return true;
  });
}

/**
 * Calculate duration in days between two dates
 */
function calculateDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check if a duration matches a duration filter
 */
function matchesDurationFilter(days: number, filter: string): boolean {
  switch (filter) {
    case 'weekend':
      return days >= 2 && days <= 3;
    case '1-week':
      return days >= 5 && days <= 7;
    case '2-weeks':
      return days >= 10 && days <= 14;
    case '3-weeks':
      return days >= 18 && days <= 21;
    case '4-plus-weeks':
      return days >= 28 && days < 42;
    case 'full-summer':
      return days >= 42;
    default:
      return true;
  }
}

/**
 * Get count of active filters
 */
export function getActiveFilterCount(filters: CampFilters): number {
  let count = 0;
  if (filters.priceRanges.length > 0) count++;
  if (filters.qualityTiers.length > 0) count++;
  if (filters.programTypes.length > 0) count++;
  if (filters.dietaryOptions.length > 0) count++;
  if (filters.languageSupport.length > 0) count++;
  if (filters.durations.length > 0) count++;
  if (filters.ageMin !== undefined || filters.ageMax !== undefined) count++;
  if (filters.searchTerm && filters.searchTerm.trim() !== '') count++;
  if (filters.categories && filters.categories.length > 0) count++;
  if (filters.locations && filters.locations.length > 0) count++;
  return count;
}

/**
 * Clear all filters
 */
export function clearAllFilters(): CampFilters {
  return {
    priceRanges: [],
    qualityTiers: [],
    programTypes: [],
    dietaryOptions: [],
    languageSupport: [],
    durations: [],
    categories: [],
    locations: [],
  };
}

/**
 * Format price range for display
 */
export function formatPriceRange(range: PriceRange): string {
  const { label } = RANGES[range];
  return label;
}
