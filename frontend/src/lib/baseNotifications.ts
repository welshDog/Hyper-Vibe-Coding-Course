/**
 * 🔔 Base Notifications Service
 * Fires push notifications to BROski pet owners via Base Dashboard API
 * Triggers: level up, evolution, reward earned
 *
 * API Limits:
 * - 20 req/min per IP
 * - title: 30 chars max
 * - message: 200 chars max
 * - wallets: 1,000 per request max
 * - 24h dedup (identical notifications ignored)
 */

const BASE_APP_URL = import.meta.env.VITE_APP_URL ||
  'https://hyper-vibe-coding-course-dnjpk2crx-bro-skis.vercel.app'

const NOTIFICATIONS_API = 'https://dashboard.base.org/api/v1/notifications/send'

export type NotificationType = 'level_up' | 'evolution' | 'reward'

export interface PetNotificationPayload {
  walletAddress: string
  petName: string
  type: NotificationType
  detail?: string // e.g. "Level 5", "Gold BROski", "50 BROski$"
}

// 🎨 Notification templates — Base enforces 30 char title / 200 char message
const TEMPLATES: Record<NotificationType, (petName: string, detail?: string) => { title: string; message: string; path: string }> = {
  level_up: (petName, detail) => ({
    title: `🆙 ${petName} levelled up!`.slice(0, 30),
    message: `Your BROski pet ${petName} just hit ${detail ?? 'a new level'}! Come celebrate! 🐾`.slice(0, 200),
    path: '/pets',
  }),
  evolution: (petName, detail) => ({
    title: `✨ ${petName} evolved!`.slice(0, 30),
    message: `Whoa! ${petName} has evolved into ${detail ?? 'something amazing'}! Check it out now 🔥`.slice(0, 200),
    path: '/pets',
  }),
  reward: (petName, detail) => ({
    title: `🏆 Reward earned!`.slice(0, 30),
    message: `${petName} earned ${detail ?? 'a reward'} for you! Claim it in your BROski wallet 💰`.slice(0, 200),
    path: '/rewards',
  }),
}

/**
 * Send a Base push notification to a single pet owner
 */
export async function sendPetNotification({
  walletAddress,
  petName,
  type,
  detail,
}: PetNotificationPayload): Promise<{ success: boolean; error?: string }> {
  const apiKey = import.meta.env.VITE_BASE_API_KEY

  if (!apiKey) {
    console.warn('⚠️ VITE_BASE_API_KEY not set — skipping Base notification')
    return { success: false, error: 'Missing API key' }
  }

  const { title, message, path } = TEMPLATES[type](petName, detail)

  try {
    const res = await fetch(NOTIFICATIONS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        app_url: BASE_APP_URL,
        wallet_addresses: [walletAddress],
        title,
        message,
        target_path: path,
      }),
    })

    if (res.status === 429) {
      console.warn('⚠️ Base notifications rate limit hit (20/min). Try again shortly.')
      return { success: false, error: 'Rate limited' }
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('❌ Base notification failed:', res.status, err)
      return { success: false, error: `HTTP ${res.status}` }
    }

    console.log(`✅ Base notification sent [${type}] to ${walletAddress}`)
    return { success: true }
  } catch (err) {
    console.error('❌ Base notification error:', err)
    return { success: false, error: String(err) }
  }
}

/**
 * Send notifications to multiple wallets at once (max 1,000)
 */
export async function sendBulkPetNotification({
  walletAddresses,
  petName,
  type,
  detail,
}: Omit<PetNotificationPayload, 'walletAddress'> & { walletAddresses: string[] }): Promise<{ success: boolean; error?: string }> {
  const apiKey = import.meta.env.VITE_BASE_API_KEY

  if (!apiKey) {
    return { success: false, error: 'Missing API key' }
  }

  if (walletAddresses.length > 1000) {
    console.warn('⚠️ Max 1,000 wallets per request — truncating')
    walletAddresses = walletAddresses.slice(0, 1000)
  }

  const { title, message, path } = TEMPLATES[type](petName, detail)

  try {
    const res = await fetch(NOTIFICATIONS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        app_url: BASE_APP_URL,
        wallet_addresses: walletAddresses,
        title,
        message,
        target_path: path,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { success: false, error: `HTTP ${res.status}: ${JSON.stringify(err)}` }
    }

    console.log(`✅ Bulk Base notification sent [${type}] to ${walletAddresses.length} wallets`)
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
