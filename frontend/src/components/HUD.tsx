import { useHUD } from '../hooks/useHUD';
import { useCounterTween } from '../hooks/useCounterTween';
import { XPToast } from './XPToast';
import { TokenBurst } from './TokenBurst';
import { RiftBanner } from './RiftBanner';

export function HUD() {
  const { xp, maxXP, tokens, streak, pendingXP, pendingTokens } = useHUD();
  const tokensDisplay = useCounterTween(tokens);

  const xpPercent = Math.min((xp / maxXP) * 100, 100);
  const isEarning = pendingTokens !== null;

  return (
    <>
      {/* Rift Banner sits above HUD */}
      <RiftBanner />

      {/* Main sticky HUD bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-purple-500/30 shadow-lg shadow-purple-500/10">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">

          {/* Logo / Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-purple-400 font-bold text-sm tracking-wider">⚡ HYPER VIBE</span>
          </div>

          {/* XP Bar */}
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span className="text-purple-300 font-semibold">XP</span>
              <span>{xp.toLocaleString()} / {maxXP.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Token Balance */}
          <div
            className={[
              'flex items-center gap-1.5 bg-yellow-500/10 border rounded-full px-3 py-1 motion-safe:transition-all motion-safe:duration-500',
              isEarning
                ? 'border-yellow-400 shadow-hfz-glow-gold motion-safe:scale-105'
                : 'border-yellow-500/30',
            ].join(' ')}
          >
            <span className="text-yellow-400 text-sm">🪙</span>
            <span className="text-yellow-300 font-bold text-sm font-mono">{tokensDisplay.toLocaleString()}</span>
            <span className="text-yellow-500/60 text-xs">BROski$</span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full px-3 py-1 shrink-0">
            <span className="text-lg leading-none">{streak > 0 ? '🔥' : '❄️'}</span>
            <span className="text-orange-300 font-bold text-sm">{streak}-day streak</span>
          </div>
        </div>
      </div>

      {/* XP Toast Popup */}
      {pendingXP && <XPToast amount={pendingXP} />}

      {/* BROski$ earn celebration */}
      <TokenBurst />

      {/* Spacer so content isn't hidden under HUD */}
      <div className="h-14" />
    </>
  );
}
