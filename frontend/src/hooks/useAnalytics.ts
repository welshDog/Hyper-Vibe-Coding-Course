/**
 * useAnalytics — PostHog event tracking hook
 *
 * Setup:
 *   1. npm install posthog-js  (add to frontend/)
 *   2. Add to frontend/.env:
 *        VITE_POSTHOG_KEY=phc_...
 *        VITE_POSTHOG_HOST=https://app.posthog.com
 *   3. Initialise PostHog once in main.tsx (see snippet below)
 *
 * main.tsx snippet:
 *   import posthog from 'posthog-js'
 *   posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
 *     api_host: import.meta.env.VITE_POSTHOG_HOST ?? 'https://app.posthog.com',
 *     capture_pageview: true,
 *     persistence: 'localStorage',
 *   })
 *
 * The hook degrades gracefully when PostHog is not loaded (no env var, ad-blocker, etc.)
 */

type PostHogInstance = {
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (distinctId: string, properties?: Record<string, unknown>) => void;
};

function getPostHog(): PostHogInstance | null {
  // PostHog is injected as a global by posthog-js when initialised in main.tsx
  const ph = (window as unknown as { posthog?: PostHogInstance }).posthog;
  return ph ?? null;
}

export function useAnalytics() {
  // ── Core events ─────────────────────────────────────────────────────────

  function trackLessonStarted(params: {
    courseId: string;
    courseTitle: string;
    lessonId: string;
    lessonTitle: string;
    lessonIndex: number;
  }) {
    getPostHog()?.capture('lesson_started', params);
  }

  function trackLessonCompleted(params: {
    courseId: string;
    courseTitle: string;
    lessonId: string;
    lessonTitle: string;
    lessonIndex: number;
    progressPercent: number;
  }) {
    getPostHog()?.capture('lesson_completed', params);
  }

  function trackCourseEnrolled(params: {
    courseId: string;
    courseTitle: string;
    price: number;
    isFree: boolean;
  }) {
    getPostHog()?.capture('course_enrolled', params);
  }

  function trackPaymentInitiated(params: {
    courseId: string;
    courseTitle: string;
    price: number;
  }) {
    getPostHog()?.capture('payment_initiated', params);
  }

  function trackCourseCompleted(params: {
    courseId: string;
    courseTitle: string;
  }) {
    getPostHog()?.capture('course_completed', params);
  }

  function trackBadgeEarned(params: {
    badgeId: string;
    badgeName: string;
    xpAwarded: number;
  }) {
    getPostHog()?.capture('badge_earned', params);
  }

  // ── Identity ─────────────────────────────────────────────────────────────
  /** Call once after login to associate subsequent events with the user */
  function identifyUser(userId: string, properties?: { email?: string; name?: string }) {
    getPostHog()?.identify(userId, properties);
  }

  return {
    trackLessonStarted,
    trackLessonCompleted,
    trackCourseEnrolled,
    trackPaymentInitiated,
    trackCourseCompleted,
    trackBadgeEarned,
    identifyUser,
  };
}
