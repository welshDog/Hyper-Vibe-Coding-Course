/** @type {import('tailwindcss').Config} */
// =============================================================================
// HyperFocus Z0ne — Tailwind Theme
// Single source of truth for HFZ design tokens (mirrors CLAUDE_DESIGN_STYLE.md
// + colors_and_type.css). All raw hex lives here — every other file should
// reference these via Tailwind classes (bg-hfz-violet, text-hfz-gold, etc.) or
// CSS vars (var(--color-hyper-violet)).
// =============================================================================
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // dark-only brand — kept for any future scoped overrides
  theme: {
    extend: {
      // ---------- COLORS ----------
      colors: {
        // ▼ Brand-prefixed tokens — preferred for new code
        hfz: {
          'space-black':    '#0A0E1A',
          'midnight':       '#0F1B35',
          'midnight-soft':  '#0D1424',
          'deep-violet':    '#1A0A2E',
          'terminal-black': '#020408',
          violet: {
            DEFAULT: '#7B2FBE',
            light:   '#A855F7',
          },
          cyan: {
            DEFAULT: '#00D4FF',
            pure:    '#00FFFF',
          },
          gold: {
            DEFAULT: '#F59E0B',
            light:   '#FCD34D',
          },
          pink:  '#D946EF',
          mint:  '#10F5A0',
          amber: '#FBBF24',
          danger: '#EF4444',
          text: {
            primary:   '#F0F4FF',
            secondary: '#8B9CC8',
            disabled:  '#7E8FB5', // Sprint 3 item 4: was #3D4F6E (~2:1, failed WCAG AA). Same hue, AA-pass (~5.3:1 worst bg).
          },
          rarity: {
            'common':         '#60A5FA',
            'common-glow':    '#3B82F6',
            'rare':           '#A855F7',
            'rare-glow':      '#7B2FBE',
            'epic':           '#D946EF',
            'epic-glow':      '#BE185D',
          },
          border: {
            violet:        'rgba(168, 85, 247, 0.2)',
            'violet-strong': 'rgba(168, 85, 247, 0.3)',
            cyan:          'rgba(0, 212, 255, 0.2)',
            soft:          'rgba(255, 255, 255, 0.08)',
          },
        },

        // ▼ Semantic aliases — used by existing pages (bg-primary etc).
        // Re-pointed from the old light theme to HFZ dark tokens so legacy
        // markup auto-darkens.
        primary: {
          DEFAULT: '#7B2FBE',  // hyper-violet
          hover:   '#A855F7',
        },
        secondary: {
          DEFAULT: '#00D4FF',  // neon-cyan
          hover:   '#00FFFF',
        },
        background: '#0A0E1A',  // space-black
        surface:    '#0F1B35',  // midnight-blue
        text:       '#F0F4FF',  // text-primary
        muted:      '#8B9CC8',
      },

      // ---------- FONTS ----------
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },

      // ---------- TYPE SCALE ----------
      // Per CLAUDE_DESIGN_STYLE.md — px-pinned, body never below 16px.
      fontSize: {
        'hfz-display': ['72px', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '800' }],
        'hfz-h1':      ['48px', { lineHeight: '1.1',  letterSpacing: '-0.01em', fontWeight: '700' }],
        'hfz-h2':      ['36px', { lineHeight: '1.15', fontWeight: '700' }],
        'hfz-h3':      ['24px', { lineHeight: '1.25', fontWeight: '600' }],
        'hfz-h4':      ['20px', { lineHeight: '1.3',  fontWeight: '600' }],
        'hfz-body-lg': ['18px', { lineHeight: '1.8' }],
        'hfz-body':    ['16px', { lineHeight: '1.6' }],
        'hfz-label':   ['14px', { lineHeight: '1.4',  letterSpacing: '0.05em', fontWeight: '600' }],
        'hfz-caption': ['14px', { lineHeight: '1.4' }],
        'hfz-code':    ['14px', { lineHeight: '1.6' }],
      },

      // ---------- SPACING (8px grid) ----------
      // Tailwind's defaults already cover most of these; these named tokens map
      // to the design-bible scale 1:1 for predictable spacing.
      spacing: {
        'hfz-1':  '4px',
        'hfz-2':  '8px',
        'hfz-3':  '12px',
        'hfz-4':  '16px',
        'hfz-5':  '24px',
        'hfz-6':  '32px',
        'hfz-7':  '48px',
        'hfz-8':  '64px',
        'hfz-9':  '96px',
        'hfz-10': '128px',
      },

      // ---------- RADII ----------
      borderRadius: {
        'hfz-sm':   '6px',
        'hfz-md':   '12px',
        'hfz-lg':   '16px',
        'hfz-xl':   '24px',
        'hfz-full': '9999px',
      },

      // ---------- LETTER SPACING ----------
      letterSpacing: {
        'hfz-tight': '-0.02em',
        'hfz-body':  '0.02em',
        'hfz-label': '0.05em',
        'hfz-caps':  '0.12em',
      },

      // ---------- SHADOWS / GLOW ----------
      boxShadow: {
        'hfz-card':         '0 4px 24px rgba(0, 0, 0, 0.4)',
        'hfz-glow-violet':  '0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)',
        'hfz-glow-cyan':    '0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)',
        'hfz-glow-gold':    '0 0 20px rgba(245, 158, 11, 0.4), 0 0 40px rgba(245, 158, 11, 0.2)',
        'hfz-glow-mint':    '0 0 20px rgba(16, 245, 160, 0.4), 0 0 40px rgba(16, 245, 160, 0.2)',
        'hfz-glow-pink':    '0 0 20px rgba(217, 70, 239, 0.4), 0 0 40px rgba(217, 70, 239, 0.2)',
      },

      // ---------- BACKGROUND IMAGES (gradient recipes) ----------
      backgroundImage: {
        'hfz-cta':          'linear-gradient(135deg, #7B2FBE 0%, #00D4FF 100%)',
        'hfz-gold':         'linear-gradient(135deg, #F59E0B 0%, #FCD34D 50%, #F59E0B 100%)',
        'hfz-holographic':  'linear-gradient(135deg, #D946EF, #A855F7, #00D4FF, #10F5A0, #FCD34D, #D946EF)',
        'hfz-hero':         'radial-gradient(ellipse at 50% 0%, #1A0A2E 0%, #0A0E1A 70%)',
        'hfz-xp':           'linear-gradient(90deg, #7B2FBE, #00D4FF)',
        'hfz-bg':           'linear-gradient(180deg, #1A0A2E 0%, #0A0E1A 100%)',
      },

      // ---------- TRANSITION TIMING ----------
      transitionTimingFunction: {
        'hfz-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'hfz-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'hfz-sharp':  'cubic-bezier(0.4, 0, 1, 1)',
      },
      transitionDuration: {
        'hfz-fast':   '150ms',
        'hfz-mid':    '300ms',
        'hfz-slow':   '600ms',
        'hfz-anim':   '1200ms',
      },

      // ---------- ANIMATIONS ----------
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%':      { opacity: '1',   transform: 'scale(1.4)' },
        },
        borderPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(168, 85, 247, 0.6)' },
          '50%':      { boxShadow: '0 0 20px rgba(168, 85, 247, 1.0), 0 0 40px rgba(168, 85, 247, 0.4)' },
        },
        holographic: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        sonarPulse: {
          '0%':   { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.0)', opacity: '0' },
        },
        idleBreath: {
          '0%, 100%': { transform: 'scale(1.0)' },
          '50%':      { transform: 'scale(1.02)' },
        },
        liquidFill: {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--progress, 100%)' },
        },
        levelBurst: {
          '0%':   { transform: 'scale(0)', opacity: '1' },
          '60%':  { transform: 'scale(1.8)', opacity: '0.6' },
          '100%': { transform: 'scale(3.0)', opacity: '0' },
        },
        drift: {
          '0%':   { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)'  },
        },
        goldSweep: {
          '0%':   { transform: 'translateX(-100%)', opacity: '0' },
          '40%':  { opacity: '1' },
          '100%': { transform: 'translateX(120%)',  opacity: '0' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // BROski$ earn callout — pop in (springy), hover, then drift up + fade out.
        tokenPop: {
          '0%':   { opacity: '0', transform: 'translateY(0) scale(0.6)' },
          '15%':  { opacity: '1', transform: 'translateY(-4px) scale(1.08)' },
          '30%':  { opacity: '1', transform: 'translateY(0) scale(1)' },
          '70%':  { opacity: '1', transform: 'translateY(-2px) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-32px) scale(0.94)' },
        },
        // BROski$ earn particle — burst outward to (var(--dx), var(--dy)) with rotation.
        tokenParticle: {
          '0%':   { opacity: '0', transform: 'translate(0,0) rotate(0) scale(0.4)' },
          '15%':  { opacity: '1', transform: 'translate(calc(var(--dx) * 0.3), calc(var(--dy) * 0.3)) rotate(calc(var(--rot) * 0.3)) scale(1)' },
          '100%': { opacity: '0', transform: 'translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(0.7)' },
        },
      },
      animation: {
        twinkle:      'twinkle 3s ease-in-out infinite',
        'border-pulse': 'borderPulse 2s ease-in-out infinite',
        holographic:  'holographic 3s ease infinite',
        'sonar-pulse': 'sonarPulse 1.4s ease-out infinite',
        'idle-breath': 'idleBreath 3s ease-in-out infinite',
        'liquid-fill': 'liquidFill 1.2s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'level-burst': 'levelBurst 0.5s ease-out forwards',
        drift:        'drift 60s linear infinite',
        shimmer:      'shimmer 1.5s linear infinite',
        'gold-sweep': 'goldSweep 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
      },

      // ---------- BACKDROP BLUR ----------
      backdropBlur: {
        'hfz-glass': '12px',
      },

      // ---------- MAX WIDTHS ----------
      maxWidth: {
        'hfz-page':   '1280px',
        'hfz-prose':  '65ch',
        'hfz-lesson': '960px',
      },
    },
  },
  plugins: [],
}
