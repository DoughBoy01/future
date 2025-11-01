import type { VerificationLevel, QualityTier } from '../types/verification';

/**
 * Mock camp data with verification and quality tier information
 * This data simulates what will eventually come from the database
 *
 * When database is ready:
 * 1. Add verification_level and quality_tier columns to organisations table
 * 2. Add dietary_options, language_support, program_types columns to camps table
 * 3. Replace this mock data with actual database queries
 */

export interface MockCamp {
  id: string;
  name: string;
  category: string;
  location: string;
  price: number;
  ageMin: number;
  ageMax: number;
  rating: number;
  reviewCount: number;
  image: string;
  verificationLevel?: VerificationLevel;
  qualityTier?: QualityTier;
  dietaryOptions?: string[];
  languageSupport?: string[];
  programType?: string;
}

export const MOCK_CAMPS: MockCamp[] = [
  {
    id: '1',
    name: 'Elite Leadership Academy - Singapore',
    category: 'Leadership',
    location: 'Singapore',
    price: 5500,
    ageMin: 14,
    ageMax: 18,
    rating: 4.9,
    reviewCount: 127,
    image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
    verificationLevel: 'elite',
    qualityTier: 'elite',
    dietaryOptions: ['halal', 'vegetarian', 'vegan'],
    languageSupport: ['english', 'mandarin', 'cantonese'],
    programType: 'leadership',
  },
  {
    id: '2',
    name: 'Cambridge University Prep Program',
    category: 'Academic',
    location: 'Cambridge, UK',
    price: 8500,
    ageMin: 15,
    ageMax: 18,
    rating: 4.8,
    reviewCount: 89,
    image: 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg',
    verificationLevel: 'premium',
    qualityTier: 'premium',
    dietaryOptions: ['halal', 'kosher', 'vegetarian', 'vegan', 'gluten-free'],
    languageSupport: ['english', 'mandarin', 'spanish'],
    programType: 'university-prep',
  },
  {
    id: '3',
    name: 'MIT Robotics & AI Summer Camp',
    category: 'STEM',
    location: 'Boston, USA',
    price: 6200,
    ageMin: 13,
    ageMax: 17,
    rating: 4.9,
    reviewCount: 245,
    image: 'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg',
    verificationLevel: 'elite',
    qualityTier: 'elite',
    dietaryOptions: ['halal', 'vegetarian', 'vegan', 'kosher', 'gluten-free'],
    languageSupport: ['english', 'mandarin'],
    programType: 'stem',
  },
  {
    id: '4',
    name: 'Hong Kong Arts & Design Workshop',
    category: 'Arts',
    location: 'Hong Kong',
    price: 3200,
    ageMin: 12,
    ageMax: 16,
    rating: 4.7,
    reviewCount: 56,
    image: 'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg',
    verificationLevel: 'verified',
    qualityTier: 'verified',
    dietaryOptions: ['vegetarian', 'vegan'],
    languageSupport: ['english', 'cantonese', 'mandarin'],
    programType: 'arts',
  },
  {
    id: '5',
    name: 'Tokyo Language & Culture Immersion',
    category: 'Language',
    location: 'Tokyo, Japan',
    price: 4800,
    ageMin: 14,
    ageMax: 18,
    rating: 4.8,
    reviewCount: 134,
    image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg',
    verificationLevel: 'premium',
    qualityTier: 'premium',
    dietaryOptions: ['halal', 'vegetarian', 'allergy-friendly'],
    languageSupport: ['english', 'japanese', 'mandarin'],
    programType: 'language',
  },
  {
    id: '6',
    name: 'Barcelona Football Academy',
    category: 'Sports',
    location: 'Barcelona, Spain',
    price: 2800,
    ageMin: 10,
    ageMax: 16,
    rating: 4.6,
    reviewCount: 78,
    image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg',
    verificationLevel: 'verified',
    qualityTier: 'verified',
    dietaryOptions: ['halal', 'vegetarian'],
    languageSupport: ['english', 'spanish'],
    programType: 'sports',
  },
  {
    id: '7',
    name: 'Swiss Alps Adventure Camp',
    category: 'Adventure',
    location: 'Zermatt, Switzerland',
    price: 5200,
    ageMin: 13,
    ageMax: 17,
    rating: 4.9,
    reviewCount: 167,
    image: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg',
    verificationLevel: 'elite',
    qualityTier: 'elite',
    dietaryOptions: ['halal', 'vegetarian', 'vegan', 'gluten-free', 'dairy-free'],
    languageSupport: ['english', 'french', 'german'],
    programType: 'adventure',
  },
  {
    id: '8',
    name: 'Dubai Business & Entrepreneurship',
    category: 'Leadership',
    location: 'Dubai, UAE',
    price: 6800,
    ageMin: 15,
    ageMax: 18,
    rating: 4.7,
    reviewCount: 92,
    image: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg',
    verificationLevel: 'premium',
    qualityTier: 'premium',
    dietaryOptions: ['halal', 'vegetarian', 'vegan'],
    languageSupport: ['english', 'arabic', 'mandarin'],
    programType: 'leadership',
  },
];
