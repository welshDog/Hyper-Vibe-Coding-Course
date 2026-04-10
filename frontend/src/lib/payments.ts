export type PaymentLinkOptions = {
  prefilledEmail?: string
  /** The Supabase course UUID — passed as Stripe metadata so the webhook can enroll the student */
  courseId?: string
  /** The Supabase user UUID — passed as Stripe metadata so the webhook knows who to enroll */
  userId?: string
}

/**
 * Builds a Stripe Payment Link URL with optional prefilled email and
 * course/user metadata. The webhook reads `client_reference_id` and
 * `metadata` to identify the purchase and create the enrollment row.
 */
export function buildStripePaymentLinkUrl(options: PaymentLinkOptions = {}) {
  const baseUrl = import.meta.env.VITE_STRIPE_PAYMENT_LINK_URL as string | undefined
  if (!baseUrl) return null

  const url = new URL(baseUrl)

  if (options.prefilledEmail) {
    url.searchParams.set('prefilled_email', options.prefilledEmail)
  }

  // Stripe Payment Links support `client_reference_id` as a single ID.
  // We encode both IDs as JSON so the webhook can decode them.
  // The webhook also reads session.metadata, but Payment Links don't
  // support metadata directly — use client_reference_id as the carrier.
  if (options.userId && options.courseId) {
    url.searchParams.set(
      'client_reference_id',
      encodeURIComponent(JSON.stringify({ userId: options.userId, courseId: options.courseId }))
    )
  }

  // Pass success URL so Stripe redirects the user back to the platform
  if (options.courseId) {
    const successUrl = `${window.location.origin}/payment-success?course_id=${options.courseId}`
    url.searchParams.set('success_url', successUrl)
  }

  return url.toString()
}

/** Per-course payment links — add individual course payment link env vars here */
export function getCoursePaymentLinkUrl(courseId: string, userId?: string, userEmail?: string): string | null {
  // Map course IDs to their individual Stripe payment link env vars
  const coursePaymentLinks: Record<string, string | undefined> = {
    // Add entries as you create payment links in Stripe:
    // 'supabase-course-uuid': import.meta.env.VITE_STRIPE_LINK_COURSE_2,
  }

  const baseUrl = coursePaymentLinks[courseId] ?? import.meta.env.VITE_STRIPE_PAYMENT_LINK_URL as string | undefined
  if (!baseUrl) return null

  return buildStripePaymentLinkUrl({ courseId, userId, prefilledEmail: userEmail }) ?? null
}

