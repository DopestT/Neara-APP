import { useEffect, useRef, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { DemoProfile, VIBE_LABEL } from '@/lib/types';
import { TrustBadge } from './Brand';
import aerialCity from '@/assets/aerial-city.jpg';

/**
 * NearaMap — Cinematic Aerial City Window.
 * Privacy-first: no exact pins, no street labels, no live tracking.
 * Layers: aerial city image → plum/black tint → vignette → moving privacy fog →
 * glowing social-energy zones → approximate privacy circles → floating profile bubbles.
 */

interface NearaMapProps {
  profiles: DemoProfile[];
  onSelect: (p: DemoProfile) => void;
  className?: string;
  overlay?: ReactNode;
  topBanners?: ReactNode;
  bottomBar?: ReactNode;
}

const MIN_ZOOM = 0.9;
const MAX_ZOOM = 1.35;

const PULSE_ZONES = [
  { x: 22, y: 28, s: 220, hue: 'var(--primary)',  label: 'A few people active',   d: 0 },
  { x: 78, y: 22, s: 180, hue: '38 75% 65%',      label: 'Tonight energy',       d: 1.2 },
  { x: 30, y: 74, s: 240, hue: '340 72% 70%',     label: 'Open to chat',          d: 0.6 },
  { x: 80, y: 70, s: 170, hue: '172 55% 58%',     label: 'Verified activity',     d: 2.0 },
  { x: 54, y: 50, s: 140, hue: 'var(--primary)',  label: 'Quiet nearby',          d: 1.6 },
];

export function NearaMap({ profiles, onSelect, className, overlay, topBanners, bottomBar }: NearaMapProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    const max = 140;
    setPan({
      x: Math.max(-max, Math.min(max, drag.current.px + dx * 0.55)),
      y: Math.max(-max, Math.min(max, drag.current.py + dy * 0.55)),
    });
  };
  const onPointerUp = () => { drag.current = null; };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom(z => clampZoom(z - e.deltaY * 0.0015));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div
      ref={wrapRef}
      className={cn(
        'relative overflow-hidden rounded-3xl glass select-none touch-none',
        'cursor-grab active:cursor-grabbing',
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Layer 1 — Aerial city background with slow cinematic drift + slight tilt */}
      <div
        className="absolute inset-0 pointer-events-none will-change-transform"
        aria-hidden
        style={{
          backgroundImage: `url(${aerialCity})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          transform: `translate(${pan.x * 0.25}px, ${pan.y * 0.25}px) scale(${1.08 * zoom}) perspective(1200px) rotateX(6deg)`,
          transformOrigin: '50% 60%',
          filter: 'saturate(0.85) brightness(0.62) blur(0.5px)',
          animation: 'neara-aerial-drift 38s ease-in-out infinite alternate',
        }}
      />

      {/* Layer 2 — Plum / black cinematic tint */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden style={{
        background: `
          radial-gradient(ellipse 90% 70% at 50% 40%, hsl(var(--primary) / 0.18), transparent 65%),
          linear-gradient(180deg, hsl(280 30% 4% / 0.55) 0%, hsl(280 28% 3% / 0.35) 45%, hsl(280 30% 3% / 0.7) 100%)
        `,
      }} />

      {/* Layer 3 — Drifting privacy fog */}
      <div className="absolute inset-0 pointer-events-none opacity-70" aria-hidden style={{
        background: `
          radial-gradient(ellipse 50% 35% at 20% 30%, hsl(var(--primary) / 0.16), transparent 60%),
          radial-gradient(ellipse 45% 30% at 80% 70%, hsl(280 30% 20% / 0.35), transparent 65%),
          radial-gradient(ellipse 60% 40% at 60% 20%, hsl(285 40% 25% / 0.25), transparent 70%)
        `,
        filter: 'blur(8px)',
        animation: 'neara-fog-drift 28s ease-in-out infinite alternate',
      }} />

      {/* Layer 4 — Soft edge vignette */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden style={{
        background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, hsl(280 30% 3% / 0.9) 100%)',
      }} />

      <style>{`
        @keyframes neara-aerial-drift {
          0%   { background-position: 48% 33%; }
          100% { background-position: 52% 37%; }
        }
        @keyframes neara-fog-drift {
          0%   { transform: translate(-2%, -1%) scale(1.05); }
          100% { transform: translate(2%, 1%) scale(1.1); }
        }
        @keyframes neara-zone-breathe {
          0%,100% { transform: translate(-50%,-50%) scale(0.92); opacity: 0.55; }
          50%     { transform: translate(-50%,-50%) scale(1.08); opacity: 1; }
        }
      `}</style>

      {/* Layer 5 — Glowing social-energy zones with soft labels */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {PULSE_ZONES.map((z, i) => (
          <div key={i} className="absolute" style={{ left: `${z.x}%`, top: `${z.y}%` }}>
            <span
              className="absolute rounded-full"
              style={{
                width: z.s, height: z.s,
                transform: 'translate(-50%,-50%)',
                background: `radial-gradient(circle, hsl(${z.hue} / 0.28), transparent 70%)`,
                border: `1px solid hsl(${z.hue} / 0.22)`,
                animation: `neara-zone-breathe ${6 + (i % 3)}s ease-in-out ${z.d}s infinite`,
                filter: 'blur(1px)',
              }}
            />
            <span
              className="absolute whitespace-nowrap px-2.5 py-1 rounded-full glass-strong text-[10px] text-foreground/80 border border-primary/25"
              style={{ transform: 'translate(-50%, calc(-50% + 0px))', top: 0, left: 0 }}
            >
              {z.label}
            </span>
          </div>
        ))}
      </div>

      {/* Pan/zoom layer for circles + bubbles */}
      <div
        className="absolute inset-0 transition-transform duration-200 ease-out will-change-transform"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        {/* You — your private circle (translucent, no exact center marker) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div className="relative">
            <div className="w-52 h-52 rounded-full privacy-circle pulse-ring relative" />
            <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 text-center space-y-1">
              <div className="px-3 py-1 rounded-full bg-background/70 border border-primary/40 text-[10px] uppercase tracking-[0.18em] text-foreground/85 backdrop-blur">
                Your private circle
              </div>
              <div className="text-[10px] text-muted-foreground/80 max-w-[220px] mx-auto leading-snug">
                Your exact location is never shown.
              </div>
            </div>
          </div>
        </div>

        {/* Other profiles — bubbles inside approximate privacy zones */}
        {profiles.map((p, idx) => (
          <button
            key={p.id}
            onClick={(e) => { e.stopPropagation(); onSelect(p); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none lift-on-tap"
            style={{ left: `${p.display_x}%`, top: `${p.display_y}%` }}
            aria-label={`${p.name}, ${p.zone_label}`}
          >
            <div
              className="relative pulse-ring privacy-circle group-hover:ring-glow transition-shadow"
              style={{
                width: p.privacy_radius,
                height: p.privacy_radius,
                animation: `float-slow ${6 + (idx % 4)}s ease-in-out ${idx * 0.4}s infinite`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-background/80 shadow-elev ring-1 ring-primary/40 group-hover:ring-primary/70 transition">
                    <img src={p.photo} alt="" draggable={false} className="w-full h-full object-cover" />
                  </div>
                  {p.verified && (
                    <div className="absolute -top-1 -right-1">
                      <TrustBadge size={18} />
                    </div>
                  )}
                  {p.vibe && (
                    <div className="absolute left-1/2 -bottom-7 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full glass-strong text-[10px] text-foreground/85 border border-primary/30">
                      {VIBE_LABEL[p.vibe]}
                    </div>
                  )}
                  <div className="absolute left-1/2 -bottom-[3.25rem] -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full text-[9px] text-muted-foreground/80">
                    {p.zone_label}
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Top banners */}
      {topBanners && (
        <div className="absolute left-3 top-3 z-30 space-y-2 max-w-[60%]">{topBanners}</div>
      )}

      {/* Floating overlay (controls) */}
      {overlay && (
        <div className="absolute right-3 top-3 z-30 flex flex-col gap-2">{overlay}</div>
      )}

      {/* Zoom controls */}
      <div className="absolute right-3 bottom-16 z-30 flex flex-col rounded-full glass-strong overflow-hidden">
        <button
          onClick={(e) => { e.stopPropagation(); setZoom(z => clampZoom(z + 0.1)); }}
          className="w-9 h-9 flex items-center justify-center hover:bg-primary/10 transition text-foreground/80"
          aria-label="Zoom in"
        >+</button>
        <div className="h-px bg-border" />
        <button
          onClick={(e) => { e.stopPropagation(); setZoom(z => clampZoom(z - 0.1)); }}
          className="w-9 h-9 flex items-center justify-center hover:bg-primary/10 transition text-foreground/80"
          aria-label="Zoom out"
        >−</button>
      </div>

      {/* Bottom trust line */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 max-w-[92%]">
        {bottomBar ?? <RotatingTrustLine />}
      </div>
    </div>
  );
}

const TRUST_LINES = [
  'Neara shows approximate areas — never exact pins.',
  'A few people are active nearby.',
  'Your circle is private.',
  'Close enough to find each other. Never close enough to be tracked.',
  'Approximate by design. Private by default.',
];

function RotatingTrustLine() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI(n => (n + 1) % TRUST_LINES.length), 4200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="px-4 py-2 rounded-full glass-strong text-[11px] text-muted-foreground whitespace-nowrap flex items-center gap-2 min-w-[260px] justify-center">
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      <span key={i} className="animate-fade-in">{TRUST_LINES[i]}</span>
    </div>
  );
}
