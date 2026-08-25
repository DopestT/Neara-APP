import { DemoProfile, DiscoveryFilters, Gender } from './types';

export interface DiscoveryViewer {
  interestedIn?: string;
  verifiedOnlyFilter?: boolean;
  filters: DiscoveryFilters;
}

export interface DiscoveryContext {
  hiddenIds?: string[];
  blockedIds?: string[];
}

/**
 * Backward-compatibility only. New accounts persist `filters.genders` directly.
 * This value is never published on a profile and never partitions the network.
 */
export function legacyGenderLens(interestedIn?: string): Gender[] {
  if (interestedIn === 'women') return ['woman'];
  if (interestedIn === 'men') return ['man'];
  if (interestedIn === 'nonbinary') return ['nonbinary'];
  return [];
}

export function getGenderLens(viewer: DiscoveryViewer): Gender[] {
  return viewer.filters.genders ?? legacyGenderLens(viewer.interestedIn);
}

/**
 * Applies one viewer's private lens to the shared Neara population.
 *
 * Critical invariant: this function only removes rows from the current
 * viewer's result set. It never changes another user's preferences,
 * visibility, membership, or the underlying population.
 */
export function filterProfilesForViewer(
  population: DemoProfile[],
  viewer: DiscoveryViewer,
  context: DiscoveryContext = {},
): DemoProfile[] {
  const { filters } = viewer;
  const genders = getGenderLens(viewer);
  const hidden = new Set(context.hiddenIds ?? []);
  const blocked = new Set(context.blockedIds ?? []);

  return population.filter((profile) => {
    if (hidden.has(profile.id) || blocked.has(profile.id)) return false;
    if (genders.length && !genders.includes(profile.gender)) return false;
    if (viewer.verifiedOnlyFilter && !profile.verified) return false;
    if (filters.verifiedOnly && !profile.verified) return false;
    if (profile.age < filters.ageMin || profile.age > filters.ageMax) return false;
    if (
      profile.height_cm &&
      (profile.height_cm < filters.heightMinCm || profile.height_cm > filters.heightMaxCm)
    ) return false;
    if (filters.vibes.length && profile.vibe && !filters.vibes.includes(profile.vibe)) return false;
    if (
      filters.intents.length &&
      profile.looking_for &&
      !profile.looking_for.some((intent) => filters.intents.includes(intent))
    ) return false;
    if (
      filters.interests.length &&
      !profile.interests.some((interest) => filters.interests.includes(interest))
    ) return false;
    if (filters.zoneRadius <= 1 && !profile.nearby_zone) return false;
    return true;
  });
}
