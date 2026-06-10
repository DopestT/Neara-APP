import { useMemo, useState } from 'react';
import { useApp } from '@/store/AppStore';
import { findProfile } from '@/lib/demoData';
import { TrustBadge } from '@/components/neara/Brand';
import { NButton } from '@/components/neara/NButton';
import { EmptyState } from '@/components/neara/EmptyState';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Radio, Inbox, Send, Clock, Crown, ShieldCheck, Search } from 'lucide-react';
import { LOOKING_FOR_LABEL } from '@/lib/types';
import { cn } from '@/lib/utils';

type ChipFilter = 'all' | 'nearby' | 'recent' | 'verified';

export default function SignalsInbox() {
  const { signals, acceptSignal, declineSignal, signalsLeft, signalsLimit, user } = useApp();
  const nav = useNavigate();
  const [tab, setTab] = useState<'received'|'sent'|'expired'>('received');
  const [chip, setChip] = useState<ChipFilter>('all');

  const received = signals.filter(s => s.toId === 'me' && s.status === 'pending');
  const sent = signals.filter(s => s.fromId === 'me');
  const expired = signals.filter(s => s.status === 'expired' || s.status === 'declined' || s.status === 'blocked');

  const receivedFiltered = useMemo(() => {
    return received.filter(s => {
      const p = findProfile(s.fromId);
      if (!p) return false;
      if (chip === 'nearby') return p.nearby_zone;
      if (chip === 'recent') return p.recently_active;
      if (chip === 'verified') return p.verified;
      return true;
    });
  }, [received, chip]);

  const list = tab === 'received' ? receivedFiltered : tab === 'sent' ? sent : expired;

  const emptyByTab = {
    received: { icon: Inbox, title: 'No Signals yet.', subtitle: "When someone feels a spark, you'll see it here." },
    sent:     { icon: Send,  title: 'No Signals sent yet.', subtitle: `${signalsLeft} of ${signalsLimit} Signals left today. Send them to the ones that matter.` },
    expired:  { icon: Clock, title: "Nothing's expired.", subtitle: 'Signals quietly expire after 7 days.' },
  }[tab];

  const counts = {
    all: received.length,
    nearby: received.filter(s => findProfile(s.fromId)?.nearby_zone).length,
    recent: received.filter(s => findProfile(s.fromId)?.recently_active).length,
    verified: received.filter(s => findProfile(s.fromId)?.verified).length,
  };

  return (
    <div className="px-5 py-6 space-y-5 pb-32">
      <div>
        <div className="flex items-end justify-between">
          <h1 className="font-display text-3xl">Signals Received</h1>
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />{signalsLeft}/{signalsLimit} today
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1.5">See who's reaching out. Match instantly with Premium.</p>
        <p className="text-[11px] text-muted-foreground/80 mt-1 flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-primary/70" />Only approximate zones — never exact location.
        </p>
      </div>

      <div className="glass rounded-full p-1 flex">
        {(['received','sent','expired'] as const).map(t => {
          const count = t==='received' ? received.length : t==='sent' ? sent.length : expired.length;
          return (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 h-10 rounded-full text-sm capitalize transition flex items-center justify-center gap-1.5 ${tab===t?'bg-gradient-accent text-primary-foreground shadow-glow':'text-muted-foreground'}`}>
              {t}<span className="text-[10px] opacity-70 tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>

      {tab === 'received' && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {([
            { id: 'all', label: 'All' },
            { id: 'nearby', label: 'Nearby zones' },
            { id: 'recent', label: 'Recently active' },
            { id: 'verified', label: 'Verified' },
          ] as { id: ChipFilter; label: string }[]).map(c => (
            <button key={c.id} onClick={() => setChip(c.id)}
              className={cn(
                'shrink-0 h-9 px-3.5 rounded-full text-xs border transition flex items-center gap-1.5',
                chip === c.id ? 'bg-foreground text-background border-transparent' : 'border-border text-muted-foreground hover:text-foreground'
              )}>
              {chip === c.id && <span className="text-[10px]">✓</span>}
              {c.label} <span className="opacity-60">· {counts[c.id]}</span>
            </button>
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState {...emptyByTab} action={<NButton variant="outline" onClick={() => nav('/app/map')}>Open Map</NButton>} />
      ) : tab === 'received' ? (
        <div className="grid grid-cols-2 gap-3">
          {receivedFiltered.map(sig => {
            const p = findProfile(sig.fromId);
            if (!p) return null;
            const blurred = !user.premium;
            return (
              <button key={sig.id}
                onClick={() => {
                  if (blurred) { nav('/app/premium'); return; }
                  const id = acceptSignal(sig.id);
                  if (id) { toast.success('Match!'); nav('/app/match/' + id); }
                }}
                className="relative glass rounded-2xl overflow-hidden text-left hover:border-primary/40 transition group">
                <div className="aspect-[3/4] relative">
                  <img src={p.photo} alt="" className={cn('w-full h-full object-cover transition', blurred && 'blur-2xl scale-110')} />
                  {blurred && <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />}
                  {p.verified && (
                    <div className="absolute top-2 right-2"><TrustBadge size={18} /></div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-3 space-y-1.5">
                    {blurred ? (
                      <>
                        <div className="h-3 w-20 rounded-full bg-foreground/30" />
                        <div className="h-2.5 w-14 rounded-full bg-foreground/20" />
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium">{p.name}, {p.age}</p>
                        <p className="text-[10px] text-muted-foreground">{p.zone_label}</p>
                      </>
                    )}
                    {p.looking_for?.[0] && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-background/70 backdrop-blur px-2 py-0.5 rounded-full border border-border">
                        <Search className="w-2.5 h-2.5" />{LOOKING_FOR_LABEL[p.looking_for[0]]}
                      </span>
                    )}
                  </div>
                </div>
                {!blurred && (
                  <div className="px-3 py-2 flex gap-1.5">
                    <NButton size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); const id = acceptSignal(sig.id); if (id) { toast.success('Match!'); nav('/app/match/' + id); } }}>Accept</NButton>
                    <NButton size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); declineSignal(sig.id); toast('Passed.'); }}>Pass</NButton>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(sig => {
            const otherId = sig.fromId === 'me' ? sig.toId : sig.fromId;
            const p = findProfile(otherId);
            if (!p) return null;
            return (
              <div key={sig.id} className="glass rounded-2xl p-4 flex gap-4 items-center">
                <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0">
                  <img src={p.photo} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{p.name}, {p.age}</p>
                    {p.verified && <TrustBadge size={14} />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{sig.message || p.zone_label}</p>
                </div>
                {tab === 'sent' && (
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border ${
                    sig.status === 'accepted' ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' :
                    sig.status === 'declined' || sig.status === 'blocked' ? 'border-muted-foreground/30 text-muted-foreground' :
                    'border-primary/40 text-primary bg-primary/5'
                  }`}>{sig.status === 'pending' ? 'Sent' : sig.status}</span>
                )}
                {tab === 'expired' && (
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{sig.status}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'received' && !user.premium && receivedFiltered.length > 0 && (
        <div className="sticky bottom-20 z-30">
          <NButton full size="lg" onClick={() => nav('/app/premium')}>
            <Crown className="w-4 h-4 mr-2" />See who sent you a Signal
          </NButton>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5"><Radio className="w-3 h-3" />Signals quietly expire after 7 days. Every one matters.</p>
    </div>
  );
}
