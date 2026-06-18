import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { NButton } from '@/components/neara/NButton';
import { CheckoutSheet, CheckoutPlan } from '@/components/neara/CheckoutSheet';
import { useApp } from '@/store/AppStore';
import { ChevronLeft, Check, Crown, Sparkles, Eye, Ghost, Plane, BadgeCheck, Zap, Radio, Heart, Filter, ShieldCheck, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const PLANS: (CheckoutPlan & { weekly?: string; badge?: string; save?: string; highlight?: boolean })[] = [
  { id: 'm1', name: '1 month', price: '$19.99', cadence: 'per month', weekly: '$5/wk' },
  { id: 'm3', name: '3 months', price: '$39.99', cadence: 'every 3 months', weekly: '$3/wk', badge: 'Most popular', save: 'Save 33%', highlight: true },
  { id: 'm12', name: 'Yearly', price: '$99.99', cadence: 'per year', weekly: '$1.92/wk', save: 'Save 58%' },
];

const PERKS = [
  { icon: Radio, title: '50 Signals/day', sub: 'Reach the ones that matter, more often.' },
  { icon: Eye, title: 'See who sent you a Signal', sub: 'No more guessing — match instantly.' },
  { icon: Filter, title: 'Advanced filters', sub: 'Height, intent, vibes, verified-only.' },
  { icon: Ghost, title: 'Ghost Mode', sub: 'Browse without appearing.' },
  { icon: Plane, title: 'Travel Mode', sub: 'Set a city before you land.' },
  { icon: BadgeCheck, title: 'Verified-only browsing', sub: 'Only see Trust Badge profiles.' },
  { icon: Zap, title: 'Profile Boost', sub: 'Be one of the top profiles for 30 min.' },
  { icon: Heart, title: 'Read receipts', sub: 'Know when your message lands.' },
];

const PLUS_PERKS = [
  'Everything in Premium',
  'Unlimited Signals',
  'Stealth Mode — invisible until match',
  'Super Signal: one priority Signal a day',
  'Premium accent themes',
];

export default function Premium() {
  const { user } = useApp();
  const nav = useNavigate();
  const [selected, setSelected] = useState<string>('m3');
  const [tab, setTab] = useState<'premium' | 'plus'>('premium');
  const [checkoutPlan, setCheckoutPlan] = useState<CheckoutPlan | null>(null);
  const [showAllPerks, setShowAllPerks] = useState(false);

  const activePlan = PLANS.find(p => p.id === selected) ?? PLANS[1];
  const visiblePerks = showAllPerks ? PERKS : PERKS.slice(0, 4);

  return (
    <div className="px-5 py-6 space-y-6 pb-32">
      <div className="flex items-center justify-between">
        <button onClick={() => nav(-1)} className="w-9 h-9 rounded-full glass flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
        <button onClick={() => nav(-1)} className="w-9 h-9 rounded-full glass flex items-center justify-center"><X className="w-4 h-4" /></button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'premium' | 'plus')}>
        <TabsList className="bg-transparent border-b border-border/40 rounded-none w-full justify-start gap-6 p-0 h-auto">
          <TabsTrigger value="premium" className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-muted-foreground px-0 pb-3 font-display text-lg">Premium</TabsTrigger>
          <TabsTrigger value="plus" className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-muted-foreground px-0 pb-3 font-display text-lg flex items-center gap-1.5">Premium+ <Sparkles className="w-3.5 h-3.5 text-primary" /></TabsTrigger>
        </TabsList>

        <TabsContent value="premium" className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="flex">
              {[0, 1, 2].map(i => (
                <div key={i} className={cn(
                  'w-20 h-20 rounded-full bg-gradient-to-br from-primary/60 via-accent/40 to-secondary blur-[6px] border-2 border-background',
                  i > 0 && '-ml-6'
                )} />
              ))}
            </div>
            <div>
              <h1 className="font-display text-4xl leading-tight">See who sent you a Signal</h1>
              <p className="text-muted-foreground mt-2">Match instantly. Skip the guessing.</p>
            </div>
          </div>

          {user.verified && !user.premium && (
            <div className="glass-strong rounded-3xl p-5 border-primary/40 ring-glow space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="w-4 h-4" />
                <p className="text-xs uppercase tracking-widest">Verified offer · 50% off first month</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl">$9.99</span>
                <span className="text-sm text-muted-foreground line-through">$19.99</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {PLANS.map(p => {
              const on = selected === p.id;
              return (
                <button key={p.id} onClick={() => setSelected(p.id)}
                  className={cn(
                    'relative rounded-2xl p-3 text-left border transition flex flex-col gap-1.5 min-h-[120px]',
                    on ? (p.highlight ? 'bg-gradient-accent text-primary-foreground border-transparent shadow-glow' : 'border-primary/60 bg-primary/10')
                       : 'border-border bg-secondary/30 hover:border-primary/30'
                  )}>
                  {p.badge && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-widest bg-foreground text-background px-2 py-0.5 rounded-full whitespace-nowrap">{p.badge}</span>
                  )}
                  <div className="flex items-start justify-between">
                    <p className="font-display text-sm leading-tight">{p.name}</p>
                    <span className={cn('w-4 h-4 rounded-full border-2 shrink-0 transition',
                      on ? 'bg-foreground border-foreground' : 'border-foreground/40')} />
                  </div>
                  <p className="font-display text-lg">{p.weekly}</p>
                  <p className="text-[10px] opacity-80">{p.price} {p.cadence}</p>
                  {p.save && <p className="text-[10px] font-medium mt-auto">{p.save}</p>}
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {visiblePerks.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0"><Icon className="w-4 h-4" /></div>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
            {!showAllPerks && (
              <button onClick={() => setShowAllPerks(true)} className="w-full h-10 rounded-full border border-border text-sm text-foreground/80 hover:border-primary/40 transition">
                See all perks
              </button>
            )}
          </div>

          <button onClick={() => setTab('plus')} className="w-full glass-strong rounded-2xl p-4 text-left flex items-center justify-between border-primary/30">
            <div>
              <p className="font-display text-lg flex items-center gap-2">Get more with Premium+ <Sparkles className="w-4 h-4 text-primary" /></p>
              <p className="text-xs text-muted-foreground mt-1">Unlimited Signals, Stealth Mode, and more.</p>
            </div>
            <span className="text-primary text-sm">→</span>
          </button>
        </TabsContent>

        <TabsContent value="plus" className="space-y-5 mt-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary"><Crown className="w-3.5 h-3.5" />Premium+</div>
            <h1 className="font-display text-4xl mt-2">Everything, unlimited.</h1>
            <p className="text-muted-foreground mt-2">For the people who don't want any limits at all.</p>
          </div>
          <div className="glass-strong rounded-3xl p-5 space-y-3 border-primary/40">
            {PLUS_PERKS.map(t => (
              <div key={t} className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center"><Star className="w-3 h-3" /></div>{t}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setCheckoutPlan({ id: 'plus-m', name: 'Premium+ Monthly', price: '$29.99', cadence: 'per month' })}
              className="glass rounded-2xl p-4 text-center hover:border-primary/40 transition">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Monthly</p>
              <p className="font-display text-2xl mt-1">$29.99</p>
            </button>
            <button onClick={() => setCheckoutPlan({ id: 'plus-y', name: 'Premium+ Yearly', price: '$199.99', cadence: 'per year' })}
              className="glass-strong rounded-2xl p-4 text-center ring-glow border-primary/60">
              <p className="text-[10px] uppercase tracking-widest text-primary">Yearly · Best</p>
              <p className="font-display text-2xl mt-1">$199.99</p>
            </button>
          </div>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3 h-3 text-primary/70" />Premium never reveals anyone's exact location.
      </p>
      <p className="text-[11px] text-muted-foreground/70 text-center">
        BeNeara.app · billed securely · cancel anytime · <Link to="/app/legal/privacy" className="hover:text-primary">Privacy</Link> · <Link to="/app/legal/terms" className="hover:text-primary">Terms</Link>
      </p>

      {tab === 'premium' && !user.premium && (
        <div className="fixed bottom-20 left-0 right-0 z-30 px-5">
          <div className="max-w-md mx-auto">
            <NButton full size="lg" onClick={() => setCheckoutPlan(activePlan)}>
              Get {activePlan.name} for {activePlan.price}
            </NButton>
          </div>
        </div>
      )}

      {user.premium && (
        <div className="glass-strong rounded-2xl p-4 text-center border-primary/40">
          <Check className="w-5 h-5 text-primary mx-auto" />
          <p className="text-sm text-primary mt-1">You're Premium. Thank you.</p>
        </div>
      )}

      <CheckoutSheet plan={checkoutPlan} open={!!checkoutPlan} onClose={() => setCheckoutPlan(null)} />
    </div>
  );
}
