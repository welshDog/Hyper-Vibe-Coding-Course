import { useAuthStore } from '../context/auth';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Enrollment, Course } from '../types/database';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { PlayCircle } from 'lucide-react';

type EnrolledCourse = Enrollment & {
  courses: Course;
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchEnrollments() {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (*)
        `)
        .eq('user_id', user!.id);

      if (error) {
        console.error('Error fetching enrollments:', error);
      } else {
        setEnrollments(data as EnrolledCourse[]);
      }
      setLoading(false);
    }

    fetchEnrollments();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p>Please log in to view your dashboard.</p>
        <Link to="/login">
          <Button className="mt-4">Log in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Welcome back, {(user.full_name || user.email || 'there').split(' ')[0]}!
          </h2>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            My Learning
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Continue where you left off.
          </p>
        </div>
        <div className="border-t border-gray-200">
          {loading ? (
            <div className="px-4 py-5 sm:p-6 text-center">Loading...</div>
          ) : enrollments.length === 0 ? (
            <div className="px-4 py-12 sm:p-6 text-center">
              <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
              <Link to="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {enrollments.map((enrollment) => (
                <li key={enrollment.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-md overflow-hidden">
                        <img 
                          src={enrollment.courses.thumbnail_url || 'https://via.placeholder.com/150'} 
                          alt={enrollment.courses.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-primary">
                          {enrollment.courses.title}
                        </h4>
                        <div className="mt-1 flex items-center">
                          <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                            <div 
                              className="h-2 bg-green-500 rounded-full" 
                              style={{ width: `${enrollment.progress_percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {enrollment.progress_percentage}% Complete
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/learn/${enrollment.course_id}`}>
                      <Button size="sm" className="flex items-center">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Continue
                      </Button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
