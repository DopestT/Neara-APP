import { useApp } from '@/store/AppStore';
import { CheckCircle2, AlertCircle, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StrengthOverride {
  profileStrength: number;
  profileMissing: string[];
  profileComplete: boolean;
  profileMissingDetailed?: { label: string; required: boolean }[];
}

export function ProfileStrength({ compact = false, override, hideEditLink = false }: { compact?: boolean; override?: StrengthOverride; hideEditLink?: boolean }) {
  const store = useApp();
  const profileStrength = override?.profileStrength ?? store.profileStrength;
  const profileMissing = override?.profileMissing ?? store.profileMissing;
  const profileComplete = override?.profileComplete ?? store.profileComplete;
  const detailed = override?.profileMissingDetailed ?? store.profileMissingDetailed ?? profileMissing.map(label => ({ label, required: true }));
  const required = detailed.filter(d => d.required);
  const optional = detailed.filter(d => !d.required);
  const label = profileStrength >= 90 ? 'Excellent' : profileStrength >= 70 ? 'Strong' : profileStrength >= 40 ? 'Getting there' : 'Just starting';

  if (compact) {
    return (
      <div className="glass rounded-2xl p-3 flex items-center gap-3">
        <div className="relative w-10 h-10 shrink-0">
          <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
              strokeDasharray={`${(profileStrength / 100) * 94.2} 94.2`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium tabular-nums">{profileStrength}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium">{label}</p>
          <p className="text-[10px] text-muted-foreground truncate">{profileComplete ? 'Discovery unlocked' : `Add: ${profileMissing[0] || '—'}`}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary/80">Profile strength</p>
          <p className="font-display text-2xl mt-1">{label}</p>
        </div>
        <span className="font-display text-3xl tabular-nums accent-text">{profileStrength}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
        <div className="h-full bg-gradient-accent transition-all duration-700" style={{ width: `${profileStrength}%` }} />
      </div>
      {detailed.length === 0 ? (
        <p className="text-sm text-primary flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Your profile is complete.</p>
      ) : (
        <div className="space-y-3">
          {required.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] uppercase tracking-widest text-amber-300/80">Required</p>
              <ul className="space-y-1.5">
                {required.map(m => (
                  <li key={m.label} className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{m.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {optional.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Boost your profile</p>
              <ul className="space-y-1.5">
                {optional.slice(0, 4).map(m => (
                  <li key={m.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                    <span>{m.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {!hideEditLink && (
        <Link to="/app/profile/edit" className="block text-center text-xs text-primary hover:underline pt-1">Edit profile →</Link>
      )}
    </div>
  );
}

export function ProfileGate() {
  const { profileComplete, profileMissing } = useApp();
  if (profileComplete) return null;
  return (
    <div className="glass-strong rounded-3xl p-6 border-amber-500/30 space-y-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400" />
        <p className="text-xs uppercase tracking-widest text-amber-300">Complete to enter discovery</p>
      </div>
      <p className="font-display text-xl">Finish your profile to meet nearby.</p>
      <p className="text-sm text-muted-foreground">Still needed: {profileMissing.slice(0, 3).join(' · ')}</p>
      <Link to="/app/profile/edit" className="inline-flex items-center gap-2 text-sm text-primary">Complete profile <ChevronRight className="w-4 h-4" /></Link>
    </div>
  );
}
