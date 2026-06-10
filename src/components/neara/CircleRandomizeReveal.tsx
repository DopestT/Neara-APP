import { useEffect, useState } from 'react';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import { motion, AnimatePresence } from 'framer-motion';

export interface CircleRandomizeRevealProps {
  src?: string;
  animationName?: string;
  onComplete?: () => void;
  /** Total duration in ms across all copy stages (default 6400) */
  durationMs?: number;
}

const STAGES = [
  'Building your private circle…',
  'Randomizing your visible area…',
  'Your circle is live.',
  'Approximate by design. Private by default.',
];

/**
 * Plays the Neara onboarding-completion reveal.
 * Falls back to a premium procedural animation when the Rive asset is missing:
 *   1. circle floats in from a neutral position (never real GPS)
 *   2. brief hover
 *   3. splits into 4 faint ghost circles
 *   4. ghosts shuffle around to randomize
 *   5. collapse back into one
 *   6. settles with one soft pulse
 *   7. nearby ambient circles wake gently
 */
export function CircleRandomizeReveal({
  src = '/rive/circle_randomize_reveal.riv',
  animationName = 'circle_randomize_reveal',
  onComplete,
  durationMs = 6400,
}: CircleRandomizeRevealProps) {
  const [stage, setStage] = useState(0);
  const [riveFailed, setRiveFailed] = useState(false);

  const { RiveComponent } = useRive({
    src,
    animations: animationName,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoadError: () => setRiveFailed(true),
  });

  useEffect(() => {
    const perStage = durationMs / STAGES.length;
    const timers = STAGES.map((_, i) =>
      window.setTimeout(() => setStage(i), i * perStage)
    );
    const done = window.setTimeout(() => onComplete?.(), durationMs + 800);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [durationMs, onComplete]);

  return (
    <div className="relative w-full min-h-[100dvh] overflow-hidden bg-background flex flex-col items-center justify-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,hsl(var(--primary)/0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--primary)/0.10),transparent_55%)]" />

      {/* Nearby ambient circles that wake gently after the reveal settles */}
      <NearbyAmbient active={stage >= 2} />

      <div className="relative w-[320px] h-[320px] md:w-[380px] md:h-[380px]">
        {riveFailed ? <FallbackCircles /> : <RiveComponent className="w-full h-full" />}
      </div>

      <div className="relative mt-10 h-20 w-full max-w-sm text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={stage}
            initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(6px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={
              stage === STAGES.length - 1
                ? 'font-display text-lg text-foreground'
                : 'text-base text-foreground/85'
            }
          >
            {STAGES[stage]}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="relative mt-8 text-[11px] text-muted-foreground/80 max-w-xs text-center leading-relaxed">
        Your exact location is never shown. Neara may slightly shift your visible
        area to help protect your privacy.
      </p>
    </div>
  );
}

/** Premium procedural fallback: float → hover → split → shuffle → collapse → settle. */
function FallbackCircles() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      <defs>
        <radialGradient id="crr-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.55" />
          <stop offset="70%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="crr-ghost" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.30" />
          <stop offset="80%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer scanning ring — always present */}
      <circle
        cx="200" cy="200" r="160"
        fill="none"
        stroke="hsl(var(--primary) / 0.28)"
        strokeWidth="1"
        strokeDasharray="3 9"
        style={{ transformOrigin: '200px 200px', animation: 'crr-spin 9s linear infinite' }}
      />
      <circle
        cx="200" cy="200" r="180"
        fill="none"
        stroke="hsl(var(--primary) / 0.15)"
        strokeWidth="1"
        strokeDasharray="2 14"
        style={{ transformOrigin: '200px 200px', animation: 'crr-spin-rev 14s linear infinite' }}
      />

      {/* 4 ghost circles that fade in, shuffle, then fade out */}
      {[0, 1, 2, 3].map(i => (
        <g key={i} style={{ transformOrigin: '200px 200px', animation: `crr-ghost-${i} 6.4s cubic-bezier(0.22,1,0.36,1) forwards` }}>
          <circle cx="200" cy="200" r="92" fill="url(#crr-ghost)" />
          <circle cx="200" cy="200" r="92" fill="none" stroke="hsl(var(--primary) / 0.45)" strokeWidth="1" strokeDasharray="2 5" />
        </g>
      ))}

      {/* Main circle: float in → hover → fade during shuffle → reform → settle */}
      <g style={{ transformOrigin: '200px 200px', animation: 'crr-main 6.4s cubic-bezier(0.22,1,0.36,1) forwards' }}>
        <circle cx="200" cy="200" r="108" fill="url(#crr-grad)" />
        <circle cx="200" cy="200" r="108" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.7" />
      </g>

      {/* Final settle pulse — runs after the reform */}
      <circle
        cx="200" cy="200" r="60"
        fill="hsl(var(--primary) / 0.18)"
        stroke="hsl(var(--primary))"
        strokeWidth="1"
        style={{ transformOrigin: '200px 200px', animation: 'crr-pulse 2.4s ease-out 4.6s infinite' }}
      />

      <style>{`
        @keyframes crr-spin     { to { transform: rotate(360deg); } }
        @keyframes crr-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes crr-pulse {
          0%   { transform: scale(0.9); opacity: 0.9; }
          70%  { transform: scale(1.3); opacity: 0; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        /* Main circle timeline */
        @keyframes crr-main {
          0%   { transform: translate(0,40px) scale(0.5); opacity: 0; }
          14%  { transform: translate(0,0)   scale(1);   opacity: 1; }
          26%  { transform: translate(0,0)   scale(1.03); opacity: 1; }
          /* hand off to ghosts */
          34%  { opacity: 0.15; }
          70%  { opacity: 0.15; }
          /* reform */
          82%  { transform: translate(0,0) scale(1.08); opacity: 1; }
          100% { transform: translate(0,0) scale(1);    opacity: 1; }
        }
        /* Ghosts appear during the shuffle window only, each drifts to a unique offset */
        @keyframes crr-ghost-0 {
          0%,33% { transform: translate(0,0) scale(0.6); opacity: 0; }
          42%    { transform: translate(-46px,-30px) scale(0.85); opacity: 0.7; }
          54%    { transform: translate(34px,-22px)  scale(0.92); opacity: 0.55; }
          64%    { transform: translate(-18px,34px)  scale(0.88); opacity: 0.5; }
          72%    { transform: translate(0,0)         scale(0.7);  opacity: 0; }
          100%   { opacity: 0; }
        }
        @keyframes crr-ghost-1 {
          0%,33% { transform: translate(0,0) scale(0.6); opacity: 0; }
          42%    { transform: translate(42px,28px)  scale(0.82); opacity: 0.65; }
          54%    { transform: translate(-36px,18px) scale(0.95); opacity: 0.5; }
          64%    { transform: translate(22px,-30px) scale(0.9);  opacity: 0.45; }
          72%    { transform: translate(0,0)        scale(0.7);  opacity: 0; }
          100%   { opacity: 0; }
        }
        @keyframes crr-ghost-2 {
          0%,33% { transform: translate(0,0) scale(0.6); opacity: 0; }
          42%    { transform: translate(36px,-36px) scale(0.88); opacity: 0.6; }
          54%    { transform: translate(-28px,-12px) scale(0.83); opacity: 0.55; }
          64%    { transform: translate(30px,26px)  scale(0.94); opacity: 0.45; }
          72%    { transform: translate(0,0)        scale(0.7);  opacity: 0; }
          100%   { opacity: 0; }
        }
        @keyframes crr-ghost-3 {
          0%,33% { transform: translate(0,0) scale(0.6); opacity: 0; }
          42%    { transform: translate(-38px,32px) scale(0.86); opacity: 0.55; }
          54%    { transform: translate(26px,34px)  scale(0.9);  opacity: 0.5; }
          64%    { transform: translate(-34px,-20px) scale(0.84); opacity: 0.45; }
          72%    { transform: translate(0,0)         scale(0.7); opacity: 0; }
          100%   { opacity: 0; }
        }
      `}</style>
    </svg>
  );
}

/** Faint nearby circles that wake gently once the user's circle settles. */
function NearbyAmbient({ active }: { active: boolean }) {
  const pts = [
    { x: 18, y: 32, d: 0.0, s: 70 },
    { x: 82, y: 28, d: 0.4, s: 56 },
    { x: 24, y: 78, d: 0.8, s: 64 },
    { x: 78, y: 76, d: 1.2, s: 50 },
    { x: 50, y: 14, d: 1.6, s: 44 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {pts.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.s,
            height: p.s,
            transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.22), transparent 70%)',
            border: '1px solid hsl(var(--primary) / 0.25)',
            opacity: active ? 1 : 0,
            transition: `opacity 900ms ease ${p.d}s`,
            animation: active ? `crr-breathe 4.2s ease-in-out ${p.d}s infinite` : 'none',
            filter: 'blur(0.3px)',
          }}
        />
      ))}
      <style>{`
        @keyframes crr-breathe {
          0%,100% { transform: translate(-50%,-50%) scale(0.92); opacity: 0.45; }
          50%     { transform: translate(-50%,-50%) scale(1.05); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}

export default CircleRandomizeReveal;
