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

export type Certificate = {
  id: string
  user_id: string
  course_id: string
  issued_at: string
}

export type QuizQuestion = {
  id: string
  lesson_id: string
  question: string
  options: string[]
  correct_answer: number
  explanation?: string | null
  order_index: number
  created_at: string
}

export type QuizAttempt = {
  id: string
  user_id: string
  question_id: string
  selected_answer: number
  is_correct: boolean
  created_at: string
}

export type ReferralCode = {
  id: string
  user_id: string
  code: string
  created_at: string
}

export type Referral = {
  id: string
  referrer_user_id: string
  referred_user_id?: string | null
  referred_email: string
  tokens_awarded: number
  rewarded_at?: string | null
  created_at: string
}
