export type PaymentLinkOptions = {
  prefilledEmail?: string
  /** The Supabase course UUID — the only value we trust from the frontend.
   *  user_id is intentionally NOT passed here; the webhook derives it from
   *  session.customer_details.email, which Stripe owns and verifies. */
  courseId?: string
}

function resolveHypercodeApiUrl(): string {
  const configured = import.meta.env.VITE_HYPERCODE_API_URL as string | undefined
  const apiUrl = configured?.trim() || 'http://localhost:8000'

  const originHost = window.location.hostname
  const isLocalOrigin = originHost === 'localhost' || originHost === '127.0.0.1'
  if (isLocalOrigin) return apiUrl

  let apiHost: string
  try {
    apiHost = new URL(apiUrl).hostname
  } catch {
    throw new Error('Invalid VITE_HYPERCODE_API_URL')
  }

  const isLocalApi = apiHost === 'localhost' || apiHost === '127.0.0.1'
  if (isLocalApi) {
    throw new Error('VITE_HYPERCODE_API_URL must be set in production')
  }

  return apiUrl
}

/**
 * Builds a Stripe Payment Link URL.
 *
 * Currency note:
 *   Stripe Payment Link currency is set at link-creation time in the Stripe Dashboard
 *   — it cannot be overridden via URL parameters. Ensure all Payment Links are created
 *   with GBP as the currency (not USD). This code passes no currency parameter because
 *   none exists for Payment Links (only for Payment Intents / Checkout Sessions).
 *
 * Security model:
 *   - Only courseId is embedded in the URL (a public value — knowing it grants nothing).
 *   - userId is never sent from the frontend. The webhook identifies the buyer
 *     via session.customer_details.email, which cannot be forged by the user.
 *   - This prevents an attacker from swapping their userId for another user's
 *     UUID to enroll a victim in a course.
 */
export function buildStripePaymentLinkUrl(options: PaymentLinkOptions = {}) {
  const baseUrl = import.meta.env.VITE_STRIPE_PAYMENT_LINK_URL as string | undefined
  if (!baseUrl) return null

  const url = new URL(baseUrl)

  if (options.prefilledEmail) {
    url.searchParams.set('prefilled_email', options.prefilledEmail)
  }

  // courseId is the only frontend-supplied value. It identifies which course
  // to unlock — the webhook validates it exists in the DB before enrolling.
  if (options.courseId) {
    url.searchParams.set('client_reference_id', options.courseId)
  }

  // Redirect back to the platform after payment
  if (options.courseId) {
    const successUrl = `${window.location.origin}/payment-success?course_id=${options.courseId}`
    url.searchParams.set('success_url', successUrl)
  }

  return url.toString()
}

/**
 * Calls the HyperCode V2.4 Stripe Checkout API.
 * Returns the Stripe-hosted checkout URL to redirect the user to.
 *
 * priceKey — one of: "pro_monthly" | "pro_yearly" | "hyper_monthly" | "hyper_yearly"
 *                    | "starter" | "builder" | "hyper"
 * userId   — Supabase user UUID (used by the webhook to link payment to account)
 */
export async function createCheckoutSession(
  priceKey: string,
  userId: string,
  courseId?: string,
): Promise<string> {
  const apiUrl = resolveHypercodeApiUrl()
  const origin = window.location.origin
  const successPath = courseId
    ? `/payment-success?course_id=${courseId}`
    : '/payment-success'
  const res = await fetch(`${apiUrl}/api/stripe/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price_id: priceKey,
      user_id: userId,
      success_url: `${origin}${successPath}`,
      cancel_url: `${origin}/pricing`,
    }),
  })
  if (!res.ok) {
    throw new Error(`Checkout request failed (${res.status})`)
  }
  const data = await res.json() as { checkout_url?: string; url?: string }
  const url = data.checkout_url ?? data.url
  if (!url) throw new Error('No checkout URL returned from API')
  return url
}

/**
 * Creates a Stripe Checkout Session for a paid course purchase.
 * Uses the HyperCode V2.4 backend API (same as token packs / subscriptions).
 *
 * The backend uses inline price_data so no Stripe Price ID needs to be pre-created
 * per course. client_reference_id = courseId is set on the session so the Supabase
 * stripe-webhook Edge Function can enroll the correct course after payment.
 */
export async function createCourseCheckoutSession(
  course: { id: string; title: string; price_pence: number },
  userId: string,
): Promise<string> {
  const apiUrl = resolveHypercodeApiUrl()
  const origin = window.location.origin
  const res = await fetch(`${apiUrl}/api/stripe/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price_id: 'course_purchase',
      user_id: userId,
      course_id: course.id,
      course_title: course.title,
      price_pence: course.price_pence,
      success_url: `${origin}/payment-success?course_id=${course.id}`,
      cancel_url: `${origin}/catalog/${course.id}`,
    }),
  })
  if (!res.ok) {
    throw new Error(`Course checkout request failed (${res.status})`)
  }
  const data = await res.json() as { checkout_url?: string; url?: string }
  const url = data.checkout_url ?? data.url
  if (!url) throw new Error('No checkout URL returned from API')
  return url
}
