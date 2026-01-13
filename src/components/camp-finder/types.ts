import type { ReactNode } from 'react';
import type { CampWithScore } from '../../services/quizService';

export type QuestionState =
  | 'NAME'
  | 'AGE'
  | 'INTERESTS'
  | 'BUDGET'
  | 'DURATION'
  | 'SPECIAL_NEEDS'
  | 'PROCESSING'
  | 'RESULTS';

export type BudgetTier =
  | 'BUDGET_FRIENDLY'
  | 'MID_RANGE'
  | 'PREMIUM'
  | 'LUXURY'
  | 'FLEXIBLE';

export type DurationPreference = 'half-day' | 'full-day' | 'week' | 'multi-week';

export interface SpecialNeeds {
  dietary?: string[];
  accessibility?: string[];
}

export interface QuizResponses {
  childName?: string;
  childAge?: number;
  interests?: string[];
  budgetTier?: BudgetTier;
  duration?: DurationPreference;
  specialNeeds?: SpecialNeeds;
}

export interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string | ReactNode;
  timestamp: Date;
  questionType?: QuestionState;
  responseValue?: any;
}

export interface ConversationState {
  messages: ChatMessage[];
  responses: QuizResponses;
  currentQuestion: QuestionState;
  isAITyping: boolean;
  sessionId: string;
  results: CampWithScore[] | null;
}

export interface ChatSession {
  sessionId: string;
  childName?: string;
  currentState: QuestionState;
  messages: ChatMessage[];
  responses: QuizResponses;
  lastUpdated: number;
}

export interface BudgetTierConfig {
  label: string;
  displayRange: string;
  emoji: string;
  description: string;
  minPrice: number; // Internal only
  maxPrice: number; // Internal only
}

export const BUDGET_TIERS: Record<BudgetTier, BudgetTierConfig> = {
  BUDGET_FRIENDLY: {
    label: 'Budget-Friendly',
    displayRange: 'Great value options',
    emoji: '💰',
    description: 'Quality programs at accessible prices',
    minPrice: 0,
    maxPrice: 500,
  },
  MID_RANGE: {
    label: 'Mid-Range',
    displayRange: 'Balanced quality & value',
    emoji: '✨',
    description: 'Popular choice for most families',
    minPrice: 500,
    maxPrice: 1200,
  },
  PREMIUM: {
    label: 'Premium',
    displayRange: 'Enhanced experiences',
    emoji: '⭐',
    description: 'Specialized programs with extras',
    minPrice: 1200,
    maxPrice: 2500,
  },
  LUXURY: {
    label: 'Luxury',
    displayRange: 'Elite opportunities',
    emoji: '👑',
    description: 'Exceptional, immersive experiences',
    minPrice: 2500,
    maxPrice: 10000,
  },
  FLEXIBLE: {
    label: "I'm Flexible",
    displayRange: 'Show me all options',
    emoji: '🌈',
    description: 'Focus on best matches regardless of price',
    minPrice: 0,
    maxPrice: 10000,
  },
};

export const DURATION_LABELS: Record<DurationPreference, string> = {
  'half-day': 'Half-day schedule',
  'full-day': 'Full-day program',
  'week': 'Week-long intensive',
  'multi-week': 'Multi-week experience',
};

export const COMMON_DIETARY_NEEDS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Halal',
  'Kosher',
  'Allergy-Friendly',
];

export const COMMON_ACCESSIBILITY_NEEDS = [
  'Wheelchair Access',
  'Visual Support',
  'Hearing Support',
  'Sensory-Friendly',
  'Sign Language',
];
