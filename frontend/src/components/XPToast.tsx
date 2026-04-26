import { useEffect, useState } from 'react';

interface XPToastProps {
  amount: number;
}

export function XPToast({ amount }: XPToastProps) {
  const [visible, setVisible] = useState(true);
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setAnimating(false), 1800);
    const removeTimer = setTimeout(() => setVisible(false), 2200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [amount]);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-20 right-6 z-[100] pointer-events-none transition-all duration-500 ${
        animating
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-4 scale-95'
      }`}
    >
      <div className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-lg px-5 py-3 rounded-2xl shadow-2xl shadow-purple-500/40 flex items-center gap-2">
        <span className="text-2xl">⚡</span>
        <span>+{amount} XP</span>
        <span className="text-purple-200 text-sm font-normal">Nice one BROski♾️!</span>
      </div>
    </div>
  );
}
