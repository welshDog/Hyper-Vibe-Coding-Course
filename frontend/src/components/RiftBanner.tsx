import { useRift } from '../hooks/useRift';

export function RiftBanner() {
  const { activeRift, timeLeft } = useRift();

  if (!activeRift) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const urgency = timeLeft < 300; // last 5 mins = red mode

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] text-center py-1.5 px-4 text-sm font-bold tracking-wide transition-colors ${
        urgency
          ? 'bg-red-600 text-white animate-pulse'
          : 'bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600 text-white'
      }`}
    >
      ⚡ RIFT EVENT ACTIVE: <span className="text-yellow-300">{activeRift.topic}</span>
      {' '}— <span className="text-yellow-200">{activeRift.multiplier}x XP</span> for{' '}
      <span className="font-mono">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
      {urgency && ' — LAST CHANCE! 🔥'}
    </div>
  );
}
