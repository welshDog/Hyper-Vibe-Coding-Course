export type User = {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  role: 'student' | 'instructor' | 'admin'
  broski_tokens: number
  created_at: string
}

export type TokenTransaction = {
  id: string
  user_id: string
  amount: number
  reason: string
  stripe_payment_intent_id?: string
  source_id?: string
  created_at: string
}

export type Course = {
  id: string
  title: string
  slug?: string | null
  description: string
  /** Price in GBP pence (e.g. 4900 = £49). 0 = free. */
  price_pence: number
  currency: string
  is_active: boolean
  /** Optional display fields — nullable until populated */
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | null
  duration_minutes?: number | null
  thumbnail_url?: string | null
  created_at: string
}

export type Lesson = {
  id: string
  course_id: string
  title: string
  order_index: number
  video_url: string
  content: string
  duration_seconds: number
  is_free: boolean
  created_at: string
}

export type Enrollment = {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
  completed_at?: string
  progress_percentage: number
}
