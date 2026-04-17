import { useEffect, useState } from 'react';
import { colors, fonts, SelectedCategory } from '@/lib/constants';
import Button from './Button';

interface Props {
  category: SelectedCategory;
  onSubmit: () => void;
  onBack: () => void;
}

export default function RequestForm({ category, onSubmit, onBack }: Props) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [urgency, setUrgency] = useState('');

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    background: colors.card,
    border: `1px solid ${focused === field ? colors.accent : colors.border}`,
    borderRadius: 10,
    padding: '14px 16px',
    color: colors.text1,
    fontSize: 14,
    fontFamily: fonts.body,
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: focused === field ? `0 0 0 3px ${colors.accentDim}` : 'none',
    boxSizing: 'border-box' as const,
  });

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: fonts.body,
    fontWeight: 700,
    color: colors.text2,
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
    marginBottom: 6,
    display: 'block',
  };

  return (
    <div style={{
      minHeight: '100vh', background: colors.bg, padding: 32,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 540,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: colors.text3,
          fontFamily: fonts.body, fontSize: 13, cursor: 'pointer',
          padding: 0, marginBottom: 40, fontWeight: 500,
        }}>{'\u2190'} Back</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 24 }}>{category.icon}</span>
          <span style={{
            fontSize: 11, fontFamily: fonts.body, fontWeight: 700,
            color: colors.accent, letterSpacing: 3,
            textTransform: 'uppercase' as const,
          }}>{`Step 2 / 3 \u00B7 ${category.name}`}</span>
        </div>

        <h2 style={{
          fontSize: 30, fontFamily: fonts.display, fontWeight: 700,
          color: colors.text1, margin: '0 0 6px', letterSpacing: '-1px',
        }}>Describe the job</h2>

        <p style={{
          fontSize: 14, fontFamily: fonts.body, color: colors.text3,
          margin: '0 0 32px',
        }}>More detail = better bids</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input
              style={inputStyle('title')}
              placeholder="e.g. Generator not starting, making strange noise"
              onFocus={() => setFocused('title')}
              onBlur={() => setFocused(null)}
            />
          </div>

          <div>
            <label style={labelStyle}>Details</label>
            <textarea
              placeholder="Brand, model, when it started, what you've tried..."
              onFocus={() => setFocused('desc')}
              onBlur={() => setFocused(null)}
              style={{
                ...inputStyle('desc'),
                minHeight: 100,
                resize: 'vertical' as const,
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Min budget ({'\u20A6'})</label>
              <input
                style={inputStyle('bmin')}
                placeholder="10,000"
                onFocus={() => setFocused('bmin')}
                onBlur={() => setFocused(null)}
              />
            </div>
            <div>
              <label style={labelStyle}>Max budget ({'\u20A6'})</label>
              <input
                style={inputStyle('bmax')}
                placeholder="25,000"
                onFocus={() => setFocused('bmax')}
                onBlur={() => setFocused(null)}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Location</label>
            <input
              style={inputStyle('loc')}
              placeholder="e.g. Games Village Estate, Abuja"
              onFocus={() => setFocused('loc')}
              onBlur={() => setFocused(null)}
            />
          </div>

          <div>
            <label style={labelStyle}>When do you need this?</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {['ASAP', 'Today', 'Tomorrow', 'This week'].map(opt => (
                <div
                  key={opt}
                  onClick={() => setUrgency(opt)}
                  style={{
                    padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                    background: urgency === opt ? colors.accentDim : colors.card,
                    border: `1px solid ${urgency === opt ? colors.accent : colors.border}`,
                    color: urgency === opt ? colors.accent : colors.text2,
                    fontSize: 13, fontFamily: fonts.body, fontWeight: 600,
                    transition: 'all 0.2s ease', textAlign: 'center' as const,
                  }}
                >{opt}</div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <Button full onClick={onSubmit}>Post request {'\u2192'} Get bids</Button>
            <p style={{
              fontSize: 11, fontFamily: fonts.body, color: colors.text3,
              textAlign: 'center' as const, marginTop: 14,
            }}>{'\uD83D\uDD12'} Payment protected by Paystack escrow</p>
          </div>
        </div>
      </div>
    </div>
  );
}