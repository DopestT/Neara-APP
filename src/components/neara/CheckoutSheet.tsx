import { useState } from 'react';
import { X, Apple, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NButton } from './NButton';
import { useApp } from '@/store/AppStore';
import { playSoundForEvent } from '@/lib/sounds';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface CheckoutPlan {
  id: string;
  name: string;
  price: string;
  cadence: string;
}

export function CheckoutSheet({ plan, open, onClose }: {
  plan: CheckoutPlan | null;
  open: boolean;
  onClose: () => void;
}) {
  const { setUser } = useApp();
  const [method, setMethod] = useState<'apple' | 'card'>('apple');
  const [paying, setPaying] = useState(false);

  if (!open || !plan) return null;

  const pay = () => {
    setPaying(true);
    setTimeout(() => {
      setUser({ premium: true });
      playSoundForEvent('premium_unlock');
      toast.success('Premium activated (demo).');
      setPaying(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-background/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md glass-strong rounded-t-3xl flex flex-col animate-fade-up max-h-[92dvh]" onClick={e => e.stopPropagation()}>
        <div className="p-5 pb-3 flex items-center justify-between">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center"><X className="w-4 h-4" /></button>
          <h2 className="font-display text-lg">Your purchase</h2>
          <div className="w-8" />
        </div>

        <div className="px-5 pb-3">
          <div className="rounded-2xl border border-border bg-secondary/30 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow">
                <ShieldCheck className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">{plan.name}</p>
                <p className="text-[11px] text-muted-foreground">Neara Premium</p>
              </div>
            </div>
            <p className="font-display text-xl">{plan.price}</p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3 flex-1 overflow-y-auto">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Payment method</p>
          <MethodButton selected={method === 'apple'} onClick={() => setMethod('apple')}
            label="Apple Pay" icon={<Apple className="w-4 h-4" />} highlight />
          <p className="text-xs uppercase tracking-widest text-muted-foreground pt-2">Other payment methods</p>
          <MethodButton selected={method === 'card'} onClick={() => setMethod('card')}
            label="Credit card" icon={<CreditCard className="w-4 h-4" />} />

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] text-amber-200/90 mt-4">
            Demo checkout — no real charge. Tap Pay to simulate Premium activation.
          </div>
        </div>

        <div className="p-5 pt-2 border-t border-border/40 space-y-3">
          <NButton full size="lg" onClick={pay} disabled={paying}>
            {paying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : method === 'apple' ? <Apple className="w-4 h-4 mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
            {paying ? 'Processing…' : method === 'apple' ? 'Pay with Apple Pay' : `Pay ${plan.price}`}
          </NButton>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Recurring billing. Your subscription renews automatically and your payment method will be charged for the same period and price unless you cancel at least 24 hours before the period ends. For instructions, see our{' '}
            <Link to="/app/legal/billing" className="underline hover:text-primary">FAQs</Link>. By tapping Pay you agree to our{' '}
            <Link to="/app/legal/terms" className="underline hover:text-primary">Terms</Link> and{' '}
            <Link to="/app/legal/privacy" className="underline hover:text-primary">Privacy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

function MethodButton({ selected, onClick, label, icon, highlight }: {
  selected: boolean; onClick: () => void; label: string; icon: React.ReactNode; highlight?: boolean;
}) {
  return (
    <button onClick={onClick}
      className={cn(
        'w-full h-14 rounded-2xl px-4 flex items-center justify-between border transition',
        selected
          ? highlight
            ? 'bg-gradient-accent text-primary-foreground border-transparent shadow-glow'
            : 'bg-primary/10 border-primary/50 text-foreground'
          : 'bg-secondary/40 border-border text-foreground/85 hover:border-primary/30'
      )}>
      <span className="flex items-center gap-3 text-sm font-medium">{icon}{label}</span>
      <span className={cn('w-5 h-5 rounded-full border-2 transition',
        selected ? 'bg-foreground/90 border-foreground/90' : 'border-foreground/40')} />
    </button>
  );
}
