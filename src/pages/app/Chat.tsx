import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/store/AppStore';
import { findProfile } from '@/lib/demoData';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NButton } from '@/components/neara/NButton';
import { ChevronLeft, Shield, MoreVertical, AlertTriangle, ShieldAlert, EyeOff, Flag, Lock, CheckCircle2, Map, MessageCircle, ImageIcon, Eye, X, KeyRound, Search, ChevronDown, ChevronUp, Heart } from 'lucide-react';
import { TrustBadge } from '@/components/neara/Brand';
import { toast } from 'sonner';
import { scanMessage } from '@/lib/safety';
import { OpeningMoves } from '@/components/neara/OpeningMoves';
import { PremiumModal } from '@/components/neara/PremiumModal';
import { cn } from '@/lib/utils';

export function ChatsList() {
  const { matches, messages, signals } = useApp();
  const nav = useNavigate();
  const [query, setQuery] = useState('');
  const [showOlder, setShowOlder] = useState(false);
  const [paywall, setPaywall] = useState<string | null>(null);

  const receivedCount = signals.filter(s => s.toId === 'me' && s.status === 'pending').length;

  type Row = { match: typeof matches[number]; last: ReturnType<typeof Object> | null; age: number };
  const rows: Row[] = matches.map(m => {
    const last = [...messages].reverse().find(x => x.matchId === m.id && x.type !== 'system' && x.type !== 'safety_warning' && x.type !== 'safety_blocked');
    const age = Date.now() - (last?.createdAt ?? m.createdAt);
    return { match: m, last: last ?? null, age };
  });

  const filteredRows = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter(r => {
      const p = findProfile(r.match.profileId);
      return p && (p.name.toLowerCase().includes(q) || (r.last as { body?: string } | null)?.body?.toLowerCase().includes(q));
    });
  }, [rows, query]);

  const SEVEN_DAYS = 7 * 86400_000;
  const recent = filteredRows.filter(r => r.age < SEVEN_DAYS);
  const older = filteredRows.filter(r => r.age >= SEVEN_DAYS);

  return (
    <div className="px-5 py-6 space-y-5 pb-32">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Chats</h1>
        <button className="w-9 h-9 rounded-full glass flex items-center justify-center" onClick={() => {
          const el = document.getElementById('chats-search');
          el?.focus();
        }} aria-label="Search">
          <Search className="w-4 h-4" />
        </button>
      </div>

      <input id="chats-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search chats"
        className="w-full h-11 rounded-full bg-secondary/40 border border-border px-4 text-sm focus:outline-none focus:border-primary/60" />

      <section className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Your matches</p>
        <button onClick={() => nav('/app/signals')} className="w-full glass-strong rounded-2xl p-4 flex items-center gap-4 text-left hover:border-primary/40 transition">
          <div className="relative w-16 h-16 shrink-0">
            <div className="absolute inset-y-1 right-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 rotate-6" />
            <div className="absolute inset-y-1 left-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/30 to-primary/30 -rotate-3" />
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-accent shadow-glow">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            {receivedCount > 0 && (
              <span className="absolute -bottom-1 -right-1 min-w-[22px] h-[22px] px-1.5 rounded-full bg-amber-400 text-background text-[11px] font-semibold flex items-center justify-center">{receivedCount}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-snug">
              People are reaching out. Match instantly to start a chat.
            </p>
            <p className="text-xs text-primary mt-1 underline underline-offset-2">See who sent you a Signal</p>
          </div>
        </button>
      </section>

      <section className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Chats (Recent)</p>
        <OpeningMoves onLocked={() => setPaywall('Custom Opening Moves')} />

        {recent.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">No recent chats — start one from your matches above.</div>
        ) : (
          recent.map(r => {
            const p = findProfile(r.match.profileId);
            if (!p) return null;
            const last = r.last as { body?: string } | null;
            return (
              <Link key={r.match.id} to={`/app/chat/${r.match.id}`} className="glass rounded-2xl p-4 flex gap-3 items-center hover:border-primary/50 transition">
                <div className="w-12 h-12 rounded-full overflow-hidden"><img src={p.photo} alt="" className="w-full h-full object-cover" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><p className="font-medium truncate">{p.name}</p>{p.verified && <TrustBadge size={14} />}</div>
                  <p className="text-xs text-muted-foreground truncate">{last?.body || 'Say hello.'}</p>
                </div>
              </Link>
            );
          })
        )}
      </section>

      {older.length > 0 && (
        <section className="space-y-2">
          <button onClick={() => setShowOlder(s => !s)} className="w-full flex items-center justify-between">
            <p className="text-sm font-medium">Older chats <span className="text-muted-foreground">({older.length})</span></p>
            {showOlder ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {showOlder && (
            <>
              <p className="text-xs text-muted-foreground">Conversations move here after 7 days of quiet. New activity brings them back.</p>
              <div className={cn('space-y-2 pt-1')}>
                {older.map(r => {
                  const p = findProfile(r.match.profileId);
                  if (!p) return null;
                  const weeks = Math.floor(r.age / (7 * 86400_000));
                  return (
                    <Link key={r.match.id} to={`/app/chat/${r.match.id}`} className="glass rounded-2xl p-3 flex gap-3 items-center opacity-80 hover:opacity-100 hover:border-primary/40 transition">
                      <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-border"><img src={p.photo} alt="" className="w-full h-full object-cover" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground">Conversation paused {weeks <= 0 ? 'this week' : `${weeks} week${weeks > 1 ? 's' : ''} ago`}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}

      <PremiumModal feature={paywall || ''} open={!!paywall} onClose={() => setPaywall(null)} />
    </div>
  );
}

const DEMO_PROMPTS = [
  'text me',
  'add me on telegram',
  'send your address',
  'cashapp me $20',
];

export function ChatScreen() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, matches, messages, sendMessage, offAppStatusFor, hideMeNow, block, privateAccess, privateRequests, requestPrivateAlbum, sharePrivateAlbum, revokePrivateAlbum } = useApp();
  const m = matches.find(x => x.id === id);
  const p = m ? findProfile(m.profileId) : null;
  const [text, setText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [albumPhotos, setAlbumPhotos] = useState<string[] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatMsgs = messages.filter(x => x.matchId === id);
  const status = id ? offAppStatusFor(id) : 'locked';
  const liveScan = useMemo(() => scanMessage(text), [text]);
  const inputBlocked = liveScan.level === 'blocked';
  const theyRequested = id ? !!privateRequests[id] : false;
  const iSharedWithThem = id ? !!privateAccess[id] : false;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMsgs.length]);

  if (!m || !p) {
    return (
      <div className="min-h-[70dvh] px-5 py-10 flex items-center justify-center">
        <div className="glass-strong rounded-3xl p-6 text-center space-y-5 border-primary/20">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shadow-glow">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl text-foreground">Chat unavailable</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This demo chat expired after the preview refreshed. Your exact location is still hidden.
            </p>
          </div>
          <div className="grid gap-2">
            <NButton onClick={() => nav('/app/map')} full>
              <Map className="w-4 h-4 mr-2" /> Back to Map
            </NButton>
            <NButton onClick={() => nav('/app/chats')} variant="outline" full>
              View Chats
            </NButton>
          </div>
        </div>
      </div>
    );
  }

  const submit = (body: string) => {
    if (!body.trim()) return;
    const result = sendMessage(m.id, body);
    if (result.level === 'blocked') {
      toast.error('Message blocked for safety.');
    } else if (result.level === 'warning') {
      toast('Safety reminder added to chat.');
    }
    setText('');
  };

  return (
    <div className="flex flex-col h-[100dvh]">
      <header className="glass-strong border-b border-border/50 px-4 h-14 flex items-center gap-3">
        <button onClick={() => nav('/app/chats')} className="w-9 h-9 rounded-full hover:bg-secondary/60 flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
        <div className="w-9 h-9 rounded-full overflow-hidden"><img src={p.photo} alt="" className="w-full h-full object-cover" /></div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5"><p className="font-medium text-sm">{p.name}</p>{p.verified && <TrustBadge size={12} />}</div>
          <p className="text-[10px] text-muted-foreground">{p.zone_label}</p>
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen(o => !o)} className="w-9 h-9 rounded-full hover:bg-secondary/60 flex items-center justify-center"><MoreVertical className="w-5 h-5" /></button>
          {menuOpen && (
            <div className="absolute right-0 top-11 glass-strong rounded-2xl p-1.5 w-52 z-50 animate-fade-in">
              <button onClick={() => { hideMeNow(); setMenuOpen(false); toast.success("You're hidden now. You can turn visibility back on anytime."); }}
                className="w-full px-3 h-10 text-left text-sm flex items-center gap-2 rounded-xl hover:bg-secondary/60"><EyeOff className="w-4 h-4"/>Hide Me Now</button>
              <button onClick={() => { hideMeNow(true); setMenuOpen(false); toast.success("Hidden and chats muted."); }}
                className="w-full px-3 h-10 text-left text-sm flex items-center gap-2 rounded-xl hover:bg-secondary/60"><EyeOff className="w-4 h-4"/>Hide Me + Mute Chats</button>
              <button onClick={() => { setMenuOpen(false); nav('/app/report/' + p.id); }}
                className="w-full px-3 h-10 text-left text-sm flex items-center gap-2 rounded-xl hover:bg-secondary/60"><Flag className="w-4 h-4"/>Report</button>
              <button onClick={() => { block(p.id); setMenuOpen(false); toast('Blocked.'); nav('/app/chats'); }}
                className="w-full px-3 h-10 text-left text-sm flex items-center gap-2 rounded-xl hover:bg-secondary/60 text-destructive">Block</button>
            </div>
          )}
        </div>
      </header>

      <div className="px-4 py-2 bg-primary/5 border-b border-primary/15 flex items-center gap-2 text-xs">
        <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-muted-foreground">Your exact location is hidden. Only share details when you're ready.</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {chatMsgs.map(msg => {
          if (msg.type === 'system') {
            return <div key={msg.id} className="text-[11px] text-center text-muted-foreground glass rounded-full py-2 px-4 mx-auto max-w-xs">{msg.body}</div>;
          }
          if (msg.type === 'safety_warning') {
            return (
              <div key={msg.id} className="mx-auto max-w-[85%] glass rounded-2xl p-3 border border-amber-500/30 flex gap-2.5 items-start animate-fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-muted-foreground">{msg.body}</div>
              </div>
            );
          }
          if (msg.type === 'safety_blocked') {
            return (
              <div key={msg.id} className="flex justify-end animate-fade-in">
                <div className="max-w-[80%] rounded-2xl rounded-br-md p-3 bg-destructive/10 border border-destructive/40">
                  <div className="flex items-center gap-1.5 text-destructive text-[10px] uppercase tracking-widest mb-1.5">
                    <ShieldAlert className="w-3 h-3" />Blocked for safety
                  </div>
                  <p className="text-xs text-muted-foreground line-through">{msg.body}</p>
                  <p className="text-[10px] text-muted-foreground/80 mt-2 not-italic">Neara limits off-app contact, payment requests, and unknown links to help prevent scams.</p>
                </div>
              </div>
            );
          }
          if (msg.type === 'private_request') {
            return (
              <div key={msg.id} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[80%] rounded-2xl p-3 border ${msg.fromMe ? 'rounded-br-md border-primary/30 bg-primary/10' : 'rounded-bl-md border-primary/30 glass'}`}>
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary mb-1.5">
                    <KeyRound className="w-3 h-3" />Private album request
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {msg.fromMe ? `Waiting for ${p.name} to share their private album.` : `${p.name} asked to view your private album.`}
                  </p>
                  {!msg.fromMe && (
                    <div className="mt-2.5 flex gap-2">
                      <NButton size="sm" disabled={!user.privatePhotos.length} onClick={() => { sharePrivateAlbum(m.id); toast.success('Private album shared.'); }}>
                        {user.privatePhotos.length ? 'Share album' : 'Add photos first'}
                      </NButton>
                      {!user.privatePhotos.length && (
                        <NButton size="sm" variant="outline" onClick={() => nav('/app/profile/edit')}>Add</NButton>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          }
          if (msg.type === 'private_album') {
            const count = msg.photos?.length ?? 0;
            return (
              <div key={msg.id} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <button
                  type="button"
                  onClick={() => msg.photos && setAlbumPhotos(msg.photos)}
                  className={`max-w-[80%] text-left rounded-2xl p-3 border transition hover:border-primary/60 ${msg.fromMe ? 'rounded-br-md border-primary/40 bg-primary/10' : 'rounded-bl-md border-primary/40 glass'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary mb-2">
                    <Lock className="w-3 h-3" />Private album · {count} photo{count === 1 ? '' : 's'}
                  </div>
                  <div className="flex gap-1.5 mb-2">
                    {msg.photos?.slice(0, 3).map((src, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-border/60">
                        <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover blur-md scale-110" />
                        <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5 text-primary/80" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Eye className="w-3 h-3" />Tap to view</p>
                </button>
              </div>
            );
          }
          return (
            <div key={msg.id} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${msg.fromMe
                ? 'bg-gradient-accent text-primary-foreground rounded-br-md'
                : 'glass rounded-bl-md'}`}>
                {msg.body}
              </div>
            </div>
          );
        })}
      </div>

      {albumPhotos && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-5 animate-fade-in" onClick={() => setAlbumPhotos(null)}>
          <div className="glass-strong rounded-3xl p-5 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <h3 className="font-display text-lg">Private album</h3>
              </div>
              <button onClick={() => setAlbumPhotos(null)} className="w-8 h-8 rounded-full hover:bg-secondary/60 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {albumPhotos.map((src, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden border border-border/60">
                  <img src={src} alt={`Private ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              These photos were shared privately with you. Please don't screenshot or share elsewhere — it's a community trust rule.
            </p>
          </div>
        </div>
      )}

      {/* Off-app status pill */}
      <div className="px-4 -mb-1 flex items-center justify-between">
        <div className={`text-[10px] px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${
          status === 'eligible' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' :
          status === 'restricted' ? 'bg-destructive/10 text-destructive border border-destructive/40' :
          'bg-secondary/60 text-muted-foreground border border-border'
        }`}>
          {status === 'eligible' ? <CheckCircle2 className="w-3 h-3"/> : <Lock className="w-3 h-3"/>}
          Off-app sharing: {status}
        </div>
      </div>

      <div className="p-3 border-t border-border/50 glass-strong">
        <div className="flex gap-2 mb-2 overflow-x-auto">
          <button onClick={() => nav('/app/safe-meet/' + m.id)} className="text-xs px-3 py-1.5 rounded-full bg-secondary/60 border border-border hover:border-primary/50 whitespace-nowrap">Suggest Safe Meet</button>
          {iSharedWithThem ? (
            <button onClick={() => { revokePrivateAlbum(m.id); toast('Private album access revoked.'); }} className="text-xs px-3 py-1.5 rounded-full bg-secondary/60 border border-border hover:border-destructive/50 whitespace-nowrap flex items-center gap-1.5"><EyeOff className="w-3 h-3" />Revoke album</button>
          ) : theyRequested && user.privatePhotos.length > 0 ? (
            <button onClick={() => { sharePrivateAlbum(m.id); toast.success('Private album shared.'); }} className="text-xs px-3 py-1.5 rounded-full bg-primary/15 border border-primary/40 text-primary hover:border-primary whitespace-nowrap flex items-center gap-1.5"><ImageIcon className="w-3 h-3" />Share private album</button>
          ) : (
            <button onClick={() => { requestPrivateAlbum(m.id); toast(`Asked ${p.name} for their private album.`); }} className="text-xs px-3 py-1.5 rounded-full bg-secondary/60 border border-border hover:border-primary/50 whitespace-nowrap flex items-center gap-1.5"><KeyRound className="w-3 h-3" />Request private album</button>
          )}
          {DEMO_PROMPTS.map(d => (
            <button key={d} onClick={() => setText(d)} className="text-[10px] px-2.5 py-1.5 rounded-full bg-secondary/40 border border-border/60 text-muted-foreground hover:border-amber-500/50 whitespace-nowrap">demo: "{d}"</button>
          ))}
        </div>

        {liveScan.level !== 'safe' && text && (
          <div className={`mb-2 text-[11px] rounded-xl px-3 py-2 flex items-start gap-2 ${
            liveScan.level === 'blocked' ? 'bg-destructive/10 border border-destructive/40 text-destructive' : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
          }`}>
            {liveScan.level === 'blocked' ? <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0"/> : <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0"/>}
            <span className="leading-snug">{liveScan.message}</span>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); submit(text); }} className="flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Message"
            className="flex-1 h-11 rounded-full bg-secondary/40 border border-border px-4 text-sm focus:outline-none focus:border-primary/60" />
          <NButton type="submit" size="sm" disabled={inputBlocked && !text}>Send</NButton>
        </form>
      </div>
    </div>
  );
}
