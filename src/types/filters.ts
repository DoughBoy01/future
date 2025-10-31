/**
 * Enhanced filtering types for camp discovery
 */

export type PriceRange =
  | 'under-500'
  | '500-1000'
  | '1000-2500'
  | '2500-5000'
  | '5000-plus';

export type ProgramType =
  | 'academic'
  | 'leadership'
  | 'university-prep'
  | 'stem'
  | 'arts'
  | 'sports'
  | 'adventure'
  | 'language'
  | 'creative';

export type DietaryOption =
  | 'halal'
  | 'vegetarian'
  | 'vegan'
  | 'kosher'
  | 'gluten-free'
  | 'dairy-free'
  | 'nut-free'
  | 'allergy-friendly';

export type LanguageSupport =
  | 'english'
  | 'mandarin'
  | 'cantonese'
  | 'spanish'
  | 'french'
  | 'japanese'
  | 'korean'
  | 'arabic';

export type DurationFilter =
  | 'weekend'
  | '1-week'
  | '2-weeks'
  | '3-weeks'
  | '4-plus-weeks'
  | 'full-summer';

export interface CampFilters {
  priceRanges: PriceRange[];
  qualityTiers: string[];
  programTypes: ProgramType[];
  dietaryOptions: DietaryOption[];
  languageSupport: LanguageSupport[];
  durations: DurationFilter[];
  ageMin?: number;
  ageMax?: number;
  searchTerm?: string;
  categories?: string[];
  locations?: string[];
}

export const PRICE_RANGES: Record<PriceRange, { label: string; min: number; max: number | null }> = {
  'under-500': { label: 'Under $500', min: 0, max: 500 },
  '500-1000': { label: '$500 - $1,000', min: 500, max: 1000 },
  '1000-2500': { label: '$1,000 - $2,500', min: 1000, max: 2500 },
  '2500-5000': { label: '$2,500 - $5,000', min: 2500, max: 5000 },
  '5000-plus': { label: '$5,000+', min: 5000, max: null },
};

export const PROGRAM_TYPES: Record<ProgramType, { label: string; icon: string }> = {
  'academic': { label: 'Academic Excellence', icon: '📚' },
  'leadership': { label: 'Leadership Development', icon: '👑' },
  'university-prep': { label: 'University Preparation', icon: '🎓' },
  'stem': { label: 'STEM & Technology', icon: '🔬' },
  'arts': { label: 'Arts & Creativity', icon: '🎨' },
  'sports': { label: 'Sports & Athletics', icon: '⚽' },
  'adventure': { label: 'Outdoor Adventure', icon: '🏕️' },
  'language': { label: 'Language Immersion', icon: '🌍' },
  'creative': { label: 'Creative Writing', icon: '✍️' },
};

export const DIETARY_OPTIONS: Record<DietaryOption, { label: string; icon: string }> = {
  'halal': { label: 'Halal', icon: '☪️' },
  'vegetarian': { label: 'Vegetarian', icon: '🥗' },
  'vegan': { label: 'Vegan', icon: '🌱' },
  'kosher': { label: 'Kosher', icon: '✡️' },
  'gluten-free': { label: 'Gluten-Free', icon: '🌾' },
  'dairy-free': { label: 'Dairy-Free', icon: '🥛' },
  'nut-free': { label: 'Nut-Free', icon: '🥜' },
  'allergy-friendly': { label: 'Allergy-Friendly', icon: '🛡️' },
};

export const LANGUAGE_SUPPORT: Record<LanguageSupport, { label: string; flag: string }> = {
  'english': { label: 'English', flag: '🇬🇧' },
  'mandarin': { label: 'Mandarin', flag: '🇨🇳' },
  'cantonese': { label: 'Cantonese', flag: '🇭🇰' },
  'spanish': { label: 'Spanish', flag: '🇪🇸' },
  'french': { label: 'French', flag: '🇫🇷' },
  'japanese': { label: 'Japanese', flag: '🇯🇵' },
  'korean': { label: 'Korean', flag: '🇰🇷' },
  'arabic': { label: 'Arabic', flag: '🇸🇦' },
};

export const DURATION_FILTERS: Record<DurationFilter, { label: string; days: number[] }> = {
  'weekend': { label: 'Weekend (2-3 days)', days: [2, 3] },
  '1-week': { label: '1 Week (5-7 days)', days: [5, 6, 7] },
  '2-weeks': { label: '2 Weeks (10-14 days)', days: [10, 11, 12, 13, 14] },
  '3-weeks': { label: '3 Weeks (18-21 days)', days: [18, 19, 20, 21] },
  '4-plus-weeks': { label: '4+ Weeks', days: [] }, // 28+
  'full-summer': { label: 'Full Summer (6+ weeks)', days: [] }, // 42+
};

/**
 * SEA-specific country codes for review filtering
 */
export const SEA_COUNTRIES = {
  SG: { name: 'Singapore', flag: '🇸🇬' },
  HK: { name: 'Hong Kong', flag: '🇭🇰' },
  MY: { name: 'Malaysia', flag: '🇲🇾' },
  ID: { name: 'Indonesia', flag: '🇮🇩' },
  TH: { name: 'Thailand', flag: '🇹🇭' },
  PH: { name: 'Philippines', flag: '🇵🇭' },
  VN: { name: 'Vietnam', flag: '🇻🇳' },
  CN: { name: 'China', flag: '🇨🇳' },
  TW: { name: 'Taiwan', flag: '🇹🇼' },
  KR: { name: 'South Korea', flag: '🇰🇷' },
  JP: { name: 'Japan', flag: '🇯🇵' },
} as const;

export type SEACountryCode = keyof typeof SEA_COUNTRIES;
