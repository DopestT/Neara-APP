import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Upload, Lock, ShieldCheck } from 'lucide-react';
import {
  SOUND_PRESETS, SOUND_EVENT_META, SoundEvent, SoundPresetId,
  loadSoundSettings, saveSoundSettings, previewPreset, SoundSettings,
} from '@/lib/sounds';
import { useApp } from '@/store/AppStore';
import { NButton } from '@/components/neara/NButton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const EVENT_ORDER: SoundEvent[] = [
  'match', 'signal_sent', 'signal_received', 'pass', 'verification', 'premium_unlock',
];

export default function SoundReactions() {
  const { user } = useApp();
  const nav = useNavigate();
  const [settings, setSettings] = useState<SoundSettings>(() => loadSoundSettings());

  const update = (patch: Partial<SoundSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSoundSettings(next);
  };

  const setEventPreset = (e: SoundEvent, id: SoundPresetId) => {
    const next = { ...settings, events: { ...settings.events, [e]: id } };
    setSettings(next);
    saveSoundSettings(next);
  };

  return (
    <div className="px-5 py-6 space-y-6 pb-32">
      <header className="space-y-2">
        <Link to="/app/profile" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-3 h-3" /> Settings
        </Link>
        <h1 className="font-display text-3xl">Sound Reactions</h1>
        <p className="text-muted-foreground">Make your matches feel like yours.</p>
        <div className="glass rounded-2xl px-4 py-3 flex items-start gap-3 mt-3">
          <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Only you hear your Sound Reactions. The other person never hears when you pass, hide, block, or report.
          </p>
        </div>
      </header>

      {/* Global toggles */}
      <div className="glass rounded-3xl divide-y divide-border/50 overflow-hidden">
        <Toggle
          label="Sound Reactions"
          sub="Master switch for all in-app sounds."
          checked={settings.enabled}
          onChange={v => update({ enabled: v })}
        />
        <Toggle
          label="Respect silent mode"
          sub="Stay quiet when your device is silenced."
          checked={settings.respectSilent}
          onChange={v => update({ respectSilent: v })}
          disabled={!settings.enabled}
        />
        <Toggle
          label="Vibration only"
          sub="Skip audio and use a subtle haptic instead."
          checked={settings.vibrationOnly}
          onChange={v => update({ vibrationOnly: v })}
          disabled={!settings.enabled}
        />
      </div>

      {/* Per-event sound pickers */}
      <div className="space-y-4">
        {EVENT_ORDER.map(ev => (
          <EventCard
            key={ev}
            event={ev}
            value={settings.events[ev]}
            customLabel={settings.customLabels[ev]}
            isPremium={!!user.premium}
            onPick={(id) => setEventPreset(ev, id)}
            onUploadMock={(label) => {
              const next = {
                ...settings,
                events: { ...settings.events, [ev]: 'custom' as SoundPresetId },
                customLabels: { ...settings.customLabels, [ev]: label },
              };
              setSettings(next);
              saveSoundSettings(next);
            }}
            onUpgrade={() => nav('/app/premium')}
            disabled={!settings.enabled}
          />
        ))}
      </div>
    </div>
  );
}

function Toggle({
  label, sub, checked, onChange, disabled,
}: { label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'w-full px-5 py-4 flex items-center gap-4 text-left transition',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary/40',
      )}
    >
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <span
        className={cn(
          'relative w-10 h-6 rounded-full transition',
          checked ? 'bg-primary' : 'bg-secondary',
        )}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background shadow transition-transform"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </span>
    </button>
  );
}

function EventCard({
  event, value, customLabel, isPremium, disabled,
  onPick, onUploadMock, onUpgrade,
}: {
  event: SoundEvent;
  value: SoundPresetId;
  customLabel?: string;
  isPremium: boolean;
  disabled?: boolean;
  onPick: (id: SoundPresetId) => void;
  onUploadMock: (label: string) => void;
  onUpgrade: () => void;
}) {
  const meta = SOUND_EVENT_META[event];
  return (
    <div className={cn('glass rounded-3xl p-5 space-y-4', disabled && 'opacity-60')}>
      <div>
        <h3 className="font-display text-lg">{meta.title}</h3>
        <p className="text-[12px] text-muted-foreground">{meta.description}</p>
      </div>

      <div className="space-y-2">
        {SOUND_PRESETS.map(p => {
          const selected = value === p.id;
          return (
            <div
              key={p.id}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 border transition cursor-pointer',
                selected ? 'border-primary/60 bg-primary/10' : 'border-border/50 hover:border-border',
              )}
              onClick={() => !disabled && onPick(p.id)}
            >
              <span
                className={cn(
                  'w-4 h-4 rounded-full border-2 shrink-0 transition',
                  selected ? 'border-primary bg-primary' : 'border-muted-foreground/40',
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{p.label}</p>
                <p className="text-[11px] text-muted-foreground truncate">{p.description}</p>
              </div>
              {p.id !== 'silent' && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); previewPreset(p.id); }}
                  className="shrink-0 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-foreground/5"
                  aria-label={`Preview ${p.label}`}
                >
                  <Play className="w-3 h-3" /> Preview
                </button>
              )}
            </div>
          );
        })}

        {/* Custom upload row */}
        <CustomUploadRow
          selected={value === 'custom'}
          customLabel={customLabel}
          isPremium={isPremium}
          disabled={disabled}
          onPick={() => onPick('custom')}
          onUploadMock={onUploadMock}
          onUpgrade={onUpgrade}
        />
      </div>
    </div>
  );
}

function CustomUploadRow({
  selected, customLabel, isPremium, disabled,
  onPick, onUploadMock, onUpgrade,
}: {
  selected: boolean;
  customLabel?: string;
  isPremium: boolean;
  disabled?: boolean;
  onPick: () => void;
  onUploadMock: (label: string) => void;
  onUpgrade: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);

  const onFile = (f: File | null) => {
    if (!f) return;
    const ok = /\.(mp3|wav|m4a)$/i.test(f.name);
    if (!ok) { toast.error('Use an MP3, WAV, or M4A file.'); return; }
    if (f.size > 1.5 * 1024 * 1024) {
      toast.error('Keep it short — max 3 seconds.');
      return;
    }
    // Mock: we don't actually decode/persist audio — just record the label.
    setPendingLabel(f.name);
    toast('Sound ready to save', { description: f.name });
  };

  return (
    <div
      className={cn(
        'rounded-2xl border p-3 transition',
        selected ? 'border-primary/60 bg-primary/10' : 'border-dashed border-border/60',
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'w-4 h-4 rounded-full border-2 shrink-0 transition',
            selected ? 'border-primary bg-primary' : 'border-muted-foreground/40',
          )}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium flex items-center gap-1.5">
            Custom Upload
            {!isPremium && <Lock className="w-3 h-3 text-amber-400" />}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {customLabel ? `Saved: ${customLabel}` : 'MP3, WAV or M4A · max 3 seconds'}
          </p>
        </div>
        {!isPremium ? (
          <button
            type="button"
            onClick={onUpgrade}
            className="text-xs text-primary hover:underline px-2 py-1"
          >
            Upgrade
          </button>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
            className="shrink-0 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-foreground/5"
          >
            <Upload className="w-3 h-3" /> Choose
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-m4a"
          className="hidden"
          onChange={e => onFile(e.target.files?.[0] || null)}
        />
      </div>

      {isPremium && (
        <>
          <p className="text-[11px] text-amber-300/80 mt-2 leading-relaxed px-1">
            Only upload sounds you own or have permission to use.
          </p>
          {(pendingLabel || customLabel) && (
            <div className="flex items-center gap-2 mt-3">
              <NButton
                size="sm"
                variant="outline"
                onClick={() => { previewPreset('custom'); }}
              >
                <Play className="w-3 h-3 mr-1" /> Preview
              </NButton>
              <NButton
                size="sm"
                onClick={() => {
                  const label = pendingLabel || customLabel || 'Custom sound';
                  onUploadMock(label);
                  onPick();
                  setPendingLabel(null);
                  toast.success('Custom sound saved');
                }}
                disabled={!pendingLabel}
              >
                Save
              </NButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}
