import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Course } from '../types/database';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

export default function CourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching courses:', error);
      } else {
        setCourses(data || []);
      }
      setLoading(false);
    }

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Course Catalog
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Explore our wide range of coding courses designed to take you from beginner to pro.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {courses.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No courses available at the moment. Check back soon!</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="flex-shrink-0">
                <img
                  className="h-48 w-full object-cover"
                  src={course.thumbnail_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80'}
                  alt={course.title}
                />
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      course.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      {Math.round(course.duration_minutes / 60)}h {course.duration_minutes % 60}m
                    </div>
                  </div>
                  <Link to={`/courses/${course.id}`} className="block mt-2">
                    <p className="text-xl font-semibold text-gray-900 hover:text-primary transition-colors">
                      {course.title}
                    </p>
                    <p className="mt-3 text-base text-gray-500 line-clamp-3">
                      {course.description}
                    </p>
                  </Link>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-900">
                      ${course.price}
                    </span>
                  </div>
                  <Link to={`/courses/${course.id}`}>
                    <Button>View Course</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
