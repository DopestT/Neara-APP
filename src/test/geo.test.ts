import { describe, it, expect } from 'vitest';
import { circleFeature, profileLngLat, profileRadiusMeters, NEARA_CENTER } from '@/lib/geo';
import type { DemoProfile } from '@/lib/types';

const mk = (display_x: number, display_y: number, privacy_radius = 100): DemoProfile =>
  ({ display_x, display_y, privacy_radius } as DemoProfile);

describe('geo helpers', () => {
  it('places a centered profile at the map center', () => {
    const [lng, lat] = profileLngLat(mk(50, 50));
    expect(lng).toBeCloseTo(NEARA_CENTER[0], 6);
    expect(lat).toBeCloseTo(NEARA_CENTER[1], 6);
  });

  it('is deterministic for the same input', () => {
    expect(profileLngLat(mk(30, 70))).toEqual(profileLngLat(mk(30, 70)));
  });

  it('treats lower display_y as further north (higher latitude)', () => {
    const north = profileLngLat(mk(50, 10))[1];
    const south = profileLngLat(mk(50, 90))[1];
    expect(north).toBeGreaterThan(south);
  });

  it('clamps the privacy radius to a sane minimum', () => {
    expect(profileRadiusMeters(mk(0, 0, 1))).toBeGreaterThanOrEqual(260);
  });

  it('builds a closed circle polygon of the requested resolution', () => {
    const f = circleFeature([0, 0], 500, {}, 64);
    const ring = f.geometry.coordinates[0];
    expect(ring.length).toBe(65); // points + 1 (closed)
    expect(ring[0]).toEqual(ring[ring.length - 1]);
  });
});
