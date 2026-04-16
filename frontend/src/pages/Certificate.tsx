import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../context/auth';
import type { Course } from '../types/database';

type CertificateRecord = {
  id: string;
  issued_at: string;
};

export default function Certificate() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuthStore();
  const [cert, setCert] = useState<CertificateRecord | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !courseId) return;

    async function load() {
      const [{ data: certData, error: certErr }, { data: courseData, error: courseErr }] =
        await Promise.all([
          supabase
            .from('certificates')
            .select('id, issued_at')
            .eq('user_id', user!.id)
            .eq('course_id', courseId)
            .single(),
          supabase.from('courses').select('*').eq('id', courseId).single(),
        ]);

      if (certErr || !certData) {
        setError('Certificate not found. Complete the course first!');
      } else if (courseErr || !courseData) {
        setError('Course not found.');
      } else {
        setCert(certData);
        setCourse(courseData);
      }
      setLoading(false);
    }

    void load();
  }, [user, courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading certificate...</p>
      </div>
    );
  }

  if (error || !cert || !course || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 text-lg font-medium">{error ?? 'Something went wrong.'}</p>
        <Link to="/dashboard" className="text-primary hover:underline text-sm">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const issuedDate = new Date(cert.issued_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const certNumber = 'HVC-' + cert.id.replace(/-/g, '').slice(0, 10).toUpperCase();
  const recipientName = user.full_name || user.email;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 print:bg-white print:p-0">
      {/* Print / Back controls — hidden when printing */}
      <div className="flex gap-4 mb-6 print:hidden">
        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          ← Dashboard
        </Link>
        <button
          onClick={() => window.print()}
          className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Print / Save PDF
        </button>
      </div>

      {/* Certificate card */}
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:max-w-none"
        id="certificate"
      >
        {/* Top accent bar */}
        <div className="h-3 bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500" />

        <div className="px-16 py-14 text-center print:px-12 print:py-10">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-violet-500 mb-2">
              Hyper Vibe Coding Hub
            </p>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Certificate of Completion
            </h1>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-2xl">🏆</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Body */}
          <p className="text-gray-500 text-base mb-3">This certifies that</p>
          <p className="text-3xl font-black text-gray-900 mb-3">{recipientName}</p>
          <p className="text-gray-500 text-base mb-3">has successfully completed</p>
          <p className="text-2xl font-bold text-violet-700 mb-8">{course.title}</p>

          {/* Stars */}
          <div className="flex justify-center gap-1 mb-8 text-yellow-400 text-xl">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>★</span>
            ))}
          </div>

          {/* Date + cert number */}
          <div className="flex justify-between items-end mt-10 pt-8 border-t border-gray-100 text-left">
            <div>
              <p className="text-xs text-gray-400 mb-1">Date Issued</p>
              <p className="text-sm font-semibold text-gray-700">{issuedDate}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">Certificate ID</p>
              <p className="text-sm font-mono text-gray-500">{certNumber}</p>
            </div>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600" />
      </div>

      <p className="mt-6 text-xs text-gray-400 print:hidden">
        🐶 Built for neurodivergent learners — by @welshDog 🏴󠁧󠁢󠁷󠁬󠁳󠁿
      </p>
    </div>
  );
}
