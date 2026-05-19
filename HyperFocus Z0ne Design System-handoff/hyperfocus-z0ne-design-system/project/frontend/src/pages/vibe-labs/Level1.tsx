import { Link } from 'react-router-dom';

export default function VibeLabLevel1() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link to="/vibe-labs" className="text-purple-400 hover:text-purple-300 text-sm mb-8 inline-block">← Back to Labs</Link>

        <div className="mb-10">
          <span className="text-xs text-purple-400 font-mono uppercase tracking-widest">Level 1</span>
          <h1 className="text-4xl font-bold text-white mt-2 mb-4">Hello World, BROski Style 👋</h1>
          <p className="text-gray-300 text-lg">
            Every legend starts here. You're going to write your first component, understand why React thinks the way it does, and ship something real.
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-purple-400 mb-3">🛑 STOP — Read This First</h2>
            <p className="text-gray-300">
              React is just JavaScript that knows how to update a webpage without refreshing it. That's it. The fancy words come later. For now: think of a component like a LEGO brick — small, reusable, snaps together.
            </p>
          </section>

          <section className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-yellow-400 mb-3">💡 WHY this matters</h2>
            <p className="text-gray-300">
              Netflix, Spotify, GitHub — all built with components. When you master this, you're thinking the same way their engineers do. For real.
            </p>
          </section>

          <section className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-green-400 mb-3">⚙️ HOW — Your Mission</h2>
            <ol className="text-gray-300 space-y-3 list-decimal list-inside">
              <li>Create a new file: <code className="text-purple-300">src/components/HelloBro.tsx</code></li>
              <li>Write a component that displays your name + "is building" + something you're proud of</li>
              <li>Import it into <code className="text-purple-300">App.tsx</code> and render it</li>
              <li>Run <code className="text-purple-300">npm run dev</code> — see it live 🎉</li>
            </ol>
          </section>

          <section className="bg-purple-950/40 rounded-xl p-6 border border-purple-700">
            <h2 className="text-xl font-bold text-purple-300 mb-3">🏆 WIN — Claim Your XP</h2>
            <p className="text-gray-300 mb-4">
              Screenshot your running component and post it in the Discord <span className="text-purple-400">#wins</span> channel. Tag @welshDog. Claim your <span className="text-yellow-400">+50 BROski$</span>.
            </p>
            <div className="bg-gray-900 rounded-lg p-3 text-sm text-gray-400 font-mono">
              /claim level-1 ✅
            </div>
          </section>

          <div className="flex justify-between items-center pt-4">
            <Link to="/vibe-labs" className="text-gray-400 hover:text-white transition-colors">← All Labs</Link>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Next up:</p>
              <span className="text-purple-400 font-semibold">Level 2 — Components &amp; Chaos 🔒</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
