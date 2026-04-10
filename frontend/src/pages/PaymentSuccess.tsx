import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../context/auth';
import { Button } from '../components/ui/Button';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';

type Status = 'loading' | 'enrolled' | 'already_enrolled' | 'error';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course_id');
  const { user } = useAuthStore();
  const [status, setStatus] = useState<Status>('loading');
  const [courseTitle, setCourseTitle] = useState<string>('');

  useEffect(() => {
    // Stripe webhook handles the actual enrollment server-side.
    // This page polls for enrollment confirmation (max ~10s) so the
    // user gets immediate feedback without waiting for webhook latency.
    if (!user || !courseId) {
      setStatus(user ? 'error' : 'loading');
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    async function pollEnrollment() {
      // Fetch course title for the success message
      if (!courseTitle) {
        const { data: course } = await supabase
          .from('courses')
          .select('title')
          .eq('id', courseId)
          .single();
        if (course) setCourseTitle(course.title);
      }

      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user!.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (enrollment) {
        setStatus('enrolled');
        return;
      }

      attempts++;
      if (attempts >= maxAttempts) {
        // Webhook may have already run and enrollment exists — or it failed.
        // Fall back to manual upsert so the student isn't blocked.
        const { error } = await supabase
          .from('enrollments')
          .upsert(
            { user_id: user!.id, course_id: courseId, progress_percentage: 0 },
            { onConflict: 'user_id,course_id' }
          );
        setStatus(error ? 'error' : 'enrolled');
        return;
      }

      setTimeout(pollEnrollment, 1000);
    }

    void pollEnrollment();
  }, [user, courseId, courseTitle]);

  // ── Not logged in ──
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
          <h2 className="text-2xl font-bold text-gray-900">Almost there!</h2>
          <p className="mt-3 text-gray-500">
            Log in to access your new course.
          </p>
          <Link to="/login" className="block mt-6">
            <Button className="w-full">Log in to continue</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading / polling ──
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Confirming your enrollment…</h2>
          <p className="mt-3 text-gray-500 text-sm">
            Hang tight — we're unlocking your course. This takes just a moment.
          </p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
          <p className="mt-3 text-gray-500">
            Your payment was processed, but we couldn't confirm your enrollment automatically.
            Reach out and we'll sort it within the hour.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link to="/dashboard">
              <Button variant="outline" className="w-full">Go to Dashboard</Button>
            </Link>
            <a href="mailto:support@hypervibecourses.com" className="text-sm text-primary hover:underline">
              Contact support
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Success ──
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900">You're in! 🎉</h2>

        {courseTitle && (
          <p className="mt-2 text-primary font-semibold">{courseTitle}</p>
        )}

        <p className="mt-3 text-gray-500">
          Payment confirmed. Your course is unlocked and waiting.
          Let's build something real.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {courseId ? (
            <Link to={`/learn/${courseId}`}>
              <Button className="w-full text-base">
                Start learning now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link to="/dashboard">
              <Button className="w-full text-base">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
          <Link to="/courses" className="text-sm text-gray-400 hover:text-gray-600">
            Browse more courses
          </Link>
        </div>
      </div>
    </div>
  );
}
