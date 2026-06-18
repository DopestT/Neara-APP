import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppStore';
import { VisibilityMode } from '@/lib/types';
import { ChevronLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { PremiumModal } from '@/components/neara/PremiumModal';

const MODES: { v: VisibilityMode; t: string; d: string; premium?: boolean }[] = [
  { v: 'visible', t: 'Visible', d: 'Discoverable in your privacy circle.' },
  { v: 'paused', t: 'Paused', d: 'Take a break. Hidden from discovery.' },
  { v: 'ghost', t: 'Ghost Mode', d: 'Browse nearby without appearing publicly on the map.', premium: true },
  { v: 'invisible_until_match', t: 'Invisible Until Match', d: 'Only revealed once you mutually match.', premium: true },
  { v: 'travel', t: 'Travel Mode', d: 'Set a city without exposing real location.', premium: true },
];

export default function VisibilitySettings() {
  const { user, setUser } = useApp();
  const nav = useNavigate();
  const [paywall, setPaywall] = useState<string | null>(null);
  return (
    <div className="px-5 py-6 space-y-6 pb-32">
      <button onClick={() => nav(-1)} className="w-9 h-9 rounded-full glass flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
      <h1 className="font-display text-3xl">Visibility</h1>
      <p className="text-sm text-muted-foreground">Choose how you appear. Switch anytime.</p>
      <div className="space-y-2">
        {MODES.map(m => {
          const locked = m.premium && !user.premium;
          const active = user.visibility === m.v;
          return (
            <button key={m.v} onClick={() => {
              if (locked) { setPaywall(m.t); return; }
              setUser({ visibility: m.v });
              toast.success(`Set to ${m.t}.`);
            }} className={`w-full text-left glass rounded-2xl p-4 transition ${active?'border-primary/60 ring-glow':''}`}>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium flex items-center gap-2">{m.t} {locked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.d}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border ${active?'bg-primary border-primary':'border-border'}`} />
              </div>
            </button>
          );
        })}
      </div>
      <PremiumModal feature={paywall || ''} open={!!paywall} onClose={() => setPaywall(null)} />
    </div>
  );
}
