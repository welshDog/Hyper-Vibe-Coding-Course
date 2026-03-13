import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Course, Lesson } from '../types/database';
import { useAuthStore } from '../context/auth';
import { Button } from '../components/ui/Button';
import { CheckCircle, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LessonPlayer() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchData() {
      if (!courseId) return;
      setError(null);

      // Verify enrollment
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

      // Fetch progress
      if (resolvedLessons.length > 0) {
        const lessonIds = resolvedLessons.map((lesson) => lesson.id);
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
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
      } else {
        setCompletedLessons(new Set());
      }

      setLoading(false);
    }

    fetchData();
  }, [courseId, user, navigate]);

  const currentLesson = lessons[currentLessonIndex];

  const handleComplete = async () => {
    if (!user || !currentLesson) return;

    // Optimistic update
    const newCompleted = new Set(completedLessons);
    newCompleted.add(currentLesson.id);
    setCompletedLessons(newCompleted);

    // DB update
    const { error: progressUpsertError } = await supabase.from('progress').upsert({
      user_id: user.id,
      lesson_id: currentLesson.id,
      completed: true,
      completed_at: new Date().toISOString()
    });
    if (progressUpsertError) {
      setCompletedLessons(completedLessons);
      return;
    }

    // Update enrollment progress
    const progressPercent = lessons.length > 0
      ? Math.min(100, Math.round((newCompleted.size / lessons.length) * 100))
      : 0;
    const { error: enrollmentUpdateError } = await supabase.from('enrollments').update({
      progress_percentage: progressPercent,
      // If all completed
      ...(newCompleted.size === lessons.length ? { completed_at: new Date().toISOString() } : {})
    }).eq('user_id', user.id).eq('course_id', courseId);
    if (enrollmentUpdateError) {
      return;
    }
  };

  const handleNext = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading learning environment...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!course || !currentLesson) return <div className="p-8 text-center">Course content not found</div>;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden" data-testid="lesson-player-container">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0" data-testid="lesson-sidebar">
        <div className="p-4 border-b border-gray-200">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mb-2" data-testid="back-dashboard-btn">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Button>
          <h2 className="text-lg font-bold text-gray-900 truncate" data-testid="course-title">{course.title}</h2>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(completedLessons.size / lessons.length) * 100}%` }}
              data-testid="progress-bar"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1" data-testid="progress-text">{completedLessons.size} / {lessons.length} completed</p>
        </div>
        
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
                    "cursor-pointer hover:bg-gray-50 transition-colors",
                    isActive && "bg-primary/5 border-l-4 border-primary"
                  )}
                  onClick={() => setCurrentLessonIndex(index)}
                >
                  <div className={cn("p-4 flex items-start", isActive ? "pl-3" : "pl-4")}>
                    <div className="flex-shrink-0 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" data-testid={`lesson-completed-icon-${index}`} />
                      ) : (
                        <div className={cn(
                          "h-5 w-5 rounded-full border-2 flex items-center justify-center text-xs",
                          isActive ? "border-primary text-primary font-bold" : "border-gray-300 text-gray-500"
                        )} data-testid={`lesson-number-${index}`}>
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={cn("text-sm font-medium", isActive ? "text-primary" : "text-gray-900")} data-testid={`lesson-title-${index}`}>
                        {lesson.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{Math.floor(lesson.duration_seconds / 60)} mins</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden" data-testid="main-content">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg shadow-lg overflow-hidden mb-8 relative" style={{ paddingBottom: '56.25%' }} data-testid="video-player">
              {/* Mock Video Player */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                  <PlayCircle className="h-20 w-20 mx-auto opacity-80" />
                  <p className="mt-4 text-lg">Video Player Placeholder</p>
                  <p className="text-sm text-gray-400">Video URL: {currentLesson.video_url}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-900" data-testid="current-lesson-title">{currentLesson.title}</h1>
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
                  <Button onClick={handleComplete} variant="default" data-testid="mark-complete-btn">
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

            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-2">Lesson Content</h3>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200" data-testid="lesson-content">
                {currentLesson.content || "No text content for this lesson."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
