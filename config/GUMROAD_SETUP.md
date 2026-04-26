# 📦 Gumroad Configuration (Legacy)

This file is a legacy reference from the early “Lean Launch” phase.

Current production payments for the platform are Stripe-based (checkout + webhooks) and are handled via:
- Supabase Edge Function: `supabase/functions/stripe-webhook/`
- Frontend checkout integration: `frontend/src/lib/payments.ts`

Keep the Gumroad flow only if you are explicitly running a Gumroad-based product alongside the platform.

## 1. Product Details
- **Name**: Hyper Vibe Coding Course 1
- **Description**:
  > Learn to build apps without writing code. This free 4-week course teaches you the "Vibe Coding" method using AI tools.
  >
  > What you get:
  > - 4 Weeks of Guided Curriculum
  > - Private Discord Community Access
  > - Daily Launch Plan
  > - Gamified Learning Experience
- **Price**: $0 (or "Pay what you want")
- **Call to Action**: "I want this!"

## 2. Content
- **Upload**: `docs/guides/START_HERE.md` (PDF version recommended)
- **Upload**: `docs/course/CURRICULUM.md`

## 3. Checkout / Thank You Page
- **Button Text**: "View Content"
- **Redirect URL**: `https://hyper-vibe-coding-course.vercel.app/` (or your docs URL if you host docs publicly)
- **Note**: "Welcome to the Vibe! Check your email for the Discord invite link."

## 4. Automated Workflow (Email Receipt)
**Subject**: Welcome to Hyper Vibe Coding! 🚀

**Body**:
```text
Hey Vibe Coder!

You're in. Welcome to the future of building software.

Here are your 3 critical next steps:

1. 📖 READ THE START GUIDE:
[Link to START_HERE.md]

2. 💬 JOIN THE DISCORD:
[Link to Discord Invite]

3. 🛠️ BOOKMARK THE COURSE INDEX:
[Link to docs/guides/INDEX.md]

See you in the #wins channel!

- The Hyper Vibe Team
```

## 5. Automation (Optional - Zapier/Make)
- **Trigger**: New Sale (Gumroad)
- **Action**: Add to ConvertKit (Tag: `course-1-student`)
- **Action**: Add to Discord Role (Bot)
