import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../context/auth';

interface LeaderboardRow {
  rank: number;
  display_name: string | null;
  avatar_url: string | null;
  level: number;
  total_xp: number;
  streak_days: number;
}

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

export default function Leaderboard() {
  const { user } = useAuthStore();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('leaderboard')
        .select('rank, display_name, avatar_url, level, total_xp, streak_days')
        .order('rank', { ascending: true })
        .limit(50);

      if (error) {
        setError('Could not load leaderboard.');
        setRows([]);
      } else {
        setRows((data as LeaderboardRow[]) ?? []);
      }
      setLoading(false);
    }
    void fetchLeaderboard();
  }, []);

  const me = useMemo(() => {
    const candidate = user?.full_name ?? user?.email ?? null;
    return candidate ? normalizeName(candidate) : null;
  }, [user?.email, user?.full_name]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-gray-300">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-red-300">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
        <p className="text-purple-300 text-sm mt-2">
          Rank up by stacking XP and keeping the streak alive.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">Rank</th>
              <th className="px-4 py-3 font-semibold">Player</th>
              <th className="px-4 py-3 font-semibold">Level</th>
              <th className="px-4 py-3 font-semibold">Total XP</th>
              <th className="px-4 py-3 font-semibold">Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row) => {
              const display = row.display_name ?? 'Anonymous BROski';
              const isMe = me ? normalizeName(display) === me : false;
              const initials = display.slice(0, 2).toUpperCase();

              return (
                <tr
                  key={row.rank}
                  className={isMe ? 'bg-purple-600/15' : 'hover:bg-white/5'}
                >
                  <td className="px-4 py-3 text-gray-200 font-semibold">
                    {row.rank}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {row.avatar_url ? (
                        <img
                          src={row.avatar_url}
                          alt={display}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-bold">
                          {initials}
                        </div>
                      )}
                      <div className="text-gray-100 font-medium">{display}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-200">{row.level}</td>
                  <td className="px-4 py-3 text-yellow-300 font-semibold">
                    {row.total_xp.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-purple-200">
                    {row.streak_days} days
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-gray-300 text-center">
                  No leaderboard entries yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
