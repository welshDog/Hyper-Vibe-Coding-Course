// components/mission-control/CatchStragglers.jsx
import { useState } from 'react'

const TONE_EMOJI = { warm: '🤗', curious: '🤔', terse: '⚡' }

export default function CatchStragglers() {
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedTones, setSelectedTones] = useState({})
  const [editedMessages, setEditedMessages] = useState({})
  const [sent, setSent] = useState([])
  const [snoozed, setSnoozed] = useState([])

  const fetchStragglers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/agent/catch-stragglers')
      const data = await res.json()
      setDrafts(data.drafts)
      const tones = {}
      data.drafts.forEach(d => { tones[d.userId] = 'warm' })
      setSelectedTones(tones)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const getMessage = (draft) => {
    if (editedMessages[draft.userId]) return editedMessages[draft.userId]
    const tone = selectedTones[draft.userId] || 'warm'
    return draft.dmVariants.find(v => v.tone === tone)?.text || ''
  }

  const handleSend = async (draft) => {
    await fetch('/api/agent/send-dm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: draft.userId,
        discordId: draft.discordId,
        email: draft.email,
        message: getMessage(draft),
        tone: selectedTones[draft.userId]
      })
    })
    setSent(s => [...s, draft.userId])
  }

  const handleSnooze = async (userId) => {
    await fetch('/api/agent/snooze-dm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
    setSnoozed(s => [...s, userId])
  }

  const handleBulkSendAll = async () => {
    const pending = drafts.filter(
      d => !sent.includes(d.userId) && !snoozed.includes(d.userId)
    )
    for (const draft of pending) await handleSend(draft)
  }

  const visible = drafts.filter(
    d => !sent.includes(d.userId) && !snoozed.includes(d.userId)
  )

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">🎯 Catch Stragglers</h2>
          <p className="text-sm text-gray-400">
            Students idle 7+ days · Review drafts · Send or skip
          </p>
        </div>
        <button
          onClick={fetchStragglers}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500"
        >
          {loading ? '⏳ Scanning...' : '🔍 Scan Now'}
        </button>
      </div>

      {drafts.length > 0 && (
        <div className="flex gap-4 text-sm bg-gray-800 rounded-lg p-3">
          <span>📋 <strong>{visible.length}</strong> pending</span>
          <span>✅ <strong>{sent.length}</strong> sent</span>
          <span>⏰ <strong>{snoozed.length}</strong> snoozed</span>
          {visible.length > 1 && (
            <button
              onClick={handleBulkSendAll}
              className="ml-auto px-3 py-1 bg-green-700 rounded text-xs font-bold hover:bg-green-600"
            >
              ✅ Approve All ({visible.length})
            </button>
          )}
        </div>
      )}

      {visible.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          {drafts.length === 0
            ? '👆 Hit Scan Now to find idle students'
            : '🎉 All students actioned!'}
        </div>
      )}

      {visible.map(draft => (
        <div
          key={draft.userId}
          className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">{draft.name}</p>
              <p className="text-xs text-gray-400">
                Level {draft.level} · {draft.totalXp} XP ·
                Last seen {draft.daysIdle}d ago
              </p>
              <p className="text-xs text-gray-500">
                📍 Last lesson: {draft.stuckModule}
              </p>
            </div>
            <div className="flex gap-1">
              {draft.discordId
                ? <span className="text-xs bg-indigo-800 px-2 py-1 rounded">Discord</span>
                : <span className="text-xs bg-gray-700 px-2 py-1 rounded">Email only</span>
              }
            </div>
          </div>

          <div className="flex gap-2">
            {draft.dmVariants.map(v => (
              <button
                key={v.tone}
                onClick={() => {
                  setSelectedTones(t => ({ ...t, [draft.userId]: v.tone }))
                  setEditedMessages(m => { const n = {...m}; delete n[draft.userId]; return n })
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedTones[draft.userId] === v.tone
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {TONE_EMOJI[v.tone]} {v.tone}
              </button>
            ))}
          </div>

          <textarea
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-blue-500"
            rows={3}
            value={getMessage(draft)}
            onChange={e => setEditedMessages(m => ({
              ...m, [draft.userId]: e.target.value
            }))}
          />

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => handleSnooze(draft.userId)}
              className="px-3 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600"
            >
              ⏰ Snooze 24h
            </button>
            <button
              onClick={() => setSnoozed(s => [...s, draft.userId])}
              className="px-3 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600"
            >
              🗑️ Skip
            </button>
            <button
              onClick={() => handleSend(draft)}
              className="px-4 py-2 bg-green-600 rounded-lg text-sm font-bold hover:bg-green-500"
            >
              ✅ Send
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
