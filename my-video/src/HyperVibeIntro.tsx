import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Glow helpers ─────────────────────────────────────────────────────────────

function purpleGlow(opacity = 1) {
  return `0 0 20px rgba(147,51,234,${opacity}), 0 0 60px rgba(147,51,234,${
    opacity * 0.5
  }), 0 0 100px rgba(147,51,234,${opacity * 0.25})`;
}

function cyanGlow(opacity = 1) {
  return `0 0 20px rgba(6,182,212,${opacity}), 0 0 60px rgba(6,182,212,${
    opacity * 0.5
  })`;
}

// ─── Main composition ─────────────────────────────────────────────────────────

export const HyperVibeIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── HYPER VIBE: spring slide-in from left ──────────────────────────────────
  const hyperVibeSpring = spring({
    frame,
    fps,
    config: { stiffness: 80, damping: 14, mass: 1 },
    durationInFrames: 40,
  });

  const hyperVibeX = interpolate(hyperVibeSpring, [0, 1], [-520, 0]);
  const hyperVibeOpacity = interpolate(hyperVibeSpring, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ── CODING COURSE: fade + slide up ────────────────────────────────────────
  const codingSpring = spring({
    frame: Math.max(0, frame - 28),
    fps,
    config: { stiffness: 70, damping: 16, mass: 1 },
    durationInFrames: 40,
  });

  const codingOpacity = interpolate(codingSpring, [0, 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });
  const codingY = interpolate(codingSpring, [0, 1], [40, 0]);

  // ── Divider line: expands outward ─────────────────────────────────────────
  const lineProgress = interpolate(frame, [35, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── BROski♾ subtitle: scale-pulse entrance ────────────────────────────────
  const brokiSpring = spring({
    frame: Math.max(0, frame - 78),
    fps,
    config: { stiffness: 220, damping: 9, mass: 0.6 },
    durationInFrames: 40,
  });

  const brokiScale = interpolate(brokiSpring, [0, 1], [0.4, 1]);
  const brokiOpacity = interpolate(brokiSpring, [0, 0.35], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Ongoing subtle pulse after entrance (frame 90+)
  const pulseCycle = Math.sin(((frame - 90) / fps) * Math.PI * 2);
  const brokiPulse =
    frame > 90 ? interpolate(pulseCycle, [-1, 1], [0.97, 1.03]) : 1;

  // ── Background vignette opacity ───────────────────────────────────────────
  const bgGlow = interpolate(frame, [0, 60], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Arial Black', 'Impact', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 70% 50% at 50% 50%,
            rgba(147,51,234,${bgGlow * 0.12}) 0%,
            rgba(6,182,212,${bgGlow * 0.06}) 50%,
            transparent 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* Scanline texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)",
          pointerEvents: "none",
        }}
      />

      {/* ── HYPER VIBE ── */}
      <div
        style={{
          transform: `translateX(${hyperVibeX}px)`,
          opacity: hyperVibeOpacity,
          color: "#9333ea",
          fontSize: 148,
          fontWeight: 900,
          letterSpacing: "-4px",
          lineHeight: 1,
          textShadow: purpleGlow(hyperVibeOpacity),
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        HYPER VIBE
      </div>

      {/* ── Divider line ── */}
      <div
        style={{
          width: `${lineProgress * 540}px`,
          height: 3,
          marginTop: 18,
          marginBottom: 18,
          background:
            "linear-gradient(90deg, #9333ea 0%, #06b6d4 100%)",
          boxShadow:
            "0 0 12px rgba(147,51,234,0.8), 0 0 24px rgba(6,182,212,0.4)",
          borderRadius: 2,
          transition: "none",
        }}
      />

      {/* ── CODING COURSE ── */}
      <div
        style={{
          transform: `translateY(${codingY}px)`,
          opacity: codingOpacity,
          color: "#06b6d4",
          fontSize: 88,
          fontWeight: 900,
          letterSpacing: "12px",
          lineHeight: 1,
          textShadow: cyanGlow(codingOpacity),
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        CODING COURSE
      </div>

      {/* ── BROski♾ subtitle ── */}
      <div
        style={{
          marginTop: 48,
          transform: `scale(${brokiScale * brokiPulse})`,
          opacity: brokiOpacity,
          color: "rgba(255,255,255,0.75)",
          fontSize: 36,
          fontWeight: 400,
          letterSpacing: "6px",
          textTransform: "uppercase",
          fontFamily: "'Arial', sans-serif",
          textShadow:
            "0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(147,51,234,0.4)",
        }}
      >
        BROski♾
      </div>
    </AbsoluteFill>
  );
};
