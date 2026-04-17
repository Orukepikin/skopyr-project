import { useEffect, useState } from 'react';
import { colors, fonts, categories } from '@/lib/constants';

interface Props {
  onBack: () => void;
}

const REQUESTS = [
  { id: 1, title: 'Generator not starting', cat: 'generator', budget: '₦15K – ₦25K', loc: 'Games Village', when: 'ASAP', bids: 3, ago: '12m' },
  { id: 2, title: 'Kitchen sink leaking badly', cat: 'plumbing', budget: '₦8K – ₦15K', loc: 'Gwarinpa', when: 'Today', bids: 5, ago: '28m' },
  { id: 3, title: 'Deep clean 3BR flat', cat: 'cleaning', budget: '₦20K – ₦35K', loc: 'Maitama', when: 'Weekend', bids: 7, ago: '1h' },
  { id: 4, title: 'Car AC blowing hot air', cat: 'auto', budget: '₦10K – ₦30K', loc: 'Wuse II', when: 'Tomorrow', bids: 2, ago: '45m' },
];

export default function BrowseJobs({ onBack }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  return (
    <div style={{
      minHeight: '100vh', background: colors.bg, padding: 32,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 780,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: colors.text3,
          fontFamily: fonts.body, fontSize: 13, cursor: 'pointer',
          padding: 0, marginBottom: 32, fontWeight: 500,
        }}>← Home</button>

        <h2 style={{
          fontSize: 30, fontFamily: fonts.display, fontWeight: 700,
          color: colors.text1, margin: '0 0 4px', letterSpacing: '-1px',
        }}>Open requests near you</h2>

        <p style={{
          fontSize: 14, fontFamily: fonts.body, color: colors.text3,
          margin: '0 0 28px',
        }}>Submit your best bid and win the job</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {REQUESTS.map((req, i) => {
            const cat = categories.find(c => c.id === req.cat);
            return (
              <div
                key={req.id}
                style={{
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 14, padding: '18px 20px',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  animation: `fadeUp 0.4s ease ${i * 0.06}s both`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = colors.cardHover;
                  e.currentTarget.style.borderColor = colors.accentBorder;
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = colors.card;
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: colors.accentDim,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0,
                    }}>{cat?.icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontFamily: fonts.body, fontWeight: 700, color: colors.text1 }}>{req.title}</div>
                      <div style={{ fontSize: 11, fontFamily: fonts.body, color: colors.text3, marginTop: 3, display: 'flex', gap: 10 }}>
                        <span>📍 {req.loc}</span>
                        <span>💰 {req.budget}</span>
                        <span>⏰ {req.when}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontFamily: fonts.body, color: colors.text3 }}>{req.ago} ago</div>
                    <div style={{
                      fontSize: 11, fontFamily: fonts.body,
                      color: req.bids < 3 ? colors.success : '#F59E0B',
                      fontWeight: 700, marginTop: 3,
                    }}>
                      {req.bids} bid{req.bids !== 1 && 's'}{req.bids < 3 && ' · Low comp'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
