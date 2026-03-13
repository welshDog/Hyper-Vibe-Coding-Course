import { useAuthStore } from '../../store/authStore'

// ♿ Accessibility panel - respects neurodivergent preferences
// Toggle these on/off - preferences saved to user profile
export default function AccessibilityControls() {
  const { user, updateUser } = useAuthStore()

  if (!user) return null

  const togglePref = (pref: keyof typeof user) => {
    updateUser({ [pref]: !user[pref as keyof typeof user] })
    // TODO: Also save to backend with PATCH /api/users/preferences
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <details className="bg-gray-800 rounded-xl p-3 shadow-xl border border-gray-700">
        <summary className="cursor-pointer text-sm font-bold text-purple-400 list-none">
          ♿ A11y Settings
        </summary>
        <div className="mt-3 space-y-2 min-w-[200px]">
          <ToggleRow
            label="📖 Dyslexia Font"
            value={user.prefDyslexiaFont}
            onChange={() => togglePref('prefDyslexiaFont')}
          />
          <ToggleRow
            label="🎬 Reduce Motion"
            value={user.prefReducedMotion}
            onChange={() => togglePref('prefReducedMotion')}
          />
          <ToggleRow
            label="🌗 High Contrast"
            value={user.prefHighContrast}
            onChange={() => togglePref('prefHighContrast')}
          />
          <ToggleRow
            label="🌙 Dark Mode"
            value={user.prefDarkMode}
            onChange={() => togglePref('prefDarkMode')}
          />
        </div>
      </details>
    </div>
  )
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: () => void
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <span className="text-sm text-gray-200">{label}</span>
      <button
        onClick={onChange}
        className={`w-11 h-6 rounded-full transition-colors ${
          value ? 'bg-purple-600' : 'bg-gray-600'
        }`}
        aria-pressed={value}
        aria-label={label}
      >
        <span
          className={`block w-4 h-4 bg-white rounded-full mx-1 transition-transform ${
            value ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}
