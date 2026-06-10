import { useMemo, useState, lazy, Suspense } from 'react';
import { DEMO_PROFILES } from '@/lib/demoData';
import { useApp } from '@/store/AppStore';
import { DemoProfile, INTENT_LABEL, LOOKING_FOR_LABEL, Vibe, VIBE_LABEL } from '@/lib/types';
import { TrustBadge } from '@/components/neara/Brand';
import { NButton } from '@/components/neara/NButton';
const NearaMapGL = lazy(() => import('@/components/neara/NearaMapGL').then((m) => ({ default: m.NearaMapGL })));
import { ProfileGate } from '@/components/neara/ProfileStrength';
import { PremiumModal } from '@/components/neara/PremiumModal';
import { FiltersSheet } from '@/components/neara/FiltersSheet';
import { Ghost, Shield, Palette, X, Flag, EyeOff, BadgeCheck, Plane, AlertTriangle, ShieldCheck, Crown, Radio, Clock, Sparkles, SlidersHorizontal, Ruler, GraduationCap, Wine, Cigarette, Baby, Star as StarIcon, Landmark, Heart, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { playSoundForEvent } from '@/lib/sounds';

export default function MapScreen() {
  const { hiddenIds, blockedIds, sendSignal, signalsLeft, signalsLimit, signalCooldownLeft, hide, user, setUser, hideMeNow, profileComplete } = useApp();
  const nav = useNavigate();
  const [selected, setSelected] = useState<DemoProfile | null>(null);
  const [signalOpen, setSignalOpen] = useState(false);
  const [outOpen, setOutOpen] = useState(false);
  const [paywall, setPaywall] = useState<string | null>(null);
  const [vibeOpen, setVibeOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const f = user.filters;
  const visible = useMemo(() => DEMO_PROFILES.filter(p => {
    if (hiddenIds.includes(p.id) || blockedIds.includes(p.id)) return false;
    if (user.verifiedOnlyFilter && !p.verified) return false;
    if (f.verifiedOnly && !p.verified) return false;
    if (p.age < f.ageMin || p.age > f.ageMax) return false;
    if (p.height_cm && (p.height_cm < f.heightMinCm || p.height_cm > f.heightMaxCm)) return false;
    if (f.vibes.length && p.vibe && !f.vibes.includes(p.vibe)) return false;
    if (f.intents.length && p.looking_for && !p.looking_for.some(i => f.intents.includes(i))) return false;
    if (f.interests.length && !p.interests.some(i => f.interests.includes(i))) return false;
    if (f.zoneRadius <= 1 && !p.nearby_zone) return false;
    return true;
  }), [hiddenIds, blockedIds, user.verifiedOnlyFilter, f]);

  const activeFilterCount =
    (f.verifiedOnly ? 1 : 0) +
    (f.vibes.length ? 1 : 0) +
    (f.intents.length ? 1 : 0) +
    (f.interests.length ? 1 : 0) +
    (f.zoneRadius !== 2 ? 1 : 0);

  const lowConfidence = user.locationConfidence === 'uncertain' || user.locationConfidence === 'restricted';
  const travelMode = user.visibility === 'travel';
  const paused = user.visibility === 'paused';

  const overlay = (
    <>
      <button
        onClick={() => {
          if (!user.verified) { setPaywall('Verified-only discovery'); return; }
          setUser({ verifiedOnlyFilter: !user.verifiedOnlyFilter });
        }}
        className={`w-10 h-10 rounded-full glass-strong flex items-center justify-center hover:border-primary/50 transition lift-on-tap ${user.verifiedOnlyFilter ? 'ring-glow border-primary/60' : ''}`}
        title="Verified only"
      ><BadgeCheck className="w-4 h-4" /></button>
      <button onClick={() => user.premium ? toast('Ghost Mode on — you browse without appearing.') : setPaywall('Ghost Mode')}
        className="w-10 h-10 rounded-full glass-strong flex items-center justify-center hover:border-primary/50 transition lift-on-tap" title="Ghost Mode">
        <Ghost className="w-4 h-4" />
      </button>
      <button onClick={() => nav('/app/safety')} className="w-10 h-10 rounded-full glass-strong flex items-center justify-center hover:border-primary/50 transition lift-on-tap" title="Safety">
        <Shield className="w-4 h-4" />
      </button>
      <button onClick={() => { hideMeNow(); toast.success("You're hidden. Turn visibility back on whenever you're ready."); }}
        className="w-10 h-10 rounded-full glass-strong flex items-center justify-center hover:border-destructive/50 transition lift-on-tap" title="Hide me now">
        <EyeOff className="w-4 h-4" />
      </button>
      <button onClick={() => nav('/app/profile')} className="w-10 h-10 rounded-full glass-strong flex items-center justify-center hover:border-primary/50 transition lift-on-tap" title="Appearance">
        <Palette className="w-4 h-4" />
      </button>
      <button onClick={() => setFiltersOpen(true)}
        className={`relative w-10 h-10 rounded-full glass-strong flex items-center justify-center hover:border-primary/50 transition lift-on-tap ${activeFilterCount ? 'ring-glow border-primary/60' : ''}`}
        title="Filters">
        <SlidersHorizontal className="w-4 h-4" />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold flex items-center justify-center">{activeFilterCount}</span>
        )}
      </button>
    </>
  );

  const banners = (
    <>
      <button onClick={() => setVibeOpen(true)}
        className="glass-strong rounded-full px-3 py-1.5 flex items-center gap-1.5 text-[11px] border border-primary/30 hover:border-primary/60 transition">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        Vibe: {VIBE_LABEL[user.vibe ?? 'open_to_chat']}
      </button>
      {user.verifiedOnlyFilter && (
        <div className="glass-strong rounded-full px-3 py-1.5 flex items-center gap-1.5 text-[11px]">
          <BadgeCheck className="w-3.5 h-3.5 text-primary" />Verified only
        </div>
      )}
      {travelMode && (
        <div className="glass-strong rounded-full px-3 py-1.5 flex items-center gap-1.5 text-[11px]">
          <Plane className="w-3.5 h-3.5 text-primary" />Travel Mode{user.travelCity ? ` · ${user.travelCity}` : ''}
        </div>
      )}
      {paused && (
        <div className="glass-strong rounded-full px-3 py-1.5 flex items-center gap-1.5 text-[11px] border border-amber-500/40">
          <EyeOff className="w-3.5 h-3.5 text-amber-400" />You're hidden — no one sees you
        </div>
      )}
      {lowConfidence && (
        <div className="glass-strong rounded-2xl px-3 py-2 flex items-start gap-2 text-[11px] border border-amber-500/40">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
          <span className="text-muted-foreground leading-snug">
            Quiet around you right now. Try widening your circle or check back later.
          </span>
        </div>
      )}
    </>
  );

  return (
    <div className="relative">
      {!profileComplete && (
        <div className="px-4 pt-4"><ProfileGate /></div>
      )}

      <div className={`mx-4 my-4 h-[calc(100dvh-3.5rem-100px)] ${!profileComplete ? 'opacity-40 pointer-events-none' : ''}`}>
        <Suspense fallback={
          <div className="h-full w-full rounded-3xl glass flex items-center justify-center">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground glass-strong rounded-full px-4 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Reading the area…
            </div>
          </div>
        }>
          <NearaMapGL profiles={visible} onSelect={setSelected} className="h-full w-full" overlay={overlay} topBanners={banners} />
        </Suspense>
      </div>

      <div className="px-6 -mt-2 mb-2 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
        <ShieldCheck className="w-3.5 h-3.5 text-primary/70" />
        <span>Approximate areas only — your exact location stays hidden.</span>
      </div>

      <div className="px-4 pb-2 flex gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground self-center">Demo location:</span>
        {(['trusted','normal','uncertain','restricted'] as const).map(c => (
          <button key={c} onClick={() => setUser({ locationConfidence: c })}
            className={`text-[10px] px-2.5 py-1 rounded-full border ${user.locationConfidence === c ? 'border-primary/60 text-primary' : 'border-border text-muted-foreground'}`}>
            {c}
          </button>
        ))}
        <button onClick={() => {
          if (!user.premium && !travelMode) { setPaywall('Travel Mode'); return; }
          setUser({ visibility: travelMode ? 'visible' : 'travel', travelCity: travelMode ? undefined : 'Miami' });
        }} className={`text-[10px] px-2.5 py-1 rounded-full border ${travelMode ? 'border-primary/60 text-primary' : 'border-border text-muted-foreground'}`}>
          {travelMode ? 'Exit Travel' : 'Travel: Miami'}
        </button>
      </div>

      {selected && !signalOpen && (
        <ProfileSheet
          profile={selected}
          onClose={() => setSelected(null)}
          onSignal={() => setSignalOpen(true)}
          onHide={() => { playSoundForEvent('pass'); hide(selected.id); setSelected(null); toast("Passed. We won't show them again."); }}
          onReport={() => { nav('/app/report/' + selected.id); }}
        />
      )}

      {selected && signalOpen && (
        <SignalModal profile={selected} signalsLeft={signalsLeft} signalsLimit={signalsLimit} cooldown={signalCooldownLeft}
          onClose={() => { setSignalOpen(false); setSelected(null); }}
          onSend={(msg) => {
            const r = sendSignal(selected.id, msg);
            if (r.ok === true) {
              playSoundForEvent('signal_sent');
              toast.success("Signal sent. Now it's their move.");
              setSignalOpen(false); setSelected(null);
              return;
            }
            const reason = (r as { reason: string }).reason;
            const cd = (r as { cooldownSecondsLeft?: number }).cooldownSecondsLeft;
            if (reason === 'out_of_signals') {
              setSignalOpen(false); setSelected(null); setOutOpen(true);
            } else {
              toast.error(`A moment — ${cd}s before your next Signal.`);
            }
          }}
        />
      )}

      {outOpen && <OutOfSignalsModal limit={signalsLimit} verified={user.verified} premium={user.premium}
        onClose={() => setOutOpen(false)} onPremium={() => { setOutOpen(false); nav('/app/premium'); }}
        onVerify={() => { setOutOpen(false); nav('/app/verification'); }} />}

      {vibeOpen && <VibeModal current={user.vibe ?? 'open_to_chat'} onClose={() => setVibeOpen(false)} onPick={(v) => { setUser({ vibe: v }); setVibeOpen(false); toast.success(`Vibe set to ${VIBE_LABEL[v]}.`); }} />}

      <PremiumModal feature={paywall || ''} open={!!paywall} onClose={() => setPaywall(null)} />
      <FiltersSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} onPaywall={(l) => { setFiltersOpen(false); setPaywall(l); }} />
    </div>
  );
}

function ProfileSheet({ profile, onClose, onSignal, onHide, onReport }: {
  profile: DemoProfile; onClose: () => void; onSignal: () => void; onHide: () => void; onReport: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md glass-strong rounded-t-3xl p-6 animate-fade-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border border-border shadow-elev">
              <img src={profile.photo} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl">{profile.name}, {profile.age}</h2>
                {profile.verified && <TrustBadge size={20} />}
              </div>
              <p className="text-xs text-primary mt-1">{INTENT_LABEL[profile.intent]}</p>
              {profile.vibe && (
                <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-[10px] text-primary">
                  <Sparkles className="w-3 h-3" />{VIBE_LABEL[profile.vibe]}
                </span>
              )}
              <p className="text-[11px] text-muted-foreground mt-1.5">{profile.zone_label}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="mt-4 glass rounded-2xl p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">My bio</p>
          <p className="text-sm text-foreground/85 leading-relaxed">{profile.bio}</p>
        </div>

        <div className="mt-3 glass rounded-2xl p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">About me</p>
          <div className="flex flex-wrap gap-2">
            {profile.height_cm && <Chip icon={Ruler}>{`${Math.floor(profile.height_cm/2.54/12)}'${Math.round(profile.height_cm/2.54)%12}"`}</Chip>}
            {profile.activity && <Chip>{profile.activity}</Chip>}
            {profile.education && <Chip icon={GraduationCap}>{profile.education}</Chip>}
            {profile.drinking && <Chip icon={Wine}>{profile.drinking}</Chip>}
            {profile.smoking && <Chip icon={Cigarette}>{profile.smoking}</Chip>}
            {profile.kids && <Chip icon={Baby}>{profile.kids}</Chip>}
            {profile.zodiac && <Chip icon={StarIcon}>{profile.zodiac}</Chip>}
            {profile.politics && <Chip icon={Landmark}>{profile.politics}</Chip>}
            {profile.spirituality && <Chip>{profile.spirituality}</Chip>}
          </div>
        </div>

        {(profile.looking_for?.length || profile.values?.length) && (
          <div className="mt-3 glass rounded-2xl p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">I'm looking for</p>
            <div className="flex flex-wrap gap-2">
              {profile.looking_for?.map(l => <Chip key={l} icon={Search}>{LOOKING_FOR_LABEL[l]}</Chip>)}
              {profile.values?.map(v => <Chip key={v}>{v}</Chip>)}
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {profile.interests.map(i => <span key={i} className="px-3 py-1 rounded-full bg-secondary/60 text-xs">{i}</span>)}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-6 sticky bottom-0">
          <NButton onClick={onSignal} className="col-span-3" size="lg"><Heart className="w-4 h-4 mr-2" />Send a Signal</NButton>
          <NButton variant="outline" size="sm" onClick={onHide}>Not my vibe</NButton>
          <NButton variant="outline" size="sm" onClick={onReport} className="col-span-2"><Flag className="w-4 h-4 mr-1.5"/>Report</NButton>
        </div>
      </div>
    </div>
  );
}

function SignalModal({ profile, signalsLeft, signalsLimit, cooldown, onClose, onSend }: {
  profile: DemoProfile; signalsLeft: number; signalsLimit: number; cooldown: number;
  onClose: () => void; onSend: (msg?: string) => void;
}) {
  const [msg, setMsg] = useState('');
  const out = signalsLeft <= 0;
  const cooling = cooldown > 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in p-6" onClick={onClose}>
      <div className="w-full max-w-sm glass-strong rounded-3xl p-6 animate-fade-up text-center" onClick={e => e.stopPropagation()}>
        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-primary/40 ring-glow mb-4">
          <img src={profile.photo} alt="" className="w-full h-full object-cover" />
        </div>
        <h2 className="font-display text-2xl">A small way to say "I'm interested."</h2>
        {out ? (
          <p className="text-sm text-muted-foreground mt-3">You used today's {signalsLimit} Signals. Come back tomorrow with fresh eyes.</p>
        ) : (
          <p className="text-sm text-muted-foreground mt-3"><span className="text-foreground font-medium">{signalsLeft}</span> of {signalsLimit} Signals left today. Send them to the ones that matter.</p>
        )}
        {!out && (
          <textarea value={msg} onChange={e => setMsg(e.target.value)} maxLength={140} placeholder="Add a short note (optional)"
            className="mt-5 w-full h-20 rounded-2xl bg-secondary/40 border border-border p-3 text-sm focus:outline-none focus:border-primary/60 resize-none" />
        )}
        {cooling && !out && (
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-amber-300">
            <Clock className="w-3.5 h-3.5" /> One moment — {cooldown}s before your next Signal.
          </div>
        )}
        <div className="mt-5 space-y-2">
          {!out && <NButton full size="lg" disabled={cooling} onClick={() => onSend(msg || undefined)}>{cooling ? `Wait ${cooldown}s` : 'Send Signal'}</NButton>}
          <NButton full variant="ghost" onClick={onClose}>{out ? 'Close' : 'Not now'}</NButton>
        </div>
      </div>
    </div>
  );
}

function OutOfSignalsModal({ limit, verified, premium, onClose, onPremium, onVerify }: {
  limit: number; verified: boolean; premium: boolean; onClose: () => void; onPremium: () => void; onVerify: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in p-6" onClick={onClose}>
      <div className="w-full max-w-sm glass-strong rounded-3xl p-6 animate-fade-up text-center" onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-accent flex items-center justify-center shadow-glow mb-4">
          <Radio className="w-6 h-6 text-primary-foreground" />
        </div>
        <h2 className="font-display text-2xl">You used today's {limit} Signals.</h2>
        <p className="text-sm text-muted-foreground mt-2">Come back tomorrow with fresh eyes — or unlock more right now.</p>
        <div className="mt-6 space-y-2">
          {!premium && <NButton full size="lg" onClick={onPremium}><Crown className="w-4 h-4 mr-2" />Upgrade to 50 a day</NButton>}
          {!verified && !premium && <NButton full variant="outline" onClick={onVerify}>Verify for 25 a day</NButton>}
          <NButton full variant="ghost" onClick={onClose}>Wait for tomorrow</NButton>
        </div>
        <p className="text-[10px] text-muted-foreground mt-4">Signals are limited on purpose — every one matters.</p>
      </div>
    </div>
  );
}

function VibeModal({ current, onClose, onPick }: { current: Vibe; onClose: () => void; onPick: (v: Vibe) => void; }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
      <div className="w-full max-w-sm glass-strong rounded-3xl p-6 animate-fade-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="text-xs uppercase tracking-widest text-primary/80">Your vibe</p>
        </div>
        <h2 className="font-display text-2xl">What's your vibe right now?</h2>
        <p className="text-xs text-muted-foreground mt-1">Shown softly on your card. Change it anytime.</p>
        <div className="flex flex-wrap gap-2 mt-5">
          {(Object.keys(VIBE_LABEL) as Vibe[]).map(v => (
            <button key={v} onClick={() => onPick(v)}
              className={`px-4 h-10 rounded-full text-sm border transition ${current === v ? 'bg-gradient-accent text-primary-foreground border-transparent shadow-glow' : 'bg-secondary/40 border-border text-foreground/85 hover:border-primary/40'}`}>
              {VIBE_LABEL[v]}
            </button>
          ))}
        </div>
        <NButton full variant="ghost" className="mt-5" onClick={onClose}>Close</NButton>
      </div>
    </div>
  );
}

function Chip({ icon: Icon, children }: { icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-secondary/60 border border-border text-xs">
      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}{children}
    </span>
  );
}
