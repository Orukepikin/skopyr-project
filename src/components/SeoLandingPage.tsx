import Head from 'next/head';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { colors, fonts } from '@/lib/constants';

const siteUrl = 'https://www.skopyr.com';

interface Section {
  title: string;
  body: string;
  bullets?: string[];
}

interface FaqItem {
  question: string;
  answer: string;
}

interface LinkItem {
  href: string;
  label: string;
}

interface Props {
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  sections: Section[];
  faqs?: FaqItem[];
  primaryCta?: LinkItem;
  secondaryCta?: LinkItem;
  relatedLinks?: LinkItem[];
}

const footerLinks: LinkItem[] = [
  { href: '/', label: 'Home' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/for-customers', label: 'For customers' },
  { href: '/for-providers', label: 'For providers' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
];

export default function SeoLandingPage({
  path,
  title,
  description,
  eyebrow,
  heading,
  intro,
  sections,
  faqs = [],
  primaryCta,
  secondaryCta,
  relatedLinks = [],
}: Props) {
  const canonicalUrl = `${siteUrl}${path}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        isPartOf: {
          '@id': `${siteUrl}/#website`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: title,
            item: canonicalUrl,
          },
        ],
      },
      ...(faqs.length > 0
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${canonicalUrl}#faq`,
              mainEntity: faqs.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: item.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <Head>
        <title>{title} | Skopyr</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${title} | Skopyr`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Skopyr" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} | Skopyr`} />
        <meta name="twitter:description" content={description} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div style={{ minHeight: '100vh', background: colors.bg }}>
        <div
          style={{
            maxWidth: 1080,
            margin: '0 auto',
            padding: '28px 24px 96px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              alignItems: 'center',
              flexWrap: 'wrap',
              marginBottom: 56,
            }}
          >
            <Link
              href="/"
              style={{
                fontSize: 22,
                fontFamily: fonts.display,
                fontWeight: 700,
                color: colors.text1,
                letterSpacing: '-1.2px',
                textDecoration: 'none',
              }}
            >
              SK<span style={{ color: colors.accent }}>O</span>PYR
            </Link>
            <div
              style={{
                display: 'flex',
                gap: 18,
                flexWrap: 'wrap',
              }}
            >
              {footerLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: colors.text3,
                    fontFamily: fonts.body,
                    fontSize: 13,
                    textDecoration: 'none',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, rgba(255,107,43,0.12), rgba(255,255,255,0.03))',
              border: `1px solid ${colors.accentBorder}`,
              borderRadius: 28,
              padding: '40px 28px',
              marginBottom: 28,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontFamily: fonts.body,
                fontWeight: 700,
                color: colors.accent,
                letterSpacing: 2.6,
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              {eyebrow}
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(34px, 6vw, 60px)',
                lineHeight: 1.06,
                fontFamily: fonts.serif,
                fontWeight: 400,
                color: colors.text1,
                maxWidth: 760,
              }}
            >
              {heading}
            </h1>
            <p
              style={{
                margin: '20px 0 0',
                maxWidth: 720,
                fontSize: 16,
                fontFamily: fonts.body,
                color: colors.text2,
                lineHeight: 1.8,
              }}
            >
              {intro}
            </p>
            {(primaryCta || secondaryCta) && (
              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  flexWrap: 'wrap',
                  marginTop: 28,
                }}
              >
                {primaryCta && (
                  <Link
                    href={primaryCta.href}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '14px 24px',
                      borderRadius: 12,
                      background: colors.accent,
                      color: '#fff',
                      textDecoration: 'none',
                      fontFamily: fonts.body,
                      fontWeight: 700,
                    }}
                  >
                    {primaryCta.label}
                  </Link>
                )}
                {secondaryCta && (
                  <Link
                    href={secondaryCta.href}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '14px 24px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${colors.border}`,
                      color: colors.text1,
                      textDecoration: 'none',
                      fontFamily: fonts.body,
                      fontWeight: 700,
                    }}
                  >
                    {secondaryCta.label}
                  </Link>
                )}
              </div>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
            }}
          >
            {sections.map((section) => (
              <section
                key={section.title}
                style={{
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 20,
                  padding: 24,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontFamily: fonts.display,
                    fontWeight: 700,
                    color: colors.text1,
                    letterSpacing: '-0.4px',
                  }}
                >
                  {section.title}
                </h2>
                <p
                  style={{
                    margin: '12px 0 0',
                    fontSize: 14,
                    fontFamily: fonts.body,
                    color: colors.text2,
                    lineHeight: 1.8,
                  }}
                >
                  {section.body}
                </p>
                {section.bullets && (
                  <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
                    {section.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        style={{
                          fontSize: 13,
                          fontFamily: fonts.body,
                          color: colors.text3,
                          lineHeight: 1.7,
                        }}
                      >
                        - {bullet}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

          {relatedLinks.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: fonts.body,
                  fontWeight: 700,
                  color: colors.accent,
                  letterSpacing: 2.2,
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                Explore More Abuja Services
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 12,
                }}
              >
                {relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      display: 'block',
                      background: colors.card,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 18,
                      padding: '18px 20px',
                      color: colors.text1,
                      textDecoration: 'none',
                      fontFamily: fonts.display,
                      fontWeight: 700,
                      letterSpacing: '-0.2px',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {faqs.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: fonts.body,
                  fontWeight: 700,
                  color: colors.accent,
                  letterSpacing: 2.2,
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                Frequently Asked Questions
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {faqs.map((faq) => (
                  <section
                    key={faq.question}
                    style={{
                      background: colors.card,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 18,
                      padding: 20,
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 18,
                        fontFamily: fonts.display,
                        fontWeight: 700,
                        color: colors.text1,
                        letterSpacing: '-0.3px',
                      }}
                    >
                      {faq.question}
                    </h2>
                    <p
                      style={{
                        margin: '10px 0 0',
                        fontSize: 14,
                        fontFamily: fonts.body,
                        color: colors.text2,
                        lineHeight: 1.8,
                      }}
                    >
                      {faq.answer}
                    </p>
                  </section>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: 52,
              paddingTop: 24,
              borderTop: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontFamily: fonts.body,
                color: colors.text3,
              }}
            >
              Skopyr helps Abuja buyers and providers message, compare bids, and pay safely through escrow.
            </div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: colors.text3,
                    textDecoration: 'none',
                    fontFamily: fonts.body,
                    fontSize: 12,
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
