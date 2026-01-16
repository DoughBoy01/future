import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Camp = Database['public']['Tables']['camps']['Row'] & {
  organisations?: { name: string } | null;
  camp_category_assignments?: Array<{
    camp_categories: { id: string; name: string; slug: string } | null;
  }>;
};

type QuizResponse = {
  childAge: number;
  parentGoals?: string[]; // goal keys (e.g., 'skill-development', 'social-connection')
  interests: string[]; // category_ids
  budgetRange?: { min: number; max: number };
  duration?: 'half-day' | 'full-day' | 'week' | 'multi-week';
  specialNeeds?: {
    dietary?: string[];
    accessibility?: string[];
  };
  locationPreference?: {
    type: 'local' | 'international';
    county?: string;
  };
};

export type CampWithScore = {
  camp: Camp;
  score: number;
  matchLabel: 'perfect' | 'great' | 'good';
  matchReasons: string[];
  ranking: number;
};

/**
 * Calculate duration in days from start and end dates
 */
function calculateDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check if camp duration matches the preference
 */
function matchesDuration(campDurationDays: number, preference: string): boolean {
  switch (preference) {
    case 'half-day':
      return campDurationDays <= 1; // Single day, half-day programs
    case 'full-day':
      return campDurationDays === 1; // Single full day
    case 'week':
      return campDurationDays >= 5 && campDurationDays <= 7; // Week-long
    case 'multi-week':
      return campDurationDays > 7; // Multiple weeks
    default:
      return false;
  }
}

/**
 * Calculate match score for a camp based on quiz responses
 */
export function calculateCampScore(camp: Camp, responses: QuizResponse): {
  score: number;
  reasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];

  // AGE FILTER (Must-have - hard requirement)
  if (!camp.age_min || !camp.age_max) {
    return { score: 0, reasons: ['Age information not available'] };
  }

  if (responses.childAge < camp.age_min || responses.childAge > camp.age_max) {
    return { score: 0, reasons: ['Age does not match camp requirements'] };
  }

  // Child's age is within range
  reasons.push(`Perfect for ${responses.childAge}-year-olds`);

  // PARENT GOALS MATCHING (40% weight - parent motivation alignment)
  if (responses.parentGoals && responses.parentGoals.length > 0) {
    // Map parent goals to relevant camp tags/keywords
    const goalTagMap: Record<string, string[]> = {
      'skill-development': ['skill', 'training', 'workshop', 'expertise', 'mastery', 'advanced'],
      'social-connection': ['social', 'team', 'group', 'friends', 'collaborative', 'community'],
      'physical-activity': ['active', 'sports', 'outdoor', 'physical', 'athletic', 'fitness', 'adventure'],
      'creative-expression': ['creative', 'art', 'music', 'expression', 'imagination', 'craft'],
      'academic-enrichment': ['academic', 'educational', 'learning', 'enrichment', 'stem', 'science', 'math'],
      'fun-adventure': ['fun', 'adventure', 'exciting', 'exploration', 'discovery', 'experience']
    };

    let goalMatches = 0;
    const matchedGoalLabels: string[] = [];

    responses.parentGoals.forEach(goal => {
      const relevantTags = goalTagMap[goal] || [];
      const campName = camp.name?.toLowerCase() || '';
      const campDescription = camp.description?.toLowerCase() || '';

      // Check if any relevant tags match the camp name or description
      const hasMatch = relevantTags.some(tag =>
        campName.includes(tag.toLowerCase()) || campDescription.includes(tag.toLowerCase())
      );

      if (hasMatch) {
        goalMatches++;
        // Add friendly label
        const goalLabels: Record<string, string> = {
          'skill-development': 'skill development',
          'social-connection': 'social connection',
          'physical-activity': 'physical activity',
          'creative-expression': 'creative expression',
          'academic-enrichment': 'academic enrichment',
          'fun-adventure': 'fun and adventure'
        };
        matchedGoalLabels.push(goalLabels[goal] || goal);
      }
    });

    if (goalMatches > 0) {
      const goalScore = (goalMatches / responses.parentGoals.length) * 40;
      score += goalScore;
      reasons.push(`Aligns with your ${matchedGoalLabels.join(' and ')} goals`);
    }
  }

  // CATEGORY MATCHING (70% weight - reduced from 80% to accommodate parent goals)
  const campCategories = camp.camp_category_assignments?.map(
    (assignment) => assignment.camp_categories?.id
  ).filter(Boolean) as string[] || [];

  const categoryMatches = campCategories.filter((catId) =>
    responses.interests.includes(catId)
  );

  if (categoryMatches.length > 0 && responses.interests.length > 0) {
    const categoryScore = (categoryMatches.length / responses.interests.length) * 70;
    score += categoryScore;

    // Get category names for reasons
    const matchedCategoryNames = camp.camp_category_assignments
      ?.filter((assignment) =>
        categoryMatches.includes(assignment.camp_categories?.id || '')
      )
      .map((assignment) => assignment.camp_categories?.name)
      .filter(Boolean) as string[];

    if (matchedCategoryNames.length > 0) {
      reasons.push(`Matches ${matchedCategoryNames.join(', ')} interest${matchedCategoryNames.length > 1 ? 's' : ''}`);
    }
  }

  // BUDGET MATCHING (50% weight - soft filter, reduced to accommodate parent goals)
  if (responses.budgetRange) {
    const campPrice = camp.early_bird_price || camp.price;

    if (
      campPrice &&
      campPrice >= responses.budgetRange.min &&
      campPrice <= responses.budgetRange.max
    ) {
      score += 50;
      if (camp.early_bird_price && camp.early_bird_price < camp.price) {
        reasons.push('Early bird discount available');
      } else {
        reasons.push('Within your budget');
      }
    } else if (campPrice && campPrice <= responses.budgetRange.max * 1.2) {
      // Partial credit if slightly over budget (within 20%)
      score += 25;
      reasons.push('Slightly above budget but great value');
    }
  }

  // DURATION MATCHING (50% weight - reduced to accommodate parent goals)
  if (responses.duration && camp.start_date && camp.end_date) {
    const campDuration = calculateDuration(camp.start_date, camp.end_date);

    if (matchesDuration(campDuration, responses.duration)) {
      score += 50;
      const durationLabels = {
        'half-day': 'Half-day schedule',
        'full-day': 'Full-day program',
        'week': 'Week-long intensive',
        'multi-week': 'Multi-week experience',
      };
      reasons.push(durationLabels[responses.duration]);
    }
  }

  // SPECIAL NEEDS (15% weight - reduced to accommodate parent goals)
  if (responses.specialNeeds) {
    const { dietary, accessibility } = responses.specialNeeds;

    // Check dietary accommodations
    if (dietary && dietary.length > 0) {
      // Check if camp amenities include dietary support
      const campAmenities = camp.amenities as any;
      if (campAmenities && Array.isArray(campAmenities)) {
        const hasDietarySupport = campAmenities.some(
          (amenity: any) =>
            amenity.category?.toLowerCase().includes('dietary') ||
            amenity.category?.toLowerCase().includes('food') ||
            amenity.items?.some((item: string) =>
              dietary.some((need) => item.toLowerCase().includes(need.toLowerCase()))
            )
        );

        if (hasDietarySupport) {
          score += 7.5;
          reasons.push('Accommodates dietary needs');
        }
      }
    }

    // Check accessibility accommodations
    if (accessibility && accessibility.length > 0) {
      const campAmenities = camp.amenities as any;
      if (campAmenities && Array.isArray(campAmenities)) {
        const hasAccessibilitySupport = campAmenities.some(
          (amenity: any) =>
            amenity.category?.toLowerCase().includes('accessibility') ||
            amenity.items?.some((item: string) =>
              accessibility.some((need) => item.toLowerCase().includes(need.toLowerCase()))
            )
        );

        if (hasAccessibilitySupport) {
          score += 7.5;
          reasons.push('Accessible facilities available');
        }
      }
    }
  }

  // LOCATION PREFERENCE MATCHING (30% weight - high priority)
  if (responses.locationPreference && camp.location) {
    const campLocation = camp.location.toLowerCase();
    const { type, county } = responses.locationPreference;

    // Check if camp is in Ireland (common Irish location patterns)
    const isIrelandCamp = campLocation.includes('ireland') ||
                          campLocation.includes('dublin') ||
                          campLocation.includes('cork') ||
                          campLocation.includes('galway') ||
                          campLocation.includes('limerick') ||
                          campLocation.includes('waterford') ||
                          campLocation.includes('kildare') ||
                          campLocation.includes('wicklow') ||
                          campLocation.includes('meath') ||
                          campLocation.includes('clare') ||
                          campLocation.includes('kerry') ||
                          campLocation.includes('donegal') ||
                          campLocation.includes('mayo') ||
                          campLocation.includes('sligo') ||
                          campLocation.includes('louth') ||
                          campLocation.includes('carlow') ||
                          campLocation.includes('kilkenny') ||
                          campLocation.includes('wexford') ||
                          campLocation.includes('tipperary') ||
                          campLocation.includes('offaly') ||
                          campLocation.includes('laois') ||
                          campLocation.includes('westmeath') ||
                          campLocation.includes('longford') ||
                          campLocation.includes('cavan') ||
                          campLocation.includes('monaghan') ||
                          campLocation.includes('roscommon') ||
                          campLocation.includes('leitrim');

    if (type === 'local') {
      // User wants local camps in Ireland
      if (isIrelandCamp) {
        score += 30;

        // Extra bonus if county matches
        if (county && campLocation.includes(county.toLowerCase())) {
          score += 10; // Additional bonus for exact county match
          reasons.push(`Located in ${county}`);
        } else {
          reasons.push('Located in Ireland');
        }
      } else {
        // Penalize international camps when user wants local
        score -= 20;
      }
    } else if (type === 'international') {
      // User wants international camps
      if (!isIrelandCamp) {
        score += 30;
        reasons.push('International destination');
      } else {
        // Penalize local camps when user wants international
        score -= 20;
      }
    }
  }

  // AVAILABILITY BONUS (5% weight - reduced to accommodate parent goals)
  const availablePlaces = camp.capacity && camp.enrolled_count
    ? camp.capacity - camp.enrolled_count
    : null;

  if (availablePlaces && availablePlaces > 5) {
    score += 5;
    reasons.push('Plenty of spots available');
  } else if (availablePlaces && availablePlaces > 0 && availablePlaces <= 5) {
    reasons.push('Limited spots remaining');
  }

  // FEATURED CAMPS BONUS (5% weight)
  if (camp.featured) {
    score += 5;
  }

  return {
    score: Math.min(Math.round(score), 100), // Cap at 100 and round
    reasons,
  };
}

/**
 * Determine match label based on score
 */
export function getMatchLabel(score: number): 'perfect' | 'great' | 'good' {
  if (score >= 80) return 'perfect';
  if (score >= 60) return 'great';
  return 'good';
}

/**
 * Get camp recommendations based on quiz responses
 */
export async function getRecommendations(
  responses: QuizResponse
): Promise<CampWithScore[]> {
  try {
    // Fetch all published camps with categories
    const { data: camps, error } = await supabase
      .from('camps')
      .select(
        `
        *,
        organisations(name),
        camp_category_assignments(
          camp_categories(id, name, slug)
        )
      `
      )
      .eq('status', 'published')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching camps:', error);
      throw error;
    }

    if (!camps || camps.length === 0) {
      return [];
    }

    // Score and filter camps
    const scoredCamps: CampWithScore[] = camps
      .map((camp) => {
        const { score, reasons } = calculateCampScore(camp, responses);
        return {
          camp,
          score,
          matchLabel: getMatchLabel(score),
          matchReasons: reasons,
          ranking: 0, // Will be set after sorting
        };
      })
      .filter((result) => result.score >= 30) // Minimum threshold
      .sort((a, b) => {
        // Primary sort by score
        if (b.score !== a.score) return b.score - a.score;

        // Tie-breaking logic
        // 1. Availability
        const aAvailable = a.camp.capacity && a.camp.enrolled_count
          ? a.camp.capacity - a.camp.enrolled_count
          : 0;
        const bAvailable = b.camp.capacity && b.camp.enrolled_count
          ? b.camp.capacity - b.camp.enrolled_count
          : 0;
        if (bAvailable !== aAvailable) return bAvailable - aAvailable;

        // 2. Early bird pricing
        const aHasEarlyBird = !!a.camp.early_bird_price;
        const bHasEarlyBird = !!b.camp.early_bird_price;
        if (aHasEarlyBird && !bHasEarlyBird) return -1;
        if (!aHasEarlyBird && bHasEarlyBird) return 1;

        // 3. Featured status
        if (a.camp.featured && !b.camp.featured) return -1;
        if (!a.camp.featured && b.camp.featured) return 1;

        // 4. Recency (newer camps rank higher)
        return new Date(b.camp.created_at || '').getTime() -
          new Date(a.camp.created_at || '').getTime();
      });

    // Assign rankings and limit to top 5
    const topResults = scoredCamps.slice(0, 5).map((result, index) => ({
      ...result,
      ranking: index + 1,
    }));

    return topResults;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
}

/**
 * Save quiz response and results to database
 */
export async function saveQuizResponse(
  responses: QuizResponse,
  results: CampWithScore[],
  sessionId: string,
  deviceType: string = 'desktop',
  email?: string
): Promise<{ success: boolean; responseId?: string; error?: any }> {
  try {
    const startedAt = new Date();
    const completedAt = new Date();
    const timeToComplete = Math.round(
      (completedAt.getTime() - startedAt.getTime()) / 1000
    );

    // Insert quiz response
    const { data: quizResponseData, error: responseError } = await supabase
      .from('quiz_responses')
      .insert({
        child_age: responses.childAge,
        parent_goals: responses.parentGoals || null,
        interests: responses.interests,
        budget_min: responses.budgetRange?.min || null,
        budget_max: responses.budgetRange?.max || null,
        duration_preference: responses.duration || null,
        special_needs: responses.specialNeeds || null,
        session_id: sessionId,
        started_at: startedAt.toISOString(),
        completed_at: completedAt.toISOString(),
        time_to_complete_seconds: timeToComplete,
        device_type: deviceType,
        email: email || null,
      })
      .select()
      .single();

    if (responseError) {
      console.error('Error saving quiz response:', responseError);
      return { success: false, error: responseError };
    }

    // Insert quiz results
    const quizResultsInserts = results.map((result) => ({
      quiz_response_id: quizResponseData.id,
      camp_id: result.camp.id,
      match_score: result.score,
      match_label: result.matchLabel,
      match_reasons: result.matchReasons,
      ranking: result.ranking,
    }));

    const { error: resultsError } = await supabase
      .from('quiz_results')
      .insert(quizResultsInserts);

    if (resultsError) {
      console.error('Error saving quiz results:', resultsError);
      return { success: false, error: resultsError };
    }

    return { success: true, responseId: quizResponseData.id };
  } catch (error) {
    console.error('Error in saveQuizResponse:', error);
    return { success: false, error };
  }
}

/**
 * Update quiz response with email (for save results functionality)
 */
export async function updateQuizResponseEmail(
  sessionId: string,
  email: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from('quiz_responses')
      .update({ email })
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error updating quiz response email:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateQuizResponseEmail:', error);
    return { success: false, error };
  }
}

/**
 * Track camp click from quiz results
 */
export async function trackCampClick(
  quizResponseId: string,
  campId: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from('quiz_results')
      .update({
        clicked: true,
        clicked_at: new Date().toISOString(),
      })
      .eq('quiz_response_id', quizResponseId)
      .eq('camp_id', campId);

    if (error) {
      console.error('Error tracking camp click:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in trackCampClick:', error);
    return { success: false, error };
  }
}

/**
 * Get fallback camps when no matches are found
 * Returns popular camps suitable for the child's age
 */
export async function getFallbackCamps(childAge: number): Promise<Camp[]> {
  try {
    const { data: camps, error } = await supabase
      .from('camps')
      .select(
        `
        *,
        organisations(name),
        camp_category_assignments(
          camp_categories(id, name, slug)
        )
      `
      )
      .eq('status', 'published')
      .lte('age_min', childAge)
      .gte('age_max', childAge)
      .order('featured', { ascending: false })
      .order('enrolled_count', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching fallback camps:', error);
      return [];
    }

    return camps || [];
  } catch (error) {
    console.error('Error in getFallbackCamps:', error);
    return [];
  }
}

/**
 * Generate session ID for quiz tracking
 */
export function generateSessionId(): string {
  return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
