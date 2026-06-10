import { useState } from 'react';
import { X, SlidersHorizontal, Crown, BadgeCheck, Ruler, Heart, Sparkles, Tag } from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { DEFAULT_FILTERS } from '@/store/AppStore';
import { DiscoveryFilters, LOOKING_FOR_LABEL, LookingFor, VIBE_LABEL, Vibe, ZONE_RADIUS_LABEL } from '@/lib/types';
import { INTEREST_POOL } from '@/lib/demoData';
import { NButton } from './NButton';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const cmToFtIn = (cm: number) => {
  const totalIn = Math.round(cm / 2.54);
  return `${Math.floor(totalIn / 12)}'${totalIn % 12}"`;
};

export function FiltersSheet({ open, onClose, onPaywall }: {
  open: boolean;
  onClose: () => void;
  onPaywall: (label: string) => void;
}) {
  const { user, setUser } = useApp();
  const [tab, setTab] = useState<'basic' | 'advanced'>('basic');
  const [draft, setDraft] = useState<DiscoveryFilters>(user.filters);

  if (!open) return null;

  const update = <K extends keyof DiscoveryFilters>(k: K, v: DiscoveryFilters[K]) => setDraft(d => ({ ...d, [k]: v }));

  const apply = () => { setUser({ filters: draft }); onClose(); };
  const reset = () => setDraft(DEFAULT_FILTERS);

  const isAdvancedLocked = !user.premium && tab === 'advanced';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md glass-strong rounded-t-3xl max-h-[92dvh] flex flex-col animate-fade-up" onClick={e => e.stopPropagation()}>
        <div className="p-5 pb-3 flex items-center justify-between border-b border-border/40">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center"><X className="w-4 h-4" /></button>
          <h2 className="font-display text-lg flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-primary" />Narrow your search</h2>
          <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground transition">Reset</button>
        </div>

        <div className="px-5 pt-4 flex gap-2">
          {(['basic','advanced'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn(
                'px-4 h-9 rounded-full text-sm capitalize transition flex items-center gap-1.5',
                tab === t ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
              )}>
              {t === 'advanced' && !user.premium && <Crown className="w-3 h-3" />}
              {t} filters
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 relative">
          {tab === 'basic' && (
            <>
              <Field label="Who would you like to meet?">
                <select value={user.interestedIn} onChange={e => setUser({ interestedIn: e.target.value })}
                  className="w-full h-12 rounded-2xl bg-secondary/40 border border-border px-4 text-sm focus:outline-none focus:border-primary/60">
                  <option value="">Everyone</option>
                  <option value="women">Women</option>
                  <option value="men">Men</option>
                  <option value="nonbinary">Non-binary</option>
                </select>
              </Field>

              <Field label="How old are they?">
                <div className="glass rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-medium">Between {draft.ageMin} and {draft.ageMax}</p>
                  <RangeSlider min={18} max={70} valueMin={draft.ageMin} valueMax={draft.ageMax}
                    onChange={(a, b) => { update('ageMin', a); update('ageMax', b); }} />
                </div>
              </Field>

              <Field label="How close are they?" sub="Neara never shows exact distance — only approximate zones.">
                <div className="glass rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-medium">{ZONE_RADIUS_LABEL[draft.zoneRadius]}</p>
                  <Slider min={1} max={4} step={1} value={[draft.zoneRadius]}
                    onValueChange={([v]) => update('zoneRadius', v as DiscoveryFilters['zoneRadius'])} />
                  <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                    <span>Tight</span><span>Nearby</span><span>City</span><span>Wide</span>
                  </div>
                  <Toggle label="Show slightly wider zones if it gets quiet"
                    checked={draft.expandIfQuiet} onChange={v => update('expandIfQuiet', v)} />
                </div>
              </Field>

              <Field label="Do they share any of your interests?">
                <div className="glass rounded-2xl p-3 flex flex-wrap gap-2">
                  {INTEREST_POOL.map(i => {
                    const on = draft.interests.includes(i);
                    return (
                      <button key={i} onClick={() => update('interests', on ? draft.interests.filter(x => x !== i) : [...draft.interests, i])}
                        className={cn('px-3 h-8 rounded-full text-xs border transition',
                          on ? 'bg-gradient-accent text-primary-foreground border-transparent shadow-glow' : 'bg-secondary/40 border-border text-foreground/85 hover:border-primary/40')}>
                        {i}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </>
          )}

          {tab === 'advanced' && (
            <div className={cn('space-y-6', isAdvancedLocked && 'pointer-events-none opacity-50 blur-[1px]')}>
              <Field label="How tall are they?" icon={Ruler}>
                <div className="glass rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-medium">
                    {draft.heightMinCm === 150 && draft.heightMaxCm === 200
                      ? 'Any height is just fine'
                      : `Between ${cmToFtIn(draft.heightMinCm)} and ${cmToFtIn(draft.heightMaxCm)}`}
                  </p>
                  <RangeSlider min={150} max={210} valueMin={draft.heightMinCm} valueMax={draft.heightMaxCm}
                    onChange={(a, b) => { update('heightMinCm', a); update('heightMaxCm', b); }} />
                </div>
              </Field>

              <Field label="What are they looking for?" icon={Heart}>
                <div className="glass rounded-2xl divide-y divide-border/40">
                  {(Object.keys(LOOKING_FOR_LABEL) as LookingFor[]).map(k => {
                    const on = draft.intents.includes(k);
                    return (
                      <button key={k} onClick={() => update('intents', on ? draft.intents.filter(x => x !== k) : [...draft.intents, k])}
                        className="w-full px-4 h-12 flex items-center justify-between text-sm">
                        <span>{LOOKING_FOR_LABEL[k]}</span>
                        <span className={cn('w-5 h-5 rounded-full border-2 transition',
                          on ? 'bg-primary border-primary' : 'border-border')} />
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Vibe filter" icon={Sparkles}>
                <div className="glass rounded-2xl p-3 flex flex-wrap gap-2">
                  {(Object.keys(VIBE_LABEL) as Vibe[]).map(v => {
                    const on = draft.vibes.includes(v);
                    return (
                      <button key={v} onClick={() => update('vibes', on ? draft.vibes.filter(x => x !== v) : [...draft.vibes, v])}
                        className={cn('px-3 h-8 rounded-full text-xs border transition',
                          on ? 'bg-gradient-accent text-primary-foreground border-transparent shadow-glow' : 'bg-secondary/40 border-border text-foreground/85 hover:border-primary/40')}>
                        {VIBE_LABEL[v]}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Verified only" icon={BadgeCheck}>
                <div className="glass rounded-2xl p-4">
                  <Toggle label="Only show profiles with a Trust Badge"
                    checked={draft.verifiedOnly} onChange={v => update('verifiedOnly', v)} />
                </div>
              </Field>
            </div>
          )}

          {isAdvancedLocked && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="glass-strong rounded-2xl px-5 py-4 flex flex-col items-center gap-2 border-primary/40 ring-glow pointer-events-auto">
                <Crown className="w-5 h-5 text-primary" />
                <p className="font-display text-sm">Advanced filters are Premium.</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 pt-3 border-t border-border/40">
          {isAdvancedLocked ? (
            <NButton full size="lg" onClick={() => onPaywall('Advanced filters')}>
              <Crown className="w-4 h-4 mr-2" />Unlock Premium
            </NButton>
          ) : (
            <NButton full size="lg" onClick={apply}>Apply filters</NButton>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, sub, icon: Icon, children }: { label: string; sub?: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      </div>
      {children}
      {sub && <p className="text-[11px] text-muted-foreground/80 px-1">{sub}</p>}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs text-muted-foreground cursor-pointer">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function RangeSlider({ min, max, valueMin, valueMax, onChange }: {
  min: number; max: number; valueMin: number; valueMax: number;
  onChange: (a: number, b: number) => void;
}) {
  return (
    <Slider
      min={min} max={max} step={1}
      value={[valueMin, valueMax]}
      onValueChange={(vals) => {
        const [a, b] = vals;
        onChange(Math.min(a, b), Math.max(a, b));
      }}
    />
  );
}
