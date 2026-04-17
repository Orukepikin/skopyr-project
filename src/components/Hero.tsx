import { useEffect, useState, useRef, ReactNode } from 'react';
import { colors, fonts, categories } from '@/lib/constants';
import Button from './Button';

interface Props {
  onPost: () => void;
  onBrowse: () => void;
}

/* ── Scroll-triggered reveal ── */
function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(36px)',
      transition: `all 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* ── Animated counter ── */
function useCount(target: number, dur = 2000): [number, () => void] {
  const [v, setV] = useState(0);
  const [go, setGo] = useState(false);
  useEffect(() => {
    if (!go) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setV(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [go, target, dur]);
  return [v, () => setGo(true)];
}

/* ── How it works step ── */
function Step({ num, title, desc, delay }: { num: string; title: string; desc: string; delay: number }) {
  return (
    <Reveal delay={delay}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{
          fontSize: 48, fontFamily: fonts.serif, color: colors.accent,
          lineHeight: 1, marginBottom: 16, fontStyle: 'italic',
        }}>{num}</div>
        <div style={{
          fontSize: 20, fontFamily: fonts.display, fontWeight: 700,
          color: colors.textDark, marginBottom: 8, letterSpacing: '-0.5px',
        }}>{title}</div>
        <div style={{
          fontSize: 15, fontFamily: fonts.body, color: colors.textMuted,
          lineHeight: 1.7,
        }}>{desc}</div>
      </div>
    </Reveal>
  );
}

export default function Hero({ onPost, onBrowse }: Props) {
  const [v, setV] = useState(false);
  const [u, goU] = useCount(2847);
  const [pr, goPr] = useCount(412);
  const [j, goJ] = useCount(8934);

  useEffect(() => {
    setTimeout(() => setV(true), 100);
    setTimeout(() => { goU(); goPr(); goJ(); }, 1000);
  }, []);

  return (
    <div>
      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 1 — Dark Hero                      */}
      {/* ═══════════════════════════════════════════ */}
      <div style={{
        minHeight: '100vh', position: 'relative', overflow: 'hidden',
        background: colors.bg, display: 'flex', flexDirection: 'column',
      }}>
        {/* Subtle grain texture */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }} />

        {/* Warm glow */}
        <div style={{
          position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: '120%', height: '60%',
          background: 'radial-gradient(ellipse, rgba(255,107,43,0.06) 0%, transparent 70%)',
        }} />

        {/* Nav */}
        <nav style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '28px 48px', position: 'relative', zIndex: 10,
          opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(-12px)',
          transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s',
        }}>
          <div style={{
            fontSize: 22, fontFamily: fonts.display, fontWeight: 700,
            color: colors.text1, letterSpacing: '-1.5px',
          }}>
            SK<span style={{ color: colors.accent }}>O</span>PYR
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" size="sm" onClick={onBrowse}>Browse jobs</Button>
            <Button variant="outline" size="sm">Sign in</Button>
            <Button size="sm">Join as provider</Button>
          </div>
        </nav>

        {/* Hero content */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 48px 80px', position: 'relative', zIndex: 10,
          textAlign: 'center', maxWidth: 900, margin: '0 auto',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,107,43,0.06)',
            border: `1px solid rgba(255,107,43,0.12)`,
            borderRadius: 100, padding: '7px 20px', marginBottom: 36,
            opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.accent, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, fontFamily: fonts.body, color: colors.text2, fontWeight: 500 }}>Now live in Abuja</span>
          </div>

          {/* Editorial headline — serif */}
          <h1 style={{
            fontSize: 'clamp(42px, 6vw, 76px)',
            fontFamily: fonts.serif,
            fontWeight: 400,
            color: colors.text1,
            lineHeight: 1.1,
            margin: 0,
            opacity: v ? 1 : 0,
            transform: v ? 'translateY(0)' : 'translateY(28px)',
            transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.4s',
          }}>
            Post what you need.
            <br />
            <span style={{ color: colors.accent, fontStyle: 'italic' }}>
              Providers compete.
            </span>
          </h1>

          {/* Subhead */}
          <p style={{
            fontSize: 17, fontFamily: fonts.body, color: colors.text2,
            lineHeight: 1.8, maxWidth: 480, margin: '32px 0 44px',
            fontWeight: 400,
            opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.6s',
          }}>
            The reverse marketplace where verified providers bid on your job.
            Compare, choose, and pay safely through escrow.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center',
            opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.7s',
          }}>
            <Button size="lg" onClick={onPost}>Post a request — free</Button>
            <Button variant="ghost" size="lg" onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}>How it works ↓</Button>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: 64, marginTop: 80,
            opacity: v ? 1 : 0, transition: 'all 0.8s ease 1s',
          }}>
            {[
              { v: u.toLocaleString(), l: 'Users' },
              { v: pr.toLocaleString(), l: 'Verified providers' },
              { v: j.toLocaleString(), l: 'Jobs completed' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 32, fontFamily: fonts.serif, fontWeight: 400,
                  color: colors.text1,
                }}>{s.v}</div>
                <div style={{
                  fontSize: 12, fontFamily: fonts.body, color: colors.text3,
                  marginTop: 4, fontWeight: 500,
                }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          opacity: v ? 0.4 : 0, transition: 'opacity 1s ease 1.2s',
          animation: 'pulse 3s infinite',
        }}>
          <div style={{ fontSize: 12, fontFamily: fonts.body, color: colors.text3, textAlign: 'center' }}>
            Scroll to explore
            <div style={{ marginTop: 8, fontSize: 18 }}>↓</div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 2 — Light: How It Works            */}
      {/* ═══════════════════════════════════════════ */}
      <div id="how-it-works" style={{
        background: colors.bgLight, padding: '120px 48px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Reveal>
            <div style={{
              fontSize: 13, fontFamily: fonts.body, fontWeight: 700,
              color: colors.accent, letterSpacing: 3,
              textTransform: 'uppercase' as const, marginBottom: 16,
            }}>How Skopyr works</div>
          </Reveal>

          <Reveal delay={100}>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 52px)', fontFamily: fonts.serif,
              fontWeight: 400, color: colors.textDark, lineHeight: 1.15,
              margin: '0 0 64px', maxWidth: 600,
            }}>
              Three steps to getting <span style={{ fontStyle: 'italic', color: colors.accent }}>the best</span> service.
            </h2>
          </Reveal>

          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            <Step num="01" title="Describe what you need" desc="Post your request with details, budget, and timeline. It takes less than 2 minutes." delay={150} />
            <Step num="02" title="Providers bid on your job" desc="Verified providers see your request and compete with their best price and approach." delay={250} />
            <Step num="03" title="Pick the best, pay safely" desc="Compare bids side-by-side. Your payment is held in Paystack escrow until the job is done." delay={350} />
          </div>

          {/* Divider */}
          <Reveal delay={400}>
            <div style={{ width: '100%', height: 1, background: colors.borderLight, margin: '80px 0' }} />
          </Reveal>

          {/* CTA within light section */}
          <Reveal delay={450}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
              <div>
                <h3 style={{
                  fontSize: 28, fontFamily: fonts.serif, fontWeight: 400,
                  color: colors.textDark, margin: '0 0 8px',
                }}>Ready to get started?</h3>
                <p style={{ fontSize: 15, fontFamily: fonts.body, color: colors.textMuted, margin: 0 }}>
                  Post your first request — it only takes a moment.
                </p>
              </div>
              <Button onClick={onPost}>Post a request</Button>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 3 — Light: Browse Categories       */}
      {/* ═══════════════════════════════════════════ */}
      <div style={{
        background: '#FFFFFF', padding: '100px 48px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{
                  fontSize: 13, fontFamily: fonts.body, fontWeight: 700,
                  color: colors.accent, letterSpacing: 3,
                  textTransform: 'uppercase' as const, marginBottom: 12,
                }}>Services</div>
                <h2 style={{
                  fontSize: 'clamp(28px, 3.5vw, 44px)', fontFamily: fonts.serif,
                  fontWeight: 400, color: colors.textDark, lineHeight: 1.2, margin: 0,
                }}>Find help for <span style={{ fontStyle: 'italic' }}>anything.</span></h2>
              </div>
              <button onClick={onPost} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 14, fontFamily: fonts.body, fontWeight: 600,
                color: colors.accent, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                View all services →
              </button>
            </div>
          </Reveal>

          {/* Auto-animated infinite marquee carousel */}
          <div style={{
            overflow: 'hidden', margin: '0 -48px', padding: '8px 0 20px',
            maskImage: 'linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)',
          }}
          onMouseEnter={() => {
            const el = document.getElementById('marquee-track');
            if (el) el.style.animationPlayState = 'paused';
          }}
          onMouseLeave={() => {
            const el = document.getElementById('marquee-track');
            if (el) el.style.animationPlayState = 'running';
          }}
          >
            <div id="marquee-track" style={{
              display: 'flex', gap: 20, width: 'max-content',
              animation: 'marquee 30s linear infinite',
            }}>
              {/* Duplicate the cards for seamless loop */}
              {[...categories, ...categories].map((cat, i) => (
                <div
                  key={`${cat.id}-${i}`}
                  onClick={onPost}
                  style={{
                    width: 220, background: colors.bgLight,
                    borderRadius: 16, padding: '32px 24px',
                    cursor: 'pointer', transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                    border: '1px solid transparent', flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = colors.accentBorder;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 16 }}>{cat.icon}</div>
                  <div style={{
                    fontSize: 16, fontFamily: fonts.display, fontWeight: 700,
                    color: colors.textDark, marginBottom: 6, letterSpacing: '-0.3px',
                  }}>{cat.name}</div>
                  <div style={{
                    fontSize: 13, fontFamily: fonts.body, color: colors.textMuted,
                    lineHeight: 1.5,
                  }}>
                    {cat.tag ? cat.tag : 'Request a provider →'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 4 — Cream: Trust & Safety          */}
      {/* ═══════════════════════════════════════════ */}
      <div style={{
        background: colors.bgCream, padding: '100px 48px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Reveal>
            <div style={{
              fontSize: 13, fontFamily: fonts.body, fontWeight: 700,
              color: colors.accent, letterSpacing: 3,
              textTransform: 'uppercase' as const, marginBottom: 16,
            }}>Built on trust</div>
          </Reveal>

          <Reveal delay={100}>
            <h2 style={{
              fontSize: 'clamp(28px, 3.5vw, 44px)', fontFamily: fonts.serif,
              fontWeight: 400, color: colors.textDark, lineHeight: 1.2,
              margin: '0 0 56px', maxWidth: 550,
            }}>
              Your money is <span style={{ fontStyle: 'italic', color: colors.accent }}>protected</span> at every step.
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { icon: '🔒', title: 'Paystack escrow', desc: 'Your payment is held securely until you confirm the job is complete. No risk, no surprises.' },
              { icon: '✓', title: 'NIN-verified providers', desc: 'Every provider passes identity verification, skills assessment, and guarantor checks before they can bid.' },
              { icon: '⭐', title: 'Ratings & reviews', desc: 'Transparent ratings from real customers. Providers build their reputation with every completed job.' },
            ].map((item, i) => (
              <Reveal key={i} delay={150 + i * 100}>
                <div style={{
                  background: '#FFFFFF', borderRadius: 16, padding: '36px 28px',
                  border: `1px solid ${colors.borderLight}`,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 16 }}>{item.icon}</div>
                  <div style={{
                    fontSize: 18, fontFamily: fonts.display, fontWeight: 700,
                    color: colors.textDark, marginBottom: 10, letterSpacing: '-0.3px',
                  }}>{item.title}</div>
                  <div style={{
                    fontSize: 14, fontFamily: fonts.body, color: colors.textMuted,
                    lineHeight: 1.7,
                  }}>{item.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 5 — Dark: Final CTA                */}
      {/* ═══════════════════════════════════════════ */}
      <div style={{
        background: colors.bg, padding: '120px 48px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{
              fontSize: 'clamp(32px, 4.5vw, 56px)', fontFamily: fonts.serif,
              fontWeight: 400, color: colors.text1, lineHeight: 1.15, margin: '0 0 20px',
            }}>
              Scope the best.<br />
              <span style={{ fontStyle: 'italic', color: colors.accent }}>Pick the best.</span>
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <p style={{
              fontSize: 16, fontFamily: fonts.body, color: colors.text2,
              lineHeight: 1.7, margin: '0 0 40px',
            }}>
              Join thousands of people in Abuja who are already finding better service providers through Skopyr.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button size="lg" onClick={onPost}>Post your first request</Button>
              <Button variant="ghost" size="lg" onClick={onBrowse}>Browse open jobs</Button>
            </div>
          </Reveal>

          {/* Footer */}
          <Reveal delay={300}>
            <div style={{
              marginTop: 100, paddingTop: 40,
              borderTop: `1px solid ${colors.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: 16,
            }}>
              <div style={{
                fontSize: 18, fontFamily: fonts.display, fontWeight: 700,
                color: colors.text1, letterSpacing: '-1px',
              }}>
                SK<span style={{ color: colors.accent }}>O</span>PYR
              </div>
              <div style={{ fontSize: 12, fontFamily: fonts.body, color: colors.text3 }}>
                © 2026 Kwaghhii Technology Solutions Ltd. All rights reserved.
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                {['Terms', 'Privacy', 'Contact'].map(link => (
                  <a key={link} href="#" style={{
                    fontSize: 13, fontFamily: fonts.body, color: colors.text3,
                    textDecoration: 'none', transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = colors.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.color = colors.text3; }}
                  >{link}</a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
