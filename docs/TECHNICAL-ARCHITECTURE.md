# Technical Architecture

## 1. System Overview

```mermaid
graph TD
  U[User Browser] --> FE[Vercel: Vite + React SPA]

  FE --> SBJS[Supabase JS Client]
  SBJS --> SBA[Supabase Auth]
  SBJS --> SBD[Supabase Postgres + RLS]

  FE --> HC[HyperCode API (Stripe Checkout)]
  HC --> ST[Stripe]
  ST --> SBEF[Supabase Edge Function: stripe-webhook]
  SBEF --> SBD

  FE --> VA[Vercel API Routes (optional)]
```

## 2. Tech Stack (What’s Actually In This Repo)
- **Frontend**: `frontend/` (React 18 + TypeScript + Vite + Tailwind)
- **Database/Auth**: Supabase (Auth + Postgres + RLS)
- **Edge Functions**: `supabase/functions/` (TypeScript)
- **Payments**: Stripe (checkout + webhooks)
- **Optional APIs**:
  - `api/` Vercel serverless routes (e.g. BROski chat)
  - `apps/api/` Node/Express API used for local development/experiments

## 3. Frontend Routes
Routes are defined in `frontend/src/App.tsx`.

| Route | Auth | Purpose |
|------|------|---------|
| `/` | Public | Landing page |
| `/pricing` | Public | Pricing tiers + checkout entry |
| `/login` | Public | Login |
| `/register` | Public | Signup |
| `/courses` | Public | Course catalog |
| `/courses/:id` | Public | Course detail |
| `/leaderboard` | Public | Public leaderboard |
| `/dashboard` | Required | User dashboard |
| `/quests` | Required | Quests |
| `/tokens` | Required | Token packs |
| `/shop` | Required | Shop |
| `/profile` | Required | Profile |
| `/scripts` | Required | Script generator |
| `/learn/:courseId` | Required | Lesson player |
| `/certificate/:courseId` | Required | Certificate view |
| `/admin` | Admin | Admin panel |
| `/payment-success` | Public | Stripe redirect success page |

## 4. Server-Side Endpoints Used by the Frontend

### 4.1 Supabase (Auth + Postgres)
The frontend uses the Supabase client to call:
- Auth (sign up, sign in, sign out)
- PostgREST queries against application tables under RLS

### 4.2 Stripe checkout (HyperCode API)
Checkout is created by calling the configured HyperCode backend:

- URL: `${VITE_HYPERCODE_API_URL}/api/stripe/checkout`
- Method: `POST`
- Response: `{ checkout_url: string }` or `{ url: string }`

The frontend calls this endpoint from `frontend/src/lib/payments.ts` and redirects the browser to the returned checkout URL.

### 4.3 Vercel API routes (optional)
Serverless routes live in `api/` (example: `POST /api/broski-chat`).

## 5. Payments → Enrollment Flow
1. User starts checkout from the frontend (pricing page or course purchase).
2. Frontend requests a Stripe Checkout Session from the backend and redirects to Stripe.
3. Stripe sends webhook events to the Supabase `stripe-webhook` Edge Function.
4. The Edge Function validates the event and applies entitlements in Postgres (e.g., inserts enrollments/tokens) using idempotent writes.

## 6. Data Model (High-Level)
This project’s source-of-truth schema is in `supabase/migrations/`. Key tables include:
- `public.users` (profile mirror of `auth.users`)
- `public.courses`, `public.lessons`
- `public.enrollments` (course unlocks; timestamp column name may differ across early migrations vs current DB)
- XP/tokens/shop/quests tables added via later migrations
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    duration_minutes INTEGER,
    instructor_id UUID REFERENCES users(id),
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    order_index INTEGER NOT NULL,
    video_url TEXT,
    content TEXT,
    duration_seconds INTEGER,
    is_free BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    UNIQUE(user_id, course_id)
);

-- Progress table
CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    time_spent_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, lesson_id)
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    plan_type VARCHAR(20) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_published ON courses(is_published);
CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_progress_user ON progress(user_id);
CREATE INDEX idx_progress_lesson ON progress(lesson_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Grant basic read access to anonymous users
GRANT SELECT ON courses TO anon;
GRANT SELECT ON lessons TO anon;

-- Grant full access to authenticated users
GRANT ALL PRIVILEGES ON enrollments TO authenticated;
GRANT ALL PRIVILEGES ON progress TO authenticated;
GRANT SELECT ON courses TO authenticated;
GRANT SELECT ON lessons TO authenticated;
```

## 7. Security Considerations
- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-based access control (RBAC)
- **Data Encryption**: SSL/TLS for data in transit, encryption at rest for sensitive data
- **Input Validation**: Server-side validation with Zod schemas
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Configured for secure cross-origin requests
- **SQL Injection**: Parameterized queries via Supabase
- **XSS Protection**: Content Security Policy headers
- **Payment Security**: PCI DSS compliance through Stripe

## 8. Performance Optimization
- **Caching**: Redis for session management and frequently accessed data
- **CDN**: CloudFront for static assets and video content
- **Lazy Loading**: Component-level code splitting
- **Image Optimization**: WebP format with responsive sizing
- **Database Indexing**: Strategic indexes on frequently queried columns
- **API Response Compression**: Gzip/Brotli compression
- **Frontend Bundle Optimization**: Tree shaking and minification
