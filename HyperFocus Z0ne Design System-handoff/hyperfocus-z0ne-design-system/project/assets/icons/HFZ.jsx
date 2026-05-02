// HFZ Icon Set v0 — custom brand glyphs
// Stroke 1.75, 24×24 viewBox, currentColor — drop in like Lucide.
// Usage: <HFZ.Brain size={24} color="#A855F7" />

const baseProps = (size = 24, color, strokeWidth = 1.75) => ({
  width: size, height: size, viewBox: '0 0 24 24',
  fill: 'none', stroke: color || 'currentColor',
  strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round',
  'aria-hidden': 'true',
});

const Brain = (p) => (
  <svg {...baseProps(p.size, p.color, p.strokeWidth)}>
    {/* Two-lobe brain with vertical fissure + a spark dot for "hyperfocus" */}
    <path d="M9.5 4.5C7.5 4.5 6 6 6 8c-1.5.4-2.5 1.7-2.5 3.2 0 1 .4 1.9 1.1 2.5C4.2 14.4 4 15.2 4 16c0 2 1.6 3.5 3.5 3.5.7 0 1.3-.2 1.8-.5.5.5 1.2.8 2 .8" />
    <path d="M14.5 4.5c2 0 3.5 1.5 3.5 3.5 1.5.4 2.5 1.7 2.5 3.2 0 1-.4 1.9-1.1 2.5.4.7.6 1.5.6 2.3 0 2-1.6 3.5-3.5 3.5-.7 0-1.3-.2-1.8-.5-.5.5-1.2.8-2 .8" />
    <path d="M12 4v16" />
    <circle cx="12" cy="12" r="1.4" fill={p.color || 'currentColor'} stroke="none" />
  </svg>
);

const Lightning = (p) => (
  <svg {...baseProps(p.size, p.color, p.strokeWidth)}>
    {/* Z0ne bolt — sharper than Lucide's, evokes the Z and the zero */}
    <path d="M14 2 4 14h6l-2 8 10-12h-6l2-8Z" />
  </svg>
);

const CircuitNode = (p) => (
  <svg {...baseProps(p.size, p.color, p.strokeWidth)}>
    {/* Central node + 4 traces ending in tiny pads — agent-mesh glyph */}
    <circle cx="12" cy="12" r="3" />
    <path d="M12 9V4M12 15v5M9 12H4M15 12h5" />
    <circle cx="12" cy="3.5" r="1" fill={p.color || 'currentColor'} stroke="none" />
    <circle cx="12" cy="20.5" r="1" fill={p.color || 'currentColor'} stroke="none" />
    <circle cx="3.5" cy="12" r="1" fill={p.color || 'currentColor'} stroke="none" />
    <circle cx="20.5" cy="12" r="1" fill={p.color || 'currentColor'} stroke="none" />
  </svg>
);

const Coin = (p) => (
  <svg {...baseProps(p.size, p.color, p.strokeWidth)}>
    {/* BROski$ coin — circle, dollar bar, tiny edge ticks */}
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="6" />
    <path d="M14.5 9.5c-.5-.8-1.5-1.2-2.5-1.2-1.4 0-2.5.8-2.5 2 0 2.5 5 1.4 5 4 0 1.2-1.1 2-2.5 2-1 0-2-.4-2.5-1.2M12 7v1.3M12 15.7V17" />
  </svg>
);

const Portal = (p) => (
  <svg {...baseProps(p.size, p.color, p.strokeWidth)}>
    {/* Concentric ovals — the Z0ne entrance */}
    <ellipse cx="12" cy="12" rx="9" ry="5" />
    <ellipse cx="12" cy="12" rx="6" ry="3" />
    <ellipse cx="12" cy="12" rx="2.5" ry="1.2" fill={p.color || 'currentColor'} stroke="none" opacity="0.7" />
  </svg>
);

const Paw = (p) => (
  <svg {...baseProps(p.size, p.color, p.strokeWidth)}>
    {/* BROski$Pet paw — 4 toes + main pad */}
    <ellipse cx="6"  cy="8"  rx="1.6" ry="2" />
    <ellipse cx="10" cy="5"  rx="1.6" ry="2" />
    <ellipse cx="14" cy="5"  rx="1.6" ry="2" />
    <ellipse cx="18" cy="8"  rx="1.6" ry="2" />
    <path d="M8 14c0-2.5 1.8-4 4-4s4 1.5 4 4c0 2-1.4 3-2.6 3.7-1.4.7-1.4 1.8-2.4 1.8-1.1 0-1-1.1-2.4-1.8C9.4 17 8 16 8 14Z" />
  </svg>
);

const Streak = (p) => (
  <svg {...baseProps(p.size, p.color, p.strokeWidth)}>
    {/* Bonus 7th glyph — flame for streaks */}
    <path d="M12 3c0 4-4 5-4 9a4 4 0 0 0 8 0c0-1.5-.8-2.5-2-3 0 2-1 3-2 3" />
    <path d="M10 16c0 1.5 1 2.5 2 2.5s2-1 2-2.5" />
  </svg>
);

const Infinity8 = (p) => (
  <svg {...baseProps(p.size, p.color, p.strokeWidth)}>
    {/* The BROski♾️ glyph */}
    <path d="M5 12c0-2 1.5-3.5 3.5-3.5S12 10 12 12s1.5 3.5 3.5 3.5S19 14 19 12s-1.5-3.5-3.5-3.5S12 10 12 12s-1.5 3.5-3.5 3.5S5 14 5 12Z" />
  </svg>
);

const HFZ = { Brain, Lightning, CircuitNode, Coin, Portal, Paw, Streak, Infinity: Infinity8 };
Object.assign(window, { HFZ });
