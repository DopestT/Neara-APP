import { useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppStore';
import { ChevronLeft, EyeOff, UserX, Flag, MapPin, Coffee, BookOpen, MessageSquare, MessageSquareOff, Video, Lock, BadgeCheck, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { NEARA_DOMAIN, NEARA_SUPPORT_EMAIL, NEARA_SAFETY_EMAIL, NEARA_LEGAL_EMAIL } from '@/lib/brand';

export default function SafetyCenter() {
  const nav = useNavigate();
  const { hideMeNow } = useApp();

  const sections: { icon: any; label: string; onClick?: () => void; to?: string; danger?: boolean }[] = [
    { icon: MapPin, label: 'Location Privacy', onClick: () => nav('/app/legal/location') },
    { icon: Lock, label: 'Off-App Safety', onClick: () => nav('/app/legal/off-app') },
    { icon: Video, label: 'Catfish Protection', onClick: () => nav('/app/verification') },
    { icon: Flag, label: 'Report a User', onClick: () => toast('Open a chat or profile to report.') },
    { icon: UserX, label: 'Blocked Users', onClick: () => nav('/app/blocked') },
    { icon: Coffee, label: 'Meetup Safety', onClick: () => toast('Always meet in public. Tell a friend. Trust your gut.') },
    { icon: MessageSquare, label: 'Contact Support', onClick: () => toast(`Support: ${NEARA_SUPPORT_EMAIL}`) },
    { icon: BookOpen, label: 'Community Rules', onClick: () => nav('/app/legal/community') },
    { icon: BookOpen, label: 'Legal & Policies', onClick: () => nav('/app/legal') },
  ];

  const explainers = [
    { icon: MapPin, t: 'Neara never shows exact pins.' },
    { icon: MessageSquare, t: 'Keep early conversations on Neara.' },
    { icon: BadgeCheck, t: 'Verified means the user passed a private real-person check.' },
    { icon: Shield, t: 'Premium never reveals anyone\'s exact location.' },
  ];

  return (
    <div className="px-5 py-6 space-y-6 pb-32">
      <button onClick={() => nav(-1)} className="w-9 h-9 rounded-full glass flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
      <div>
        <p className="text-xs uppercase tracking-widest text-primary/80">Safety Center</p>
        <h1 className="font-display text-3xl mt-2">Your safety, your control.</h1>
      </div>

      {/* Hide Me Now — primary action */}
      <div className="space-y-3">
        <button onClick={() => { hideMeNow(); toast.success("You're hidden now. You can turn visibility back on anytime."); }}
          className="w-full glass-strong rounded-3xl p-6 text-left hover:border-primary/50 transition group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-glow">
              <EyeOff className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-display text-xl">Hide Me Now</p>
              <p className="text-xs text-muted-foreground mt-1">Disappear from discovery instantly.</p>
            </div>
          </div>
        </button>
        <button onClick={() => { hideMeNow(true); toast.success('Hidden and chats muted.'); }}
          className="w-full glass rounded-2xl px-5 h-12 flex items-center gap-3 text-sm hover:border-primary/40 transition">
          <MessageSquareOff className="w-4 h-4 text-primary" />
          Hide Me + Mute Chats
        </button>
      </div>

      {/* Explainer cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {explainers.map(e => (
          <div key={e.t} className="glass rounded-2xl p-4">
            <e.icon className="w-4 h-4 text-primary mb-2" />
            <p className="text-[12px] leading-snug text-foreground/85">{e.t}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl divide-y divide-border/50 overflow-hidden">
        {sections.map(i => (
          <button key={i.label} onClick={i.onClick}
            className="w-full px-5 h-14 flex items-center gap-3 hover:bg-secondary/40 transition text-left">
            <i.icon className="w-4 h-4 text-muted-foreground" />
            <span className="flex-1 text-sm">{i.label}</span>
            <span className="text-muted-foreground">›</span>
          </button>
        ))}
      </div>

      <footer className="pt-4 text-center space-y-1.5">
        <p className="text-[11px] text-foreground/80 font-medium">{NEARA_DOMAIN} · Legal & Safety</p>
        <p className="text-[10px] text-muted-foreground/80">
          Safety {NEARA_SAFETY_EMAIL} · Legal {NEARA_LEGAL_EMAIL} · Support {NEARA_SUPPORT_EMAIL}
        </p>
        <p className="text-[10px] text-muted-foreground/60">
          Neara shows approximate areas — never exact pins.
        </p>
      </footer>
    </div>
  );
}
