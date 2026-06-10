import { useNavigate } from 'react-router-dom';
import { CircleRandomizeReveal } from '@/components/neara/CircleRandomizeReveal';

export default function Reveal() {
  const nav = useNavigate();
  return (
    <CircleRandomizeReveal
      onComplete={() => nav('/app/map', { replace: true })}
    />
  );
}
