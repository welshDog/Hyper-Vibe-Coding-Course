import { Link } from 'react-router-dom';

const levels = [
  { id: 1, title: 'Level 1 — Hello World, BROski Style', xp: 50, locked: false },
  { id: 2, title: 'Level 2 — Components & Chaos', xp: 100, locked: true },
  { id: 3, title: 'Level 3 — State & Superpowers', xp: 150, locked: true },
  { id: 4, title: 'Level 4 — API Connections', xp: 200, locked: true },
  { id: 5, title: 'Level 5 — Ship It to Production', xp: 300, locked: true },
];

export default function VibeLabs() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-purple-400 mb-4">⚡ Vibe Labs</h1>
          <p className="text-xl text-gray-300">
            Hands-on coding missions. Build real things. Earn BROski$.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Stop reading. Start building. Your brain learns best by doing.
          </p>
        </div>

        <div className="grid gap-6">
          {levels.map((level) => (
            <div
              key={level.id}
              className={`rounded-xl border p-6 flex items-center justify-between transition-all ${
                level.locked
                  ? 'border-gray-700 bg-gray-900/50 opacity-60'
                  : 'border-purple-500 bg-purple-950/30 hover:bg-purple-950/50'
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-2xl font-bold ${
                    level.locked ? 'text-gray-500' : 'text-purple-400'
                  }`}>
                    L{level.id}
                  </span>
                  {level.locked && (
                    <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">
                      🔒 Complete previous level first
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-white">{level.title}</h2>
                <p className="text-sm text-yellow-400 mt-1">+{level.xp} BROski$ XP</p>
              </div>

              {!level.locked ? (
                <Link
                  to={`/vibe-labs/level-${level.id}`}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-lg transition-colors"
                >
                  Enter →
                </Link>
              ) : (
                <button
                  disabled
                  className="bg-gray-700 text-gray-500 font-bold px-6 py-3 rounded-lg cursor-not-allowed"
                >
                  Locked
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Complete all levels to unlock your <span className="text-purple-400">Meta-Architect Certificate</span> 🏆</p>
        </div>
      </div>
    </main>
  );
}
