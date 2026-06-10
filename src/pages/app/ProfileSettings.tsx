import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppStore';
import { TrustBadge } from '@/components/neara/Brand';
import { ProfileStrength } from '@/components/neara/ProfileStrength';
import { ChevronRight, Eye, Shield, Crown, Palette, Radio, UserX, Settings, Edit, Circle, EyeOff, Video, FileText, AlertCircle, Lock, Music2 } from 'lucide-react';
import { AccentTheme } from '@/lib/types';
import { NButton } from '@/components/neara/NButton';
import { toast } from 'sonner';
import { NEARA_DOMAIN, NEARA_SUPPORT_EMAIL } from '@/lib/brand';

export default function ProfileSettings() {
  const { user, accent, setAccent, autoAccent, setAutoAccent, signalsLeft, signalsLimit, resetOnboarding, hideMeNow, blockedIds, verificationStale } = useApp();
  const nav = useNavigate();

  const sections: { icon: any; label: string; to?: string; right?: string; onClick?: () => void }[] = [
    { icon: Edit, label: 'Edit Profile', to: '/app/profile/edit' },
    { icon: Lock, label: 'Private Album', to: '/app/profile/edit', right: `${user.privatePhotos?.length || 0} photo${(user.privatePhotos?.length || 0) === 1 ? '' : 's'}` },
    { icon: Eye, label: 'Visibility', to: '/app/visibility', right: user.visibility === 'visible' ? 'Visible' : user.visibility.replace(/_/g,' ') },
    { icon: EyeOff, label: 'Hide Me Now', onClick: () => { hideMeNow(); toast.success("You're hidden now. You can turn visibility back on anytime."); } },
    { icon: Video, label: 'Verification', to: '/app/verification', right: verificationStale ? 'Refresh' : user.verified ? 'Verified' : 'Start' },
    { icon: Circle, label: 'Privacy Circle', right: user.privacyRadius.replace('_',' ') },
    { icon: Radio, label: 'Signals', right: `${signalsLeft}/${signalsLimit}` },
    { icon: Crown, label: 'Premium', to: '/app/premium', right: user.premium ? 'Active' : 'Upgrade' },
    { icon: Music2, label: 'Sound Reactions', to: '/app/sound-reactions' },
    { icon: Shield, label: 'Safety Center', to: '/app/safety' },
    { icon: UserX, label: 'Blocked Users', to: '/app/blocked', right: blockedIds.length ? String(blockedIds.length) : '—' },
    { icon: FileText, label: 'Legal & Policies', to: '/app/legal' },
    { icon: Settings, label: 'Log out (demo reset)', onClick: () => { resetOnboarding(); nav('/'); } },
  ];

  return (
    <div className="px-5 py-6 space-y-6">
      <div className="glass-strong rounded-3xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center text-2xl font-display text-primary-foreground overflow-hidden relative">
          {user.photos?.[0] ? (
            <img src={user.photos[0]} alt="Your main photo" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <span>{(user.displayName || 'N')[0]?.toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl">{user.displayName || 'Your Name'}{user.age ? `, ${user.age}` : ''}</h2>
            {user.verified && <TrustBadge size={16} />}
          </div>
          <p className="text-xs text-muted-foreground capitalize">{user.intent.replace(/_/g,' ')}</p>
          {user.premium && <p className="text-[10px] uppercase tracking-widest text-primary mt-1">Premium</p>}
        </div>
      </div>

      {verificationStale && (
        <div className="glass rounded-2xl p-4 flex items-start gap-3 border-amber-500/40">
          <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Verification needs refresh</p>
            <p className="text-[11px] text-muted-foreground">Your main photo changed since approval. Re-verify to keep your Trust Badge.</p>
          </div>
          <NButton size="sm" onClick={() => nav('/app/verification')}>Refresh</NButton>
        </div>
      )}

      <ProfileStrength hideEditLink />

      <div className="glass rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-primary" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Appearance</p>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {(['violet','teal','gold','pink','mint'] as AccentTheme[]).map(a => (
            <button key={a} onClick={() => setAccent(a)} data-accent={a}
              className={`aspect-square rounded-2xl transition ${!autoAccent && accent===a?'ring-2 ring-primary ring-offset-2 ring-offset-background':''}`}
              style={{ background: `hsl(var(--accent-h) var(--accent-s) var(--accent-l))`, boxShadow: '0 0 16px hsl(var(--accent-h) var(--accent-s) var(--accent-l) / 0.4)' }} />
          ))}
          <button onClick={() => setAutoAccent(!autoAccent)}
            className={`aspect-square rounded-2xl bg-gradient-to-br from-violet-500 via-pink-500 to-amber-400 ${autoAccent?'ring-2 ring-primary ring-offset-2 ring-offset-background':''}`} />
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">Choose your accent, or let Neara adapt automatically.</p>
      </div>

      <div className="glass rounded-3xl divide-y divide-border/50 overflow-hidden">
        {sections.map(s => {
          const content = (
            <div className="px-5 h-14 flex items-center gap-3 hover:bg-secondary/40 transition cursor-pointer">
              <s.icon className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1 text-sm">{s.label}</span>
              {s.right && <span className="text-xs text-muted-foreground">{s.right}</span>}
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          );
          if (s.to && s.to !== '#') return <Link key={s.label} to={s.to}>{content}</Link>;
          if (s.onClick) return <button key={s.label} onClick={s.onClick} className="w-full text-left">{content}</button>;
          return <div key={s.label}>{content}</div>;
        })}
      </div>

      {!user.premium && (
        <NButton full size="lg" onClick={() => nav('/app/premium')}>Unlock Premium</NButton>
      )}

      <footer className="pt-6 pb-4 text-center space-y-1">
        <p className="text-[11px] text-muted-foreground">
          <span className="text-foreground/80 font-medium">{NEARA_DOMAIN}</span> · privacy-first by design
        </p>
        <p className="text-[10px] text-muted-foreground/70">
          Support: {NEARA_SUPPORT_EMAIL}
        </p>
        <Link to="/app/build-status" className="inline-block text-[10px] text-muted-foreground/50 hover:text-primary mt-1">
          internal · build status
        </Link>
      </footer>
    </div>
  );
}
