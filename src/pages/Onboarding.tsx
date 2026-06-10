import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, StepHeader } from '@/components/neara/Screen';
import { Logo, PrivacyOrb, SectionTitle, TrustBadge } from '@/components/neara/Brand';
import { NButton } from '@/components/neara/NButton';
import { NField, NTextarea, ChipSelect } from '@/components/neara/NField';
import { PhotoUploader } from '@/components/neara/PhotoUploader';
import { StepTransition } from '@/components/neara/StepTransition';
import { AnonymousPresence } from '@/components/neara/AnonymousPresence';
import { useApp } from '@/store/AppStore';
import { AccentTheme, RelationshipIntent, Vibe, VIBE_LABEL } from '@/lib/types';
import { toast } from 'sonner';

type Step =
  | 'welcome' | 'signup' | 'agegate' | 'profile' | 'photos'
  | 'verify' | 'verifySuccess' | 'offer'
  | 'location' | 'circle' | 'appearance' | 'safety';

const ORDER: Step[] = ['welcome','signup','agegate','profile','photos','verify','verifySuccess','offer','location','circle','appearance','safety'];

export default function Onboarding() {
  const nav = useNavigate();
  const { setUser, user, setAccent, accent, autoAccent, setAutoAccent, completeOnboarding } = useApp();
  const [step, setStep] = useState<Step>('welcome');

  const idx = ORDER.indexOf(step);
  const total = ORDER.length;
  const goNext = (s: Step) => setStep(s);
  const back = idx > 0 ? () => setStep(ORDER[idx - 1]) : undefined;

  // Local form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<string>('');
  const [interestedIn, setInterestedIn] = useState<string>('');
  const [intent, setIntent] = useState<RelationshipIntent>('open_to_chat');
  const [vibe, setVibe] = useState<Vibe>('open_to_chat');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [radius, setRadius] = useState<'standard'|'private'|'extra_private'>('standard');

  const calcAge = (d: string) => {
    if (!d) return 0;
    const t = new Date(d), n = new Date();
    let a = n.getFullYear() - t.getFullYear();
    const m = n.getMonth() - t.getMonth();
    if (m < 0 || (m === 0 && n.getDate() < t.getDate())) a--;
    return a;
  };

  return (
    <Screen className="min-h-[100dvh]">
      {step !== 'welcome' && step !== 'verifySuccess' && step !== 'offer' && (
        <StepHeader step={idx + 1} total={total} onBack={back} />
      )}

      <StepTransition stepKey={step}><>


      {step === 'welcome' && (
        <div className="relative flex flex-col items-center text-center min-h-[80dvh] justify-center">
          {/* Privacy-safe ambient backdrop — purely procedural shapes.
              No real photos, no user data, no database queries. */}
          <AnonymousPresence count={7} className="-z-10" />

          <PrivacyOrb size={180} className="mb-10 animate-float-slow"><Logo size="lg" /></PrivacyOrb>
          <h1 className="font-display text-3xl md:text-4xl leading-tight max-w-sm">Welcome to Neara.</h1>
          <p className="text-foreground/80 mt-3 max-w-sm text-lg">Meet nearby without feeling exposed.</p>
          <p className="text-muted-foreground mt-4 max-w-sm">Close enough to connect. Private enough to stay in control.</p>
          <div className="w-full mt-10 space-y-3 max-w-xs">
            <NButton full size="lg" onClick={() => goNext('signup')}>Create account</NButton>
            <NButton full size="lg" variant="outline" onClick={() => goNext('signup')}>Log in</NButton>
          </div>
          <p className="mt-10 text-xs text-muted-foreground/80 tracking-wide">Approximate areas only · No live tracking · You stay in control</p>
          <p className="mt-3 text-[10px] text-muted-foreground/60 max-w-xs leading-relaxed">
            Preview imagery is illustrative. Real profiles stay private until you enter Neara.
          </p>
        </div>
      )}

      {step === 'signup' && (
        <div className="space-y-8">
          <SectionTitle eyebrow="Create account" title="A discreet beginning." subtitle="Your details stay yours. We never share or expose them." />
          <div className="space-y-4">
            <NField label="Display name" value={name} onChange={e => setName(e.target.value)} placeholder="What should we call you?" />
            <NField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            <NField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            <NField label="Date of birth" type="date" value={dob} onChange={e => setDob(e.target.value)} />
          </div>
          <NButton full size="lg" disabled={!name || !email || !password || !dob} onClick={() => {
            const age = calcAge(dob);
            if (age < 18) { toast.error('You must be 18 or older to use Neara.'); return; }
            setUser({ displayName: name, age });
            goNext('agegate');
          }}>Continue</NButton>
        </div>
      )}

      {step === 'agegate' && (
        <div className="flex flex-col items-center text-center min-h-[70dvh] justify-center">
          <PrivacyOrb size={140} className="mb-8">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round"/></svg>
          </PrivacyOrb>
          <h1 className="font-display text-3xl">Adults only.</h1>
          <p className="text-muted-foreground mt-3 max-w-sm">Neara is for adults only. You must be 18+ to use this app.</p>
          <NButton size="lg" className="mt-10" onClick={() => goNext('profile')}>I confirm I'm 18+</NButton>
        </div>
      )}

      {step === 'profile' && (
        <div className="space-y-8">
          <SectionTitle eyebrow="Your profile" title="Tell us a little." subtitle="Honesty travels well here." />
          <div className="space-y-5">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Gender</span>
              <ChipSelect value={gender} onChange={setGender} options={[
                {value:'woman',label:'Woman'},{value:'man',label:'Man'},{value:'nonbinary',label:'Nonbinary'},{value:'other',label:'Other'},{value:'prefer_not_to_say',label:'Prefer not to say'},
              ]} />
            </div>
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Interested in</span>
              <ChipSelect value={interestedIn} onChange={setInterestedIn} options={[
                {value:'women',label:'Women'},{value:'men',label:'Men'},{value:'everyone',label:'Everyone'},{value:'custom',label:'Custom'},
              ]} />
            </div>
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Looking for</span>
              <ChipSelect<RelationshipIntent> value={intent} onChange={setIntent} options={[
                {value:'tonight',label:'Tonight'},{value:'this_week',label:'This Week'},{value:'open_to_chat',label:'Open to Chat'},{value:'casual',label:'Casual'},{value:'see_where_it_goes',label:'See Where It Goes'},
              ]} />
            </div>
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">What's your vibe?</span>
              <ChipSelect<Vibe> value={vibe} onChange={setVibe} options={
                (Object.keys(VIBE_LABEL) as Vibe[]).map(v => ({ value: v, label: VIBE_LABEL[v] }))
              } />
            </div>
            <NTextarea label="Short bio" placeholder="A line or two about you." value={bio} onChange={e => setBio(e.target.value)} maxLength={160} />
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Interests</span>
              <ChipSelect multi value={interests} onChange={setInterests} options={
                ['Coffee','Film','Music','Art','Books','Travel','Food','Fitness','Design','Photography'].map(i=>({value:i,label:i}))
              } />
            </div>
          </div>
          <NButton full size="lg" disabled={!gender || !interestedIn} onClick={() => {
            setUser({ gender, interestedIn, intent, vibe, bio, interests });
            goNext('photos');
          }}>Continue</NButton>
        </div>
      )}

      {step === 'photos' && (
        <div className="space-y-8">
          <SectionTitle eyebrow="Photos" title="Show up clearly." subtitle="Profiles with clear photos are trusted faster and shown more often." />
          <PhotoUploader photos={photos} onChange={setPhotos} max={6} />
          <NButton full size="lg" disabled={photos.length < 1} onClick={() => {
            setUser({ photos, photoCount: photos.length, mainPhotoSig: photos[0]?.slice(-32) || '' });
            goNext('verify');
          }}>Continue</NButton>
        </div>
      )}

      {step === 'verify' && (
        <div className="flex flex-col items-center text-center min-h-[70dvh] justify-center">
          <PrivacyOrb size={160} className="mb-8"><TrustBadge size={56} /></PrivacyOrb>
          <h1 className="font-display text-3xl">Get verified. Be trusted faster.</h1>
          <p className="text-muted-foreground mt-3 max-w-sm">Verified profiles are seen more, trusted faster, and unlock 25 Signals/day.</p>
          <div className="w-full mt-10 space-y-3 max-w-xs">
            <NButton full size="lg" onClick={() => { const sig = photos[0]?.slice(-32) || `${name}|${Date.now()}`; setUser({ verified: true, trustBadge: true, mainPhotoSig: sig, verifiedPhotoSig: sig }); goNext('verifySuccess'); }}>Verify Now</NButton>
            <NButton full size="lg" variant="ghost" onClick={() => goNext('location')}>Skip For Now</NButton>
          </div>
        </div>
      )}

      {step === 'verifySuccess' && (
        <VerifyStamp name={user.displayName || name} onContinue={() => goNext('offer')} />
      )}

      {step === 'offer' && (
        <div className="space-y-8 min-h-[80dvh] flex flex-col justify-center">
          <SectionTitle eyebrow="Verified Upgrade Offer" title="50% off your first month." subtitle="You're verified. Unlock Premium for deeper discovery and control." className="text-center mx-auto" />
          <div className="glass rounded-3xl p-8 text-center">
            <div className="flex items-baseline justify-center gap-2">
              <span className="font-display text-5xl">$9.99</span>
              <span className="text-muted-foreground">first month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">then $19.99/month · cancel anytime</p>
            <div className="mt-8 space-y-3">
              <NButton full size="lg" onClick={() => { setUser({ premium: true }); toast.success('Premium activated for demo.'); goNext('location'); }}>Claim 50% Off</NButton>
              <NButton full variant="ghost" onClick={() => goNext('location')}>Maybe Later</NButton>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">Premium never reveals anyone's exact location.</p>
        </div>
      )}

      {step === 'location' && (
        <div className="space-y-8">
          <SectionTitle eyebrow="Your area" title="Enter your area." subtitle="Your exact location stays hidden — we only ever show approximate circles." />
          <ul className="space-y-3">
            {['No exact pins, ever', 'No exact distance', 'No live movement tracking', 'Only an approximate circle is shared'].map(t => (
              <li key={t} className="glass rounded-2xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary">✓</div>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-3">
            <NButton full size="lg" onClick={() => goNext('circle')}>Share my area</NButton>
            <NButton full size="lg" variant="outline" onClick={() => goNext('circle')}>Use Travel Mode instead</NButton>
          </div>
        </div>
      )}

      {step === 'circle' && (
        <div className="space-y-8">
          <SectionTitle eyebrow="Your circle" title="Choose your circle." subtitle="Your circle is never centered exactly on you. It's how close people get — without ever knowing where you are." />
          <div className="space-y-3">
            {[
              { v:'standard', t:'Standard', d:'Best balance of discovery and privacy.' },
              { v:'private', t:'Private', d:'Larger circle. Fewer details revealed.' },
              { v:'extra_private', t:'Extra Private', d:'Maximum zone. Discovery slows.' },
            ].map(o => (
              <button key={o.v} onClick={() => setRadius(o.v as any)}
                className={`w-full text-left glass rounded-2xl p-5 transition ${radius===o.v?'border-primary/60 ring-glow':''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{o.t}</p>
                    <p className="text-sm text-muted-foreground">{o.d}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border ${radius===o.v?'bg-primary border-primary':'border-border'}`} />
                </div>
              </button>
            ))}
          </div>
          <NButton full size="lg" onClick={() => { setUser({ privacyRadius: radius }); goNext('appearance'); }}>Continue</NButton>
        </div>
      )}

      {step === 'appearance' && (
        <div className="space-y-8">
          <SectionTitle eyebrow="Appearance" title="Choose your accent." subtitle="Set the mood. You can change it any time, or let Neara adapt with you." />
          <div className="grid grid-cols-3 gap-3">
            {(['violet','teal','gold','pink','mint'] as AccentTheme[]).map(a => (
              <button key={a} onClick={() => setAccent(a)}
                data-accent={a}
                className={`group glass rounded-2xl p-4 flex flex-col items-center gap-3 transition ${!autoAccent && accent===a?'ring-glow border-primary/60':''}`}>
                <div className="w-12 h-12 rounded-full" style={{ background: `hsl(var(--accent-h) var(--accent-s) var(--accent-l))`, boxShadow: '0 0 20px hsl(var(--accent-h) var(--accent-s) var(--accent-l) / 0.5)' }} />
                <span className="text-xs capitalize">{a}</span>
              </button>
            ))}
            <button onClick={() => setAutoAccent(true)}
              className={`glass rounded-2xl p-4 flex flex-col items-center gap-3 transition ${autoAccent?'ring-glow border-primary/60':''}`}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 via-pink-500 to-amber-400 animate-float-slow" />
              <span className="text-xs">Auto</span>
            </button>
          </div>
          <NButton full size="lg" onClick={() => goNext('safety')}>Continue</NButton>
        </div>
      )}

      {step === 'safety' && (
        <div className="space-y-8">
          <SectionTitle eyebrow="A few quiet promises" title="Close, not exposed." />
          <ul className="space-y-3">
            {[
              'Your exact location stays hidden.',
              'You control when you appear.',
              'No messaging without mutual interest.',
              'Signals are limited on purpose — every one matters.',
              'Meet in public first when it feels right.',
            ].map(t => (
              <li key={t} className="glass rounded-2xl p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-primary text-sm shrink-0 mt-0.5">✓</div>
                <span className="text-sm leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
          <NButton full size="lg" onClick={() => { completeOnboarding(); nav('/app/reveal'); }}>Enter Neara</NButton>
        </div>
      )}
      </></StepTransition>
    </Screen>
  );
}

function VerifyStamp({ name, onContinue }: { name: string; onContinue: () => void }) {
  const { user } = useApp();
  const main = user.photos?.[0];
  return (
    <div className="flex flex-col items-center text-center min-h-[80dvh] justify-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-3xl animate-ripple bg-primary/30" />
        <div className="glass-strong rounded-3xl p-6 w-72 relative animate-fade-up">
          <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-primary/40 to-primary/5 mb-4 relative overflow-hidden">
            {main && <img src={main} alt="Your verified photo" className="absolute inset-0 w-full h-full object-cover" />}
            <div className="absolute -top-2 -right-2"><TrustBadge size={44} animated /></div>
          </div>
          <p className="font-display text-xl">{name || 'You'}, verified</p>
          <p className="text-xs text-muted-foreground">Trust Badge unlocked</p>
        </div>
      </div>
      <h2 className="font-display text-2xl mt-10">You're verified.</h2>
      <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
        <li>Trust Badge Unlocked</li>
        <li>Higher Visibility</li>
        <li>25 Signals/day</li>
        <li>Verified-Only Discovery</li>
      </ul>
      <NButton size="lg" className="mt-10" onClick={onContinue}>Continue</NButton>
    </div>
  );
}
