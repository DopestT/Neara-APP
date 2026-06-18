import { useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import maplibregl, { Map as MLMap, Marker as MLMarker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { cn } from '@/lib/utils';
import { DemoProfile, VIBE_LABEL } from '@/lib/types';
import {
  NEARA_CENTER, NEARA_MAP_STYLE, NEARA_INITIAL_ZOOM, NEARA_MIN_ZOOM, NEARA_MAX_ZOOM,
  profileLngLat, profileRadiusMeters, circleFeature, accentHsl, type LngLat,
} from '@/lib/geo';

/**
 * NearaMapGL — real interactive map (MapLibre GL) wearing neara's skin.
 * Drop-in replacement for <NearaMap />: same props.
 *
 * Privacy-first by design even on a real basemap:
 *  - profiles render as approximate privacy *circles* (meters), never exact pins
 *  - zoom is capped so you can't drill to a doorstep
 *  - your own circle is a soft area, not a marker
 * Custom dark style = free CARTO dark basemap + neara plum/fog/vignette overlay.
 */

interface NearaMapGLProps {
  profiles: DemoProfile[];
  onSelect: (p: DemoProfile) => void;
  className?: string;
  overlay?: ReactNode;
  topBanners?: ReactNode;
  bottomBar?: ReactNode;
  /** Approximate radius of your own privacy circle, in meters. */
  youRadiusMeters?: number;
}

const ENERGY_ZONES = [
  { x: 22, y: 28, label: 'A few people active', hue: null, delay: 0 },
  { x: 78, y: 22, label: 'Tonight energy', hue: '38 75% 65%', delay: 1.2 },
  { x: 30, y: 74, label: 'Open to chat', hue: '340 72% 70%', delay: 0.6 },
  { x: 80, y: 70, label: 'Verified activity', hue: '172 55% 58%', delay: 2.0 },
  { x: 54, y: 50, label: 'Quiet nearby', hue: null, delay: 1.6 },
];

const TRUST_LINES = [
  'Neara shows approximate areas — never exact pins.',
  'A few people are active nearby.',
  'Your circle is private.',
  'Close enough to find each other. Never close enough to be tracked.',
  'Approximate by design. Private by default.',
];

function badgeHtml() {
  return `<span class="neara-gl-badge"><svg viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary-foreground))" stroke-width="3"><path d="M5 12l4 4 10-10" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
}

export function NearaMapGL({
  profiles, onSelect, className, overlay, topBanners, bottomBar, youRadiusMeters = 650,
}: NearaMapGLProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<MLMarker[]>([]);
  const youCenterRef = useRef<LngLat>(NEARA_CENTER);
  const [ready, setReady] = useState(false);
  const [trustIdx, setTrustIdx] = useState(0);

  // ── Build / refresh the privacy circles + profile bubbles ──────────────────
  const renderProfiles = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const zoneFeatures = profiles.map((p) =>
      circleFeature(profileLngLat(p), profileRadiusMeters(p), { id: p.id }));
    const src = map.getSource('neara-zones') as maplibregl.GeoJSONSource | undefined;
    if (src) src.setData({ type: 'FeatureCollection', features: zoneFeatures });

    // Rebuild bubble markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    profiles.forEach((p, idx) => {
      const el = document.createElement('button');
      el.className = 'neara-gl-bubble group';
      el.setAttribute('aria-label', `${p.name}, ${p.zone_label}`);
      el.style.animationDelay = `${idx * 0.4}s`;
      el.innerHTML = `
        <span class="neara-gl-bubble-ring"></span>
        <span class="neara-gl-photo">
          <img src="${p.photo}" alt="" draggable="false" />
        </span>
        ${p.verified ? badgeHtml() : ''}
        ${p.vibe ? `<span class="neara-gl-vibe">${VIBE_LABEL[p.vibe]}</span>` : ''}
        <span class="neara-gl-zone">${p.zone_label}</span>`;
      el.addEventListener('click', (e) => { e.stopPropagation(); onSelect(p); });
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(profileLngLat(p))
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [profiles, onSelect]);

  // ── Recolor the GL layers to the live accent theme ─────────────────────────
  const applyAccent = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const fill = accentHsl(0.16);
    const line = accentHsl(0.42);
    if (map.getLayer('neara-zones-fill')) map.setPaintProperty('neara-zones-fill', 'fill-color', fill);
    if (map.getLayer('neara-zones-line')) map.setPaintProperty('neara-zones-line', 'line-color', line);
    if (map.getLayer('neara-you-fill')) map.setPaintProperty('neara-you-fill', 'fill-color', accentHsl(0.12));
    if (map.getLayer('neara-you-line')) map.setPaintProperty('neara-you-line', 'line-color', accentHsl(0.55));
  }, []);

  // ── Init map once ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!wrapRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: wrapRef.current,
      style: NEARA_MAP_STYLE,
      center: NEARA_CENTER,
      zoom: NEARA_INITIAL_ZOOM,
      minZoom: NEARA_MIN_ZOOM,
      maxZoom: NEARA_MAX_ZOOM,
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
      maxPitch: 0,
      cooperativeGestures: false,
    });
    map.touchZoomRotate.disableRotation();
    map.keyboard.disable();
    mapRef.current = map;

    map.on('load', () => {
      // Cinematic overlay (tint + fog + vignette) injected above canvas, below markers
      const container = map.getContainer();
      const overlayEl = document.createElement('div');
      overlayEl.className = 'neara-gl-cinema';
      overlayEl.setAttribute('aria-hidden', 'true');
      overlayEl.innerHTML = `<span class="neara-gl-fog"></span><span class="neara-gl-vignette"></span>`;
      const canvasContainer = map.getCanvasContainer();
      container.insertBefore(overlayEl, canvasContainer.nextSibling);

      // Your private circle (soft area at approximate center)
      map.addSource('neara-you', { type: 'geojson', data: circleFeature(youCenterRef.current, youRadiusMeters) });
      map.addLayer({ id: 'neara-you-fill', type: 'fill', source: 'neara-you', paint: { 'fill-color': accentHsl(0.12) } });
      map.addLayer({ id: 'neara-you-line', type: 'line', source: 'neara-you', paint: { 'line-color': accentHsl(0.55), 'line-width': 1.4, 'line-dasharray': [3, 2] } });

      // Profile privacy circles
      map.addSource('neara-zones', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({ id: 'neara-zones-fill', type: 'fill', source: 'neara-zones', paint: { 'fill-color': accentHsl(0.16) } });
      map.addLayer({ id: 'neara-zones-line', type: 'line', source: 'neara-zones', paint: { 'line-color': accentHsl(0.42), 'line-width': 1 } });

      // Social-energy zones as soft breathing glows (non-interactive markers)
      ENERGY_ZONES.forEach((z) => {
        const zEl = document.createElement('div');
        zEl.className = 'neara-gl-energy';
        zEl.style.setProperty('--ez-hue', z.hue ?? getComputedStyle(document.documentElement).getPropertyValue('--primary').trim());
        zEl.style.animationDelay = `${z.delay}s`;
        zEl.innerHTML = `<span class="neara-gl-energy-glow"></span><span class="neara-gl-energy-label">${z.label}</span>`;
        new maplibregl.Marker({ element: zEl, anchor: 'center' })
          .setLngLat(profileLngLat({ display_x: z.x, display_y: z.y } as DemoProfile))
          .addTo(map);
      });

      setReady(true);
      renderProfiles();
    });

    // Recolor when the user changes accent theme
    const obs = new MutationObserver(() => applyAccent());
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-accent', 'style', 'class'] });

    // Keep the canvas sized to its container
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(wrapRef.current);

    return () => {
      obs.disconnect();
      ro.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render bubbles whenever the visible profile set changes
  useEffect(() => { if (ready) renderProfiles(); }, [ready, renderProfiles]);

  // Rotating trust line
  useEffect(() => {
    const t = window.setInterval(() => setTrustIdx((n) => (n + 1) % TRUST_LINES.length), 4200);
    return () => clearInterval(t);
  }, []);

  const zoomBy = (d: number) => mapRef.current?.zoomTo((mapRef.current?.getZoom() ?? NEARA_INITIAL_ZOOM) + d, { duration: 220 });

  const locate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const map = mapRef.current;
      if (!map) return;
      const c: LngLat = [pos.coords.longitude, pos.coords.latitude];
      youCenterRef.current = c;
      const ys = map.getSource('neara-you') as maplibregl.GeoJSONSource | undefined;
      ys?.setData(circleFeature(c, youRadiusMeters));
      map.flyTo({ center: c, zoom: Math.min(NEARA_MAX_ZOOM, 13.5), speed: 0.8 });
    }, undefined, { enableHighAccuracy: false, timeout: 8000 });
  };

  return (
    <div className={cn('relative overflow-hidden rounded-3xl glass select-none', className)}>
      <div ref={wrapRef} className="neara-gl-map absolute inset-0" />

      {!ready && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground glass-strong rounded-full px-4 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Reading the area…
          </div>
        </div>
      )}

      {/* You-are-here label */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-6 z-20 text-center">
        <div className="px-3 py-1 rounded-full bg-background/70 border border-primary/40 text-[10px] uppercase tracking-[0.18em] text-foreground/85 backdrop-blur">
          Your private circle
        </div>
      </div>

      {topBanners && <div className="absolute left-3 top-3 z-30 space-y-2 max-w-[60%]">{topBanners}</div>}
      {overlay && <div className="absolute right-3 top-3 z-30 flex flex-col gap-2">{overlay}</div>}

      {/* Controls */}
      <div className="absolute right-3 bottom-16 z-30 flex flex-col gap-2">
        <button onClick={locate} className="w-9 h-9 rounded-full glass-strong flex items-center justify-center text-foreground/80 hover:bg-primary/10 transition lift-on-tap" aria-label="Find my area">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round"/></svg>
        </button>
        <div className="flex flex-col rounded-full glass-strong overflow-hidden">
          <button onClick={() => zoomBy(0.6)} className="w-9 h-9 flex items-center justify-center hover:bg-primary/10 transition text-foreground/80" aria-label="Zoom in">+</button>
          <div className="h-px bg-border" />
          <button onClick={() => zoomBy(-0.6)} className="w-9 h-9 flex items-center justify-center hover:bg-primary/10 transition text-foreground/80" aria-label="Zoom out">−</button>
        </div>
      </div>

      {/* Bottom trust line */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 max-w-[92%]">
        {bottomBar ?? (
          <div className="px-4 py-2 rounded-full glass-strong text-[11px] text-muted-foreground whitespace-nowrap flex items-center gap-2 min-w-[260px] justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span key={trustIdx} className="animate-fade-in">{TRUST_LINES[trustIdx]}</span>
          </div>
        )}
      </div>

      <NearaMapGLStyles />
    </div>
  );
}

/** Scoped styles: dark grade on the basemap, cinematic overlay, neara bubbles + energy zones. */
function NearaMapGLStyles() {
  return (
    <style>{`
      .neara-gl-map .maplibregl-canvas { filter: saturate(0.82) brightness(0.78) contrast(1.06); }
      .neara-gl-map .maplibregl-ctrl-attrib { background: hsl(280 14% 7% / 0.55); border-radius: 8px; }
      .neara-gl-map .maplibregl-ctrl-attrib a { color: hsl(36 30% 95% / 0.5); }
      .neara-gl-map .maplibregl-ctrl-logo { opacity: 0.35; }

      .neara-gl-cinema { position: absolute; inset: 0; pointer-events: none; z-index: 1;
        background:
          radial-gradient(ellipse 90% 70% at 50% 40%, hsl(var(--primary) / 0.14), transparent 65%),
          linear-gradient(180deg, hsl(280 30% 4% / 0.42) 0%, hsl(280 28% 3% / 0.12) 45%, hsl(280 30% 3% / 0.5) 100%); }
      .neara-gl-fog { position: absolute; inset: 0;
        background:
          radial-gradient(ellipse 50% 35% at 20% 30%, hsl(var(--primary) / 0.12), transparent 60%),
          radial-gradient(ellipse 45% 30% at 80% 70%, hsl(280 30% 20% / 0.28), transparent 65%);
        filter: blur(10px); opacity: 0.7; animation: neara-gl-fog-drift 28s ease-in-out infinite alternate; }
      .neara-gl-vignette { position: absolute; inset: 0;
        background: radial-gradient(ellipse at 50% 50%, transparent 58%, hsl(280 30% 3% / 0.82) 100%); }
      @keyframes neara-gl-fog-drift { 0% { transform: translate(-2%, -1%) scale(1.05); } 100% { transform: translate(2%, 1%) scale(1.1); } }

      .neara-gl-bubble { position: relative; width: 64px; height: 64px; background: transparent; border: none; padding: 0; cursor: pointer;
        animation: neara-gl-float 7s ease-in-out infinite; -webkit-tap-highlight-color: transparent; }
      @keyframes neara-gl-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      .neara-gl-bubble-ring { position: absolute; inset: -18px; border-radius: 9999px;
        background: radial-gradient(circle, hsl(var(--primary) / 0.20), transparent 70%);
        border: 1px solid hsl(var(--primary) / 0.28); }
      .neara-gl-photo { position: absolute; inset: 0; border-radius: 9999px; overflow: hidden;
        border: 2px solid hsl(var(--background) / 0.85); box-shadow: 0 10px 30px -8px hsl(280 40% 2% / 0.7);
        outline: 1px solid hsl(var(--primary) / 0.4); transition: outline-color .2s; }
      .neara-gl-bubble:hover .neara-gl-photo { outline-color: hsl(var(--primary) / 0.8); }
      .neara-gl-bubble:hover .neara-gl-bubble-ring { box-shadow: 0 0 0 1px hsl(var(--primary) / 0.4), 0 0 30px hsl(var(--primary) / 0.32); }
      .neara-gl-photo img { width: 100%; height: 100%; object-fit: cover; }
      .neara-gl-badge { position: absolute; top: -3px; right: -3px; width: 20px; height: 20px; border-radius: 9999px;
        display: inline-flex; align-items: center; justify-content: center;
        background: var(--gradient-accent); box-shadow: var(--shadow-glow); }
      .neara-gl-badge svg { width: 66%; height: 66%; }
      .neara-gl-vibe, .neara-gl-zone { position: absolute; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      .neara-gl-vibe { bottom: -26px; padding: 2px 9px; border-radius: 9999px; font-size: 10px; color: hsl(var(--foreground) / 0.85);
        background: hsl(var(--card) / 0.7); border: 1px solid hsl(var(--primary) / 0.3); backdrop-filter: blur(6px); }
      .neara-gl-zone { bottom: -42px; font-size: 9px; color: hsl(var(--muted-foreground) / 0.85); }

      .neara-gl-energy { position: relative; width: 0; height: 0; pointer-events: none; }
      .neara-gl-energy-glow { position: absolute; left: 50%; top: 50%; width: 200px; height: 200px; transform: translate(-50%, -50%);
        border-radius: 9999px; background: radial-gradient(circle, hsl(var(--ez-hue) / 0.26), transparent 70%);
        border: 1px solid hsl(var(--ez-hue) / 0.20); filter: blur(1px);
        animation: neara-gl-breathe 7s ease-in-out infinite; }
      .neara-gl-energy-label { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); white-space: nowrap;
        padding: 3px 10px; border-radius: 9999px; font-size: 10px; color: hsl(var(--foreground) / 0.8);
        background: hsl(var(--card) / 0.7); border: 1px solid hsl(var(--primary) / 0.22); backdrop-filter: blur(6px); }
      @keyframes neara-gl-breathe { 0%,100% { transform: translate(-50%,-50%) scale(0.92); opacity: 0.55; } 50% { transform: translate(-50%,-50%) scale(1.08); opacity: 1; } }
    `}</style>
  );
}
