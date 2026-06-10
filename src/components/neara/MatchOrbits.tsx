import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { AccentTheme } from '@/lib/types';

/**
 * MatchOrbits — signature Neara match animation.
 *
 * Two variants for A/B testing perceived smoothness and premium feel:
 *   • Variant A — "Snap & Settle"     : energetic, fast orbit, magnetic pull
 *   • Variant B — "Slow Burn Premium" : longer arc, gentler easing, calm reveal
 *
 * The structure is identical so the only thing being compared is
 * timing + easing (and a few proportional geometry tweaks).
 */

export type MatchOrbitsVariant = 'A' | 'B';

type Tuning = {
  // Phase timing (ms)
  introDelay: number;
  orbitDuration: number;
  premergeDelay: number;
  mergeDelay: number;
  doneDelay: number;

  // Easing
  orbitEase: string;
  pullEase: string;
  mergeEase: string;

  // Orbit geometry
  orbitAngle: number;
  introRadius: number;
  orbitRadius: number;
  premergeRadius: number;
  mergeRadius: number;

  // Self-spin (s)
  primarySpinDuration: number;
  secondarySpinDuration: number;
  mergedRingDuration: number;

  // Transitions (ms)
  radiusShrinkOrbit: number;
  radiusShrinkPremerge: number;
  radiusShrinkMerge: number;
  scaleTransition: number;
  glowTransition: number;
  fadeTransition: number;
  introFade: number;

  // Merge entrance
  mergeInDuration: number;
  mergePulseDelay: number;
  mergePulseDuration: number;
  mergePulseScale: number;
  mergeStartScale: number;

  // Circle sizing
  circleSize: number;
  profileSize: number;
  mergedSize: number;
  tickSize: number;

  // Pre-merge tension
  premergeScale: number;
  premergeGlowBoost: number;
};

/* ═══════════════════ VARIANT A — "Snap & Settle" ═══════════════════
   Fast, confident, magnetic. Current production feel. */
const VARIANT_A: Tuning = {
  introDelay: 150,
  orbitDuration: 800,
  premergeDelay: 950,
  mergeDelay: 1450,
  doneDelay: 2150,

  orbitEase: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  pullEase: 'cubic-bezier(0.7, 0, 0.84, 0)',
  mergeEase: 'cubic-bezier(0.16, 1, 0.3, 1)',

  orbitAngle: 540,
  introRadius: 130,
  orbitRadius: 88,
  premergeRadius: 22,
  mergeRadius: 0,

  primarySpinDuration: 1.0,
  secondarySpinDuration: 1.6,
  mergedRingDuration: 8,

  radiusShrinkOrbit: 800,
  radiusShrinkPremerge: 500,
  radiusShrinkMerge: 300,
  scaleTransition: 400,
  glowTransition: 400,
  fadeTransition: 220,
  introFade: 150,

  mergeInDuration: 380,
  mergePulseDelay: 400,
  mergePulseDuration: 300,
  mergePulseScale: 1.05,
  mergeStartScale: 0.88,

  circleSize: 96,
  profileSize: 56,
  mergedSize: 150,
  tickSize: 6,

  premergeScale: 1.08,
  premergeGlowBoost: 1.5,
};

/* ═══════════════════ VARIANT B — "Slow Burn Premium" ═══════════════════
   Longer arc, gentler easings, more breath before the merge.
   Hypothesis: feels more cinematic / luxurious. */
const VARIANT_B: Tuning = {
  introDelay: 220,
  orbitDuration: 1200,        // longer, more graceful orbit
  premergeDelay: 1420,
  mergeDelay: 2050,
  doneDelay: 2900,

  orbitEase: 'cubic-bezier(0.45, 0.05, 0.25, 1)',   // smoother, less snap
  pullEase: 'cubic-bezier(0.55, 0.05, 0.35, 1)',    // gentler magnetic pull
  mergeEase: 'cubic-bezier(0.22, 1, 0.36, 1)',      // luxurious settle

  orbitAngle: 450,            // ~1.25 loops, less frantic
  introRadius: 140,
  orbitRadius: 96,
  premergeRadius: 26,
  mergeRadius: 0,

  primarySpinDuration: 1.6,
  secondarySpinDuration: 2.4,
  mergedRingDuration: 12,

  radiusShrinkOrbit: 1200,
  radiusShrinkPremerge: 630,
  radiusShrinkMerge: 380,
  scaleTransition: 520,
  glowTransition: 520,
  fadeTransition: 300,
  introFade: 220,

  mergeInDuration: 520,
  mergePulseDelay: 540,
  mergePulseDuration: 420,
  mergePulseScale: 1.04,
  mergeStartScale: 0.9,

  circleSize: 96,
  profileSize: 56,
  mergedSize: 158,
  tickSize: 6,

  premergeScale: 1.06,
  premergeGlowBoost: 1.4,
};

const PRESETS: Record<MatchOrbitsVariant, Tuning> = {
  A: VARIANT_A,
  B: VARIANT_B,
};

const ACCENT_HUE: Record<AccentTheme, number> = {
  violet: 265,
  teal: 174,
  gold: 42,
  pink: 335,
  mint: 152,
};

interface Props {
  myAccent: AccentTheme;
  otherAccent: AccentTheme;
  myPhoto?: string;
  otherPhoto?: string;
  onComplete?: () => void;
  className?: string;
  /** Which timing/easing preset to use. Default 'A'. */
  variant?: MatchOrbitsVariant;
}

type Phase = 'intro' | 'orbit' | 'premerge' | 'merge' | 'done';

export function MatchOrbits({
  myAccent,
  otherAccent,
  myPhoto,
  otherPhoto,
  onComplete,
  className,
  variant = 'A',
}: Props) {
  const T = PRESETS[variant];
  const [phase, setPhase] = useState<Phase>('intro');

  useEffect(() => {
    setPhase('intro');
    const t1 = setTimeout(() => setPhase('orbit'), T.introDelay);
    const t2 = setTimeout(() => setPhase('premerge'), T.premergeDelay);
    const t3 = setTimeout(() => setPhase('merge'), T.mergeDelay);
    const t4 = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, T.doneDelay);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete, T]);

  const h1 = ACCENT_HUE[myAccent];
  const h2 = ACCENT_HUE[otherAccent];

  const radius =
    phase === 'intro' ? T.introRadius
      : phase === 'orbit' ? T.orbitRadius
      : phase === 'premerge' ? T.premergeRadius
      : T.mergeRadius;

  const orbitActive = phase === 'orbit' || phase === 'premerge';
  const showIndividuals = phase !== 'merge' && phase !== 'done';
  const showMerged = phase === 'merge' || phase === 'done';

  // Namespace keyframes per variant so both can coexist if ever rendered together
  const ns = `neara-${variant.toLowerCase()}`;

  return (
    <div
      className={cn(
        'relative w-full h-[340px] flex items-center justify-center overflow-hidden',
        className,
      )}
      style={{
        background: `
          radial-gradient(circle at 50% 50%, hsl(${h1} 70% 50% / 0.10), transparent 55%),
          radial-gradient(circle at 50% 50%, hsl(${h2} 70% 50% / 0.10), transparent 65%)
        `,
        opacity: phase === 'intro' ? 0.85 : 1,
        transition: `opacity ${T.introFade}ms ease-out`,
      }}
    >
      <div className="relative" style={{ width: 0, height: 0 }}>
        <div
          className="absolute"
          style={{
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            transformOrigin: '0 0',
            animation: orbitActive
              ? `${ns}-orbit-rotate ${T.orbitDuration}ms ${T.orbitEase} forwards`
              : 'none',
            opacity: showIndividuals ? 1 : 0,
            transition: `opacity ${T.fadeTransition}ms ease-out`,
          }}
        >
          <OrbitArm radius={radius} side="left" phase={phase} T={T} ns={ns}>
            <CircleSelf hue={h1} photo={myPhoto} spinDirection="cw" phase={phase} label="You" T={T} ns={ns} />
          </OrbitArm>
          <OrbitArm radius={radius} side="right" phase={phase} T={T} ns={ns}>
            <CircleSelf hue={h2} photo={otherPhoto} spinDirection="ccw" phase={phase} label="Them" T={T} ns={ns} />
          </OrbitArm>
        </div>

        <MergedCircle hue1={h1} hue2={h2} visible={showMerged} T={T} ns={ns} />
      </div>

      <style>{`
        @keyframes ${ns}-orbit-rotate {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(${T.orbitAngle}deg); }
        }
        @keyframes ${ns}-spin-cw  { from { transform: rotate(0deg); }    to { transform: rotate(360deg); } }
        @keyframes ${ns}-spin-ccw { from { transform: rotate(0deg); }    to { transform: rotate(-360deg); } }
        @keyframes ${ns}-counter-orbit {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(-${T.orbitAngle}deg); }
        }
        @keyframes ${ns}-merge-in {
          0%   { transform: translate(-50%, -50%) scale(${T.mergeStartScale}); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1.0); opacity: 1; }
        }
        @keyframes ${ns}-merge-pulse {
          0%   { transform: translate(-50%, -50%) scale(1.0); }
          50%  { transform: translate(-50%, -50%) scale(${T.mergePulseScale}); }
          100% { transform: translate(-50%, -50%) scale(1.0); }
        }
        @keyframes ${ns}-ring-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function OrbitArm({
  radius, side, phase, T, ns, children,
}: {
  radius: number; side: 'left' | 'right'; phase: Phase; T: Tuning; ns: string;
  children: React.ReactNode;
}) {
  const sign = side === 'left' ? -1 : 1;
  const transitionDur =
    phase === 'orbit' ? T.radiusShrinkOrbit
      : phase === 'premerge' ? T.radiusShrinkPremerge
      : T.radiusShrinkMerge;

  return (
    <div
      className="absolute"
      style={{
        left: 0, top: 0, width: 0, height: 0,
        transform: `translate(${sign * radius}px, 0)`,
        transition: `transform ${transitionDur}ms ${phase === 'premerge' ? T.pullEase : T.orbitEase}`,
      }}
    >
      <div
        style={{
          transformOrigin: 'center center',
          animation:
            phase === 'orbit' || phase === 'premerge'
              ? `${ns}-counter-orbit ${T.orbitDuration}ms ${T.orbitEase} forwards`
              : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function CircleSelf({
  hue, photo, spinDirection, phase, label, T, ns,
}: {
  hue: number; photo?: string; spinDirection: 'cw' | 'ccw';
  phase: Phase; label: string; T: Tuning; ns: string;
}) {
  const scale = phase === 'premerge' ? T.premergeScale : 1.0;
  const glowBoost = phase === 'premerge' ? T.premergeGlowBoost : 1.0;
  const size = T.circleSize;

  return (
    <div
      className="absolute"
      style={{
        left: -size / 2, top: -size / 2, width: size, height: size,
        transform: `scale(${scale})`,
        transition: `transform ${T.scaleTransition}ms ${T.orbitEase}`,
      }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 50%,
            hsl(${hue} 80% 60% / ${0.35 * glowBoost}),
            hsl(${hue} 80% 50% / 0.08) 60%,
            transparent 75%)`,
          boxShadow: `
            0 0 ${30 * glowBoost}px hsl(${hue} 80% 60% / ${0.45 * glowBoost}),
            inset 0 0 20px hsl(${hue} 80% 60% / 0.15)
          `,
          backdropFilter: 'blur(8px)',
          transition: `box-shadow ${T.glowTransition}ms ease-out, background ${T.glowTransition}ms ease-out`,
        }}
      />

      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: `1px solid hsl(${hue} 80% 65% / 0.55)`,
          animation:
            phase === 'orbit' || phase === 'premerge'
              ? `${ns}-${spinDirection === 'cw' ? 'spin-cw' : 'spin-ccw'} ${T.primarySpinDuration}s linear infinite`
              : 'none',
          transformOrigin: 'center center',
        }}
      >
        <span
          className="absolute rounded-full"
          style={{
            width: T.tickSize, height: T.tickSize,
            top: -T.tickSize / 2, left: '50%', marginLeft: -T.tickSize / 2,
            background: `hsl(${hue} 90% 70%)`,
            boxShadow: `0 0 8px hsl(${hue} 90% 70% / 0.9)`,
          }}
        />
      </div>

      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: 6,
          border: `1px dashed hsl(${hue} 80% 70% / 0.25)`,
          animation:
            phase === 'orbit' || phase === 'premerge'
              ? `${ns}-${spinDirection === 'cw' ? 'spin-ccw' : 'spin-cw'} ${T.secondarySpinDuration}s linear infinite`
              : 'none',
          transformOrigin: 'center center',
        }}
      />

      <div
        className="absolute inset-0 m-auto rounded-full overflow-hidden border-2 border-background shadow-elev"
        style={{ width: T.profileSize, height: T.profileSize }}
      >
        {photo ? (
          <img src={photo} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `radial-gradient(circle at 40% 35%,
                hsl(${hue} 60% 75%),
                hsl(${hue} 70% 30%))`,
            }}
          />
        )}
      </div>
    </div>
  );
}

function MergedCircle({
  hue1, hue2, visible, T, ns,
}: {
  hue1: number; hue2: number; visible: boolean; T: Tuning; ns: string;
}) {
  if (!visible) return null;
  const size = T.mergedSize;

  return (
    <div
      className="absolute rounded-full"
      style={{
        left: 0, top: 0, width: size, height: size,
        marginLeft: -size / 2, marginTop: -size / 2,
        background: `
          radial-gradient(circle at 35% 40%, hsl(${hue1} 80% 60% / 0.35), transparent 60%),
          radial-gradient(circle at 65% 60%, hsl(${hue2} 80% 60% / 0.35), transparent 60%),
          radial-gradient(circle at 50% 50%, hsl(${hue1} 60% 50% / 0.08), transparent 75%)
        `,
        backdropFilter: 'blur(10px)',
        boxShadow: `
          0 0 50px hsl(${hue1} 80% 60% / 0.4),
          0 0 90px hsl(${hue2} 80% 60% / 0.3)
        `,
        animation: `
          ${ns}-merge-in ${T.mergeInDuration}ms ${T.mergeEase} forwards,
          ${ns}-merge-pulse ${T.mergePulseDuration}ms ease-in-out ${T.mergePulseDelay}ms 1
        `,
        transform: 'translate(0, 0)',
      }}
    >
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: '50%', top: '50%', width: '100%', height: '100%',
          background: `conic-gradient(from 0deg,
            hsl(${hue1} 85% 65%) 0deg,
            hsl(${hue1} 85% 70%) 90deg,
            hsl(${hue2} 85% 70%) 180deg,
            hsl(${hue2} 85% 65%) 270deg,
            hsl(${hue1} 85% 65%) 360deg)`,
          mask: 'radial-gradient(circle, transparent 67%, black 68%, black 100%)',
          WebkitMask: 'radial-gradient(circle, transparent 67%, black 68%, black 100%)',
          animation: `${ns}-ring-spin ${T.mergedRingDuration}s linear infinite`,
          transformOrigin: 'center',
        }}
      />

      <div
        className="absolute inset-3 rounded-full glass-strong flex items-center justify-center"
        style={{ border: `1px solid hsl(${(hue1 + hue2) / 2} 70% 60% / 0.35)` }}
      >
        <div
          className="w-4 h-4 rounded-full"
          style={{
            background: `linear-gradient(135deg, hsl(${hue1} 85% 65%), hsl(${hue2} 85% 65%))`,
            boxShadow: `0 0 16px hsl(${(hue1 + hue2) / 2} 80% 60% / 0.7)`,
          }}
        />
      </div>
    </div>
  );
}

export const MATCH_ORBITS_VARIANTS: Record<MatchOrbitsVariant, { name: string; subtitle: string }> = {
  A: { name: 'A · Snap & Settle', subtitle: 'Fast orbit, magnetic pull, ~2.15s' },
  B: { name: 'B · Slow Burn Premium', subtitle: 'Longer arc, gentler easing, ~2.9s' },
};
