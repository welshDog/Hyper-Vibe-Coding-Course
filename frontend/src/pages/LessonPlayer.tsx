import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Course, Lesson } from '../types/database';
import { useAuthStore } from '../context/auth';
import { Button } from '../components/ui/Button';
import { CheckCircle, ChevronLeft, ChevronRight, X, Zap, Award } from 'lucide-react';
import { VideoPlayer } from '../components/VideoPlayer';
import { cn } from '../lib/utils';
import { useAchievements, BADGES } from '../hooks/useAchievements';
import { useAnalytics } from '../hooks/useAnalytics';

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastItem = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
};

function ToastStack({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50 w-80 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-gray-900 text-white rounded-xl shadow-2xl p-4 flex items-start gap-3 border border-gray-700 pointer-events-auto animate-in slide-in-from-right-4"
        >
          <span className="text-2xl flex-shrink-0 leading-none mt-0.5">{toast.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-snug">{toast.title}</p>
            <p className="text-xs text-gray-400 mt-1 leading-snug">{toast.subtitle}</p>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-gray-500 hover:text-white flex-shrink-0 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function LessonPlayer() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();

  // Preview mode: skip enrollment check, show enroll CTA banner
  const isPreview = searchParams.get('preview') === 'true';

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const { onLessonCompleted, totalXp, earnedBadges } = useAchievements();
  const { trackLessonStarted, trackLessonCompleted, trackBadgeEarned } = useAnalytics();

  // Track which lessons we've already fired lesson_started for (per mount)
  const trackedStartRef = useRef(new Set<string>());

  // ── Toast helpers ────────────────────────────────────────────────────────
  function addToast(toast: Omit<ToastItem, 'id'>) {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => removeToast(id), 5500);
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // ── Data fetch ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchData() {
      if (!courseId) return;
      setError(null);

      // Enrollment check — skipped in preview mode
      if (!isPreview) {
        const { data: enrollment, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user!.id)
          .eq('course_id', courseId)
          .single();

        if (enrollmentError) {
          setError('Failed to verify enrollment');
          setLoading(false);
          return;
        }

        if (!enrollment) {
          navigate(`/courses/${courseId}`);
          return;
        }
      }

      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      if (courseError || !courseData) {
        setError('Failed to load course');
        setLoading(false);
        return;
      }
      setCourse(courseData);

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (lessonsError) {
        setError('Failed to load lessons');
        setLoading(false);
        return;
      }
      const resolvedLessons = lessonsData ?? [];
      setLessons(resolvedLessons);

      // Fetch progress (only when enrolled, not in preview)
      if (!isPreview && resolvedLessons.length > 0) {
        const lessonIds = resolvedLessons.map((l) => l.id);
        const { data: progressData, error: progressError } = await supabase
          .from('lesson_progress')
          .select('lesson_id')
          .eq('user_id', user!.id)
          .eq('completed', true)
          .in('lesson_id', lessonIds);

        if (progressError) {
          setError('Failed to load progress');
          setLoading(false);
          return;
        }
        setCompletedLessons(new Set((progressData ?? []).map((p) => p.lesson_id)));
      }

      setLoading(false);
    }

    void fetchData();
  }, [courseId, user, navigate, isPreview]);

  // ── Fire lesson_started analytics on lesson change ───────────────────────
  useEffect(() => {
    if (!course || !lessons[currentLessonIndex]) return;
    const lesson = lessons[currentLessonIndex];
    if (trackedStartRef.current.has(lesson.id)) return;
    trackedStartRef.current.add(lesson.id);
    trackLessonStarted({
      courseId: courseId!,
      courseTitle: course.title,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      lessonIndex: currentLessonIndex,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLessonIndex, course, lessons]);

  const currentLesson = lessons[currentLessonIndex];

  // ── Mark lesson complete ─────────────────────────────────────────────────
  const handleComplete = async () => {
    if (!user || !currentLesson) return;

    const newCompleted = new Set(completedLessons);
    newCompleted.add(currentLesson.id);
    setCompletedLessons(newCompleted);

    // Preview mode: local-only, no DB writes
    if (isPreview) {
      addToast({
        emoji: '🔥',
        title: 'Nice work, BROski!',
        subtitle: 'Enroll to save your progress and unlock badges.',
      });
      return;
    }

    // Persist progress to DB
    const { error: progressError } = await supabase.from('lesson_progress').upsert({
      user_id: user.id,
      course_id: courseId,
      lesson_id: currentLesson.id,
      completed: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' });
    if (progressError) {
      setCompletedLessons(completedLessons);
      return;
    }

    // Update enrollment progress %
    const progressPercent =
      lessons.length > 0
        ? Math.min(100, Math.round((newCompleted.size / lessons.length) * 100))
        : 0;
    await supabase
      .from('enrollments')
      .update({
        progress_percentage: progressPercent,
        ...(newCompleted.size === lessons.length ? { completed_at: new Date().toISOString() } : {}),
      })
      .eq('user_id', user.id)
      .eq('course_id', courseId);

    // Analytics
    trackLessonCompleted({
      courseId: courseId!,
      courseTitle: course!.title,
      lessonId: currentLesson.id,
      lessonTitle: currentLesson.title,
      lessonIndex: currentLessonIndex,
      progressPercent,
    });

    // Achievement check — get newly unlocked badges
    const newBadgeIds = await onLessonCompleted(newCompleted.size, lessons.length);

    if (newBadgeIds.length > 0) {
      for (const badgeId of newBadgeIds) {
        const badge = BADGES[badgeId];
        trackBadgeEarned({ badgeId, badgeName: badge.name, xpAwarded: badge.xp });
        addToast({
          emoji: badge.emoji,
          title: `${badge.name} unlocked!`,
          subtitle: `+${badge.xp} XP — ${badge.description}`,
        });
      }
    } else {
      // Motivational toast even when no badge fires
      const broskiMessages = [
        'Keep the streak alive!',
        'Momentum is everything — keep going.',
        'That\'s the vibe. Next lesson is waiting.',
        'One more down. You\'re building real skills.',
      ];
      const msg = broskiMessages[Math.floor(Math.random() * broskiMessages.length)];
      addToast({ emoji: '⚡', title: 'Lesson complete! +10 BROski$', subtitle: msg });
    }
  };

  const handleNext = () => {
    if (currentLessonIndex < lessons.length - 1) setCurrentLessonIndex((p) => p + 1);
  };
  const handlePrev = () => {
    if (currentLessonIndex > 0) setCurrentLessonIndex((p) => p - 1);
  };

  // ── Early returns ────────────────────────────────────────────────────────
  if (loading) return <div className="p-8 text-center">Loading learning environment...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!course || !currentLesson) return <div className="p-8 text-center">Course content not found</div>;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex h-screen bg-gray-100 overflow-hidden" data-testid="lesson-player-container">
        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0" data-testid="lesson-sidebar">
          <div className="p-4 border-b border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="mb-2"
              data-testid="back-dashboard-btn"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
            </Button>

            <h2 className="text-lg font-bold text-gray-900 truncate" data-testid="course-title">
              {course.title}
            </h2>

            {/* Progress bar */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${lessons.length > 0 ? (completedLessons.size / lessons.length) * 100 : 0}%` }}
                data-testid="progress-bar"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1" data-testid="progress-text">
              {completedLessons.size} / {lessons.length} completed
            </p>

            {/* XP + badge count */}
            {!isPreview && (
              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100">
                <span className="flex items-center gap-1 text-xs font-medium text-yellow-600">
                  <Zap className="w-3 h-3" />
                  {totalXp} XP
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-purple-600">
                  <Award className="w-3 h-3" />
                  {earnedBadges.length} badge{earnedBadges.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Preview mode indicator */}
            {isPreview && (
              <div className="mt-2 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                Preview mode — progress not saved
              </div>
            )}
          </div>

          {/* Lesson list */}
          <div className="flex-1 overflow-y-auto">
            <ul className="divide-y divide-gray-100" data-testid="lesson-list">
              {lessons.map((lesson, index) => {
                const isActive = index === currentLessonIndex;
                const isCompleted = completedLessons.has(lesson.id);
                return (
                  <li
                    key={lesson.id}
                    data-testid={`lesson-item-${index}`}
                    className={cn(
                      'cursor-pointer hover:bg-gray-50 transition-colors',
                      isActive && 'bg-primary/5 border-l-4 border-primary',
                    )}
                    onClick={() => setCurrentLessonIndex(index)}
                  >
                    <div className={cn('p-4 flex items-start', isActive ? 'pl-3' : 'pl-4')}>
                      <div className="flex-shrink-0 mt-0.5">
                        {isCompleted ? (
                          <CheckCircle
                            className="h-5 w-5 text-green-500"
                            data-testid={`lesson-completed-icon-${index}`}
                          />
                        ) : (
                          <div
                            className={cn(
                              'h-5 w-5 rounded-full border-2 flex items-center justify-center text-xs',
                              isActive
                                ? 'border-primary text-primary font-bold'
                                : 'border-gray-300 text-gray-500',
                            )}
                            data-testid={`lesson-number-${index}`}
                          >
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            isActive ? 'text-primary' : 'text-gray-900',
                          )}
                          data-testid={`lesson-title-${index}`}
                        >
                          {lesson.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {Math.floor(lesson.duration_seconds / 60)} mins
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden" data-testid="main-content">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              {/* Video player */}
              <VideoPlayer
                url={currentLesson.video_url}
                title={currentLesson.title}
              />

              {/* Controls */}
              <div className="flex items-center justify-between mb-8">
                <h1
                  className="text-2xl font-bold text-gray-900"
                  data-testid="current-lesson-title"
                >
                  {currentLesson.title}
                </h1>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentLessonIndex === 0}
                    data-testid="prev-lesson-btn"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                  </Button>

                  {!completedLessons.has(currentLesson.id) && (
                    <Button
                      onClick={handleComplete}
                      variant="default"
                      data-testid="mark-complete-btn"
                    >
                      Mark as Complete
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentLessonIndex === lessons.length - 1}
                    data-testid="next-lesson-btn"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Lesson content */}
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-2">Lesson Content</h3>
                <div
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                  data-testid="lesson-content"
                >
                  {currentLesson.content || 'No text content for this lesson.'}
                </div>
              </div>
            </div>
          </div>

          {/* Preview CTA banner — sticky at bottom of content column */}
          {isPreview && (
            <div className="flex-shrink-0 bg-primary px-8 py-4 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold text-sm">Enjoying this? Get full access.</p>
                <p className="text-purple-200 text-xs mt-0.5">
                  Enroll to unlock all lessons, track progress, and earn badges.
                </p>
              </div>
              <Link to="/pricing">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary transition-colors"
                >
                  Enroll now →
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Toast stack — outside layout so it's never clipped */}
      <ToastStack toasts={toasts} onDismiss={removeToast} />
    </>
  );
}
