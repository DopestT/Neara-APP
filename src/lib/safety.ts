// Neara safety scanner — purely client-side mock for prototype.
// Scans outgoing chat messages for off-app sharing & location-pressure attempts.

export type SafetyLevel = 'safe' | 'warning' | 'blocked';
export type SafetyCategory =
  | 'social_handle'
  | 'phone'
  | 'link'
  | 'payment'
  | 'crypto'
  | 'off_app_phrase'
  | 'location_pressure'
  | 'never_on_here';

export interface SafetyFinding {
  level: SafetyLevel;
  category: SafetyCategory;
  match: string;
  reason: string;
}

export interface SafetyScanResult {
  level: SafetyLevel;
  findings: SafetyFinding[];
  message: string;
}

const RX = {
  // social handles & off-app apps
  social: /\b(insta(gram)?|snap(chat)?|telegram|whats\s?app|tiktok|kik|signal|wechat|discord|@[a-z0-9._]{2,})\b/i,
  // phone numbers (loose international/US)
  phone: /(?:\+?\d[\s\-().]?){7,}\d/,
  // links / domains
  link: /(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|io|co|me|app|gg|ly|xyz|link))/i,
  // payment apps
  payment: /\b(cash\s?app|cashapp|venmo|zelle|paypal|revolut|wise|apple\s?pay|google\s?pay)\b/i,
  // crypto
  crypto: /\b(btc|bitcoin|eth|ethereum|usdt|crypto|wallet|metamask|binance|coinbase)\b/i,
  // off-app phrases
  offApp: /\b(text me|add me|message me there|hit me up|dm me|reach me on|find me on|i.?m never on here|let.?s move|move this off|continue (this )?(elsewhere|outside))\b/i,
  // location pressure
  locPressure: /\b(send (me )?your address|drop (me )?your (location|pin)|where exactly|exact location|come to my place|come over now|what.?s your address|your address\??|share location)\b/i,
};

export function scanMessage(text: string): SafetyScanResult {
  const findings: SafetyFinding[] = [];
  const t = text.trim();
  if (!t) return { level: 'safe', findings, message: '' };

  if (RX.phone.test(t)) findings.push({ level: 'blocked', category: 'phone', match: t.match(RX.phone)![0], reason: 'Phone numbers can lead to scams.' });
  if (RX.payment.test(t)) findings.push({ level: 'blocked', category: 'payment', match: t.match(RX.payment)![0], reason: 'Payment apps are a common scam vector.' });
  if (RX.crypto.test(t)) findings.push({ level: 'blocked', category: 'crypto', match: t.match(RX.crypto)![0], reason: 'Crypto/payment requests are blocked early on.' });
  if (RX.link.test(t)) findings.push({ level: 'blocked', category: 'link', match: t.match(RX.link)![0], reason: 'Unknown links are blocked until trust is built.' });
  if (RX.locPressure.test(t)) findings.push({ level: 'warning', category: 'location_pressure', match: t.match(RX.locPressure)![0], reason: 'Neara protects exact location.' });
  if (RX.social.test(t)) findings.push({ level: 'warning', category: 'social_handle', match: t.match(RX.social)![0], reason: 'Off-app handles are limited until trust is built.' });
  if (RX.offApp.test(t)) findings.push({ level: 'warning', category: 'off_app_phrase', match: t.match(RX.offApp)![0], reason: 'Stay on Neara for now.' });

  let level: SafetyLevel = 'safe';
  if (findings.some(f => f.level === 'blocked')) level = 'blocked';
  else if (findings.length) level = 'warning';

  const message =
    level === 'blocked'
      ? 'This message was blocked for safety. Neara limits off-app contact, payment requests, and unknown links to help prevent scams.'
      : level === 'warning'
        ? 'Stay on Neara for now. To help reduce scams and fake profiles, off-app contact sharing is limited until trust is established.'
        : '';

  return { level, findings, message };
}

// Whether two users may share off-app contact yet.
// Requires: matched + both verified + at least N messages exchanged.
export function offAppEligible(opts: { matched: boolean; bothVerified: boolean; messageCount: number; min?: number }) {
  const min = opts.min ?? 12;
  return opts.matched && opts.bothVerified && opts.messageCount >= min;
}

export type LocationConfidence = 'trusted' | 'normal' | 'uncertain' | 'restricted' | 'review_required';
export type OffAppStatus = 'locked' | 'eligible' | 'approved' | 'restricted';
