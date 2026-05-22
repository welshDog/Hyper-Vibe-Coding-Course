import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import { useNavigate } from 'react-router-dom'

type Signup = {
  email: string
  full_name: string | null
  subscription_tier: string
  broski_tokens: number
  role: string
  created_at: string
}

export default function SignupsDashboard() {
  const [signups, setSignups] = useState<Signup[]>([])
  const [loading, setLoading] = useState(true)
  const [liveCount, setLiveCount] = useState(0)
  const [authed, setAuthed] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const supabase = createClient()

    async function init() {
      // 🔒 Auth guard — check user + admin role
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') { navigate('/'); return }

      setAuthed(true)

      // Load all signups
      const { data } = await supabase
        .from('users')
        .select('email, full_name, subscription_tier, broski_tokens, role, created_at')
        .order('created_at', { ascending: false })

      setSignups(data || [])
      setLoading(false)

      // 🔴 LIVE — fires on every new INSERT into public.users
      const channel = supabase
        .channel('admin-signups-live')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'users' },
          (payload) => {
            setSignups((prev) => [payload.new as Signup, ...prev])
            setLiveCount((c) => c + 1)
          }
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }

    init()
  }, [])

  const tierColor = (tier: string) =>
    ({
      free: 'bg-gray-700 text-gray-200',
      pro: 'bg-purple-700 text-white',
      enterprise: 'bg-yellow-500 text-black',
    } as Record<string, string>)[tier] ?? 'bg-gray-600 text-white'

  if (loading || !authed) return (
    <div className="flex items-center justify-center h-screen bg-gray-950 text-white text-2xl">
      ⚡ Loading HyperVibe HQ...
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-purple-400">
          🧠 HyperVibe Signups HQ
        </h1>
        <div className="flex gap-6 mt-3">
          <span className="text-gray-400">
            Total: <strong className="text-white">{signups.length}</strong>
          </span>
          {liveCount > 0 && (
            <span className="text-green-400 animate-pulse">
              🔴 +{liveCount} new this session!
            </span>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {['free', 'pro', 'enterprise'].map((tier) => (
          <div key={tier} className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">
              {signups.filter((s) => s.subscription_tier === tier).length}
            </div>
            <div className="text-gray-400 capitalize">{tier}</div>
          </div>
        ))}
      </div>

      {/* Live Table */}
      <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
        <table className="w-full">
          <thead className="bg-gray-800 text-gray-400 text-sm uppercase">
            <tr>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Tier</th>
              <th className="p-4 text-left">BROski$</th>
              <th className="p-4 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {signups.map((s, i) => (
              <tr
                key={s.email + i}
                className="border-t border-gray-800 hover:bg-gray-800 transition-colors"
              >
                <td className="p-4 font-mono text-sm text-blue-300">{s.email}</td>
                <td className="p-4 text-gray-300">{s.full_name || '—'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${tierColor(s.subscription_tier)}`}>
                    {s.subscription_tier}
                  </span>
                </td>
                <td className="p-4 text-yellow-400 font-bold">💰 {s.broski_tokens ?? 0}</td>
                <td className="p-4 text-gray-500 text-sm">
                  {new Date(s.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {signups.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            No signups yet — go launch something! 🚀
          </div>
        )}
      </div>
    </div>
  )
}
