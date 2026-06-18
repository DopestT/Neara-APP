/**
 * Neara Sound Reactions — original, royalty-free, synthesized via WebAudio.
 *
 * Privacy: sounds are LOCAL to the current user only. Triggering events like
 * "pass" or "match" never sends audio to the other person.
 *
 * All presets are procedurally generated tones / envelopes — no copyrighted
 * samples (e.g. the actual "Price is Right" trombone is intentionally NOT used;
 * we synthesize an original "womp" inspired by it).
 */

export type SoundEvent =
  | 'match'
  | 'signal_sent'
  | 'signal_received'
  | 'pass'
  | 'verification'
  | 'premium_unlock';

export type SoundPresetId =
  | 'neara_chime'          // Match default
  | 'soft_pulse'           // Signal Sent default
  | 'gentle_glow'          // Signal Received default
  | 'womp'                 // Pass default (original sad-trombone-inspired)
  | 'badge_stamp'          // Verification default
  | 'gold_shimmer'         // Premium Unlock default
  | 'silent'
  | 'custom';

export interface SoundPresetMeta {
  id: SoundPresetId;
  label: string;
  description: string;
}

export const SOUND_PRESETS: SoundPresetMeta[] = [
  { id: 'neara_chime', label: 'Warm Neara Chime', description: 'Signature two-note bloom' },
  { id: 'soft_pulse', label: 'Soft Pulse', description: 'Whisper-quiet heartbeat' },
  { id: 'gentle_glow', label: 'Gentle Glow', description: 'Airy rising shimmer' },
  { id: 'womp', label: 'Womp (original)', description: 'Sad-trombone-inspired, royalty-free' },
  { id: 'badge_stamp', label: 'Badge Stamp', description: 'Tactile confirm thunk' },
  { id: 'gold_shimmer', label: 'Gold Shimmer', description: 'Luxe high sparkle' },
  { id: 'silent', label: 'Silent', description: 'No sound for this event' },
];

const PRESET_FOR_EVENT_DEFAULT: Record<SoundEvent, SoundPresetId> = {
  match: 'neara_chime',
  signal_sent: 'soft_pulse',
  signal_received: 'gentle_glow',
  pass: 'womp',
  verification: 'badge_stamp',
  premium_unlock: 'gold_shimmer',
};

export interface SoundSettings {
  enabled: boolean;
  respectSilent: boolean;
  vibrationOnly: boolean;
  events: Record<SoundEvent, SoundPresetId>;
  /** Per-event custom uploaded sound (premium). Mocked = just a label here. */
  customLabels: Partial<Record<SoundEvent, string>>;
}

const SETTINGS_KEY = 'neara.soundReactions.v1';

export function defaultSoundSettings(): SoundSettings {
  return {
    enabled: true,
    respectSilent: true,
    vibrationOnly: false,
    events: { ...PRESET_FOR_EVENT_DEFAULT },
    customLabels: {},
  };
}

export function loadSoundSettings(): SoundSettings {
  if (typeof window === 'undefined') return defaultSoundSettings();
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSoundSettings();
    const parsed = JSON.parse(raw);
    return {
      ...defaultSoundSettings(),
      ...parsed,
      events: { ...PRESET_FOR_EVENT_DEFAULT, ...(parsed.events || {}) },
      customLabels: parsed.customLabels || {},
    };
  } catch {
    return defaultSoundSettings();
  }
}

export function saveSoundSettings(s: SoundSettings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
  window.dispatchEvent(new CustomEvent('neara:soundSettingsChanged'));
}

/* ───────────────────────────── Web Audio engine ───────────────────────────── */

let _ctx: AudioContext | null = null;
function ctx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (_ctx) return _ctx;
  const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  _ctx = new AC();
  return _ctx;
}

interface ToneSpec {
  freq: number;
  start: number;     // seconds offset
  dur: number;       // seconds
  type?: OscillatorType;
  gain?: number;     // peak gain
  glideTo?: number;  // optional pitch glide target
  detune?: number;
}

function playTones(tones: ToneSpec[], masterGain = 0.18) {
  const ac = ctx();
  if (!ac) return;
  if (ac.state === 'suspended') ac.resume().catch(() => {});
  const now = ac.currentTime;
  const master = ac.createGain();
  master.gain.value = masterGain;
  master.connect(ac.destination);

  tones.forEach(t => {
    const osc = ac.createOscillator();
    osc.type = t.type || 'sine';
    osc.frequency.setValueAtTime(t.freq, now + t.start);
    if (t.glideTo !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, t.glideTo), now + t.start + t.dur);
    }
    if (t.detune) osc.detune.value = t.detune;

    const g = ac.createGain();
    const peak = t.gain ?? 0.6;
    // ADSR-ish envelope: fast attack, gentle release
    g.gain.setValueAtTime(0.0001, now + t.start);
    g.gain.exponentialRampToValueAtTime(peak, now + t.start + Math.min(0.04, t.dur * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0001, now + t.start + t.dur);

    osc.connect(g).connect(master);
    osc.start(now + t.start);
    osc.stop(now + t.start + t.dur + 0.02);
  });
}

function playNoiseBurst(durSec: number, hpFreq = 800, gain = 0.06) {
  const ac = ctx();
  if (!ac) return;
  const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * durSec), ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = hpFreq;
  const g = ac.createGain();
  g.gain.value = gain;
  src.connect(hp).connect(g).connect(ac.destination);
  src.start();
}

/* ───────────────────────────── Preset renderers ───────────────────────────── */

const RENDERERS: Record<Exclude<SoundPresetId, 'silent' | 'custom'>, () => void> = {
  // Two-note warm bloom (E5 → B5) with soft sine + triangle layer
  neara_chime: () => playTones([
    { freq: 659.25, start: 0,    dur: 0.55, type: 'sine',     gain: 0.5 },
    { freq: 987.77, start: 0.12, dur: 0.65, type: 'sine',     gain: 0.45 },
    { freq: 329.63, start: 0.0,  dur: 0.7,  type: 'triangle', gain: 0.18 },
  ], 0.22),

  // Single low soft "thump" + breath
  soft_pulse: () => {
    playTones([
      { freq: 180, start: 0, dur: 0.18, type: 'sine', gain: 0.55, glideTo: 120 },
    ], 0.22);
    playNoiseBurst(0.08, 1200, 0.03);
  },

  // Airy upward glide — like a soft notification
  gentle_glow: () => playTones([
    { freq: 520,  start: 0,    dur: 0.45, type: 'sine', gain: 0.45, glideTo: 880 },
    { freq: 1040, start: 0.18, dur: 0.35, type: 'sine', gain: 0.25 },
  ], 0.18),

  // Original sad-trombone-inspired "womp" — descending sawtooth thirds
  // (Intentionally NOT the copyrighted Price is Right sample.)
  womp: () => playTones([
    { freq: 392, start: 0.00, dur: 0.18, type: 'sawtooth', gain: 0.35, glideTo: 370 },
    { freq: 349, start: 0.18, dur: 0.18, type: 'sawtooth', gain: 0.35, glideTo: 330 },
    { freq: 311, start: 0.36, dur: 0.22, type: 'sawtooth', gain: 0.35, glideTo: 294 },
    { freq: 262, start: 0.58, dur: 0.55, type: 'sawtooth', gain: 0.40, glideTo: 175 },
  ], 0.16),

  // Tactile stamp: short low square + bright tick
  badge_stamp: () => {
    playTones([
      { freq: 140, start: 0, dur: 0.14, type: 'square',   gain: 0.45, glideTo: 90 },
      { freq: 1600, start: 0.02, dur: 0.08, type: 'triangle', gain: 0.25 },
    ], 0.2);
    playNoiseBurst(0.06, 2000, 0.04);
  },

  // Luxe shimmer: stacked high sines fading in/out
  gold_shimmer: () => {
    playTones([
      { freq: 1175, start: 0.00, dur: 0.9,  type: 'sine', gain: 0.22 },
      { freq: 1568, start: 0.06, dur: 0.85, type: 'sine', gain: 0.20 },
      { freq: 1976, start: 0.14, dur: 0.8,  type: 'sine', gain: 0.18 },
      { freq: 2637, start: 0.22, dur: 0.7,  type: 'sine', gain: 0.14 },
    ], 0.18);
    playNoiseBurst(0.5, 4000, 0.02);
  },
};

/* ──────────────────────────── Public play API ──────────────────────────── */

/** Play a preset directly (used by preview buttons). */
export function previewPreset(id: SoundPresetId, customLabel?: string) {
  if (id === 'silent') return;
  if (id === 'custom') {
    // Mock: custom uploads are simulated — fall back to neara_chime so preview still gives feedback.
    RENDERERS.neara_chime();
    return;
  }
  RENDERERS[id]?.();
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { (navigator as any).vibrate(pattern); } catch {}
  }
}

const VIBRATION_FOR_EVENT: Record<SoundEvent, number | number[]> = {
  match: [12, 60, 18],
  signal_sent: 10,
  signal_received: [8, 40, 8],
  pass: [6, 30, 6, 30, 10],
  verification: [14, 50, 14],
  premium_unlock: [10, 40, 10, 40, 20],
};

/**
 * Play the user's chosen sound for an in-app event.
 * Safe to call from anywhere — fails silently if WebAudio is unavailable.
 */
export function playSoundForEvent(event: SoundEvent) {
  const s = loadSoundSettings();
  if (!s.enabled) return;
  if (s.vibrationOnly) {
    vibrate(VIBRATION_FOR_EVENT[event]);
    return;
  }
  // "Respect silent mode" is a best-effort hint on the web — there is no
  // reliable silent-mode signal in the browser. We still call vibrate (which
  // OS-level silent mode honors) and proceed with audio; native wrapper can
  // hook this flag in the future.
  vibrate(VIBRATION_FOR_EVENT[event]);
  const preset = s.events[event] || PRESET_FOR_EVENT_DEFAULT[event];
  previewPreset(preset, s.customLabels[event]);
}

export const DEFAULT_PRESET_FOR_EVENT = PRESET_FOR_EVENT_DEFAULT;

export const SOUND_EVENT_META: Record<SoundEvent, { title: string; description: string }> = {
  match:           { title: 'Match Sound',           description: 'Choose what plays when two circles become one.' },
  signal_sent:     { title: 'Signal Sent Sound',     description: 'A soft cue when your Signal leaves.' },
  signal_received: { title: 'Signal Received Sound', description: 'A gentle alert when someone reaches out.' },
  pass:            { title: 'Pass Sound',            description: 'Play a private sound when you choose Not My Vibe.' },
  verification:    { title: 'Verification Sound',    description: 'Celebrate the moment your Trust Badge lands.' },
  premium_unlock:  { title: 'Premium Unlock Sound',  description: 'A luxe shimmer when Premium activates.' },
};
