import { useEffect, useState } from 'react';
import { colors, fonts, categories, SelectedCategory } from '@/lib/constants';

interface Props {
  onSelect: (cat: SelectedCategory) => void;
  onBack: () => void;
}

export default function Categories({ onSelect, onBack }: Props) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState('');
  const [focused, setFocused] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const filtered = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCustomSubmit = () => {
    if (customText.trim()) {
      onSelect({ id: 'custom', name: customText.trim(), icon: '\u270F\uFE0F', tag: null });
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: colors.bg, padding: 32,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 860,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: colors.text3,
          fontFamily: fonts.body, fontSize: 13, cursor: 'pointer',
          padding: 0, marginBottom: 40, fontWeight: 500,
        }}>{'\u2190'} Back</button>

        <div style={{
          fontSize: 11, fontFamily: fonts.body, fontWeight: 700,
          color: colors.accent, letterSpacing: 3,
          textTransform: 'uppercase' as const, marginBottom: 10,
        }}>Step 1 / 3</div>

        <h2 style={{
          fontSize: 34, fontFamily: fonts.serif, fontWeight: 400,
          color: colors.text1, margin: '0 0 6px',
        }}>What do you need?</h2>

        <p style={{
          fontSize: 15, fontFamily: fonts.body, color: colors.text3,
          margin: '0 0 28px',
        }}>Pick a category or describe your own</p>

        {/* Search bar */}
        <div style={{ position: 'relative' as const, marginBottom: 28 }}>
          <span style={{
            position: 'absolute' as const, left: 16, top: '50%', transform: 'translateY(-50%)',
            fontSize: 16, opacity: 0.4,
          }}>{'\uD83D\uDD0D'}</span>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setCustomMode(false); }}
            placeholder="Search services..."
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width: '100%', background: colors.card,
              border: `1px solid ${focused ? colors.accent : colors.border}`,
              borderRadius: 12, padding: '14px 16px 14px 44px',
              color: colors.text1, fontSize: 15, fontFamily: fonts.body,
              outline: 'none', transition: 'all 0.2s ease',
              boxShadow: focused ? `0 0 0 3px ${colors.accentDim}` : 'none',
              boxSizing: 'border-box' as const,
            }}
          />
        </div>

        {/* Category grid */}
        {!customMode && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))',
            gap: 10,
            marginBottom: 20,
          }}>
            {filtered.map((cat, i) => (
              <div
                key={cat.id}
                onClick={() => onSelect(cat)}
                onMouseEnter={() => setHovered(cat.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: hovered === cat.id ? colors.cardHover : colors.card,
                  border: `1px solid ${hovered === cat.id ? colors.accentBorder : colors.border}`,
                  borderRadius: 14, padding: '22px 14px', cursor: 'pointer',
                  textAlign: 'center' as const,
                  transition: 'all 0.25s ease',
                  transform: hovered === cat.id ? 'translateY(-3px)' : 'none',
                  position: 'relative' as const, overflow: 'hidden',
                  animation: `fadeUp 0.4s ease ${Math.min(i * 0.03, 0.5)}s both`,
                }}
              >
                {cat.tag && (
                  <div style={{
                    position: 'absolute' as const, top: 7, right: 7,
                    fontSize: 8, fontFamily: fonts.body, fontWeight: 700,
                    color: colors.accent, background: colors.accentDim,
                    padding: '2px 6px', borderRadius: 4, letterSpacing: '0.3px',
                  }}>{cat.tag}</div>
                )}
                <div style={{ fontSize: 28, marginBottom: 8 }}>{cat.icon}</div>
                <div style={{
                  fontSize: 12, fontFamily: fonts.body, fontWeight: 700,
                  color: hovered === cat.id ? colors.text1 : colors.text2,
                  transition: 'color 0.2s',
                }}>{cat.name}</div>
              </div>
            ))}

            {/* Something else card */}
            <div
              onClick={() => setCustomMode(true)}
              onMouseEnter={() => setHovered('custom')}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === 'custom' ? colors.accentDim : colors.card,
                border: `1px solid ${hovered === 'custom' ? colors.accent : colors.border}`,
                borderRadius: 14, padding: '22px 14px', cursor: 'pointer',
                textAlign: 'center' as const,
                transition: 'all 0.25s ease',
                transform: hovered === 'custom' ? 'translateY(-3px)' : 'none',
                animation: 'fadeUp 0.4s ease 0.5s both',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{'\u270F\uFE0F'}</div>
              <div style={{
                fontSize: 12, fontFamily: fonts.body, fontWeight: 700,
                color: hovered === 'custom' ? colors.accent : colors.text2,
                transition: 'color 0.2s',
              }}>Something else</div>
            </div>
          </div>
        )}

        {/* No results */}
        {!customMode && filtered.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: '40px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{'\uD83E\uDD14'}</div>
            <p style={{
              fontSize: 15, fontFamily: fonts.body, color: colors.text2, marginBottom: 20,
            }}>No matching category found</p>
            <button
              onClick={() => { setCustomMode(true); setCustomText(search); }}
              style={{
                background: colors.accent, color: '#fff', border: 'none',
                borderRadius: 10, padding: '12px 24px', fontSize: 14,
                fontFamily: fonts.body, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Describe what you need instead {'\u2192'}
            </button>
          </div>
        )}

        {/* Custom input mode */}
        {customMode && (
          <div style={{
            background: colors.card, border: `1px solid ${colors.border}`,
            borderRadius: 16, padding: 28,
            animation: 'fadeUp 0.4s ease both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>{'\u270F\uFE0F'}</span>
              <div>
                <div style={{
                  fontSize: 18, fontFamily: fonts.display, fontWeight: 700,
                  color: colors.text1, letterSpacing: '-0.5px',
                }}>Describe your service</div>
                <div style={{
                  fontSize: 13, fontFamily: fonts.body, color: colors.text3,
                }}>Tell us what you need in a few words</div>
              </div>
            </div>

            <textarea
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder="e.g. Someone to fix my water heater, need a tiler for my bathroom, looking for a makeup artist..."
              autoFocus
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${colors.border}`,
                borderRadius: 10, padding: '14px 16px',
                color: colors.text1, fontSize: 14, fontFamily: fonts.body,
                outline: 'none', minHeight: 100, resize: 'vertical' as const,
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box' as const,
              }}
              onFocus={e => { e.currentTarget.style.borderColor = colors.accent; }}
              onBlur={e => { e.currentTarget.style.borderColor = colors.border; }}
            />

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                onClick={handleCustomSubmit}
                disabled={!customText.trim()}
                style={{
                  background: customText.trim() ? colors.accent : 'rgba(255,255,255,0.05)',
                  color: customText.trim() ? '#fff' : colors.text3,
                  border: 'none', borderRadius: 10, padding: '12px 24px',
                  fontSize: 14, fontFamily: fonts.body, fontWeight: 700,
                  cursor: customText.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                }}
              >
                Continue {'\u2192'}
              </button>
              <button
                onClick={() => { setCustomMode(false); setCustomText(''); }}
                style={{
                  background: 'rgba(255,255,255,0.05)', color: colors.text2,
                  border: `1px solid ${colors.border}`, borderRadius: 10,
                  padding: '12px 20px', fontSize: 14, fontFamily: fonts.body,
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                Back to categories
              </button>
            </div>
          </div>
        )}
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

