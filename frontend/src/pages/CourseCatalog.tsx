import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Course } from '../types/database';
import {
  HVZButton,
  HVZCard,
  HVZTag,
  type TagColor,
} from '../components/ui/hvz';

const DIFFICULTY_TONE: Record<string, TagColor> = {
  beginner: 'mint',
  intermediate: 'amber',
  advanced: 'pink',
};

export default function CourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      setError(null);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        setError("Hmm, let's try that again 🔄 — couldn't load the catalog.");
      } else {
        setCourses(data ?? []);
      }
      setLoading(false);
    }

    void fetchCourses();
  }, []);

  return (
    <div className="bg-hfz-space-black min-h-screen py-12 sm:py-16">
      <div className="max-w-hfz-page mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 max-w-[65ch] mx-auto text-center">
          <HVZTag color="cyan">🎓 Catalog</HVZTag>
          <h1
            className="font-display font-extrabold tracking-hfz-tight mt-4 text-hfz-text-primary"
            style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              lineHeight: 1.05,
              background: 'none',
              WebkitTextFillColor: 'unset',
              textWrap: 'balance',
            }}
          >
            Pick your next{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--color-violet-lt), var(--color-neon-cyan))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              build session.
            </span>
          </h1>
          <p className="mt-4 text-hfz-body-lg text-hfz-text-secondary leading-[1.8]">
            Beginner to Hyper-Pro. Every course ends with a deployed thing you can show off.
          </p>
        </div>

        {loading ? (
          <p className="text-hfz-text-secondary text-center">Wiring up the Z0ne...</p>
        ) : error ? (
          <div className="rounded-hfz-md border border-hfz-danger/40 bg-hfz-danger/10 px-5 py-4 text-hfz-danger max-w-md mx-auto text-center">
            {error}
          </div>
        ) : courses.length === 0 ? (
          <HVZCard padding={32} style={{ maxWidth: 480, margin: '0 auto' }}>
            <p className="text-base text-hfz-text-secondary text-center m-0">
              Your courses will show up here — new drops soon. 🎯
            </p>
          </HVZCard>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const difficulty = course.difficulty ?? null;
              const description = course.description ?? 'Course details coming soon.';
              const thumbnail =
                course.thumbnail_url ??
                'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80';
              const isFree = course.price_pence === 0;
              const priceLabel = isFree
                ? 'Free'
                : `£${(course.price_pence / 100).toFixed(2).replace(/\.00$/, '')}`;

              return (
                <HVZCard key={course.id} padding={0} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div className="flex-shrink-0 relative">
                    <img
                      className="h-44 w-full object-cover"
                      src={thumbnail}
                      alt={course.title}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(15,27,53,0) 50%, rgba(15,27,53,0.85) 100%)',
                      }}
                    />
                  </div>

                  <div className="flex-1 p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      {difficulty ? (
                        <HVZTag color={DIFFICULTY_TONE[difficulty] ?? 'violet'}>
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </HVZTag>
                      ) : (
                        <HVZTag color="violet">Vibe Coding</HVZTag>
                      )}
                      {course.duration_minutes != null && (
                        <span className="flex items-center gap-1.5 text-xs text-hfz-text-secondary font-mono">
                          <Clock className="h-3.5 w-3.5" />
                          {Math.round(course.duration_minutes / 60)}h {course.duration_minutes % 60}m
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/catalog/${course.id}`}
                      className="block no-underline group flex-1"
                    >
                      <h2
                        className="font-display font-bold text-[20px] leading-[1.3] text-hfz-text-primary group-hover:text-hfz-cyan transition-colors mb-2"
                        style={{ background: 'none', WebkitTextFillColor: 'unset' }}
                      >
                        {course.title}
                      </h2>
                      <p className="text-sm text-hfz-text-secondary leading-relaxed line-clamp-3 m-0">
                        {description}
                      </p>
                    </Link>

                    <div className="mt-5 pt-4 border-t border-hfz-border-violet flex items-center justify-between gap-3">
                      <span
                        className={`font-display font-extrabold text-2xl tracking-hfz-tight ${
                          isFree ? 'text-hfz-mint' : 'text-hfz-text-primary'
                        }`}
                      >
                        {priceLabel}
                      </span>
                      <div className="flex items-center gap-2">
                        <Link to={`/learn/${course.id}?preview=true`} className="no-underline">
                          <HVZButton variant="ghost" size="sm">
                            ▶ Preview
                          </HVZButton>
                        </Link>
                        <Link to={`/catalog/${course.id}`} className="no-underline">
                          <HVZButton variant="primary" size="sm">
                            View →
                          </HVZButton>
                        </Link>
                      </div>
                    </div>
                  </div>
                </HVZCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
