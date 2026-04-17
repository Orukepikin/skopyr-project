import { useEffect, useState } from 'react';
import { colors, fonts } from '@/lib/constants';

interface Props {
  onComplete: () => void;
}

export default function Splash({ onComplete }: Props) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 1000);
    const t3 = setTimeout(() => setPhase(3), 1800);
    const t4 = setTimeout(onComplete, 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: colors.bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 999, opacity: phase >= 3 ? 0 : 1, transition: 'opacity 0.6s ease',
    }}>
      <div style={{
        position: 'absolute', width: 300, height: 300,
        background: `radial-gradient(circle, ${colors.accentDim} 0%, transparent 70%)`,
        borderRadius: '50%', filter: 'blur(50px)',
        opacity: phase >= 1 ? 1 : 0, transition: 'opacity 0.8s ease',
      }} />
      <div style={{
        fontSize: 68, fontFamily: fonts.display, fontWeight: 700,
        color: colors.text1, letterSpacing: '-3px',
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
      }}>
        SK<span style={{ color: colors.accent }}>O</span>PYR
      </div>
      <div style={{
        fontSize: 12, fontFamily: fonts.body, fontWeight: 500,
        color: colors.text3, letterSpacing: 5, textTransform: 'uppercase', marginTop: 10,
        opacity: phase >= 2 ? 1 : 0, transition: 'all 0.5s ease 0.1s',
      }}>
        Scope the best · Pick the best
      </div>
    </div>
  );
}
