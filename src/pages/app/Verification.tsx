import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NButton } from '@/components/neara/NButton';
import { TrustBadge, SectionTitle, PrivacyOrb } from '@/components/neara/Brand';
import { useApp } from '@/store/AppStore';
import { ChevronLeft, Video, Eye, Hand, RotateCw, Circle } from 'lucide-react';
import { playSoundForEvent } from '@/lib/sounds';

type Phase = 'intro' | 'recording' | 'processing' | 'success';

const PROMPTS = [
  { icon: RotateCw, text: 'Turn your head left.' },
  { icon: Eye, text: 'Blink twice.' },
  { icon: Hand, text: 'Raise your hand.' },
  { icon: Circle, text: 'Follow the dot.' },
];

export default function Verification() {
  const nav = useNavigate();
  const { setUser, user } = useApp();
  const [phase, setPhase] = useState<Phase>('intro');
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const dotRef = useRef<HTMLDivElement>(null);

  // Pick three random prompts in stable order
  const [prompts] = useState(() => [...PROMPTS].sort(() => Math.random() - 0.5).slice(0, 3));

  useEffect(() => {
    if (phase !== 'recording') return;
    const t = setInterval(() => {
      setProgress(p => {
        const next = p + 2;
        if (next >= 100) {
          if (stepIdx + 1 < prompts.length) {
            setStepIdx(i => i + 1);
            return 0;
          } else {
            clearInterval(t);
            setPhase('processing');
            setTimeout(() => {
              setUser({ verified: true, trustBadge: true, verifiedPhotoSig: user.mainPhotoSig || `verified-${Date.now()}`, mainPhotoSig: user.mainPhotoSig || `verified-${Date.now()}` });
              playSoundForEvent('verification');
              setPhase('success');
            }, 1800);
            return 100;
          }
        }
        return next;
      });
    }, 60);
    return () => clearInterval(t);
  }, [phase, stepIdx, prompts.length, setUser]);

  if (phase === 'intro') {
    return (
      <div className="px-5 py-6 space-y-8 min-h-[80dvh] flex flex-col">
        <button onClick={() => nav(-1)} className="w-9 h-9 rounded-full glass flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <PrivacyOrb size={160} className="mb-8"><Video className="w-12 h-12 text-primary" /></PrivacyOrb>
          <h1 className="font-display text-3xl">Anti-Catfish Verification</h1>
          <p className="text-muted-foreground mt-3 max-w-sm">Complete a quick private video check so people know you're real.</p>
          <p className="text-xs text-muted-foreground/80 mt-2 max-w-sm">Your verification video is never shown on your profile.</p>
          <div className="glass rounded-3xl p-5 mt-8 text-left space-y-2 w-full max-w-sm">
            <p className="text-xs uppercase tracking-widest text-primary/80 mb-2">After approval, you unlock</p>
            <p className="text-sm">· Trust Badge</p>
            <p className="text-sm">· Higher visibility</p>
            <p className="text-sm">· 25 Signals/day</p>
            <p className="text-sm">· Verified-Only Discovery</p>
          </div>
        </div>
        <NButton full size="lg" onClick={() => setPhase('recording')}>Start Verification</NButton>
      </div>
    );
  }

  if (phase === 'recording') {
    const Prompt = prompts[stepIdx];
    return (
      <div className="px-5 py-6 space-y-6 min-h-[80dvh] flex flex-col">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-destructive flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />Recording · Private
          </span>
          <span className="text-xs text-muted-foreground">{stepIdx + 1} / {prompts.length}</span>
        </div>

        <div className="relative aspect-[3/4] rounded-3xl overflow-hidden glass-strong border border-primary/30">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(circle at 50% 40%, hsl(var(--primary)/0.25), transparent 60%), linear-gradient(180deg, hsl(240 8% 8%), hsl(240 12% 4%))',
          }} />
          {/* Face guide */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-56 rounded-[50%] border-2 border-dashed border-primary/40 animate-pulse-slow" />

          {/* Following dot demo */}
          {Prompt.text === 'Follow the dot.' && (
            <div ref={dotRef} className="absolute w-4 h-4 rounded-full bg-primary shadow-glow"
              style={{
                top: `${20 + Math.sin(progress / 8) * 30}%`,
                left: `${20 + Math.cos(progress / 6) * 30}%`,
                transition: 'top 0.5s, left 0.5s',
              }} />
          )}

          {/* Prompt overlay */}
          <div className="absolute bottom-4 left-4 right-4 glass-strong rounded-2xl p-4 flex items-center gap-3">
            <Prompt.icon className="w-5 h-5 text-primary" />
            <p className="font-display text-lg">{Prompt.text}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
            <div className="h-full bg-gradient-accent transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground text-center">Hold steady. We'll guide you through {prompts.length} quick checks.</p>
        </div>
      </div>
    );
  }

  if (phase === 'processing') {
    return (
      <div className="min-h-[80dvh] flex flex-col items-center justify-center text-center px-5">
        <PrivacyOrb size={140}><div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></PrivacyOrb>
        <h2 className="font-display text-2xl mt-8">Reviewing privately…</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">Liveness checks complete. Confirming you're real.</p>
      </div>
    );
  }

  // success
  return (
    <div className="min-h-[80dvh] flex flex-col items-center justify-center text-center px-5">
      <div className="relative">
        <div className="absolute inset-0 rounded-3xl animate-ripple bg-primary/30" />
        <div className="glass-strong rounded-3xl p-8 relative animate-fade-up">
          <TrustBadge size={72} animated />
        </div>
      </div>
      <h1 className="font-display text-3xl mt-10">{user.displayName || 'You'}, verified.</h1>
      <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
        <li>Trust Badge unlocked</li>
        <li>Higher visibility</li>
        <li>25 Signals/day</li>
        <li>Verified-Only discovery</li>
      </ul>
      <NButton size="lg" className="mt-10" onClick={() => nav('/app/map')}>Continue</NButton>
    </div>
  );
}
