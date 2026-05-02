/** @type {import('tailwindcss').Config} */
// =================================================================
// HyperFocus Z0ne — Tailwind config
// Drop-in replacement for welshDog/Hyper-Vibe-Coding-Course
// Vite + React + TypeScript + Tailwind CSS
//
// Mirrors every token in colors_and_type.css. Use Tailwind utilities
// OR raw CSS variables — both stay in lockstep.
// =================================================================

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // brand is dark-only; class is set on <html> at boot
  theme: {
    extend: {
      // -------- COLORS --------
      colors: {
        // Surfaces
        'space-black':    '#0A0E1A',
        'midnight-blue':  '#0F1B35',
        'midnight-soft':  '#0D1424',
        'deep-violet':    '#1A0A2E',
        'terminal-black': '#020408',

        // Brand primaries
        'hyper-violet':       { DEFAULT: '#7B2FBE', light: '#A855F7', hover: '#6B25A8' },
        'neon-cyan':          { DEFAULT: '#00D4FF', light: '#00FFFF', hover: '#00B8E0' },

        // Reward / accent
        'broski-gold':  { DEFAULT: '#F59E0B', light: '#FCD34D' },
        'reward-pink':  '#D946EF',
        'success-mint': '#10F5A0',
        'warning-amber':'#FBBF24',
        'danger-red':   '#EF4444',

        // Semantic text
        text: {
          primary:   '#F0F4FF',
          secondary: '#8B9CC8',
          disabled:  '#3D4F6E',
        },

        // Pet rarity
        rarity: {
          common:      '#60A5FA',
          'common-glow':'#3B82F6',
          rare:        '#A855F7',
          'rare-glow': '#7B2FBE',
          epic:        '#D946EF',
          'epic-glow': '#BE185D',
        },

        // Aliases for shadcn/cva style — keep Button.tsx working
        primary:        { DEFAULT: '#7B2FBE', foreground: '#F0F4FF', hover: '#6B25A8' },
        secondary:      { DEFAULT: '#00D4FF', foreground: '#0A0E1A' },
        destructive:    { DEFAULT: '#EF4444', foreground: '#F0F4FF' },
        accent:         { DEFAULT: 'rgba(168,85,247,0.12)', foreground: '#F0F4FF' },
        muted:          { DEFAULT: '#0F1B35', foreground: '#8B9CC8' },
        background:     '#0A0E1A',
        foreground:     '#F0F4FF',
        surface:        '#0F1B35',
        border:         'rgba(168,85,247,0.2)',
        input:          'rgba(168,85,247,0.3)',
        ring:           '#00D4FF',
      },

      // -------- TYPOGRAPHY --------
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'caption':   ['12px', { lineHeight: '1.5' }],
        'label':     ['14px', { lineHeight: '1.5', letterSpacing: '0.05em', fontWeight: '600' }],
        'code':      ['14px', { lineHeight: '1.6' }],
        'body':      ['16px', { lineHeight: '1.6' }],
        'body-lg':   ['18px', { lineHeight: '1.8' }], // dyslexia-friendly long-form
        'h4':        ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3':        ['24px', { lineHeight: '1.25', fontWeight: '600' }],
        'h2':        ['36px', { lineHeight: '1.15', letterSpacing: '-0.005em', fontWeight: '700' }],
        'h1':        ['48px', { lineHeight: '1.1',  letterSpacing: '-0.01em',  fontWeight: '700' }],
        'display':   ['72px', { lineHeight: '1.05', letterSpacing: '-0.02em',  fontWeight: '800' }],
      },
      letterSpacing: {
        tightest: '-0.02em',
        tighter:  '-0.01em',
        normal:   '0',
        body:     '0.02em',  // default body
        wide:     '0.05em',  // labels, caps
        wider:    '0.08em',  // pills, badges
        widest:   '0.14em',  // tier chips, brand monogram
      },
      lineHeight: {
        tight:     '1.05',
        snug:      '1.15',
        normal:    '1.6',
        relaxed:   '1.8', // long-form lesson reading
      },

      // -------- SPACING (8px grid) --------
      spacing: {
        '0.5': '2px',
        '1':   '4px',   // --space-1
        '2':   '8px',   // --space-2
        '3':   '12px',  // --space-3
        '4':   '16px',  // --space-4
        '5':   '24px',  // --space-5
        '6':   '32px',  // --space-6
        '7':   '48px',  // --space-7
        '8':   '64px',  // --space-8
        '9':   '96px',  // --space-9
        '10':  '128px', // --space-10
        // Layout sizes
        'sidebar':         '240px',
        'sidebar-collapsed':'64px',
        'hud':             '56px',
        'content-max':     '1280px',
        'lesson-max':      '960px',
        'prose':           '65ch', // dyslexia-friendly prose width
      },
      maxWidth: {
        'content': '1280px',
        'lesson':  '960px',
        'prose':   '65ch',
      },

      // -------- RADII --------
      borderRadius: {
        'sm':   '6px',
        'md':   '12px',
        'lg':   '16px',
        'xl':   '24px',
        'full': '9999px',
      },

      // -------- BORDERS --------
      borderColor: {
        'violet-soft':   'rgba(168, 85, 247, 0.2)',
        'violet-strong': 'rgba(168, 85, 247, 0.3)',
        'cyan-soft':     'rgba(0, 212, 255, 0.2)',
      },

      // -------- SHADOWS & GLOW --------
      boxShadow: {
        'card':         '0 4px 24px rgba(0, 0, 0, 0.4)',
        'glow-violet':  '0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)',
        'glow-cyan':    '0 0 20px rgba(0, 212, 255, 0.4),  0 0 40px rgba(0, 212, 255, 0.2)',
        'glow-gold':    '0 0 20px rgba(245, 158, 11, 0.4), 0 0 40px rgba(245, 158, 11, 0.2)',
        'glow-mint':    '0 0 20px rgba(16, 245, 160, 0.4), 0 0 40px rgba(16, 245, 160, 0.2)',
        'glow-pink':    '0 0 20px rgba(217, 70, 239, 0.4), 0 0 40px rgba(217, 70, 239, 0.2)',
        'inner-soft':   'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'hud':          '0 4px 16px rgba(123, 47, 190, 0.1)',
      },

      // -------- GRADIENTS (as backgroundImage) --------
      backgroundImage: {
        'grad-cta':         'linear-gradient(135deg, #7B2FBE 0%, #00D4FF 100%)',
        'grad-cta-hover':   'linear-gradient(135deg, #6B25A8 0%, #00B8E0 100%)',
        'grad-gold':        'linear-gradient(135deg, #F59E0B 0%, #FCD34D 50%, #F59E0B 100%)',
        'grad-xp':          'linear-gradient(90deg,  #7B2FBE, #00D4FF)',
        'grad-mint':        'linear-gradient(90deg,  #10F5A0, #00D4FF)',
        'grad-hero':        'radial-gradient(ellipse at 50% 0%, #1A0A2E 0%, #0A0E1A 70%)',
        'grad-deck':        'linear-gradient(180deg, #0A0E1A 0%, #0F1B35 100%)',
        'grad-holographic': 'linear-gradient(135deg, #D946EF, #A855F7, #00D4FF, #10F5A0, #FCD34D, #D946EF)',
        'grad-tier-bronze': 'linear-gradient(135deg, #4A2A12 0%, #6B3D1A 100%)',
        'grad-tier-silver': 'linear-gradient(135deg, #2A3548 0%, #455269 100%)',
        'grad-tier-gold':   'linear-gradient(135deg, #F59E0B 0%, #FCD34D 50%, #F59E0B 100%)',
        'grad-tier-hyper':  'linear-gradient(135deg, #7B2FBE 0%, #A855F7 50%, #00D4FF 100%)',
      },
      backgroundSize: {
        'holo': '300% 300%',
        'gold': '200% 100%',
      },

      // -------- TIMING / EASING --------
      transitionDuration: {
        fast: '150ms',
        mid:  '300ms',
        slow: '600ms',
        celebrate: '1200ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'sharp':  'cubic-bezier(0.4, 0, 1, 1)',
      },

      // -------- ANIMATIONS --------
      keyframes: {
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
        liquidFill: {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--progress, 100%)' },
        },
        idleBreath: {
          '0%, 100%': { transform: 'scale(1.0)' },
          '50%':      { transform: 'scale(1.02)' },
        },
        blinkCursor: {
          '0%, 50%':   { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        twinkle: {
          '0%, 100%': { opacity: '.2', transform: 'scale(1)' },
          '50%':      { opacity: '.9', transform: 'scale(1.4)' },
        },
        goldShimmer: {
          '0%':   { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)',    opacity: '1'   },
          '50%':      { transform: 'scale(1.25)', opacity: '.75' },
        },
      },
      animation: {
        'border-pulse':  'borderPulse 2s ease-in-out infinite',
        'holographic':   'holographic 3s ease infinite',
        'sonar-pulse':   'sonarPulse 1.5s ease-out infinite',
        'liquid-fill':   'liquidFill 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'idle-breath':   'idleBreath 3s ease-in-out infinite',
        'blink-cursor':  'blinkCursor 1s steps(2) infinite',
        'twinkle':       'twinkle 4s ease-in-out infinite',
        'gold-shimmer':  'goldShimmer 4s linear infinite',
        'pulse-dot':     'pulseDot 2.4s ease-in-out infinite',
      },

      // -------- BACKDROP --------
      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
};
