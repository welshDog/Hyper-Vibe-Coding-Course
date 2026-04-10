import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;
type Status = 'idle' | 'loading' | 'success' | 'error';

type FormState = {
  tester_type: string;
  platform_description: string;
  target_audience: string;
  would_pay: boolean | null;
  pay_reason: string;
  confusion: string;
  loved: string;
  overall_rating: number;
};

type TesterOption = {
  value: string;
  label: string;
  emoji: string;
};

// ─── Static data ──────────────────────────────────────────────────────────────

const TESTER_OPTIONS: TesterOption[] = [
  { value: 'adhd_learner',  label: 'ADHD / Neurodivergent Learner', emoji: '🧠' },
  { value: 'non_coder',     label: 'Complete Non-Coder',            emoji: '👋' },
  { value: 'junior_dev',    label: 'Junior Developer',              emoji: '💻' },
  { value: 'mobile_user',   label: 'Mobile User',                   emoji: '📱' },
  { value: 'skeptic',       label: 'Skeptic / Never coded before',  emoji: '🤔' },
  { value: 'other',         label: 'Something else',                emoji: '✨' },
];

const RATING_LABELS: Record<number, string> = {
  1: 'Not quite there yet',
  2: 'Some work needed',
  3: 'Getting there',
  4: 'Really good!',
  5: 'Ship it! 🚀',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressDots({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2 mt-4">
      {([1, 2, 3] as Step[]).map((s) => (
        <div
          key={s}
          className={cn('w-3 h-3 rounded-full transition-all', {
            'bg-violet-500': s === step,
            'bg-violet-500/40': s < step,
            'bg-gray-700': s > step,
          })}
        />
      ))}
      <span className="ml-2 text-xs text-gray-500">Step {step} of 3</span>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-gray-300 text-sm font-medium mb-2">{children}</label>
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg p-3 w-full resize-none focus:outline-none focus:border-violet-500 transition-colors"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PlaytestFeedback() {
  const [step, setStep] = useState<Step>(1);
  const [status, setStatus] = useState<Status>('idle');
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState<FormState>({
    tester_type: '',
    platform_description: '',
    target_audience: '',
    would_pay: null,
    pay_reason: '',
    confusion: '',
    loved: '',
    overall_rating: 0,
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setStatus('loading');
    const { error } = await supabase.from('playtest_responses').insert({
      tester_type:          form.tester_type,
      platform_description: form.platform_description  || null,
      target_audience:      form.target_audience       || null,
      would_pay:            form.would_pay,
      pay_reason:           form.pay_reason            || null,
      confusion:            form.confusion             || null,
      loved:                form.loved                 || null,
      overall_rating:       form.overall_rating        || null,
    });
    setStatus(error ? 'error' : 'success');
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md py-16">
          <p className="text-5xl">🎉</p>
          <h2 className="text-white text-3xl font-bold mt-4">Thank you so much!</h2>
          <p className="text-gray-400 text-lg mt-2">
            Your feedback goes straight into the builder's hands.
            This is exactly what makes the platform better. 🏴󠁧󠁢󠁷󠁬󠁳󠁠
          </p>
          <Link
            to="/"
            className="text-violet-400 hover:text-violet-300 mt-6 block text-center transition-colors"
          >
            ← Back to the platform
          </Link>
        </div>
      </div>
    );
  }

  // ── Shared shell ───────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-950 min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* Top bar */}
        <div className="mb-10">
          <span className="inline-flex items-center bg-violet-500/10 text-violet-300 border border-violet-500/30 rounded-full px-4 py-1 text-sm">
            🧪 Hyper Vibe — Playtest Feedback
          </span>
          <ProgressDots step={step} />
        </div>

        {/* ── STEP 1 — Who are you? ─────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 className="text-white text-2xl font-bold">First — who are you?</h2>
            <p className="text-gray-400 mt-1 mb-6">
              This helps me understand which type of user you are.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {TESTER_OPTIONS.map(({ value, label, emoji }) => {
                const selected = form.tester_type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update('tester_type', value)}
                    className={cn(
                      'cursor-pointer rounded-xl p-4 border-2 text-left transition-all',
                      selected
                        ? 'border-violet-500 bg-violet-500/10 text-white'
                        : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600',
                    )}
                  >
                    <span className="text-2xl block mb-2">{emoji}</span>
                    <span className="text-sm font-medium leading-snug">{label}</span>
                  </button>
                );
              })}
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!form.tester_type}
              className="w-full mt-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg disabled:opacity-40"
            >
              Next →
            </Button>
          </div>
        )}

        {/* ── STEP 2 — Core questions ───────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-white text-2xl font-bold">Your honest thoughts 💬</h2>
              <p className="text-gray-400 mt-1">No wrong answers. Brutal is better.</p>
            </div>

            {/* Q1 — Platform description */}
            <div>
              <FieldLabel>In one sentence — what does this platform do?</FieldLabel>
              <Textarea
                value={form.platform_description}
                onChange={(v) => update('platform_description', v)}
                placeholder="It's a platform that..."
              />
            </div>

            {/* Q2 — Target audience */}
            <div>
              <FieldLabel>Who do you think it's built for?</FieldLabel>
              <Textarea
                value={form.target_audience}
                onChange={(v) => update('target_audience', v)}
                placeholder="I think it's for people who..."
              />
            </div>

            {/* Q3 — Would you pay £29? */}
            <div>
              <FieldLabel>Would you pay £29 for a course here?</FieldLabel>
              <div className="flex gap-3">
                {([true, false] as const).map((val) => {
                  const isYes = val === true;
                  const selected = form.would_pay === val;
                  return (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => update('would_pay', val)}
                      className={cn(
                        'border-2 rounded-lg px-6 py-3 font-semibold transition-all flex-1',
                        selected && isYes
                          ? 'bg-green-500/20 border-green-500 text-green-400'
                          : selected && !isYes
                          ? 'bg-red-500/20 border-red-500 text-red-400'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600',
                      )}
                    >
                      {isYes ? '✅ Yes' : '❌ No'}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3">
                <FieldLabel>Why / why not?</FieldLabel>
                <Textarea
                  value={form.pay_reason}
                  onChange={(v) => update('pay_reason', v)}
                  placeholder="Because..."
                />
              </div>
            </div>

            {/* Q4 — Confusion */}
            <div>
              <FieldLabel>What confused you or felt broken?</FieldLabel>
              <Textarea
                value={form.confusion}
                onChange={(v) => update('confusion', v)}
                placeholder="The [X] page was confusing because..."
                rows={3}
              />
            </div>

            {/* Q5 — Loved */}
            <div>
              <FieldLabel>What did you actually like?</FieldLabel>
              <Textarea
                value={form.loved}
                onChange={(v) => update('loved', v)}
                placeholder="I liked..."
              />
            </div>

            <Button
              onClick={() => setStep(3)}
              disabled={!form.platform_description && !form.target_audience}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg disabled:opacity-40"
            >
              Almost done →
            </Button>
          </div>
        )}

        {/* ── STEP 3 — Rating + submit ──────────────────────────────────── */}
        {step === 3 && (
          <div>
            <h2 className="text-white text-2xl font-bold">Last one — overall rating</h2>
            <p className="text-gray-400 mt-1 mb-8">How would you rate the experience overall?</p>

            {/* Star rating */}
            <div
              className="flex gap-3 mb-3"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoverRating || form.overall_rating);
                return (
                  <span
                    key={star}
                    role="button"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    tabIndex={0}
                    className={cn(
                      'text-4xl cursor-pointer transition-opacity select-none',
                      active ? 'opacity-100' : 'opacity-30',
                    )}
                    onMouseEnter={() => setHoverRating(star)}
                    onClick={() => update('overall_rating', star)}
                    onKeyDown={(e) => e.key === 'Enter' && update('overall_rating', star)}
                  >
                    ⭐
                  </span>
                );
              })}
            </div>

            {/* Rating label */}
            <p className="text-gray-400 text-sm h-5">
              {RATING_LABELS[hoverRating || form.overall_rating] ?? ''}
            </p>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={status === 'loading'}
              className="w-full mt-10 py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg rounded-xl disabled:opacity-50"
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Feedback 🏴󠁧󠁢󠁷󠁬󠁳󠁠'
              )}
            </Button>

            {status === 'error' && (
              <p className="text-red-400 text-sm mt-3 text-center">
                Something went wrong. Please try again.
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
