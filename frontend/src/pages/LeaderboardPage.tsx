import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface LeaderboardRow {
  rank: number;
  display_name: string | null;
  avatar_url: string | null;
  total_xp: number;
  level: number;
  streak_days: number;
  tokens: number;
}

const MEDAL = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('rank', { ascending: true })
        .limit(50);
      if (error) {
        setError('Could not load leaderboard.');
      } else {
        setRows(data as LeaderboardRow[]);
      }
      setLoading(false);
    }
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-purple-400 text-xl">
        ⚡ Loading BROski Hall of Fame...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">
        🏆 BROski Hall of Fame
      </h1>
      <p className="text-purple-300 mb-8 text-sm">
        Top learners by XP — refreshes live. Keep vibing to climb! ⚡
      </p>

      {rows.length === 0 ? (
        <p className="text-gray-400">No one on the board yet — be the first! 🚀</p>
      ) : (
        <div className="space-y-3" data-testid="leaderboard-rows">
          {rows.map((row) => {
            const rankIdx = row.rank - 1;
            const medal = rankIdx < 3 ? MEDAL[rankIdx] : `#${row.rank}`;
            const initials = row.display_name
              ? row.display_name.slice(0, 2).toUpperCase()
              : '??';

            return (
              <div
                key={row.rank}
                className={`flex items-center gap-4 rounded-xl px-5 py-4 ${
                  rankIdx === 0
                    ? 'bg-yellow-500/10 border border-yellow-500/30'
                    : rankIdx === 1
                    ? 'bg-gray-400/10 border border-gray-400/20'
                    : rankIdx === 2
                    ? 'bg-amber-700/10 border border-amber-700/20'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {/* Rank */}
                <span className="text-2xl w-10 text-center">{medal}</span>

                {/* Avatar */}
                {row.avatar_url ? (
                  <img
                    src={row.avatar_url}
                    alt={row.display_name ?? 'avatar'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white text-sm font-bold">
                    {initials}
                  </div>
                )}

                {/* Name + level */}
                <div className="flex-1">
                  <p className="text-white font-semibold">
                    {row.display_name ?? 'Anonymous BROski'}
                  </p>
                  <p className="text-purple-400 text-xs">
                    Level {row.level} &middot; {row.streak_days}🔥 streak
                  </p>
                </div>

                {/* XP */}
                <div className="text-right">
                  <p className="text-yellow-300 font-bold">{row.total_xp.toLocaleString()} XP</p>
                  <p className="text-purple-300 text-xs">{row.tokens} BROski$</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
