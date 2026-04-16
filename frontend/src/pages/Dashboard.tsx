import { useAuthStore } from '../context/auth';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Enrollment, Course } from '../types/database';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { PlayCircle, Coins, Award, Copy, Check, Users } from 'lucide-react';

type EnrolledCourse = Enrollment & {
  courses: Course;
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      const [{ data: enrollData, error: enrollErr }, { data: refCode }, { count: refCount }] =
        await Promise.all([
          supabase
            .from('enrollments')
            .select('*, courses (*)')
            .eq('user_id', user!.id),
          supabase.rpc('get_or_create_referral_code', { p_user_id: user!.id }),
          supabase
            .from('referrals')
            .select('*', { count: 'exact', head: true })
            .eq('referrer_user_id', user!.id),
        ]);

      if (enrollErr) {
        console.error('Error fetching enrollments:', enrollErr);
      } else {
        setEnrollments(enrollData as EnrolledCourse[]);
      }
      if (refCode) setReferralCode(refCode as string);
      setReferralCount(refCount ?? 0);
      setLoading(false);
    }

    fetchData();
  }, [user]);

  const referralLink = referralCode
    ? `${window.location.origin}/register?ref=${referralCode}`
    : null;

  const handleCopy = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      {/* ── BROski$ balance card ───────────────────────────────────────────── */}
      <Link to="/tokens" className="block mb-8">
        <div className="flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl px-6 py-4 hover:border-yellow-400 transition-colors">
          <Coins className="h-8 w-8 text-yellow-500 flex-shrink-0" />
          <div>
            <p className="text-2xl font-black text-yellow-600">
              {(user.broski_tokens ?? 0).toLocaleString()} BROski$
            </p>
            <p className="text-sm text-gray-500">Your token balance — earn by learning, spend in the Shop</p>
          </div>
          <span className="ml-auto text-sm font-semibold text-yellow-600 hidden sm:block">
            View &amp; top up →
          </span>
        </div>
      </Link>

      {/* ── Referral card ─────────────────────────────────────────────────────── */}
      {referralCode && (
        <div className="mb-8 bg-gradient-to-r from-indigo-50 to-violet-50 border border-violet-200 rounded-xl px-6 py-5">
          <div className="flex items-start gap-4">
            <Users className="h-6 w-6 text-violet-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm">Refer a friend — earn 100 BROski$</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Share your link. When they sign up, 100 BROski$ lands in your account instantly.
                {referralCount > 0 && (
                  <span className="ml-2 font-semibold text-violet-600">
                    {referralCount} successful referral{referralCount !== 1 ? 's' : ''} so far! 🔥
                  </span>
                )}
              </p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <code className="text-xs bg-white border border-violet-200 rounded px-3 py-1.5 text-violet-700 font-mono truncate max-w-xs">
                  {referralLink}
                </code>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-800 bg-white border border-violet-200 rounded px-3 py-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <div className="flex items-center gap-2">
                      {enrollment.progress_percentage === 100 && (
                        <Link to={`/certificate/${enrollment.course_id}`}>
                          <Button size="sm" variant="outline" className="flex items-center gap-1 border-yellow-400 text-yellow-700 hover:bg-yellow-50">
                            <Award className="h-4 w-4" />
                            Certificate
                          </Button>
                        </Link>
                      )}
                      <Link to={`/learn/${enrollment.course_id}`}>
                        <Button size="sm" className="flex items-center">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          {enrollment.progress_percentage === 100 ? 'Review' : 'Continue'}
                        </Button>
                      </Link>
                    </div>
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
