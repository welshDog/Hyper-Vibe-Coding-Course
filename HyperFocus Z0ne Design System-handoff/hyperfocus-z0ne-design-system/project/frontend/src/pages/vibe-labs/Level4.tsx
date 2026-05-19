import { Link } from 'react-router-dom';

export default function VibeLabLevel4() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link to="/vibe-labs" className="text-purple-400 hover:text-purple-300 text-sm mb-8 inline-block">← Back to Labs</Link>
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-4 mb-8">
          <p className="text-yellow-300 text-sm">⚠️ You're peeking ahead — complete Level 3 first to unlock this and claim your BROski$!</p>
        </div>
        <span className="text-xs text-purple-400 font-mono uppercase tracking-widest">Level 4</span>
        <h1 className="text-4xl font-bold text-white mt-2 mb-4">API Connections 🔌</h1>
        <p className="text-gray-400">Complete Level 3 to unlock this mission.</p>
        <div className="mt-8">
          <Link to="/vibe-labs/level-3" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-lg transition-colors">Start Level 3 →</Link>
        </div>
      </div>
    </main>
  );
}
