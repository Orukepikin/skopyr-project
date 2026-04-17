import { useEffect, useState } from 'react';
import { colors, fonts } from '@/lib/constants';
import Button from './Button';

interface Props {
  onBack: () => void;
  onHome: () => void;
}

const BIDS = [
  { id: 1, name: 'Chidi Okonkwo', rating: 4.9, jobs: 234, price: 18000, avatar: 'CO', verified: true, msg: 'Specialist in Mikano & Mantrac generators. Full toolkit, parts included. 30-day warranty.', eta: 'Today 2PM', time: '~2 hrs' },
  { id: 2, name: 'Amaka Eze', rating: 4.7, jobs: 156, price: 15000, avatar: 'AE', verified: true, msg: 'All brands covered. Price includes diagnostics and minor parts. Same-day service guaranteed.', eta: 'Today 3:30PM', time: '~3 hrs' },
  { id: 3, name: 'Ibrahim Musa', rating: 4.8, jobs: 312, price: 22000, avatar: 'IM', verified: true, msg: 'Master technician, 15 years experience. Premium express service with full warranty on all repairs.', eta: 'Today 1PM', time: '~1 hr' },
];

export default function BidsView({ onBack, onHome }: Props) {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  return (
    <div style={{
      minHeight: '100vh', background: colors.bg, padding: 32,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 720,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: colors.text3,
          fontFamily: fonts.body, fontSize: 13, cursor: 'pointer',
          padding: 0, marginBottom: 28, fontWeight: 500,
        }}>← Back</button>

        {/* Request summary */}
        <div style={{
          background: colors.accentDim,
          border: `1px solid ${colors.accentBorder}`,
          borderRadius: 16, padding: '22px 24px', marginBottom: 28,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: fonts.body, fontWeight: 700, color: colors.accent, letterSpacing: 2.5, textTransform: 'uppercase' as const, marginBottom: 6 }}>Your request · Live</div>
              <div style={{ fontSize: 18, fontFamily: fonts.display, fontWeight: 700, color: colors.text1, letterSpacing: '-0.5px' }}>Generator not starting</div>
              <div style={{ fontSize: 12, fontFamily: fonts.body, color: colors.text3, marginTop: 6, display: 'flex', gap: 14, flexWrap: 'wrap' as const }}>
                <span>⚡ Generator</span><span>📍 Games Village</span><span>💰 ₦15K – ₦25K</span><span>⏰ ASAP</span>
              </div>
            </div>
            <div style={{
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: 100, padding: '5px 14px', fontSize: 12,
              fontFamily: fonts.body, color: colors.success, fontWeight: 700,
              whiteSpace: 'nowrap' as const, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: colors.success, animation: 'pulse 2s infinite', display: 'inline-block' }} />
              3 bids
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontFamily: fonts.body, fontWeight: 700, color: colors.accent, letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 6 }}>Step 3 / 3</div>
        <h2 style={{ fontSize: 28, fontFamily: fonts.display, fontWeight: 700, color: colors.text1, margin: '0 0 4px', letterSpacing: '-1px' }}>Compare & pick</h2>
        <p style={{ fontSize: 14, fontFamily: fonts.body, color: colors.text3, margin: '0 0 24px' }}>Tap any bid to see details</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {BIDS.map((bid, i) => (
            <div
              key={bid.id}
              onClick={() => setSelected(selected === bid.id ? null : bid.id)}
              style={{
                background: selected === bid.id ? colors.accentDim : colors.card,
                border: `1px solid ${selected === bid.id ? colors.accentBorder : colors.border}`,
                borderRadius: 16, padding: 20, cursor: 'pointer',
                transition: 'all 0.25s ease',
                animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}08)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontFamily: fonts.display, fontWeight: 700, color: colors.accent,
                    flexShrink: 0,
                  }}>{bid.avatar}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15, fontFamily: fonts.body, fontWeight: 700, color: colors.text1 }}>{bid.name}</span>
                      {bid.verified && (
                        <span style={{ fontSize: 9, fontFamily: fonts.body, fontWeight: 800, color: colors.success, background: 'rgba(34,197,94,0.1)', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.5px' }}>VERIFIED</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 3, alignItems: 'center' }}>
                      <span style={{ color: '#F59E0B', fontSize: 13 }}>{'★'.repeat(Math.floor(bid.rating))}</span>
                      <span style={{ color: colors.text3, fontSize: 13, fontFamily: fonts.body, fontWeight: 600 }}>{bid.rating}</span>
                      <span style={{ fontSize: 11, fontFamily: fonts.body, color: colors.text3 }}>{bid.jobs} jobs</span>
                      <span style={{ fontSize: 11, fontFamily: fonts.body, color: colors.text3 }}>{bid.time}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontFamily: fonts.display, fontWeight: 700, color: colors.text1, letterSpacing: '-0.5px' }}>₦{bid.price.toLocaleString()}</div>
                  <div style={{ fontSize: 11, fontFamily: fonts.body, color: colors.text3 }}>{bid.eta}</div>
                </div>
              </div>

              {/* Expanded */}
              <div style={{
                maxHeight: selected === bid.id ? 160 : 0,
                overflow: 'hidden', transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                opacity: selected === bid.id ? 1 : 0,
              }}>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${colors.border}` }}>
                  <p style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text2, lineHeight: 1.6, margin: '0 0 14px', fontStyle: 'italic' }}>"{bid.msg}"</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowModal(true); }}>Accept this bid</Button>
                    <Button variant="ghost" size="sm" onClick={(e: React.MouseEvent) => e.stopPropagation()}>Message</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, backdropFilter: 'blur(6px)',
          }}
          onClick={() => setShowModal(false)}
        >
          <div onClick={e => e.stopPropagation()} style={{
            background: '#141418', borderRadius: 20, padding: 36,
            border: `1px solid ${colors.border}`, maxWidth: 400, width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <div style={{ textAlign: 'center' as const, marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
              <h3 style={{ fontSize: 22, fontFamily: fonts.display, fontWeight: 700, color: colors.text1, margin: '0 0 6px', letterSpacing: '-0.5px' }}>Confirm & pay</h3>
              <p style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text3, margin: 0 }}>Held in escrow until job is complete</p>
            </div>

            <div style={{ background: colors.card, borderRadius: 12, padding: 16, marginBottom: 20 }}>
              {[['Service', '₦18,000'], ['Skopyr fee (10%)', '₦1,800']].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text3 }}>{label}</span>
                  <span style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text1, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontFamily: fonts.body, color: colors.text1, fontWeight: 700 }}>Total</span>
                <span style={{ fontSize: 20, fontFamily: fonts.display, color: colors.accent, fontWeight: 700 }}>₦19,800</span>
              </div>
            </div>

            <Button full onClick={() => { setShowModal(false); onHome(); }}>Pay with Paystack →</Button>
            <p style={{ fontSize: 10, fontFamily: fonts.body, color: colors.text3, textAlign: 'center' as const, marginTop: 12, lineHeight: 1.5 }}>
              Escrow → Job done → You confirm → Provider paid
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
