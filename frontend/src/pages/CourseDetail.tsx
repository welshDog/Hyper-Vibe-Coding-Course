import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Course, Lesson } from '../types/database';
import { useAuthStore } from '../context/auth';
import { PlayCircle, Lock } from 'lucide-react';
import { createCourseCheckoutSession } from '../lib/payments';
import { HVZButton, HVZCard, HVZTag, type TagColor } from '../components/ui/hvz';

const DIFFICULTY_TONE: Record<string, TagColor> = {
  beginner: 'mint',
  intermediate: 'amber',
  advanced: 'pink',
};

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) {
        console.error('Error fetching course:', courseError);
        setLoading(false);
        return;
      }
      setCourse(courseData);

      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index');
      setLessons(lessonsData || []);

      if (user) {
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', id)
          .single();
        setIsEnrolled(!!enrollment);
      }

      setLoading(false);
    }

    void fetchData();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (enrolling || !course) return;
    setEnrollError(null);
    setEnrolling(true);

    if (course.price_pence === 0) {
      const { error } = await supabase.from('enrollments').upsert(
        { user_id: user.id, course_id: id, progress_percentage: 0 },
        { onConflict: 'user_id,course_id' },
      );

      if (error) {
        setEnrollError("Hmm, let's try that again 🔄 — couldn't enroll you right now.");
        setEnrolling(false);
        return;
      }
      setIsEnrolled(true);
      navigate(`/learn/${id}`);
      return;
    }

    try {
      const checkoutUrl = await createCourseCheckoutSession(
        { id: course.id, title: course.title, price_pence: course.price_pence },
        user.id,
      );
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('[CourseDetail] Course checkout failed:', err);
      setEnrollError("Hmm, let's try that again 🔄 — payment system's having a moment.");
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-hfz-space-black min-h-screen flex items-center justify-center text-hfz-text-secondary">
        Wiring up the Z0ne...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-hfz-space-black min-h-screen flex flex-col items-center justify-center px-4 py-12 text-center">
        <HVZCard padding={32} style={{ maxWidth: 420 }}>
          <h1
            className="font-display font-bold text-2xl text-hfz-text-primary mb-3"
            style={{ background: 'none', WebkitTextFillColor: 'unset' }}
          >
            Course not found
          </h1>
          <p className="text-base text-hfz-text-secondary mb-6">
            That portal blinked out — try the catalog instead.
          </p>
          <Link to="/catalog" className="block no-underline">
            <HVZButton variant="primary" size="md" fullWidth>
              Back to catalog →
            </HVZButton>
          </Link>
        </HVZCard>
      </div>
    );
  }

  const isFree = course.price_pence === 0;
  const priceLabel = isFree
    ? 'Free'
    : `£${(course.price_pence / 100).toFixed(2).replace(/\.00$/, '')}`;

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(ellipse at 50% -10%, var(--color-deep-violet) 0%, var(--color-space-black) 60%)',
      }}
    >
      <div className="max-w-hfz-page mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
          {/* Course info */}
          <div>
            <HVZTag color="cyan">🎓 Course</HVZTag>
            <h1
              className="font-display font-extrabold tracking-hfz-tight text-hfz-text-primary mt-4"
              style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                lineHeight: 1.1,
                background: 'none',
                WebkitTextFillColor: 'unset',
                textWrap: 'balance',
              }}
            >
              {course.title}
            </h1>

            <div className="mt-4 flex items-center gap-3 flex-wrap">
              {course.difficulty && (
                <HVZTag color={DIFFICULTY_TONE[course.difficulty] ?? 'violet'}>
                  {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                </HVZTag>
              )}
              <span className="text-sm text-hfz-text-secondary font-mono">
                {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                {course.duration_minutes != null
                  ? ` · ${Math.round(course.duration_minutes / 60)}h ${course.duration_minutes % 60}m`
                  : ''}
              </span>
            </div>

            <p className="mt-5 text-hfz-body-lg text-hfz-text-primary/90 leading-[1.8] max-w-[60ch]">
              {course.description ?? 'Course details coming soon.'}
            </p>

            <div className="mt-8">
              <span
                className={`font-display font-extrabold text-3xl tracking-hfz-tight ${
                  isFree ? 'text-hfz-mint' : 'text-hfz-text-primary'
                }`}
              >
                {priceLabel}
              </span>
            </div>

            {enrollError && (
              <p
                role="alert"
                className="mt-4 text-sm text-hfz-danger max-w-[40ch]"
              >
                {enrollError}
              </p>
            )}

            <div className="mt-6 flex gap-3 flex-wrap">
              {isEnrolled ? (
                <Link to={`/learn/${course.id}`} className="no-underline">
                  <HVZButton variant="primary" size="lg">
                    Continue learning →
                  </HVZButton>
                </Link>
              ) : (
                <HVZButton
                  variant="primary"
                  size="lg"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling
                    ? isFree
                      ? 'Enrolling...'
                      : 'Wiring up checkout...'
                    : isFree
                    ? "Let's GO — free →"
                    : `Enroll — ${priceLabel}`}
                </HVZButton>
              )}
              <Link to={`/learn/${course.id}?preview=true`} className="no-underline">
                <HVZButton variant="ghost" size="lg">
                  ▶ Free preview
                </HVZButton>
              </Link>
            </div>
          </div>

          {/* Syllabus */}
          <div className="mt-12 lg:mt-0">
            <h2
              className="font-display font-bold text-hfz-h3 text-hfz-text-primary mb-4"
              style={{ background: 'none', WebkitTextFillColor: 'unset' }}
            >
              Syllabus
            </h2>

            {lessons.length === 0 ? (
              <HVZCard padding={24}>
                <p className="text-base text-hfz-text-secondary m-0">
                  Lessons drop here — coming soon. 🎯
                </p>
              </HVZCard>
            ) : (
              <HVZCard padding={0} style={{ overflow: 'hidden' }}>
                <ul className="list-none p-0 m-0 divide-y divide-hfz-border-violet">
                  {lessons.map((lesson, i) => {
                    const unlocked = isEnrolled || lesson.is_free;
                    return (
                      <li
                        key={lesson.id}
                        className="px-5 py-4 flex items-center justify-between gap-3 hover:bg-hfz-violet/5 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex-shrink-0">
                            {unlocked ? (
                              <PlayCircle className="h-5 w-5 text-hfz-cyan" />
                            ) : (
                              <Lock className="h-5 w-5 text-hfz-text-disabled" aria-label="Locked" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-hfz-text-primary truncate m-0">
                              <span className="font-mono text-hfz-violet-light mr-2">
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              {lesson.title}
                            </p>
                            <p className="text-xs text-hfz-text-secondary mt-0.5 font-mono">
                              {Math.floor(lesson.duration_seconds / 60)} min
                            </p>
                          </div>
                        </div>
                        {lesson.is_free && !isEnrolled && (
                          <HVZTag color="mint">Free</HVZTag>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </HVZCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
