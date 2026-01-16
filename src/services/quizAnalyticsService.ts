/**
 * Quiz Analytics Service
 * Tracks quiz events for analytics and conversion tracking
 */

export interface QuizEvent {
  event: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Simple in-memory event storage (can be replaced with proper analytics service)
const eventLog: QuizEvent[] = [];

/**
 * Track a quiz event
 */
export function trackQuizEvent(
  event: string,
  metadata?: Record<string, any>
): void {
  const quizEvent: QuizEvent = {
    event,
    timestamp: new Date(),
    metadata,
  };

  // Store in memory
  eventLog.push(quizEvent);

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('[Quiz Analytics]', event, metadata);
  }

  // TODO: Integrate with Google Analytics 4
  // if (typeof gtag !== 'undefined') {
  //   gtag('event', event, {
  //     event_category: 'quiz',
  //     ...metadata,
  //   });
  // }

  // TODO: Integrate with custom analytics backend
  // await fetch('/api/analytics/track', {
  //   method: 'POST',
  //   body: JSON.stringify(quizEvent),
  // });
}

/**
 * Track quiz started
 */
export function trackQuizStarted(sessionId: string): void {
  trackQuizEvent('quiz_started', {
    session_id: sessionId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track question answered
 */
export function trackQuestionAnswered(
  questionNumber: number,
  questionLabel: string,
  value: any
): void {
  trackQuizEvent('question_answered', {
    question_number: questionNumber,
    question_label: questionLabel,
    value: JSON.stringify(value),
  });
}

/**
 * Track quiz completed
 */
export function trackQuizCompleted(
  sessionId: string,
  timeSeconds: number,
  resultsCount: number
): void {
  trackQuizEvent('quiz_completed', {
    session_id: sessionId,
    time_to_complete_seconds: timeSeconds,
    results_count: resultsCount,
  });
}

/**
 * Track results viewed
 */
export function trackResultsViewed(
  sessionId: string,
  resultsCount: number
): void {
  trackQuizEvent('results_viewed', {
    session_id: sessionId,
    results_count: resultsCount,
  });
}

/**
 * Track email captured
 */
export function trackEmailCaptured(
  sessionId: string,
  source: 'save_results' | 'share_results' = 'save_results'
): void {
  trackQuizEvent('email_captured', {
    session_id: sessionId,
    source,
  });
}

/**
 * Track camp clicked from results
 */
export function trackCampClickedFromResults(
  sessionId: string,
  campId: string,
  ranking: number,
  matchLabel: string
): void {
  trackQuizEvent('camp_clicked', {
    session_id: sessionId,
    camp_id: campId,
    ranking,
    match_label: matchLabel,
  });
}

/**
 * Track quiz abandoned
 */
export function trackQuizAbandoned(
  sessionId: string,
  questionNumber: number,
  questionLabel: string
): void {
  trackQuizEvent('quiz_abandoned', {
    session_id: sessionId,
    drop_off_question: questionNumber,
    drop_off_label: questionLabel,
  });
}

/**
 * Get all tracked events (for debugging)
 */
export function getEventLog(): QuizEvent[] {
  return [...eventLog];
}

/**
 * Clear event log (for debugging)
 */
export function clearEventLog(): void {
  eventLog.length = 0;
}

/**
 * Get quiz funnel metrics
 */
export interface QuizFunnelMetrics {
  started: number;
  q1_completed: number;
  q2_completed: number;
  q3_completed: number;
  q4_completed: number;
  q5_completed: number;
  quiz_completed: number;
  email_captured: number;
  camp_clicked: number;
}

export function getQuizFunnelMetrics(): QuizFunnelMetrics {
  const metrics: QuizFunnelMetrics = {
    started: 0,
    q1_completed: 0,
    q2_completed: 0,
    q3_completed: 0,
    q4_completed: 0,
    q5_completed: 0,
    quiz_completed: 0,
    email_captured: 0,
    camp_clicked: 0,
  };

  eventLog.forEach((event) => {
    if (event.event === 'quiz_started') {
      metrics.started++;
    } else if (event.event === 'question_answered') {
      const qNum = event.metadata?.question_number;
      if (qNum === 1) metrics.q1_completed++;
      else if (qNum === 2) metrics.q2_completed++;
      else if (qNum === 3) metrics.q3_completed++;
      else if (qNum === 4) metrics.q4_completed++;
      else if (qNum === 5) metrics.q5_completed++;
    } else if (event.event === 'quiz_completed') {
      metrics.quiz_completed++;
    } else if (event.event === 'email_captured') {
      metrics.email_captured++;
    } else if (event.event === 'camp_clicked') {
      metrics.camp_clicked++;
    }
  });

  return metrics;
}
