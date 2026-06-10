import type { DemoProfile } from './types';

export type LngLat = [number, number];

/**
 * Map configuration — privacy-first.
 * No real user coordinates are ever used: demo profiles are placed deterministically
 * around an approximate city center so the relative arrangement matches the old faux map.
 *
 * Overridable via env (no API key required by default):
 *   VITE_MAP_CENTER   "lng,lat"   default Miami downtown
 *   VITE_MAP_STYLE    full style URL
 *   VITE_MAPBOX_TOKEN if set (and no VITE_MAP_STYLE), uses Mapbox dark-v11
 */

const FALLBACK_CENTER: LngLat = [-80.1918, 25.7617]; // Miami

export const NEARA_CENTER: LngLat = (() => {
  const raw = import.meta.env.VITE_MAP_CENTER as string | undefined;
  if (!raw) return FALLBACK_CENTER;
  const [lng, lat] = raw.split(',').map((n) => parseFloat(n.trim()));
  return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : FALLBACK_CENTER;
})();

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

/** Free CARTO dark basemap — no token needed. Upgradeable to Mapbox via env. */
export const NEARA_MAP_STYLE: string =
  (import.meta.env.VITE_MAP_STYLE as string | undefined) ||
  (MAPBOX_TOKEN
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=${MAPBOX_TOKEN}`
    : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json');

export const NEARA_INITIAL_ZOOM = 13;
export const NEARA_MIN_ZOOM = 10.5;
export const NEARA_MAX_ZOOM = 15.5; // capped on purpose — keeps discovery "approximate"

/** Deterministic lng/lat for a demo profile from its percent-space position. */
export function profileLngLat(p: DemoProfile, center: LngLat = NEARA_CENTER): LngLat {
  const [clng, clat] = center;
  const nx = (p.display_x - 50) / 50; // -1 .. 1  (east/west)
  const ny = (p.display_y - 50) / 50; // -1 .. 1  (top = north)
  const SPREAD_LNG = 0.03;
  const SPREAD_LAT = 0.022;
  return [clng + nx * SPREAD_LNG, clat - ny * SPREAD_LAT];
}

/** Approximate privacy-zone radius (meters) for a profile's bubble. */
export function profileRadiusMeters(p: DemoProfile): number {
  return Math.max(260, Math.round(p.privacy_radius * 3.4));
}

/** GeoJSON polygon approximating a circle of `radiusMeters` around `center`. */
export function circleFeature(
  center: LngLat,
  radiusMeters: number,
  props: Record<string, unknown> = {},
  points = 72,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const [lng, lat] = center;
  const earth = 6378137;
  const dLat = (radiusMeters / earth) * (180 / Math.PI);
  const dLng = (radiusMeters / (earth * Math.cos((Math.PI * lat) / 180))) * (180 / Math.PI);
  const ring: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * 2 * Math.PI;
    ring.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]);
  }
  ring.push(ring[0]); // close the ring exactly (GeoJSON requirement)
  return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] }, properties: props };
}

/** Read the live accent color (follows the user's chosen theme) as an hsl() string. */
export function accentHsl(alpha = 1): string {
  if (typeof window === 'undefined') return `hsl(285 70% 68% / ${alpha})`;
  const v = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  const triplet = v || '285 70% 68%';
  return alpha >= 1 ? `hsl(${triplet})` : `hsl(${triplet} / ${alpha})`;
}
