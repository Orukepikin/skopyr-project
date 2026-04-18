import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { colors, fonts, categories } from '@/lib/constants';
import type { DashboardRole } from '@/lib/dashboard';
import type { SponsoredAd } from '@/lib/marketplace';
import Button from './Button';
import AuthControls from './AuthControls';
import SponsoredAdsRail from './SponsoredAdsRail';
import SeoContentSection from './SeoContentSection';

interface Props {
  onPost: () => void;
  onBrowse: () => void;
  onDashboard: (role: DashboardRole) => void;
  sponsoredAds: SponsoredAd[];
  onMessageSponsor: (ad: SponsoredAd) => void;
}

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(36px)',
        transition: `all 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function useCount(target: number, dur = 2000): [number, () => void] {
  const [value, setValue] = useState(0);
  const [go, setGo] = useState(false);
  const start = useCallback(() => setGo(true), []);

  useEffect(() => {
    if (!go) return;

    let startTs: number | null = null;

    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const progress = Math.min((ts - startTs) / dur, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      setValue(Math.floor(ease * target));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [go, target, dur]);

  return [value, start];
}

function Step({ num, title, desc, delay }: { num: string; title: string; desc: string; delay: number }) {
  return (
    <Reveal delay={delay}>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 48,
            fontFamily: fonts.serif,
            color: colors.accent,
            lineHeight: 1,
            marginBottom: 16,
            fontStyle: 'italic',
          }}
        >
          {num}
        </div>
        <div
          style={{
            fontSize: 20,
            fontFamily: fonts.display,
            fontWeight: 700,
            color: colors.textDark,
            marginBottom: 8,
            letterSpacing: '-0.5px',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 15,
            fontFamily: fonts.body,
            color: colors.textMuted,
            lineHeight: 1.7,
          }}
        >
          {desc}
        </div>
      </div>
    </Reveal>
  );
}

export default function Hero({ onPost, onBrowse, onDashboard, sponsoredAds, onMessageSponsor }: Props) {
  const [visible, setVisible] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [users, goUsers] = useCount(2847);
  const [providers, goProviders] = useCount(412);
  const [jobs, goJobs] = useCount(8934);

  useEffect(() => {
    const visibleTimer = window.setTimeout(() => setVisible(true), 100);
    const countTimer = window.setTimeout(() => {
      goUsers();
      goProviders();
      goJobs();
    }, 1000);

    return () => {
      window.clearTimeout(visibleTimer);
      window.clearTimeout(countTimer);
    };
  }, [goJobs, goProviders, goUsers]);

  useEffect(() => {
    const updateViewport = () => setViewportWidth(window.innerWidth);

    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const isMobile = viewportWidth < 768;
  const isSmallMobile = viewportWidth < 420;
  const shellPadding = isMobile ? 20 : 48;
  const largeSectionPadding = isMobile ? `88px ${shellPadding}px` : '120px 48px';
  const mediumSectionPadding = isMobile ? `80px ${shellPadding}px` : '100px 48px';
  const marqueeMask = isMobile
    ? 'linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)'
    : 'linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)';

  return (
    <div>
      <div
        style={{
          minHeight: isMobile ? 'auto' : '100vh',
          position: 'relative',
          overflow: 'hidden',
          background: colors.bg,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.03,
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '120%',
            height: '60%',
            background: 'radial-gradient(ellipse, rgba(255,107,43,0.06) 0%, transparent 70%)',
          }}
        />

        <nav
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 16 : 24,
            padding: `${isMobile ? 20 : 28}px ${shellPadding}px ${isMobile ? 8 : 28}px`,
            position: 'relative',
            zIndex: 10,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(-12px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s',
          }}
        >
          <div
            style={{
              fontSize: isMobile ? 20 : 22,
              fontFamily: fonts.display,
              fontWeight: 700,
              color: colors.text1,
              letterSpacing: '-1.5px',
              textAlign: isMobile ? 'center' : 'left',
            }}
          >
            SK<span style={{ color: colors.accent }}>O</span>PYR
          </div>
          <AuthControls compact={isMobile} onBrowse={onBrowse} onDashboard={onDashboard} />
        </nav>

        <div style={{ padding: `0 ${shellPadding}px` }}>
          <SponsoredAdsRail compact={isMobile} ads={sponsoredAds} onMessageSponsor={onMessageSponsor} />
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `0 ${shellPadding}px ${isMobile ? 56 : 80}px`,
            position: 'relative',
            zIndex: 10,
            textAlign: 'center',
            maxWidth: isMobile ? 560 : 900,
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,107,43,0.06)',
              border: '1px solid rgba(255,107,43,0.12)',
              borderRadius: 100,
              padding: isMobile ? '7px 16px' : '7px 20px',
              marginBottom: isMobile ? 28 : 36,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: colors.accent,
                animation: 'pulse 2s infinite',
              }}
            />
            <span style={{ fontSize: 12, fontFamily: fonts.body, color: colors.text2, fontWeight: 500 }}>
              Now live in Abuja
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(38px, 11vw, 76px)',
              fontFamily: fonts.serif,
              fontWeight: 400,
              color: colors.text1,
              lineHeight: 1.1,
              margin: 0,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(28px)',
              transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.4s',
            }}
          >
            Post what you need.
            <br />
            <span style={{ color: colors.accent, fontStyle: 'italic' }}>Providers compete.</span>
          </h1>

          <p
            style={{
              fontSize: isMobile ? 16 : 17,
              fontFamily: fonts.body,
              color: colors.text2,
              lineHeight: 1.8,
              maxWidth: isMobile ? 360 : 480,
              margin: isMobile ? '24px 0 36px' : '32px 0 44px',
              fontWeight: 400,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.6s',
            }}
          >
            The reverse marketplace where verified providers bid on your job. Compare, choose, and pay safely
            through escrow.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 14,
              flexWrap: 'wrap',
              justifyContent: 'center',
              flexDirection: isSmallMobile ? 'column' : 'row',
              width: isSmallMobile ? '100%' : 'auto',
              maxWidth: isSmallMobile ? 320 : 'none',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.7s',
            }}
          >
            <Button size="lg" full={isSmallMobile} onClick={onPost}>
              Post a request - free
            </Button>
            <Button
              variant="ghost"
              size="lg"
              full={isSmallMobile}
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              How it works
            </Button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(3, minmax(0, 1fr))' : 'repeat(3, auto)',
              gap: isMobile ? 16 : 64,
              marginTop: isMobile ? 56 : 80,
              width: isMobile ? '100%' : 'auto',
              maxWidth: isMobile ? 420 : 'none',
              opacity: visible ? 1 : 0,
              transition: 'all 0.8s ease 1s',
            }}
          >
            {[
              { value: users.toLocaleString(), label: 'Users' },
              { value: providers.toLocaleString(), label: 'Verified providers' },
              { value: jobs.toLocaleString(), label: 'Jobs completed' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: isMobile ? 28 : 32,
                    fontFamily: fonts.serif,
                    fontWeight: 400,
                    color: colors.text1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: fonts.body,
                    color: colors.text3,
                    marginTop: 4,
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isMobile && (
          <div
            style={{
              position: 'absolute',
              bottom: 32,
              left: '50%',
              transform: 'translateX(-50%)',
              opacity: visible ? 0.4 : 0,
              transition: 'opacity 1s ease 1.2s',
              animation: 'pulse 3s infinite',
            }}
          >
            <div style={{ fontSize: 12, fontFamily: fonts.body, color: colors.text3, textAlign: 'center' }}>
              Scroll to explore
              <div style={{ marginTop: 8, fontSize: 18 }}>v</div>
            </div>
          </div>
        )}
      </div>

      <div id="how-it-works" style={{ background: colors.bgLight, padding: largeSectionPadding }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Reveal>
            <div
              style={{
                fontSize: 13,
                fontFamily: fonts.body,
                fontWeight: 700,
                color: colors.accent,
                letterSpacing: 3,
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              How Skopyr works
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h2
              style={{
                fontSize: 'clamp(32px, 4vw, 52px)',
                fontFamily: fonts.serif,
                fontWeight: 400,
                color: colors.textDark,
                lineHeight: 1.15,
                margin: `0 0 ${isMobile ? 40 : 64}px`,
                maxWidth: 600,
              }}
            >
              Three steps to getting <span style={{ fontStyle: 'italic', color: colors.accent }}>the best</span>{' '}
              service.
            </h2>
          </Reveal>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
              gap: isMobile ? 32 : 48,
            }}
          >
            <Step
              num="01"
              title="Describe what you need"
              desc="Post your request with details, budget, and timeline. It takes less than 2 minutes."
              delay={150}
            />
            <Step
              num="02"
              title="Providers bid on your job"
              desc="Verified providers see your request and compete with their best price and approach."
              delay={250}
            />
            <Step
              num="03"
              title="Pick the best, pay safely"
              desc="Compare bids side-by-side. Your payment is held in Paystack escrow until the job is done."
              delay={350}
            />
          </div>

          <Reveal delay={400}>
            <div
              style={{
                width: '100%',
                height: 1,
                background: colors.borderLight,
                margin: `${isMobile ? 56 : 80}px 0`,
              }}
            />
          </Reveal>

          <Reveal delay={450}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                flexDirection: isMobile ? 'column' : 'row',
                flexWrap: 'wrap',
                gap: 24,
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 28,
                    fontFamily: fonts.serif,
                    fontWeight: 400,
                    color: colors.textDark,
                    margin: '0 0 8px',
                  }}
                >
                  Ready to get started?
                </h3>
                <p style={{ fontSize: 15, fontFamily: fonts.body, color: colors.textMuted, margin: 0 }}>
                  Post your first request - it only takes a moment.
                </p>
              </div>
              <Button full={isSmallMobile} onClick={onPost}>
                Post a request
              </Button>
            </div>
          </Reveal>
        </div>
      </div>

      <div style={{ background: '#FFFFFF', padding: mediumSectionPadding }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Reveal>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'flex-end',
                flexDirection: isMobile ? 'column' : 'row',
                marginBottom: 40,
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontFamily: fonts.body,
                    fontWeight: 700,
                    color: colors.accent,
                    letterSpacing: 3,
                    textTransform: 'uppercase',
                    marginBottom: 12,
                  }}
                >
                  Services
                </div>
                <h2
                  style={{
                    fontSize: 'clamp(28px, 3.5vw, 44px)',
                    fontFamily: fonts.serif,
                    fontWeight: 400,
                    color: colors.textDark,
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  Find help for <span style={{ fontStyle: 'italic' }}>anything.</span>
                </h2>
              </div>
              <button
                onClick={onPost}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontFamily: fonts.body,
                  fontWeight: 600,
                  color: colors.accent,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: 0,
                }}
              >
                View all services -&gt;
              </button>
            </div>
          </Reveal>

          <div
            style={{
              overflow: 'hidden',
              margin: `0 -${shellPadding}px`,
              padding: '8px 0 20px',
              maskImage: marqueeMask,
              WebkitMaskImage: marqueeMask,
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
            <div
              id="marquee-track"
              style={{
                display: 'flex',
                gap: 20,
                width: 'max-content',
                animation: 'marquee 30s linear infinite',
              }}
            >
              {[...categories, ...categories].map((cat, i) => (
                <div
                  key={`${cat.id}-${i}`}
                  onClick={onPost}
                  style={{
                    width: isMobile ? 186 : 220,
                    background: colors.bgLight,
                    borderRadius: 16,
                    padding: isMobile ? '24px 18px' : '32px 24px',
                    cursor: 'pointer',
                    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                    border: '1px solid transparent',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = colors.accentBorder;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 16 }}>{cat.icon}</div>
                  <div
                    style={{
                      fontSize: 16,
                      fontFamily: fonts.display,
                      fontWeight: 700,
                      color: colors.textDark,
                      marginBottom: 6,
                      letterSpacing: '-0.3px',
                    }}
                  >
                    {cat.name}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontFamily: fonts.body,
                      color: colors.textMuted,
                      lineHeight: 1.5,
                    }}
                  >
                    {cat.tag ? cat.tag : 'Request a provider -&gt;'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SeoContentSection />

      <div style={{ background: colors.bgCream, padding: mediumSectionPadding }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Reveal>
            <div
              style={{
                fontSize: 13,
                fontFamily: fonts.body,
                fontWeight: 700,
                color: colors.accent,
                letterSpacing: 3,
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              Built on trust
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h2
              style={{
                fontSize: 'clamp(28px, 3.5vw, 44px)',
                fontFamily: fonts.serif,
                fontWeight: 400,
                color: colors.textDark,
                lineHeight: 1.2,
                margin: '0 0 56px',
                maxWidth: 550,
              }}
            >
              Your money is <span style={{ fontStyle: 'italic', color: colors.accent }}>protected</span> at every
              step.
            </h2>
          </Reveal>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
            }}
          >
            {[
              {
                icon: 'Escrow',
                title: 'Paystack escrow',
                desc: 'Your payment is held securely until you confirm the job is complete. No risk, no surprises.',
              },
              {
                icon: 'Verified',
                title: 'NIN-verified providers',
                desc: 'Every provider passes identity verification, skills assessment, and guarantor checks before they can bid.',
              },
              {
                icon: 'Rated',
                title: 'Ratings & reviews',
                desc: 'Transparent ratings from real customers. Providers build their reputation with every completed job.',
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={150 + i * 100}>
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    padding: isMobile ? '28px 22px' : '36px 28px',
                    border: `1px solid ${colors.borderLight}`,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: 13, marginBottom: 16, color: colors.accent, fontFamily: fonts.display, fontWeight: 700 }}>
                    {item.icon}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontFamily: fonts.display,
                      fontWeight: 700,
                      color: colors.textDark,
                      marginBottom: 10,
                      letterSpacing: '-0.3px',
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontFamily: fonts.body,
                      color: colors.textMuted,
                      lineHeight: 1.7,
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: colors.bg, padding: largeSectionPadding, textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Reveal>
            <h2
              style={{
                fontSize: 'clamp(32px, 4.5vw, 56px)',
                fontFamily: fonts.serif,
                fontWeight: 400,
                color: colors.text1,
                lineHeight: 1.15,
                margin: '0 0 20px',
              }}
            >
              Scope the best.
              <br />
              <span style={{ fontStyle: 'italic', color: colors.accent }}>Pick the best.</span>
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <p
              style={{
                fontSize: 16,
                fontFamily: fonts.body,
                color: colors.text2,
                lineHeight: 1.7,
                margin: '0 0 40px',
              }}
            >
              Join thousands of people in Abuja who are already finding better service providers through Skopyr.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div
              style={{
                display: 'flex',
                gap: 14,
                justifyContent: 'center',
                flexWrap: 'wrap',
                flexDirection: isSmallMobile ? 'column' : 'row',
              }}
            >
              <Button full={isSmallMobile} size="lg" onClick={onPost}>
                Post your first request
              </Button>
              <Button full={isSmallMobile} variant="ghost" size="lg" onClick={onBrowse}>
                Browse open jobs
              </Button>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div
              style={{
                marginTop: isMobile ? 72 : 100,
                paddingTop: 40,
                borderTop: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: isMobile ? 'column' : 'row',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontFamily: fonts.display,
                  fontWeight: 700,
                  color: colors.text1,
                  letterSpacing: '-1px',
                }}
              >
                SK<span style={{ color: colors.accent }}>O</span>PYR
              </div>
              <div style={{ fontSize: 12, fontFamily: fonts.body, color: colors.text3 }}>
                Copyright 2026 Kwaghhii Technology Solutions Ltd. All rights reserved.
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  { label: 'How it works', href: '/how-it-works' },
                  { label: 'For customers', href: '/for-customers' },
                  { label: 'For providers', href: '/for-providers' },
                  { label: 'Pricing', href: '/pricing' },
                  { label: 'FAQ', href: '/faq' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      fontSize: 13,
                      fontFamily: fonts.body,
                      color: colors.text3,
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.text3;
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
