export type PaymentLinkOptions = {
  prefilledEmail?: string
}

export function buildStripePaymentLinkUrl(options: PaymentLinkOptions = {}) {
  const baseUrl = import.meta.env.VITE_STRIPE_PAYMENT_LINK_URL as string | undefined
  if (!baseUrl) return null

  const url = new URL(baseUrl)
  if (options.prefilledEmail) {
    url.searchParams.set('prefilled_email', options.prefilledEmail)
  }

  return url.toString()
}

