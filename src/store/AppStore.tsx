import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { AccentTheme, RelationshipIntent, VisibilityMode, PrivacyRadius, SignalRecord, MatchRecord, ChatMessage, Vibe, DiscoveryFilters } from '@/lib/types';
import { DEMO_PROFILES } from '@/lib/demoData';
import { scanMessage, offAppEligible, LocationConfidence, OffAppStatus, SafetyScanResult } from '@/lib/safety';

interface UserState {
  displayName: string;
  age: number;
  gender: string;
  interestedIn: string;
  intent: RelationshipIntent;
  vibe?: Vibe;
  bio: string;
  interests: string[];
  photoCount: number;
  /** Real photo data URLs uploaded by the user. photos[0] is the main photo. */
  photos: string[];
  /** Private album photos — only visible to matches you explicitly share with. */
  privatePhotos: string[];
  /** signature of the main photo — used to flag stale verification when it changes */
  mainPhotoSig: string;
  /** signature captured at the moment of verification */
  verifiedPhotoSig: string;
  verified: boolean;
  premium: boolean;
  visibility: VisibilityMode;
  privacyRadius: PrivacyRadius;
  trustBadge: boolean;
  locationConfidence: LocationConfidence;
  travelCity?: string;
  verifiedOnlyFilter: boolean;
  mutedChats: boolean;
  pressureWarnings: number;
  filters: DiscoveryFilters;
}

export const DEFAULT_FILTERS: DiscoveryFilters = {
  ageMin: 24,
  ageMax: 44,
  zoneRadius: 2,
  heightMinCm: 150,
  heightMaxCm: 200,
  intents: [],
  interests: [],
  vibes: [],
  verifiedOnly: false,
  expandIfQuiet: true,
};

export type SignalSendResult =
  | { ok: true }
  | { ok: false; reason: 'out_of_signals' | 'cooldown'; cooldownSecondsLeft?: number };

export interface ReportRecord {
  id: string;
  targetId: string;
  reason: string;
  detail?: string;
  createdAt: number;
}

interface AppState {
  user: UserState;
  setUser: (u: Partial<UserState>) => void;
  accent: AccentTheme;
  autoAccent: boolean;
  setAccent: (a: AccentTheme) => void;
  setAutoAccent: (v: boolean) => void;
  signalsLeft: number;
  signalsLimit: number;
  sendSignal: (toId: string, message?: string) => SignalSendResult;
  signalCooldownLeft: number;
  signals: SignalRecord[];
  matches: MatchRecord[];
  acceptSignal: (id: string) => string | null;
  declineSignal: (id: string) => void;
  blockedIds: string[];
  block: (id: string) => void;
  unblock: (id: string) => void;
  hiddenIds: string[];
  hide: (id: string) => void;
  unhide: (id: string) => void;
  messages: ChatMessage[];
  sendMessage: (matchId: string, body: string, type?: ChatMessage['type']) => SafetyScanResult;
  trySendMessage: (matchId: string, body: string) => SafetyScanResult;
  offAppStatusFor: (matchId: string) => OffAppStatus;
  hideMeNow: (alsoMute?: boolean) => void;
  showMe: () => void;
  reports: ReportRecord[];
  fileReport: (r: Omit<ReportRecord, 'id' | 'createdAt'>) => void;
  resetOnboarding: () => void;
  onboardingComplete: boolean;
  completeOnboarding: () => void;
  /** Whether profile has the minimum required fields to enter discovery */
  profileComplete: boolean;
  /** % strength 0..100 of profile completeness (more generous than minimum) */
  profileStrength: number;
  profileMissing: string[];
  profileMissingDetailed: { label: string; required: boolean }[];
  /** Verified user changed their main photo since approval — needs re-verify */
  verificationStale: boolean;
  /** Per-match private album access granted by ME to them */
  privateAccess: Record<string, boolean>;
  /** Per-match private album access requests from THEM, pending my decision */
  privateRequests: Record<string, boolean>;
  requestPrivateAlbum: (matchId: string) => void;
  sharePrivateAlbum: (matchId: string) => void;
  revokePrivateAlbum: (matchId: string) => void;
}

const AppContext = createContext<AppState | null>(null);

const defaultUser: UserState = {
  displayName: '',
  age: 0,
  gender: '',
  interestedIn: '',
  intent: 'open_to_chat',
  vibe: 'open_to_chat',
  bio: '',
  interests: [],
  photoCount: 0,
  photos: [],
  privatePhotos: [],
  mainPhotoSig: '',
  verifiedPhotoSig: '',
  verified: false,
  premium: false,
  visibility: 'visible',
  privacyRadius: 'standard',
  trustBadge: false,
  locationConfidence: 'normal',
  travelCity: undefined,
  verifiedOnlyFilter: false,
  mutedChats: false,
  pressureWarnings: 0,
  filters: DEFAULT_FILTERS,
};

const SIGNAL_COOLDOWN_MS = 8_000;

export function computeProfileStrength(user: Pick<UserState, 'displayName' | 'age' | 'gender' | 'interestedIn' | 'photoCount' | 'bio' | 'interests' | 'verified'>) {
  const checks: { key: string; pass: boolean; required?: boolean; label: string }[] = [
    { key: 'name',     pass: !!user.displayName.trim(),         required: true,  label: 'Display name' },
    { key: 'age',      pass: user.age >= 18,                    required: true,  label: 'Age (18+)' },
    { key: 'gender',   pass: !!user.gender,                     required: true,  label: 'Gender' },
    { key: 'interest', pass: !!user.interestedIn,               required: true,  label: 'Interested in' },
    { key: 'photo',    pass: user.photoCount >= 1,              required: true,  label: 'At least 1 photo' },
    { key: 'bio',      pass: user.bio.trim().length >= 20,                       label: 'Bio (20+ chars)' },
    { key: 'tags',     pass: user.interests.length >= 3,                         label: '3+ interests' },
    { key: 'photos3',  pass: user.photoCount >= 3,                               label: '3 photos' },
    { key: 'verified', pass: user.verified,                                      label: 'Verified' },
  ];
  const passed = checks.filter(c => c.pass).length;
  const strength = Math.round((passed / checks.length) * 100);
  const required = checks.filter(c => c.required);
  const complete = required.every(c => c.pass);
  const missingDetailed = checks.filter(c => !c.pass).map(c => ({ label: c.label, required: !!c.required }));
  const missing = missingDetailed.map(m => m.label);
  return { profileComplete: complete, profileStrength: strength, profileMissing: missing, profileMissingDetailed: missingDetailed };
}


export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserState>(defaultUser);
  const [accent, setAccentState] = useState<AccentTheme>('violet');
  const [autoAccent, setAutoAccent] = useState(false);
  const [signals, setSignals] = useState<SignalRecord[]>([
    { id: 's-in-1', fromId: 'p2', toId: 'me', status: 'pending', createdAt: Date.now() - 3600_000, expiresAt: Date.now() + 6*86400_000, message: 'Your bio caught my eye.' },
    { id: 's-in-2', fromId: 'p5', toId: 'me', status: 'pending', createdAt: Date.now() - 7200_000, expiresAt: Date.now() + 6*86400_000 },
  ]);
  const [matches, setMatches] = useState<MatchRecord[]>([
    { id: 'm-demo', profileId: 'p4', createdAt: Date.now() - 86400_000, lastMessage: 'Nice to meet you.' },
  ]);
  const [blockedIds, setBlocked] = useState<string[]>([]);
  const [hiddenIds, setHidden] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'msg-1', matchId: 'm-demo', fromMe: false, body: 'Hi! Glad we matched.', createdAt: Date.now() - 80000_000 },
    { id: 'msg-sys', matchId: 'm-demo', fromMe: false, type: 'system', body: 'Your exact location is hidden. Share details only when you\'re ready.', createdAt: Date.now() - 80001_000 },
    { id: 'msg-pr-seed', matchId: 'm-demo', fromMe: false, type: 'private_request', body: 'Asked to see your private album.', createdAt: Date.now() - 70000_000 },
  ]);
  const [onboardingComplete, setOnboarding] = useState(false);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [privateAccess, setPrivateAccess] = useState<Record<string, boolean>>({});
  const [privateRequests, setPrivateRequests] = useState<Record<string, boolean>>({ 'm-demo': true });
  const lastSignalAt = useRef(0);
  const [, tick] = useState(0); // re-render to refresh cooldown countdown
  useEffect(() => {
    const t = setInterval(() => tick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const signalsLimit = user.premium ? 50 : user.verified ? 25 : 20;
  const signalsUsedToday = signals.filter(s => s.fromId === 'me' && Date.now() - s.createdAt < 86400_000).length;
  const signalsLeft = Math.max(0, signalsLimit - signalsUsedToday);
  const signalCooldownLeft = Math.max(0, Math.ceil((lastSignalAt.current + SIGNAL_COOLDOWN_MS - Date.now()) / 1000));

  useEffect(() => { document.documentElement.setAttribute('data-accent', accent); }, [accent]);

  useEffect(() => {
    if (!autoAccent) return;
    const themes: AccentTheme[] = ['violet', 'teal', 'gold', 'pink', 'mint'];
    const apply = () => setAccentState(themes[new Date().getHours() % themes.length]);
    apply();
    const t = setInterval(apply, 60_000);
    return () => clearInterval(t);
  }, [autoAccent]);

  // Profile strength & completeness
  const { profileComplete, profileStrength, profileMissing, profileMissingDetailed } = useMemo(() => computeProfileStrength(user), [user]);


  const verificationStale = user.verified && !!user.verifiedPhotoSig && user.mainPhotoSig !== user.verifiedPhotoSig;

  const value: AppState = useMemo(() => ({
    user,
    setUser: (u) => setUserState(s => ({ ...s, ...u })),
    accent,
    autoAccent,
    setAccent: (a) => { setAutoAccent(false); setAccentState(a); },
    setAutoAccent,
    signalsLeft,
    signalsLimit,
    signalCooldownLeft,
    signals,
    matches,
    blockedIds,
    hiddenIds,
    messages,
    reports,
    onboardingComplete,
    profileComplete,
    profileStrength,
    profileMissing,
    profileMissingDetailed,
    verificationStale,
    completeOnboarding: () => setOnboarding(true),
    resetOnboarding: () => { setUserState(defaultUser); setOnboarding(false); },
    sendSignal: (toId, message) => {
      if (signalsLeft <= 0) return { ok: false, reason: 'out_of_signals' };
      const cd = lastSignalAt.current + SIGNAL_COOLDOWN_MS - Date.now();
      if (cd > 0) return { ok: false, reason: 'cooldown', cooldownSecondsLeft: Math.ceil(cd / 1000) };
      lastSignalAt.current = Date.now();
      setSignals(s => [...s, { id: `s-${Date.now()}`, fromId: 'me', toId, message, status: 'pending', createdAt: Date.now(), expiresAt: Date.now() + 7*86400_000 }]);
      return { ok: true };
    },
    acceptSignal: (id) => {
      const sig = signals.find(s => s.id === id);
      if (!sig) return null;
      const profile = DEMO_PROFILES.find(p => p.id === sig.fromId);
      if (!profile) return null;
      setSignals(s => s.map(x => x.id === id ? { ...x, status: 'accepted' } : x));
      const match: MatchRecord = { id: `m-${Date.now()}`, profileId: profile.id, createdAt: Date.now() };
      setMatches(m => [match, ...m]);
      setMessages(ms => [...ms, { id: `sys-${Date.now()}`, matchId: match.id, fromMe: false, type: 'system', body: 'Your exact location is hidden. Share details only when you\'re ready.', createdAt: Date.now() }]);
      return match.id;
    },
    declineSignal: (id) => setSignals(s => s.map(x => x.id === id ? { ...x, status: 'declined' } : x)),
    block: (id) => {
      setBlocked(b => b.includes(id) ? b : [...b, id]);
      // cancel any signals between us and them, close matches and disable chats
      setSignals(s => s.map(x => (x.fromId === id || x.toId === id) && x.status === 'pending' ? { ...x, status: 'blocked' } : x));
      setMatches(ms => ms.filter(m => m.profileId !== id));
    },
    unblock: (id) => setBlocked(b => b.filter(x => x !== id)),
    hide: (id) => setHidden(h => h.includes(id) ? h : [...h, id]),
    unhide: (id) => setHidden(h => h.filter(x => x !== id)),
    sendMessage: (matchId, body, type = 'text') => {
      const scan: SafetyScanResult = type === 'text' ? scanMessage(body) : { level: 'safe', findings: [], message: '' };
      const match = matches.find(m => m.id === matchId);
      const profile = match ? DEMO_PROFILES.find(p => p.id === match.profileId) : null;
      const msgCount = messages.filter(m => m.matchId === matchId && m.type !== 'system' && m.type !== 'safety_warning' && m.type !== 'safety_blocked').length;
      const eligible = offAppEligible({ matched: !!match, bothVerified: !!user.verified && !!profile?.verified, messageCount: msgCount });

      let level = scan.level;
      if (eligible && level === 'warning' && scan.findings.every(f => f.category === 'social_handle' || f.category === 'off_app_phrase')) level = 'safe';
      if (scan.findings.some(f => f.category === 'location_pressure')) setUserState(s => ({ ...s, pressureWarnings: s.pressureWarnings + 1 }));

      if (level === 'blocked') {
        setMessages(ms => [...ms, { id: `blk-${Date.now()}`, matchId, fromMe: true, body, type: 'safety_blocked', createdAt: Date.now(), safetyCategory: scan.findings[0]?.category }]);
        return scan;
      }
      if (level === 'warning') {
        setMessages(ms => [...ms,
          { id: `msg-${Date.now()}`, matchId, fromMe: true, body, type: 'text', createdAt: Date.now() },
          { id: `warn-${Date.now()}`, matchId, fromMe: false, body: scan.message, type: 'safety_warning', createdAt: Date.now() + 1, safetyCategory: scan.findings[0]?.category },
        ]);
        return scan;
      }

      setMessages(ms => [...ms, { id: `msg-${Date.now()}`, matchId, fromMe: true, body, type, createdAt: Date.now() }]);
      if (type === 'text') {
        setTimeout(() => {
          setMessages(ms => [...ms, { id: `msg-${Date.now()}-r`, matchId, fromMe: false, body: 'That sounds lovely.', createdAt: Date.now() }]);
        }, 1400);
      }
      return scan;
    },
    trySendMessage: (_matchId, body) => scanMessage(body),
    offAppStatusFor: (matchId) => {
      const match = matches.find(m => m.id === matchId);
      const profile = match ? DEMO_PROFILES.find(p => p.id === match.profileId) : null;
      const msgCount = messages.filter(m => m.matchId === matchId && m.type !== 'system' && m.type !== 'safety_warning' && m.type !== 'safety_blocked').length;
      if (user.pressureWarnings >= 3) return 'restricted';
      if (offAppEligible({ matched: !!match, bothVerified: !!user.verified && !!profile?.verified, messageCount: msgCount })) return 'eligible';
      return 'locked';
    },
    hideMeNow: (alsoMute) => setUserState(s => ({ ...s, visibility: 'paused', mutedChats: alsoMute ? true : s.mutedChats })),
    showMe: () => setUserState(s => ({ ...s, visibility: 'visible', mutedChats: false })),
    fileReport: (r) => setReports(rs => [{ ...r, id: `r-${Date.now()}`, createdAt: Date.now() }, ...rs]),
    privateAccess,
    privateRequests,
    requestPrivateAlbum: (matchId) => {
      // Send a request message from me, then simulate them granting after a delay with their "private" album (their main photo as stand-in).
      setMessages(ms => [...ms, { id: `pr-${Date.now()}`, matchId, fromMe: true, type: 'private_request', body: 'Asked to see your private album.', createdAt: Date.now() }]);
      setTimeout(() => {
        const match = matches.find(m => m.id === matchId);
        const profile = match ? DEMO_PROFILES.find(p => p.id === match.profileId) : null;
        if (!profile) return;
        setMessages(ms => [...ms, {
          id: `pa-${Date.now()}`, matchId, fromMe: false, type: 'private_album',
          body: `${profile.name} shared their private album.`,
          photos: [profile.photo, profile.photo, profile.photo],
          createdAt: Date.now(),
        }]);
      }, 1800);
    },
    sharePrivateAlbum: (matchId) => {
      if (!user.privatePhotos.length) return;
      setPrivateAccess(a => ({ ...a, [matchId]: true }));
      setPrivateRequests(r => { const { [matchId]: _, ...rest } = r; return rest; });
      setMessages(ms => [...ms, {
        id: `pa-${Date.now()}`, matchId, fromMe: true, type: 'private_album',
        body: 'Shared your private album.',
        photos: [...user.privatePhotos],
        createdAt: Date.now(),
      }]);
    },
    revokePrivateAlbum: (matchId) => {
      setPrivateAccess(a => { const { [matchId]: _, ...rest } = a; return rest; });
      setMessages(ms => [...ms, { id: `pv-${Date.now()}`, matchId, fromMe: true, type: 'system', body: 'You revoked private album access.', createdAt: Date.now() }]);
    },
  }), [user, accent, autoAccent, signals, matches, blockedIds, hiddenIds, messages, signalsLeft, signalsLimit, signalCooldownLeft, onboardingComplete, profileComplete, profileStrength, profileMissing, verificationStale, reports, privateAccess, privateRequests]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const c = useContext(AppContext);
  if (!c) throw new Error('useApp must be used within AppProvider');
  return c;
};
