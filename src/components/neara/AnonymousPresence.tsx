import { useMemo } from 'react';

/**
 * AnonymousPresence — purely procedural "human presence nearby" backdrop
 * for the welcome / pre-signup screens.
 *
 * PRIVACY GUARANTEES (by construction):
 *  • No <img> tags, no URLs, no uploads, no demo profile data.
 *  • Nothing is fetched from the database or AppStore.
 *  • Shapes are abstract silhouettes built from gradients + soft blur.
 *  • Forms drift forward and fade BEFORE they could read as a real face.
 *
 * Visual intent: faint anonymous silhouettes drifting toward the viewer,
 * blurred portrait-card glows, feathered edges, slow forward motion.
 */

type Blob = {
  id: number;
  /** start position % */
  left: number;
  top: number;
  /** base size in px (small — animation scales it up) */
  size: number;
  /** accent hue */
  hue: number;
  /** animation duration s */
  duration: number;
  /** delay s — staggers the drift */
  delay: number;
  /** rotation deg */
  rot: number;
  /** which silhouette variant */
  variant: 'head' | 'card' | 'orb';
};

const HUES = [265, 174, 42, 335, 152]; // violet, teal, gold, pink, mint

function seededBlobs(count: number): Blob[] {
  // Deterministic so SSR/CSR match and there's no jitter on re-render.
  const out: Blob[] = [];
  let s = 9133;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 0xffffffff;
    return s / 0xffffffff;
  };
  for (let i = 0; i < count; i++) {
    out.push({
      id: i,
      left: 5 + rand() * 90,
      top: 10 + rand() * 80,
      size: 90 + rand() * 70,
      hue: HUES[Math.floor(rand() * HUES.length)],
      duration: 16 + rand() * 14,
      delay: -rand() * 20, // negative => mid-cycle on mount
      rot: (rand() - 0.5) * 18,
      variant: (['head', 'card', 'orb'] as const)[Math.floor(rand() * 3)],
    });
  }
  return out;
}

interface Props {
  /** Number of drifting presences. Default 7. */
  count?: number;
  className?: string;
}

export function AnonymousPresence({ count = 7, className }: Props) {
  const blobs = useMemo(() => seededBlobs(count), [count]);

  return (
    <div
      aria-hidden="true"
      className={
        'pointer-events-none absolute inset-0 overflow-hidden ' + (className || '')
      }
    >
      {/* Atmospheric depth wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, hsl(var(--background) / 0) 0%, hsl(var(--background) / 0.6) 70%, hsl(var(--background)) 100%)',
        }}
      />

      {blobs.map((b) => (
        <span
          key={b.id}
          className="absolute"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: b.size,
            height: b.size * 1.25,
            transform: `translate(-50%, -50%) rotate(${b.rot}deg)`,
            animation: `neara-presence-drift ${b.duration}s ease-in-out ${b.delay}s infinite`,
            filter: 'blur(14px)',
            willChange: 'transform, opacity',
          }}
        >
          <SilhouetteShape variant={b.variant} hue={b.hue} />
        </span>
      ))}

      {/* Front-of-lens haze keeps everything soft + ensures forms fade
          before they could resolve into a real face. */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(2px)',
          background:
            'radial-gradient(circle at 50% 45%, transparent 35%, hsl(var(--background) / 0.55) 75%, hsl(var(--background)) 100%)',
        }}
      />

      <style>{`
        @keyframes neara-presence-drift {
          0% {
            transform: translate(-50%, -42%) scale(0.55) rotate(0deg);
            opacity: 0;
          }
          18% { opacity: 0.32; }
          55% { opacity: 0.28; }
          82% { opacity: 0.10; }
          100% {
            transform: translate(-50%, -58%) scale(1.35) rotate(4deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Procedural silhouette — head/shoulders shape, portrait card, or soft orb.
 * None of these resolve into recognizable faces; they read as presence.
 */
function SilhouetteShape({
  variant,
  hue,
}: {
  variant: 'head' | 'card' | 'orb';
  hue: number;
}) {
  const fill = `hsl(${hue} 70% 70% / 0.55)`;
  const glow = `hsl(${hue} 80% 60% / 0.35)`;

  if (variant === 'card') {
    // Soft "portrait card" — a rounded rectangle gradient with no detail
    return (
      <span
        className="block w-full h-full"
        style={{
          borderRadius: '38% / 32%',
          background: `
            radial-gradient(circle at 50% 35%, ${fill}, transparent 60%),
            linear-gradient(180deg, ${glow}, transparent 80%)
          `,
          boxShadow: `0 0 40px ${glow}`,
        }}
      />
    );
  }

  if (variant === 'orb') {
    return (
      <span
        className="block w-full h-full rounded-full"
        style={{
          background: `radial-gradient(circle at 45% 40%, ${fill}, transparent 65%)`,
          boxShadow: `0 0 60px ${glow}`,
        }}
      />
    );
  }

  // 'head' — abstract head + shoulders silhouette in SVG
  return (
    <svg
      viewBox="0 0 100 125"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id={`g-${hue}`} cx="50%" cy="38%" r="65%">
          <stop offset="0%" stopColor={`hsl(${hue} 75% 72%)`} stopOpacity="0.65" />
          <stop offset="60%" stopColor={`hsl(${hue} 70% 55%)`} stopOpacity="0.25" />
          <stop offset="100%" stopColor={`hsl(${hue} 60% 40%)`} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* head */}
      <ellipse cx="50" cy="40" rx="22" ry="26" fill={`url(#g-${hue})`} />
      {/* shoulders */}
      <path
        d="M 12 125 Q 14 82 38 74 Q 50 86 62 74 Q 86 82 88 125 Z"
        fill={`url(#g-${hue})`}
        opacity="0.85"
      />
    </svg>
  );
}
