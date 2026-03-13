export type User = {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: 'student' | 'instructor' | 'admin'
  created_at: string
}

export type Course = {
  id: string
  title: string
  description: string
  price: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  instructor_id: string
  thumbnail_url: string
  is_published: boolean
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
