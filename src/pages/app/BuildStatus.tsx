import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock } from 'lucide-react';
import { NEARA_DOMAIN } from '@/lib/brand';
import { cn } from '@/lib/utils';

type Status = 'Working' | 'Visual only' | 'Needs backend' | 'Missing' | 'Broken';

interface Item {
  area: string;
  status: Status;
  works: string;
  simulated: string;
  backend: string;
  next: string;
}

const ITEMS: Item[] = [
  { area: 'Discovery filters sheet',     status: 'Working',       works: 'Two-tab modal (Basic + Advanced). Age, zone radius (1-4 zones, no miles), interests, height, intent, vibe, verified-only. Advanced is Premium-locked.', simulated: 'Filter state is local.',                                  backend: 'Server-side discovery query.',                       next: 'Wire to discovery endpoint.' },
  { area: 'Signals Received grid',       status: 'Working',       works: 'Blurred preview cards (2-col) with chip filters: All / Nearby zones / Recently active / Verified. Premium reveals + accepts. Sticky upgrade CTA.', simulated: 'Mock signals + blur for non-premium.',                    backend: 'Live received signals query.',                       next: 'Replace with live query.' },
  { area: 'Chats restructure',           status: 'Working',       works: 'Matches tile w/ count badge, Opening Moves card (premium-locked shuffle), recent chats, collapsible Older chats (paused after 7 days), search.', simulated: 'Mock chat data.',                                         backend: 'Chats persistence + realtime.',                      next: 'Wire to chat backend.' },
  { area: 'Profile detail v2',           status: 'Working',       works: 'My bio card, About me chip grid (height/activity/education/drinking/smoking/kids/zodiac/politics/spirituality), Looking for chips, sticky action bar.', simulated: 'Mock profile fields.',                              backend: 'Profile schema fields.',                             next: 'Persist richer profile.' },
  { area: 'Premium tabs + Checkout',     status: 'Working',       works: 'Premium / Premium+ tabs, 3 plan cards (Monthly/3-month/Yearly) with Save %, perks list w/ See all, sticky CTA opens CheckoutSheet (Apple Pay + Card, demo only).', simulated: 'Pay flips premium=true after 900ms spinner.', backend: 'Stripe/Paddle entitlement + webhooks.',         next: 'Wire to payment provider when ready.' },
  { area: 'Circle Randomize Reveal',     status: 'Working',       works: 'Premium procedural fallback: float-in → hover → 4-ghost shuffle → collapse → settle pulse → nearby circles wake. Staged copy + privacy note.', simulated: 'SVG fallback while Rive asset is absent.',                 backend: 'Rive asset circle_randomize_reveal.riv at /rive/.', next: 'Drop .riv into public/rive/ — component auto-swaps to Rive.' },
  { area: 'Rive asset slot',             status: 'Missing',       works: 'useRive wired with onLoadError fallback; expects /rive/circle_randomize_reveal.riv with animation circle_randomize_reveal.',                       simulated: '—',                                                       backend: 'Designer-produced .riv asset.',                      next: 'Upload .riv to public/rive/.' },
  { area: 'Alive map effects',           status: 'Working',       works: 'Breathing ambient pulse zones, privacy haze layer, idle floating bubbles, rotating warm microcopy, clamped zoom.',                                    simulated: 'Decorative only — no realtime presence yet.',             backend: 'Approximate density signal for zone breathing.',     next: 'Drive zone intensity from real coarse density.' },
  { area: 'Welcome background motion',   status: 'Working',       works: 'AnonymousPresence procedural silhouettes drift forward; no photos, no profile data, never resolves into faces.',                                       simulated: 'Purely procedural shapes.',                               backend: 'None — privacy-safe by construction.',               next: 'Tune density per device perf if needed.' },
  { area: 'Onboarding warmth',           status: 'Working',       works: 'Step labels reframed (Step Into Neara, Build My Circle, Choose Your Glow, Vibe, Profile, Trust, Enter the Map) + reveal handoff.',                    simulated: 'Local state only.',                                       backend: 'Account + profile persistence.',                     next: 'Wire to Cloud auth.' },
  { area: 'Sound Reactions',             status: 'Working',       works: 'Settings page with master toggle, vibration only, silent-mode respect, per-event sound selection, originals via WebAudio, preview buttons.',           simulated: 'Custom upload labels persisted in localStorage; no remote audio.', backend: 'Storage for user-uploaded short clips.',     next: 'Wire Cloud Storage when premium uploads ship.' },
  { area: 'Match animation',             status: 'Working',       works: 'Two-color orbit + self-spin + tightening radius → blended merge → settle pulse → reveal copy. A/B variant toggle on Matches page.',                   simulated: 'Triggered by visiting match page.',                       backend: 'Trigger from real match event.',                     next: 'Wire to realtime match event.' },
  { area: 'Onboarding',                  status: 'Working',       works: 'Multi-step flow + progress + completion + main-photo signature.',     simulated: 'No identity check yet.',                                  backend: 'Account + profile persistence.',                     next: 'Wire to Cloud auth.' },

  { area: 'Profile completion meter',    status: 'Working',       works: 'Strength %, missing fields, gate before discovery.',                   simulated: 'Local state only.',                                       backend: 'Persist profile remotely.',                          next: 'Sync on auth.' },
  { area: 'Edit Profile',                status: 'Working',       works: 'Full edit screen with strength meter; bumps photo signature.',         simulated: 'Photos still placeholders.',                              backend: 'Real photo upload.',                                 next: 'Wire Cloud Storage.' },
  { area: 'Photo upload',                status: 'Missing',       works: 'UI placeholder.',                                                      simulated: 'No real upload pipeline.',                                backend: 'Storage bucket + moderation.',                       next: 'Add Cloud Storage upload.' },
  { area: 'Verification flow',           status: 'Visual only',   works: 'Liveness prompts, stamp animation, badge state, photo signature.',     simulated: 'No real selfie/video liveness.',                          backend: 'Liveness API + reviewer queue.',                     next: 'Integrate liveness provider.' },
  { area: 'Verification refresh',        status: 'Working',       works: 'Detects main-photo change after approval; surfaces banner + CTA.',     simulated: 'Signature is local.',                                     backend: 'Server-side staleness check.',                       next: 'Move to server signal.' },
  { area: 'Location permission screen',  status: 'Visual only',   works: 'Copy + CTA.',                                                          simulated: 'Does not request real geolocation.',                      backend: 'Geolocation + privacy zone calc.',                   next: 'Wire navigator.geolocation.' },
  { area: 'Privacy circle setup',        status: 'Working',       works: 'Radius preview, zone labels, persisted to AppStore.',                  simulated: 'Static demo radius applied client-side.',                 backend: 'Server-side coarsening of real coords.',             next: 'Move coarsening server-side.' },
  { area: 'Appearance / theme selector', status: 'Working',       works: 'Accent + auto-accent drive map, badges, buttons, rings, tabs.',        simulated: '—',                                                       backend: 'Sync across devices.',                               next: 'Persist remotely once auth lands.' },
  { area: 'Main map',                    status: 'Working',       works: 'Custom dark luxury mock map, pan/zoom clamp, circles, bubbles.',       simulated: 'No real geo tiles, no real users.',                       backend: 'Spatial query for approx zones only.',               next: 'Decide MapLibre vs continued mock.' },
  { area: 'Privacy circle behavior',     status: 'Working',       works: 'Approx labels only, never exposes real coords.',                       simulated: 'Coords come from demoData.',                              backend: 'Server-side coarsening.',                            next: 'Server-side coarsening.' },
  { area: 'Signal counter',              status: 'Working',       works: 'Header chip + decrement, cooldown enforcement, daily limit by tier.',  simulated: 'Daily reset is local.',                                   backend: 'Server-truth daily reset + abuse limits.',           next: 'Move to Cloud.' },
  { area: 'Send Signal modal',           status: 'Working',       works: 'Opens, sends, decrements, cooldown warning, out-of-Signals modal.',    simulated: 'No delivery to other user.',                              backend: 'Signal delivery + notification.',                    next: 'Add signals table + edge fn.' },
  { area: 'Out-of-Signals upsell',       status: 'Working',       works: 'Modal offers Verify (25/day) or Premium (50/day).',                    simulated: 'Local flags only.',                                       backend: 'Billing + entitlement.',                              next: 'Stripe + entitlements.' },
  { area: 'Signals inbox',               status: 'Working',       works: 'Received/Sent/Expired tabs with counts, status pills, empty states.',  simulated: 'Static seed data.',                                       backend: 'Query of received signals.',                         next: 'Replace with live query.' },
  { area: 'Match creation',              status: 'Working',       works: 'Accept incoming Signal → match + system message + chat unlocks.',      simulated: 'No real mutual-signal logic.',                            backend: 'Mutual signal → match record.',                      next: 'Add matcher edge fn.' },
  { area: 'Match animation',             status: 'Working',       works: 'Self-spin + orbit + merge with both users\' accents; tunable T-config.', simulated: 'Triggered by visiting match page.',                       backend: 'Trigger from real match event.',                     next: 'Wire to realtime match event.' },
  { area: 'Chat (post-match only)',      status: 'Working',       works: 'Gated behind match, safety scan, warn/block states, off-app status.',  simulated: 'Messages local; auto-reply is canned.',                   backend: 'Chat persistence + realtime.',                       next: 'Add messages table + realtime.' },
  { area: 'Safe Meet flow',              status: 'Visual only',   works: 'Public-place suggestions inserted into chat.',                         simulated: 'No shared check-in.',                                     backend: 'Check-in record + safety contact ping.',             next: 'Implement check-in record.' },
  { area: 'Premium paywalls',            status: 'Working',       works: 'Modal blocks Ghost / Travel / Verified-only / Filters with CTA.',      simulated: 'Premium flag is local.',                                  backend: 'Billing + entitlement.',                              next: 'Stripe + entitlements.' },
  { area: 'Verified upgrade offer',      status: 'Working',       works: 'Premium screen shows 50% off card when verified & not premium.',       simulated: 'No real billing.',                                        backend: 'Stripe price + coupon.',                              next: 'Wire to billing.' },
  { area: 'Ghost / Invisible / Travel',  status: 'Working',       works: 'Modes exist with paywall modal; visibility state respected in chrome.', simulated: 'No server-side hide-from-query.',                         backend: 'Discovery filter server-side.',                      next: 'Server-side visibility filter.' },
  { area: 'Verified-only discovery',     status: 'Working',       works: 'Toggle filters map list to verified profiles only.',                    simulated: 'Client-side filter on mock data.',                        backend: 'Server-side discovery filter.',                      next: 'Wire to server query.' },
  { area: 'Hide Me Now / Show Me',       status: 'Working',       works: 'One-tap hide + mute, status chip in header, one-tap restore.',         simulated: 'Local only.',                                             backend: 'Server-side visibility flip.',                       next: 'Sync to backend on auth.' },
  { area: 'Safety Center',               status: 'Working',       works: 'Hub for safety actions + explainers, links into Legal & Blocked.',     simulated: 'Some flows toast-only.',                                  backend: 'Real report/block endpoints.',                       next: 'Wire actions to endpoints.' },
  { area: 'Report flow',                 status: 'Working',       works: 'Multi-reason flow persists to local report log, hides + can block.',   simulated: 'Reports stay client-side.',                               backend: 'Reports table + moderator queue.',                   next: 'Persist reports.' },
  { area: 'Block flow',                  status: 'Working',       works: 'Block cancels Signals, closes matches, removes from discovery + chats.', simulated: 'Local state.',                                            backend: 'Blocks table.',                                      next: 'Persist blocks.' },
  { area: 'Blocked Users page',          status: 'Working',       works: 'List + Unblock; reached from Profile, Safety Center.',                 simulated: 'Local state.',                                            backend: 'Blocks endpoint.',                                   next: 'Wire to backend.' },
  { area: 'Off-app sharing warnings',    status: 'Working',       works: 'Live scan of input; warn/block states for handles/phones/payments.',   simulated: 'Heuristic regex client-side.',                            backend: 'Server-side rescan + abuse signals.',                next: 'Add server detection.' },
  { area: 'Location pressure warnings',  status: 'Working',       works: 'Phrase detection in chat input + counter that restricts off-app.',     simulated: 'Heuristic regex.',                                        backend: 'Cross-user signals.',                                next: 'Aggregate server-side.' },
  { area: 'Legal & Safety Center',       status: 'Working',       works: '8 versioned policy pages with index, linked from Premium/Safety.',     simulated: 'Static copy bundled.',                                    backend: 'Versioned legal CMS.',                               next: `Publish at ${NEARA_DOMAIN}/legal.` },
  { area: 'Admin / Build Status',        status: 'Working',       works: 'This page. Filters, status chips, fix-next per item.',                 simulated: 'Hardcoded data.',                                         backend: 'Admin auth + moderator tools.',                      next: 'Add real admin roles.' },
];

const STATUS_STYLES: Record<Status, string> = {
  'Working':       'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'Visual only':   'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Needs backend': 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  'Missing':       'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
  'Broken':        'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

const FILTERS: ('All' | Status)[] = ['All', 'Working', 'Visual only', 'Needs backend', 'Missing', 'Broken'];

export default function BuildStatus() {
  const nav = useNavigate();
  const [filter, setFilter] = useState<'All' | Status>('All');

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: ITEMS.length };
    for (const s of ['Working','Visual only','Needs backend','Missing','Broken'] as Status[]) {
      c[s] = ITEMS.filter(i => i.status === s).length;
    }
    return c;
  }, []);

  const filtered = filter === 'All' ? ITEMS : ITEMS.filter(i => i.status === filter);

  return (
    <div className="px-5 py-6 space-y-6 pb-32">
      <button onClick={() => nav(-1)} className="w-9 h-9 rounded-full glass flex items-center justify-center">
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div>
        <p className="text-xs uppercase tracking-widest text-primary/80 flex items-center gap-2">
          <Lock className="w-3 h-3" /> Internal · {NEARA_DOMAIN}
        </p>
        <h1 className="font-display text-3xl mt-2">Build Status</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Honest snapshot of what ships, what's a mock, and what needs backend.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'h-8 px-3 rounded-full text-xs border transition',
              filter === f
                ? 'bg-gradient-accent text-primary-foreground border-transparent shadow-glow'
                : 'glass text-muted-foreground hover:text-foreground'
            )}
          >
            {f} <span className="opacity-60 tabular-nums">· {counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(item => (
          <div key={item.area} className="glass rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-lg leading-tight">{item.area}</h3>
              <span className={cn('text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border whitespace-nowrap', STATUS_STYLES[item.status])}>
                {item.status}
              </span>
            </div>
            <dl className="grid grid-cols-1 gap-2 text-xs">
              <Row label="Works now"      value={item.works} />
              <Row label="Simulated"      value={item.simulated} />
              <Row label="Needs backend"  value={item.backend} />
              <Row label="Fix next"       value={item.next} accent />
            </dl>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground text-center pt-4">
        {NEARA_DOMAIN} · internal build truth — not linked from public nav.
      </p>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
      <dd className={cn('flex-1', accent && 'text-primary')}>{value}</dd>
    </div>
  );
}
