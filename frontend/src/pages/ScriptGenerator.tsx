import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check, Clock, BookOpen, Wrench, Trophy, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { VIBE_CODING_FOUNDATIONS, type Module, type ScriptSection, type ModuleType } from '../lib/curriculum-data';

// ─── localStorage hook ────────────────────────────────────────────────────────

const LS_KEY = 'hyper-vibe-recorded-modules';

function useRecordedModules() {
  const [recorded, setRecorded] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      return new Set(stored ? (JSON.parse(stored) as string[]) : []);
    } catch {
      return new Set<string>();
    }
  });

  function toggle(moduleId: string) {
    setRecorded((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      try {
        localStorage.setItem(LS_KEY, JSON.stringify([...next]));
      } catch {
        // localStorage unavailable — state still updates in memory
      }
      return next;
    });
  }

  return { recorded, toggle };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function moduleTypeIcon(type: ModuleType) {
  switch (type) {
    case 'lesson':  return <BookOpen className="w-4 h-4" />;
    case 'lab':     return <Wrench className="w-4 h-4" />;
    case 'project': return <Trophy className="w-4 h-4" />;
    case 'quiz':    return <HelpCircle className="w-4 h-4" />;
  }
}

function moduleTypeBadge(type: ModuleType) {
  const base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium';
  const colors: Record<ModuleType, string> = {
    lesson:  'bg-purple-100 text-purple-700',
    lab:     'bg-blue-100 text-blue-700',
    project: 'bg-amber-100 text-amber-700',
    quiz:    'bg-green-100 text-green-700',
  };
  return (
    <span className={cn(base, colors[type])}>
      {moduleTypeIcon(type)}
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

// ─── Script section card ──────────────────────────────────────────────────────

function ScriptSectionCard({ section, index }: { section: ScriptSection; index: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(section.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="font-semibold text-sm text-gray-800">{section.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {section.duration}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-300 hover:bg-white transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <pre className="p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed bg-white">
        {section.content}
      </pre>
    </div>
  );
}

// ─── Full script copy ─────────────────────────────────────────────────────────

function CopyFullScript({ module }: { module: Module }) {
  const [copied, setCopied] = useState(false);

  if (!module.script) return null;

  const fullText = [
    `# ${module.title}`,
    `Total Duration: ${module.script.totalDuration}`,
    '',
    ...module.script.sections.flatMap((s, i) => [
      `## [${i + 1}] ${s.label} — ${s.duration}`,
      s.content,
      '',
    ]),
  ].join('\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Script copied to clipboard!' : 'Copy full script'}
    </button>
  );
}

// ─── Module panel ─────────────────────────────────────────────────────────────

function ModulePanel({
  module,
  recorded,
  onToggle,
}: {
  module: Module;
  recorded: boolean;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasScript = Boolean(module.script);

  return (
    <div
      className={cn(
        'border rounded-xl overflow-hidden transition-all',
        recorded ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white',
      )}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
        onClick={() => hasScript && setOpen((o) => !o)}
      >
        <span className="text-gray-400 w-5 flex-shrink-0">
          {hasScript ? (
            open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            <span className="w-4 h-4" />
          )}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">
              {module.order}. {module.title}
            </span>
            {moduleTypeBadge(module.type)}
            {module.badgesAwarded?.length ? (
              <span className="text-xs text-amber-600 font-medium">🏅 Awards badge</span>
            ) : null}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{module.keyConceptSummary}</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {module.durationMinutes} min
          </span>
          {module.xpAwarded ? (
            <span className="text-xs font-medium text-purple-600">+{module.xpAwarded} XP</span>
          ) : null}
          {hasScript && (
            <label
              className="flex items-center gap-1.5 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={recorded}
                onChange={onToggle}
                className="w-4 h-4 accent-green-600"
              />
              <span className="text-xs text-gray-500">{recorded ? 'Recorded ✓' : 'Recorded'}</span>
            </label>
          )}
        </div>
      </div>

      {/* Expanded script */}
      {open && module.script && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <strong>Total:</strong>&nbsp;{module.script.totalDuration}
              </span>
              <span>{module.script.sections.length} sections</span>
            </div>
            <CopyFullScript module={module} />
          </div>

          {/* Recording checklist */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
            <p className="font-semibold text-gray-700 mb-2">Before you hit record:</p>
            {[
              'Screen recording software open (OBS / Loom / Descript)',
              'Replit / demo tab ready in browser',
              'Mic levels tested',
              'Notifications silenced',
              'Script printed or on second monitor',
            ].map((item) => (
              <label key={item} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-purple-600" />
                {item}
              </label>
            ))}
          </div>

          {/* Script sections */}
          <div className="space-y-3">
            {module.script.sections.map((section, i) => (
              <ScriptSectionCard key={i} section={section} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* No script note */}
      {open && !module.script && (
        <div className="px-5 pb-4 pt-2 text-sm text-gray-400 italic border-t border-gray-100">
          No video script — this is a {module.type} module.
          {module.deliverable && (
            <p className="mt-1 not-italic text-gray-600">
              <strong>Deliverable:</strong> {module.deliverable}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Week section ─────────────────────────────────────────────────────────────

function WeekSection({
  week,
  defaultOpen,
  recordedSet,
  onToggle,
}: {
  week: (typeof VIBE_CODING_FOUNDATIONS.weeks)[0];
  defaultOpen: boolean;
  recordedSet: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const scriptModules = week.modules.filter((m) => m.script);
  const totalMinutes = week.modules.reduce((sum, m) => sum + m.durationMinutes, 0);

  return (
    <section className="mb-6">
      <button
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          {open ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          <div className="text-left">
            <div className="font-bold text-base">Week {week.order}: {week.title}</div>
            <div className="text-xs text-gray-400 mt-0.5">{week.tagline}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>{scriptModules.length} script{scriptModules.length !== 1 ? 's' : ''}</span>
          <span>{totalMinutes} min content</span>
          <span className="text-purple-400 font-medium">+{week.xpAvailable} XP available</span>
        </div>
      </button>

      {open && (
        <div className="mt-3 space-y-2 pl-2">
          {week.modules.map((module) => (
            <ModulePanel
              key={module.id}
              module={module}
              recorded={recordedSet.has(module.id)}
              onToggle={() => onToggle(module.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScriptGenerator() {
  const course = VIBE_CODING_FOUNDATIONS;
  const { recorded: recordedSet, toggle: toggleRecorded } = useRecordedModules();

  const allModules = course.weeks.flatMap((w) => w.modules);
  const scriptModules = allModules.filter((m) => m.script);
  const recordedCount = scriptModules.filter((m) => recordedSet.has(m.id)).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-medium text-purple-400 uppercase tracking-widest mb-2">
                Instructor Tool — Internal Only
              </div>
              <h1 className="text-2xl font-bold text-white">{course.title}</h1>
              <p className="text-gray-400 text-sm mt-1">{course.subtitle}</p>
            </div>
            <div className="text-right text-sm text-gray-400 space-y-1">
              <div>{course.durationWeeks} weeks · {course.hoursPerWeek}/week</div>
              <div>{course.level} · {course.tool}</div>
              <div className="text-purple-400">{scriptModules.length} of {allModules.length} modules have scripts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats — now shows recorded progress */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total modules', value: allModules.length, color: 'text-gray-900' },
            { label: 'Scripts ready', value: scriptModules.length, color: 'text-purple-600' },
            { label: 'Recorded', value: recordedCount, color: 'text-green-600' },
            { label: 'Still to record', value: scriptModules.length - recordedCount, color: 'text-amber-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div className={`text-3xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Recording progress bar */}
        {scriptModules.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Recording progress</span>
              <span className="font-medium">{recordedCount} / {scriptModules.length} scripts recorded</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${scriptModules.length > 0 ? (recordedCount / scriptModules.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Usage note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-sm text-amber-800">
          <strong>How to use:</strong> Click a week to expand. Click a module to see the recording script.
          Use "Copy full script" to paste into your teleprompter or notes. Check "Recorded" when done —
          progress saves automatically and survives page refresh.
        </div>

        {/* Weeks */}
        {course.weeks.map((week, i) => (
          <WeekSection
            key={week.id}
            week={week}
            defaultOpen={i === 0}
            recordedSet={recordedSet}
            onToggle={toggleRecorded}
          />
        ))}
      </div>
    </div>
  );
}
