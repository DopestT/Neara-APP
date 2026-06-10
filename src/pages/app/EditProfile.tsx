import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, computeProfileStrength } from '@/store/AppStore';
import { NButton } from '@/components/neara/NButton';
import { NField, NTextarea, ChipSelect } from '@/components/neara/NField';
import { PhotoUploader } from '@/components/neara/PhotoUploader';
import { ProfileStrength } from '@/components/neara/ProfileStrength';
import { RelationshipIntent, Vibe, VIBE_LABEL } from '@/lib/types';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

const INTENT_OPTS: { value: RelationshipIntent; label: string }[] = [
  { value: 'tonight', label: 'Tonight' },
  { value: 'this_week', label: 'This Week' },
  { value: 'open_to_chat', label: 'Open to Chat' },
  { value: 'casual', label: 'Casual' },
  { value: 'see_where_it_goes', label: 'See Where It Goes' },
];
const INTERESTS = ['Coffee','Film','Music','Art','Books','Travel','Food','Fitness','Design','Photography','Hiking','Yoga','Wine','Gaming','Theatre'];

export default function EditProfile() {
  const nav = useNavigate();
  const { user, setUser } = useApp();
  const [name, setName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [gender, setGender] = useState(user.gender);
  const [interestedIn, setInterestedIn] = useState(user.interestedIn);
  const [intent, setIntent] = useState<RelationshipIntent>(user.intent);
  const [vibe, setVibe] = useState<Vibe>(user.vibe ?? 'open_to_chat');
  const [interests, setInterests] = useState<string[]>(user.interests);
  const [photos, setPhotos] = useState<string[]>(user.photos ?? []);
  const [privatePhotos, setPrivatePhotos] = useState<string[]>(user.privatePhotos ?? []);
  const [ageStr, setAgeStr] = useState<string>(user.age ? String(user.age) : '');
  const ageNum = Number(ageStr) || 0;

  const liveStrength = useMemo(() => computeProfileStrength({
    displayName: name, age: ageNum, gender, interestedIn,
    photoCount: photos.length, bio, interests, verified: user.verified,
  }), [name, ageNum, gender, interestedIn, bio, interests, photos, user.verified]);

  const save = () => {
    if (ageNum < 18) { toast.error('You must be 18 or older to use Neara.'); return; }
    if (ageNum > 120) { toast.error('Please enter a valid age.'); return; }
    const mainSig = photos[0]?.slice(-32) || '';
    setUser({
      displayName: name.trim(),
      age: ageNum,
      bio: bio.trim(),
      gender,
      interestedIn,
      intent,
      vibe,
      interests,
      photos,
      privatePhotos,
      photoCount: photos.length,
      mainPhotoSig: mainSig,
    });
    toast.success('Profile saved.');
    nav('/app/profile');
  };

  return (
    <div className="px-5 py-6 space-y-6 pb-32">
      <button onClick={() => nav(-1)} className="w-9 h-9 rounded-full glass flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
      <div>
        <p className="text-xs uppercase tracking-widest text-primary/80">Edit profile</p>
        <h1 className="font-display text-3xl mt-2">Make it unmistakably you.</h1>
      </div>
      <ProfileStrength override={liveStrength} hideEditLink />
      <div className="space-y-4">
        <NField label="Display name" value={name} onChange={e => setName(e.target.value)} placeholder="What should we call you?" maxLength={32} />
        <NField label="Age" type="number" inputMode="numeric" min={18} max={120} value={ageStr} onChange={e => setAgeStr(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))} placeholder="18 or older" />
        <NTextarea label="Short bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="A line or two about you." maxLength={200} />
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
          <ChipSelect<RelationshipIntent> value={intent} onChange={setIntent} options={INTENT_OPTS} />
        </div>
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">What's your vibe?</span>
          <ChipSelect<Vibe> value={vibe} onChange={setVibe} options={(Object.keys(VIBE_LABEL) as Vibe[]).map(v => ({ value: v, label: VIBE_LABEL[v] }))} />
        </div>
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Interests</span>
          <ChipSelect multi value={interests} onChange={setInterests} options={INTERESTS.map(i => ({ value: i, label: i }))} />
        </div>
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Photos</span>
          <PhotoUploader photos={photos} onChange={setPhotos} max={6} />
          <p className="text-[11px] text-muted-foreground">Changing your main photo may require re-verification.</p>
        </div>
        <div className="space-y-2 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-primary/80">Private album</span>
            <span className="text-[10px] text-muted-foreground">{privatePhotos.length} photo{privatePhotos.length === 1 ? '' : 's'}</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Hidden by default. Only matches you explicitly share with can view these — and you can revoke access anytime.
          </p>
          <PhotoUploader photos={privatePhotos} onChange={setPrivatePhotos} max={6} />
        </div>
      </div>
      <NButton full size="lg" onClick={save}>Save profile</NButton>
    </div>
  );
}
