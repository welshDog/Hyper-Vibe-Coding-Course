/**
 * AdminRiftPanel — embedded inside the existing Admin page.
 * Shows current active rift + open/close controls.
 * Writes directly to Supabase `rifts` table (admin RLS guards the insert).
 */
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface ActiveRift {
  id: string;
  topic: string;
  multiplier: number;
  expires_at: string;
  description: string | null;
}

export default function AdminRiftPanel() {
  const [activeRift, setActiveRift] = useState<ActiveRift | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // New rift form state
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [multiplier, setMultiplier] = useState(2);
  const [durationMins, setDurationMins] = useState(45);

  async function fetchActiveRift() {
    const { data } = await supabase
      .from('rifts')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setActiveRift(data as ActiveRift | null);
    setLoading(false);
  }

  useEffect(() => {
    fetchActiveRift();
    const interval = setInterval(fetchActiveRift, 15000);
    return () => clearInterval(interval);
  }, []);

  async function openRift() {
    if (!topic.trim()) { setMsg('Topic is required!'); return; }
    setBusy(true);
    const expiresAt = new Date(Date.now() + durationMins * 60 * 1000).toISOString();
    const { error } = await supabase.from('rifts').insert({
      topic: topic.trim(),
      description: description.trim() || null,
      multiplier,
      expires_at: expiresAt,
    });
    if (error) {
      setMsg(`Error: ${error.message}`);
    } else {
      setMsg(`🌀 Rift "${topic}" opened! ${durationMins} mins · ${multiplier}x XP`);
      setTopic('');
      setDescription('');
      await fetchActiveRift();
    }
    setBusy(false);
    setTimeout(() => setMsg(null), 4000);
  }

  async function closeRift() {
    if (!activeRift) return;
    setBusy(true);
    const { error } = await supabase
      .from('rifts')
      .update({ expires_at: new Date().toISOString() })
      .eq('id', activeRift.id);
    if (error) {
      setMsg(`Error: ${error.message}`);
    } else {
      setMsg('Rift closed ✅');
      setActiveRift(null);
    }
    setBusy(false);
    setTimeout(() => setMsg(null), 3000);
  }

  if (loading) return <p className="text-gray-400 text-sm">Loading rift status...</p>;

  return (
    <section
      data-testid="admin-rift-panel"
      className="bg-white/5 border border-purple-500/20 rounded-2xl p-6 mt-6"
    >
      <h2 className="text-xl font-bold text-white mb-4">🌀 Rift Control</h2>

      {msg && (
        <div className="mb-4 rounded-lg bg-purple-700/20 border border-purple-500/30 px-4 py-2 text-purple-200 text-sm">
          {msg}
        </div>
      )}

      {/* Active rift status */}
      {activeRift ? (
        <div className="mb-6 rounded-xl bg-purple-900/30 border border-purple-500/40 px-5 py-4">
          <p className="text-purple-200 font-semibold">
            🌀 Active Rift: <span className="text-white">{activeRift.topic}</span>
          </p>
          <p className="text-purple-300 text-sm mt-1">
            {activeRift.multiplier}x XP &middot; Expires{' '}
            {new Date(activeRift.expires_at).toLocaleTimeString()}
          </p>
          {activeRift.description && (
            <p className="text-gray-400 text-sm mt-1">{activeRift.description}</p>
          )}
          <button
            onClick={closeRift}
            disabled={busy}
            data-testid="close-rift-btn"
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50
                       text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {busy ? 'Closing...' : 'Close Rift ❌'}
          </button>
        </div>
      ) : (
        <p className="text-gray-400 text-sm mb-6">No active rift right now.</p>
      )}

      {/* Open new rift form */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold">Open New Rift</h3>

        <div>
          <label className="block text-purple-300 text-xs mb-1">Topic *</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. async/await"
            data-testid="rift-topic-input"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2
                       text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-400"
          />
        </div>

        <div>
          <label className="block text-purple-300 text-xs mb-1">Description (optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Extra context for students"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2
                       text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-400"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-purple-300 text-xs mb-1">XP Multiplier</label>
            <select
              value={multiplier}
              onChange={(e) => setMultiplier(Number(e.target.value))}
              data-testid="rift-multiplier-select"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2
                         text-white text-sm focus:outline-none focus:border-purple-400"
            >
              {[1.5, 2, 2.5, 3].map((v) => (
                <option key={v} value={v}>{v}x</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-purple-300 text-xs mb-1">Duration (mins)</label>
            <select
              value={durationMins}
              onChange={(e) => setDurationMins(Number(e.target.value))}
              data-testid="rift-duration-select"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2
                         text-white text-sm focus:outline-none focus:border-purple-400"
            >
              {[15, 30, 45, 60, 90].map((v) => (
                <option key={v} value={v}>{v} min</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={openRift}
          disabled={busy}
          data-testid="open-rift-btn"
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50
                     text-white font-semibold rounded-xl transition-colors"
        >
          {busy ? 'Opening...' : '🌀 Open Rift'}
        </button>
      </div>
    </section>
  );
}
