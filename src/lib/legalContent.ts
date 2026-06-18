import { NEARA_DOMAIN, NEARA_LEGAL_EMAIL, NEARA_SAFETY_EMAIL } from './brand';

export interface LegalDoc {
  slug: string;
  title: string;
  short: string;
  updated: string;
  body: { heading: string; text: string }[];
}

const UPDATED = 'May 2026';

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: 'terms',
    title: 'Terms of Service',
    short: 'The rules for using Neara.',
    updated: UPDATED,
    body: [
      { heading: 'About Neara', text: `Neara (${NEARA_DOMAIN}) is a privacy-first dating product. By using it you agree to these Terms.` },
      { heading: 'Eligibility', text: 'You must be at least 18 years old. Neara is strictly adults-only.' },
      { heading: 'Acceptable use', text: 'Be honest. Do not impersonate anyone, harass others, spam, or post illegal content. Off-platform pressure and payment solicitation are prohibited.' },
      { heading: 'Account & content', text: 'You are responsible for your account, photos, bio and messages. We may remove content that breaks our rules.' },
      { heading: 'Termination', text: `We may suspend or terminate accounts that violate these Terms. Contact ${NEARA_LEGAL_EMAIL} with questions.` },
      { heading: 'Liability', text: 'Neara is provided as-is. You meet people at your own discretion. Use the Safety Center.' },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    short: 'What we collect, what we never share.',
    updated: UPDATED,
    body: [
      { heading: 'What we never do', text: 'We never show your exact location. We never share live distance. We never use exact pins. We never sell personal data.' },
      { heading: 'What we collect', text: 'Account info (email, age, display name), profile content you choose to share, approximate area, and product analytics.' },
      { heading: 'Approximate areas', text: 'Your area is coarsened server-side into a privacy circle before any other user can see it. The radius depends on your privacy setting.' },
      { heading: 'Verification data', text: 'Verification selfies/videos are private and never displayed on your profile. See Verification Data Policy.' },
      { heading: 'Your rights', text: `You can request your data or delete your account anytime by emailing ${NEARA_LEGAL_EMAIL}.` },
    ],
  },
  {
    slug: 'community',
    title: 'Community Rules',
    short: 'Be honest. Be kind. Respect privacy.',
    updated: UPDATED,
    body: [
      { heading: 'Be a real person', text: 'No fake profiles, no AI-generated impersonations, no catfishing.' },
      { heading: 'Be kind', text: 'No harassment, hate speech, threats, or sexual content sent without consent.' },
      { heading: 'Respect privacy', text: 'Do not pressure anyone for their exact location, address, or off-app handles.' },
      { heading: 'No scams', text: 'No payment requests, crypto pitches, suspicious links, or external solicitation.' },
      { heading: 'Consequences', text: 'Breaking these rules can result in warnings, restricted features, or a permanent ban.' },
    ],
  },
  {
    slug: 'adult-only',
    title: 'Adult-Only Policy',
    short: 'Neara is strictly 18+.',
    updated: UPDATED,
    body: [
      { heading: 'Minimum age', text: 'Every Neara user must be 18 or older. We enforce age gating at sign-up and during verification.' },
      { heading: 'Reporting', text: `If you suspect an underage user, report immediately. Reports go to ${NEARA_SAFETY_EMAIL} and are prioritized.` },
      { heading: 'Zero tolerance', text: 'We work with authorities where required by law.' },
    ],
  },
  {
    slug: 'location',
    title: 'Location Privacy Policy',
    short: 'Approximate areas only. No exact pins.',
    updated: UPDATED,
    body: [
      { heading: 'Coarsening', text: 'Your raw location is coarsened into a privacy circle before being stored for discovery.' },
      { heading: 'No live tracking', text: 'We never broadcast live movement. Distances shown are approximate ranges, not measured distances.' },
      { heading: 'Travel mode', text: 'Travel Mode shows a city only — never your home or current exact location.' },
      { heading: 'Premium', text: 'Premium never reveals anyone\'s exact location.' },
    ],
  },
  {
    slug: 'verification',
    title: 'Verification Data Policy',
    short: 'Verification videos are private.',
    updated: UPDATED,
    body: [
      { heading: 'What we collect', text: 'A short private liveness check (head movement, blinks, hand raise, or follow-the-dot).' },
      { heading: 'How it is used', text: 'Only to confirm you are a real person matching your main photo. It is never shown on your profile.' },
      { heading: 'Retention', text: 'Verification media is retained only as long as needed for the review and audit window, then deleted.' },
      { heading: 'Re-verification', text: 'If you change your main photo we may ask you to re-verify.' },
    ],
  },
  {
    slug: 'off-app',
    title: 'Off-App Sharing Policy',
    short: 'We slow down off-app sharing early on.',
    updated: UPDATED,
    body: [
      { heading: 'Why we slow it down', text: 'Most romance scams start with a fast push to move off-app. We limit social handles, phone numbers, and payment apps until trust is built.' },
      { heading: 'When it unlocks', text: 'Off-app contact unlocks once both users are verified and have exchanged a meaningful number of messages.' },
      { heading: 'Blocked categories', text: 'Phone numbers, payment apps, crypto, and unknown links are always blocked early — even between verified users.' },
    ],
  },
  {
    slug: 'safety-reporting',
    title: 'Safety & Reporting Policy',
    short: 'How we respond when something goes wrong.',
    updated: UPDATED,
    body: [
      { heading: 'Reports', text: 'Reports are confidential. We review every report against our Community Rules.' },
      { heading: 'Categories', text: 'Harassment, Fake Profile/Catfish, Underage, Spam, Scam, Threatening Behavior, Location Pressure, Off-App Pressure, Inappropriate Content, Impersonation.' },
      { heading: 'Actions', text: 'Outcomes range from a warning, to restricted features, to a permanent ban. Severe reports are escalated to our safety team.' },
      { heading: 'Contact', text: `For urgent issues email ${NEARA_SAFETY_EMAIL}.` },
    ],
  },
];

export const findLegal = (slug: string) => LEGAL_DOCS.find(d => d.slug === slug);
