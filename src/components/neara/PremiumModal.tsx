import { ReactNode } from 'react';
import { Crown, X } from 'lucide-react';
import { NButton } from './NButton';
import { useNavigate } from 'react-router-dom';

export function PremiumModal({ feature, open, onClose, children }: {
  feature: string; open: boolean; onClose: () => void; children?: ReactNode;
}) {
  const nav = useNavigate();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
      <div className="w-full max-w-sm glass-strong rounded-3xl p-6 animate-fade-up relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
        <div className="w-14 h-14 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-glow mb-4">
          <Crown className="w-6 h-6 text-primary-foreground" />
        </div>
        <p className="text-xs uppercase tracking-widest text-primary/80">Premium</p>
        <h2 className="font-display text-2xl mt-1">{feature} is a Premium feature.</h2>
        <div className="mt-4 text-sm text-muted-foreground space-y-3">
          {children || <p>Unlock deeper discovery and more control. Premium never reveals anyone's exact location.</p>}
        </div>
        <div className="mt-6 space-y-2">
          <NButton full size="lg" onClick={() => { onClose(); nav('/app/premium'); }}>See Premium</NButton>
          <NButton full variant="ghost" onClick={onClose}>Not now</NButton>
        </div>
      </div>
    </div>
  );
}
