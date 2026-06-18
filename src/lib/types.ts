export type AccentTheme = 'violet' | 'teal' | 'gold' | 'pink' | 'mint';
export type RelationshipIntent = 'tonight' | 'this_week' | 'open_to_chat' | 'casual' | 'see_where_it_goes';
export type Gender = 'woman' | 'man' | 'nonbinary' | 'other' | 'prefer_not_to_say';
export type InterestedIn = 'women' | 'men' | 'everyone' | 'custom';
export type VisibilityMode = 'visible' | 'ghost' | 'invisible_until_match' | 'paused' | 'travel';
export type PrivacyRadius = 'standard' | 'private' | 'extra_private';
export type SignalStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled' | 'blocked';
export type VerificationStatus = 'not_started' | 'pending' | 'approved' | 'rejected';

export type Vibe =
  | 'open_to_chat'
  | 'maybe_tonight'
  | 'coffee_first'
  | 'just_browsing'
  | 'low_key'
  | 'feeling_social'
  | 'in_town';

export const VIBE_LABEL: Record<Vibe, string> = {
  open_to_chat: 'Open to chat',
  maybe_tonight: 'Maybe tonight',
  coffee_first: 'Coffee first',
  just_browsing: 'Just browsing',
  low_key: 'Low-key',
  feeling_social: 'Feeling social',
  in_town: 'In town this week',
};

export const INTENT_LABEL: Record<RelationshipIntent, string> = {
  tonight: 'Tonight',
  this_week: 'This Week',
  open_to_chat: 'Open to Chat',
  casual: 'Casual',
  see_where_it_goes: 'See Where It Goes',
};

export type LookingFor =
  | 'long_term'
  | 'open_to_seeing'
  | 'marriage'
  | 'casual'
  | 'life_partner'
  | 'enm';

export const LOOKING_FOR_LABEL: Record<LookingFor, string> = {
  long_term: 'A long-term relationship',
  open_to_seeing: 'Open to seeing where things go',
  marriage: 'Marriage',
  casual: 'Something casual',
  life_partner: 'A life partner',
  enm: 'Ethical non-monogamy',
};

export interface DemoProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  intent: RelationshipIntent;
  vibe?: Vibe;
  bio: string;
  interests: string[];
  photo: string;
  verified: boolean;
  zone_label: string;
  // privacy circle position on the demo map (percent based)
  display_x: number;
  display_y: number;
  privacy_radius: number; // px
  // Optional richer profile fields
  height_cm?: number;
  activity?: string;
  education?: string;
  drinking?: string;
  smoking?: string;
  kids?: string;
  zodiac?: string;
  politics?: string;
  spirituality?: string;
  looking_for?: LookingFor[];
  values?: string[];
  recently_active?: boolean;
  nearby_zone?: boolean;
}

export interface DiscoveryFilters {
  ageMin: number;
  ageMax: number;
  zoneRadius: 1 | 2 | 3 | 4;
  heightMinCm: number;
  heightMaxCm: number;
  intents: LookingFor[];
  interests: string[];
  vibes: Vibe[];
  verifiedOnly: boolean;
  expandIfQuiet: boolean;
}

export const ZONE_RADIUS_LABEL: Record<DiscoveryFilters['zoneRadius'], string> = {
  1: 'Tight (~1 zone)',
  2: 'Nearby (~3 zones)',
  3: 'City (~6 zones)',
  4: 'Wide (~12 zones)',
};

export interface SignalRecord {
  id: string;
  fromId: string;
  toId: string;
  message?: string;
  status: SignalStatus;
  createdAt: number;
  expiresAt: number;
}

export interface MatchRecord {
  id: string;
  profileId: string;
  createdAt: number;
  lastMessage?: string;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  fromMe: boolean;
  body: string;
  type?: 'text' | 'system' | 'meetup_suggestion' | 'safety_warning' | 'safety_blocked' | 'private_request' | 'private_album';
  createdAt: number;
  safetyCategory?: string;
  /** photos payload for private_album messages (data URLs) */
  photos?: string[];
}
