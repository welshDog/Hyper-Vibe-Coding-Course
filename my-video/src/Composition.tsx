import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import React from "react";

const random = (seed: number) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

const Spark: React.FC<{ seed: number; frame: number; fps: number }> = ({ seed, frame, fps }) => {
  const angle = random(seed) * 360;
  const length = 40 + random(seed + 1) * 80;
  const startRadius = 20 + random(seed + 2) * 30;
  const delay = random(seed + 3) * 20;
  const duration = 15 + random(seed + 4) * 20;
  const cycleFrame = (frame - delay) % (duration + 10);
  const progress = interpolate(cycleFrame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(cycleFrame, [0, 5, duration - 5, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rad = (angle * Math.PI) / 180;
  const x1 = Math.cos(rad) * startRadius;
  const y1 = Math.sin(rad) * startRadius;
  const x2 = Math.cos(rad) * (startRadius + length * progress);
  const y2 = Math.sin(rad) * (startRadius + length * progress);
  const color = random(seed + 5) > 0.5 ? "#9333ea" : "#06b6d4";
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color}
      strokeWidth={1.5 + random(seed + 6) * 2}
      opacity={opacity}
      style={{ filter: `drop-shadow(0 0 4px ${color})` }}
    />
  );
};

const ElectricOrb: React.FC<{ cx: number; cy: number; frame: number; seed: number }> = ({ cx, cy, frame, seed }) => {
  const pulseRadius = interpolate(
    Math.sin((frame + seed * 10) * 0.15), [-1, 1], [8, 22]
  );
  const opacity = interpolate(Math.sin((frame + seed * 7) * 0.2), [-1, 1], [0.4, 1]);
  const color = seed % 2 === 0 ? "#9333ea" : "#06b6d4";
  return (
    <circle cx={cx} cy={cy} r={pulseRadius} fill="none"
      stroke={color} strokeWidth={2} opacity={opacity}
      style={{ filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color})` }}
    />
  );
};

export const HyperVibeIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleSlide = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const subtitleOpacity = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logoScale = spring({ frame: frame - 60, fps, config: { damping: 8, stiffness: 120 } });
  const glowPulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.6, 1.4]);
  const electricIntensity = interpolate(frame, [0, 30, 150], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const sparkSeeds = Array.from({ length: 24 }, (_, i) => i * 37);
  const orbPositions = [
    { cx: width * 0.15, cy: height * 0.3, seed: 0 },
    { cx: width * 0.85, cy: height * 0.3, seed: 1 },
    { cx: width * 0.15, cy: height * 0.7, seed: 2 },
    { cx: width * 0.85, cy: height * 0.7, seed: 3 },
    { cx: width * 0.5, cy: height * 0.12, seed: 4 },
    { cx: width * 0.5, cy: height * 0.88, seed: 5 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", overflow: "hidden" }}>

      {/* Background grid */}
      <svg width={width} height={height} style={{ position: "absolute", opacity: 0.08 }}>
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#9333ea" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />
      </svg>

      {/* Radial bg glow */}
      <div style={{
        position: "absolute", width: "100%", height: "100%",
        background: `radial-gradient(ellipse at center, rgba(147,51,234,${0.12 * glowPulse}) 0%, rgba(6,182,212,${0.06 * glowPulse}) 40%, transparent 70%)`,
      }} />

      {/* Corner electric orbs */}
      <svg width={width} height={height} style={{ position: "absolute", opacity: electricIntensity }}>
        {orbPositions.map((orb, i) => (
          <ElectricOrb key={i} {...orb} frame={frame} />
        ))}
      </svg>

      {/* Sparks around title center */}
      <svg width={width} height={height} style={{ position: "absolute", opacity: electricIntensity }}>
        <g transform={`translate(${width / 2}, ${height / 2})`}>
          {sparkSeeds.map((seed) => (
            <Spark key={seed} seed={seed} frame={frame} fps={fps} />
          ))}
        </g>
      </svg>

      {/* HYPER VIBE title */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <div style={{
          transform: `translateX(${interpolate(titleSlide, [0, 1], [-300, 0])}px)`,
          fontSize: 120,
          fontWeight: 900,
          fontFamily: "Arial Black, sans-serif",
          letterSpacing: "0.08em",
          color: "#9333ea",
          textShadow: `0 0 ${20 * glowPulse}px #9333ea, 0 0 ${40 * glowPulse}px #9333ea, 0 0 ${80 * glowPulse}px rgba(147,51,234,0.5)`,
          lineHeight: 1,
        }}>
          HYPER VIBE
        </div>

        {/* Electric divider line */}
        <div style={{
          width: interpolate(frame, [10, 40], [0, 700], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          height: 3,
          background: `linear-gradient(90deg, transparent, #9333ea, #06b6d4, transparent)`,
          boxShadow: `0 0 12px #06b6d4, 0 0 24px rgba(6,182,212,0.5)`,
          margin: "12px 0",
        }} />

        {/* CODING COURSE */}
        <div style={{
          opacity: subtitleOpacity,
          fontSize: 88,
          fontWeight: 900,
          fontFamily: "Arial Black, sans-serif",
          letterSpacing: "0.15em",
          color: "#06b6d4",
          textShadow: `0 0 ${18 * glowPulse}px #06b6d4, 0 0 ${36 * glowPulse}px #06b6d4, 0 0 ${72 * glowPulse}px rgba(6,182,212,0.5)`,
        }}>
          CODING COURSE
        </div>

        {/* BROski logo */}
        <div style={{
          marginTop: 28,
          transform: `scale(${Math.max(0, logoScale)})`,
          fontSize: 32,
          fontWeight: 700,
          fontFamily: "Arial, sans-serif",
          letterSpacing: "0.3em",
          color: "rgba(255,255,255,0.85)",
          textShadow: `0 0 10px rgba(147,51,234,0.8), 0 0 20px rgba(6,182,212,0.5)`,
        }}>
          BROSKI♾
        </div>
      </AbsoluteFill>

      {/* Scanline overlay */}
      <div style={{
        position: "absolute", width: "100%", height: "100%",
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
        pointerEvents: "none",
      }} />
    </AbsoluteFill>
  );
};
