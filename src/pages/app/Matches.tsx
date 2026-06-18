import { useState } from 'react';
import { useApp } from '@/store/AppStore';
import { findProfile } from '@/lib/demoData';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { NButton } from '@/components/neara/NButton';
import { TrustBadge } from '@/components/neara/Brand';
import { MatchOrbits, MatchOrbitsVariant, MATCH_ORBITS_VARIANTS } from '@/components/neara/MatchOrbits';
import { RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccentTheme } from '@/lib/types';
import { playSoundForEvent } from '@/lib/sounds';

const VARIANT_KEY = 'neara.matchAnim.variant';

const ACCENT_POOL: AccentTheme[] = ['violet', 'teal', 'gold', 'pink', 'mint'];
const accentForProfile = (id: string): AccentTheme => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ACCENT_POOL[h % ACCENT_POOL.length];
};

export function MatchesList() {
  const { matches } = useApp();
  return (
    <div className="px-5 py-6 space-y-6 pb-32">
      <h1 className="font-display text-3xl">Matches</h1>
      {matches.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center text-muted-foreground">
          <p className="font-display text-xl text-foreground">No matches yet. That's okay.</p>
          <p className="text-sm mt-2 max-w-xs mx-auto leading-relaxed">Send Signals intentionally — the right ones matter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {matches.map(m => {
            const p = findProfile(m.profileId);
            if (!p) return null;
            return (
              <Link key={m.id} to={`/app/chat/${m.id}`} className="glass rounded-2xl overflow-hidden hover:border-primary/50 transition">
                <div className="aspect-[4/5] relative">
                  <img src={p.photo} alt="" className="w-full h-full object-cover" />
                  {p.verified && <div className="absolute top-2 right-2"><TrustBadge size={18} /></div>}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent p-3">
                    <p className="font-medium">{p.name}, {p.age}</p>
                    <p className="text-[11px] text-muted-foreground">{p.zone_label}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MatchScreen() {
  const { id } = useParams();
  const { matches, accent } = useApp();
  const nav = useNavigate();
  const m = matches.find(x => x.id === id);
  const p = m ? findProfile(m.profileId) : null;
  const [revealed, setRevealed] = useState(false);

  const [variant, setVariantState] = useState<MatchOrbitsVariant>(() => {
    if (typeof window === 'undefined') return 'A';
    const stored = localStorage.getItem(VARIANT_KEY);
    return stored === 'B' ? 'B' : 'A';
  });
  // Replay key forces MatchOrbits to remount when variant changes or replay tapped
  const [replayKey, setReplayKey] = useState(0);

  const setVariant = (v: MatchOrbitsVariant) => {
    setVariantState(v);
    try { localStorage.setItem(VARIANT_KEY, v); } catch {}
    setRevealed(false);
    setReplayKey(k => k + 1);
  };
  const replay = () => {
    setRevealed(false);
    setReplayKey(k => k + 1);
  };

  if (!m || !p) return <div className="p-10 text-center text-muted-foreground">Match not found.</div>;

  const otherAccent = accentForProfile(p.id);

  return (
    <div className="px-5 py-8 min-h-[calc(100dvh-3.5rem)] flex flex-col items-center text-center">
      <MatchOrbits
        key={`${variant}-${replayKey}`}
        variant={variant}
        myAccent={accent}
        otherAccent={otherAccent}
        otherPhoto={p.photo}
        onComplete={() => { setRevealed(true); playSoundForEvent('match'); }}
      />

      {/* A/B test controls — internal tool, kept discreet */}
      <div className="mt-4 w-full max-w-sm">
        <div className="glass rounded-2xl p-2 flex items-stretch gap-1 text-[11px]">
          {(['A', 'B'] as MatchOrbitsVariant[]).map(v => {
            const meta = MATCH_ORBITS_VARIANTS[v];
            const active = variant === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setVariant(v)}
                className={cn(
                  'flex-1 rounded-xl px-3 py-2 text-left transition',
                  active
                    ? 'bg-primary/15 border border-primary/40 text-foreground'
                    : 'border border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/5',
                )}
                aria-pressed={active}
              >
                <div className="font-medium leading-tight">{meta.name}</div>
                <div className="opacity-70 mt-0.5 leading-tight">{meta.subtitle}</div>
              </button>
            );
          })}
          <button
            type="button"
            onClick={replay}
            className="px-3 rounded-xl border border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition flex items-center justify-center"
            aria-label="Replay animation"
            title="Replay"
          >
            <RotateCw size={14} />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 opacity-70">
          A/B test · your pick is remembered on this device
        </p>
      </div>

      <div
        className="transition-all duration-700 ease-out"
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'translateY(0)' : 'translateY(12px)',
        }}
      >
        <h1 className="font-display text-4xl mt-4">You matched.</h1>
        <p className="text-muted-foreground mt-3 max-w-sm mx-auto">
          Close enough to connect — still protected by Neara.
        </p>

        <div className="flex items-center justify-center gap-2 mt-5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">You</span>
          <span className="opacity-50">·</span>
          <span className="font-medium text-foreground inline-flex items-center gap-1">
            {p.name}
            {p.verified && <TrustBadge size={14} />}
          </span>
        </div>

        <div className="w-full max-w-xs mx-auto mt-8 space-y-3">
          <NButton full size="lg" onClick={() => nav('/app/chat/' + m.id)}>Start Chat</NButton>
          <NButton full size="lg" variant="outline" onClick={() => nav('/app/safe-meet/' + m.id)}>
            Suggest Safe Meet
          </NButton>
          <NButton full size="lg" variant="ghost" onClick={() => nav('/app/matches')}>
            View Profile
          </NButton>
        </div>
      </div>
    </div>
  );
}

