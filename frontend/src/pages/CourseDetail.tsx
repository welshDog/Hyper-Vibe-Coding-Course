import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Course, Lesson } from '../types/database';
import { useAuthStore } from '../context/auth';
import { Button } from '../components/ui/Button';
import { PlayCircle, Lock } from 'lucide-react';
import { getCoursePaymentLinkUrl } from '../lib/payments';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      // Fetch course
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

      // Fetch lessons
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index');
      setLessons(lessonsData || []);

      // Check enrollment
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

    fetchData();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (enrolling || !course) return;
    setEnrolling(true);

    // Free courses: enroll directly
    if (course.price_pence === 0) {
      const { error } = await supabase
        .from('enrollments')
        .upsert(
          { user_id: user.id, course_id: id, progress_percentage: 0 },
          { onConflict: 'user_id,course_id' }
        );

      if (error) {
        console.error('Enrollment error:', error);
        setEnrolling(false);
        return;
      }
      setIsEnrolled(true);
      navigate(`/learn/${id}`);
      return;
    }

    // Paid courses: redirect to Stripe Payment Link
    const paymentUrl = getCoursePaymentLinkUrl(course.id, user.email);

    if (!paymentUrl) {
      console.error('[CourseDetail] No Stripe payment link configured — blocking enrollment to prevent bypass');
      alert('Payment system is temporarily unavailable. Please try again later.');
      setEnrolling(false);
      return;
    }

    // Redirect to Stripe — enrollment happens via webhook after payment
    window.location.href = paymentUrl;
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!course) return <div className="p-8 text-center">Course not found</div>;

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
          {/* Course Info */}
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {course.title}
            </h1>
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              {course.difficulty ? (
                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                  course.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                </span>
              ) : null}
              <span className="text-sm text-gray-500">
                {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                {course.duration_minutes != null
                  ? ` • ${Math.round(course.duration_minutes / 60)}h ${course.duration_minutes % 60}m`
                  : ''}
              </span>
            </div>
            <p className="mt-4 text-lg text-gray-500">
              {course.description}
            </p>
            
            <div className="mt-8 flex gap-4">
              {isEnrolled ? (
                <Link to={`/learn/${course.id}`}>
                  <Button size="lg" className="w-full sm:w-auto">
                    Continue Learning
                  </Button>
                </Link>
              ) : (
                <Button size="lg" onClick={handleEnroll} className="w-full sm:w-auto" disabled={enrolling}>
                  {enrolling
                    ? (course.price_pence === 0 ? 'Enrolling...' : 'Redirecting to checkout…')
                    : course.price_pence === 0
                      ? 'Enroll for free'
                      : `Enroll — £${(course.price_pence / 100).toFixed(2).replace(/\.00$/, '')}`}
                </Button>
              )}
            </div>
          </div>

          {/* Syllabus */}
          <div className="mt-12 lg:mt-0">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Course Syllabus</h3>
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {lessons.map((lesson) => (
                  <li key={lesson.id} className="bg-gray-50 px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {isEnrolled || lesson.is_free ? (
                          <PlayCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <Lock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                        <p className="text-xs text-gray-500">{Math.floor(lesson.duration_seconds / 60)} mins</p>
                      </div>
                    </div>
                    {lesson.is_free && !isEnrolled && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Free Preview
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
