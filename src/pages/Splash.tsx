import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo, PrivacyOrb } from '@/components/neara/Brand';

export default function Splash() {
  const nav = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => nav('/onboarding'), 2200);
    return () => clearTimeout(t);
  }, [nav]);
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center text-center">
      <PrivacyOrb size={260} className="animate-float-slow">
        <div className="text-center animate-fade-up">
          <Logo size="lg" />
        </div>
      </PrivacyOrb>
      <p className="mt-12 text-muted-foreground tracking-[0.3em] uppercase text-xs animate-fade-up" style={{animationDelay:'0.4s'}}>Nearby… Almost.</p>
    </div>
  );
}
