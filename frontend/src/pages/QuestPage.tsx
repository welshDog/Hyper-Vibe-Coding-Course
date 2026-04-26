import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useHUD } from '../hooks/useHUD';
import { useAuthStore } from '../context/auth';

interface Quest {
  id: string;
  title: string;
  description: string | null;
  xp_reward: number;
  token_reward: number;
  quest_type: string;
  sort_order: number;
}

interface CompleteResult {
  success: boolean;
  xp_awarded?: number;
  tokens_awarded?: number;
  rift_multiplier?: number;
  error?: string;
}

export default function QuestPage() {
  const { user } = useAuthStore();
  const { awardXP } = useHUD();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuests() {
      setLoading(true);
      const { data } = await supabase
        .from('quests')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      setQuests((data as Quest[]) ?? []);

      if (user?.id) {
        const { data: doneData } = await supabase
          .from('user_quests')
          .select('quest_id')
          .eq('user_id', user.id);
        setCompleted(new Set((doneData ?? []).map((r: { quest_id: string }) => r.quest_id)));
      }
      setLoading(false);
    }
    fetchQuests();
  }, [user?.id]);

  async function handleComplete(questId: string, xpReward: number) {
    if (!user) return;
    setCompleting(questId);
    const { data, error } = await supabase
      .rpc('complete_quest', { p_quest_id: questId });

    if (error || !(data as CompleteResult)?.success) {
      setFlash((data as CompleteResult)?.error ?? error?.message ?? 'Something went wrong');
      setTimeout(() => setFlash(null), 3000);
    } else {
      const result = data as CompleteResult;
      const awarded = result.xp_awarded ?? xpReward;
      awardXP(awarded);
      setCompleted((prev) => new Set([...prev, questId]));
      const mult = result.rift_multiplier && result.rift_multiplier > 1
        ? ` (${result.rift_multiplier}x Rift!)` : '';
      setFlash(`+${awarded} XP${mult} — Quest complete! 🎉`);
      setTimeout(() => setFlash(null), 3000);
    }
    setCompleting(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-purple-400 text-xl">
        ⚡ Loading quests...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">⚔️ Quests</h1>
      <p className="text-purple-300 mb-8 text-sm">
        Complete quests to earn XP + BROski$ tokens. Active Rifts double your rewards! 🌀
      </p>

      {flash && (
        <div className="mb-6 rounded-xl bg-purple-700/30 border border-purple-500/40 px-5 py-3 text-purple-200 font-medium">
          {flash}
        </div>
      )}

      <div className="space-y-4">
        {quests.map((quest) => {
          const done = completed.has(quest.id);
          return (
            <div
              key={quest.id}
              data-testid="quest-row"
              className={`rounded-xl px-5 py-4 border flex items-center gap-4 ${
                done
                  ? 'bg-green-900/20 border-green-700/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex-1">
                <p className={`font-semibold ${ done ? 'text-green-400 line-through' : 'text-white' }`}>
                  {quest.title}
                </p>
                {quest.description && (
                  <p className="text-gray-400 text-sm mt-0.5">{quest.description}</p>
                )}
                <p className="text-purple-300 text-xs mt-1">
                  +{quest.xp_reward} XP
                  {quest.token_reward > 0 && ` · +${quest.token_reward} BROski$`}
                </p>
              </div>

              {done ? (
                <span className="text-green-400 text-xl">✅</span>
              ) : (
                <button
                  onClick={() => handleComplete(quest.id, quest.xp_reward)}
                  disabled={completing === quest.id}
                  data-testid={`complete-quest-${quest.id}`}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50
                             text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {completing === quest.id ? '...' : 'Complete ✨'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
