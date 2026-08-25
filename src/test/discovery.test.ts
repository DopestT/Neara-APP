import { describe, expect, it } from 'vitest';
import { DEMO_PROFILES } from '@/lib/demoData';
import { filterProfilesForViewer, getGenderLens } from '@/lib/discovery';
import { DiscoveryFilters } from '@/lib/types';

const baseFilters: DiscoveryFilters = {
  ageMin: 18,
  ageMax: 70,
  zoneRadius: 4,
  heightMinCm: 150,
  heightMaxCm: 210,
  intents: [],
  interests: [],
  vibes: [],
  verifiedOnly: false,
  expandIfQuiet: true,
  genders: [],
};

describe('Neara unified discovery map', () => {
  it('shows the shared population when the viewer has no gender lens', () => {
    const result = filterProfilesForViewer(DEMO_PROFILES, { filters: baseFilters });
    expect(result.map(p => p.id)).toEqual(DEMO_PROFILES.map(p => p.id));
  });

  it('filters only the current viewer result set', () => {
    const womenView = filterProfilesForViewer(DEMO_PROFILES, {
      filters: { ...baseFilters, genders: ['woman'] },
    });
    const menView = filterProfilesForViewer(DEMO_PROFILES, {
      filters: { ...baseFilters, genders: ['man'] },
    });

    expect(womenView.length).toBeGreaterThan(0);
    expect(womenView.every(p => p.gender === 'woman')).toBe(true);
    expect(menView.length).toBeGreaterThan(0);
    expect(menView.every(p => p.gender === 'man')).toBe(true);

    // The source population remains one network and is never mutated.
    expect(DEMO_PROFILES.some(p => p.gender === 'woman')).toBe(true);
    expect(DEMO_PROFILES.some(p => p.gender === 'man')).toBe(true);
    expect(DEMO_PROFILES.some(p => p.gender === 'nonbinary')).toBe(true);
  });

  it('supports inclusive multi-gender lenses', () => {
    const result = filterProfilesForViewer(DEMO_PROFILES, {
      filters: { ...baseFilters, genders: ['man', 'nonbinary'] },
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result.every(p => p.gender === 'man' || p.gender === 'nonbinary')).toBe(true);
  });

  it('keeps blocks and hides independent of identity filters', () => {
    const result = filterProfilesForViewer(
      DEMO_PROFILES,
      { filters: baseFilters },
      { blockedIds: ['p1'], hiddenIds: ['p2'] },
    );

    expect(result.some(p => p.id === 'p1')).toBe(false);
    expect(result.some(p => p.id === 'p2')).toBe(false);
  });

  it('migrates the old single-choice setting as a private viewer lens', () => {
    expect(getGenderLens({ interestedIn: 'women', filters: { ...baseFilters, genders: undefined } })).toEqual(['woman']);
    expect(getGenderLens({ interestedIn: 'men', filters: { ...baseFilters, genders: undefined } })).toEqual(['man']);
    expect(getGenderLens({ interestedIn: 'everyone', filters: { ...baseFilters, genders: undefined } })).toEqual([]);
  });
});
