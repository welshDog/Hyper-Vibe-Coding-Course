import { useAuthStore } from '../store/authStore'
import { getLevelName, getXpToNextLevel } from '../store/gamificationStore'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuthStore()

  if (!user) return null

  const { current, needed, pct } = getXpToNextLevel(user.totalXp)
  const levelName = getLevelName(user.currentLevel)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero: Resume button - big & obvious for ADHD brains */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-2xl p-6">
        <h1 className="text-2xl font-bold">Hey {user.displayName}! 👋</h1>
        <p className="text-gray-300 mt-1">Level {user.currentLevel} · {levelName}</p>
        <Link
          to="/courses"
          className="mt-4 inline-block bg-purple-500 hover:bg-purple-400 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors"
        >
          🚀 Resume Where I Left Off
        </Link>
      </div>

      {/* XP Progress Bar */}
      <div className="bg-gray-800 rounded-xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-purple-400 font-bold">{user.totalXp} XP total</span>
          <span className="text-gray-400">{current}/{needed} to next level</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard emoji="🔥" label="Streak" value={`${user.currentStreak} days`} />
        <StatCard emoji="💜" label="BROski$" value={user.broskiCoins.toString()} />
        <StatCard emoji="⚡" label="Level" value={user.currentLevel.toString()} />
      </div>
    </div>
  )
}

function StatCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 text-center">
      <div className="text-2xl">{emoji}</div>
      <div className="text-gray-400 text-xs mt-1">{label}</div>
      <div className="text-white font-bold text-lg">{value}</div>
    </div>
  )
}
