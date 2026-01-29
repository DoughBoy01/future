/**
 * Analytics tracking utilities for FutureEdge
 * Tracks user interactions and events for analytics and optimization
 */

interface AnalyticsEvent {
  eventName: string;
  properties: Record<string, any>;
  timestamp: string;
}

/**
 * Generic event tracking function
 * Sends events to console for now - can be extended to send to Supabase or external service
 */
export const trackEvent = (eventName: string, properties: Record<string, any> = {}): void => {
  const event: AnalyticsEvent = {
    eventName,
    properties,
    timestamp: new Date().toISOString(),
  };

  // Log to console for debugging
  console.log('📊 Analytics Event:', eventName, properties);

  // TODO: Send to analytics service (Supabase, Google Analytics, etc.)
  // Example: supabase.from('analytics_events').insert(event)
};

/**
 * Track when the featured camps carousel is viewed
 * @param campIds - Array of camp IDs currently visible in the carousel
 */
export const trackFeaturedCarouselView = (campIds: string[]): void => {
  trackEvent('featured_carousel_view', {
    camp_ids: campIds,
    visible_count: campIds.length,
  });
};

/**
 * Track when a user clicks on a featured camp card
 * @param campId - ID of the camp that was clicked
 * @param position - Position of the camp in the carousel (0-indexed)
 * @param totalCamps - Total number of featured camps in the carousel
 */
export const trackFeaturedCampClick = (
  campId: string,
  position: number,
  totalCamps: number
): void => {
  trackEvent('featured_camp_click', {
    camp_id: campId,
    position,
    total_featured_camps: totalCamps,
  });
};

/**
 * Track carousel interaction (navigation)
 * @param interactionType - Type of interaction (arrow_click, dot_click, swipe, keyboard)
 * @param direction - Direction of navigation (next, previous, specific_slide)
 * @param currentSlide - Current slide index before navigation
 * @param targetSlide - Target slide index after navigation
 */
export const trackCarouselInteraction = (
  interactionType: 'arrow_click' | 'dot_click' | 'swipe' | 'keyboard',
  direction: 'next' | 'previous' | 'specific_slide',
  currentSlide: number,
  targetSlide: number
): void => {
  trackEvent('carousel_interaction', {
    interaction_type: interactionType,
    direction,
    current_slide: currentSlide,
    target_slide: targetSlide,
  });
};

/**
 * Track autoplay interactions
 * @param action - Action performed (pause, resume, toggle)
 */
export const trackAutoplayInteraction = (action: 'pause' | 'resume' | 'toggle'): void => {
  trackEvent('carousel_autoplay', {
    action,
  });
};
