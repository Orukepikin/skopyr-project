import { colors, fonts } from '@/lib/constants';

const searchTopics = [
  {
    title: 'Generator repair in Abuja',
    body: 'Buyers can post urgent power issues in Games Village, Wuse, Gwarinpa, and Maitama, then compare fast replies from verified generator specialists.',
  },
  {
    title: 'Plumbers and AC repair experts',
    body: 'Skopyr helps people find plumbers, AC technicians, solar installers, and cleaners while giving providers a clearer path to quality leads.',
  },
  {
    title: 'Sponsored provider visibility',
    body: 'Providers can pay for sponsored placements so their services appear above the fold, stand out in discovery, and attract more direct messages.',
  },
];

const faqs = [
  {
    question: 'How does Skopyr help buyers hire service providers in Abuja?',
    answer:
      'Buyers post a request, message providers directly, compare bids, and pay safely through Paystack-backed escrow before releasing funds.',
  },
  {
    question: 'Can service providers advertise their services on Skopyr?',
    answer:
      'Yes. Providers can run sponsored ads from their dashboard so their services show up in premium homepage placement with a direct message call to action.',
  },
  {
    question: 'Can buyers and sellers message each other before a booking?',
    answer:
      'Yes. Buyers can message providers from bids and sponsored cards, while providers can message requesters from open jobs and continue the conversation in the dashboard inbox.',
  },
];

export default function SeoContentSection() {
  return (
    <section
      style={{
        background: '#FCFBF8',
        padding: '100px 48px',
        borderTop: `1px solid ${colors.borderLight}`,
      }}
    >
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <div
          style={{
            fontSize: 13,
            fontFamily: fonts.body,
            fontWeight: 700,
            color: colors.accent,
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          Popular service searches
        </div>
        <h2
          style={{
            fontSize: 'clamp(30px, 4vw, 50px)',
            fontFamily: fonts.serif,
            fontWeight: 400,
            color: colors.textDark,
            lineHeight: 1.15,
            margin: '0 0 18px',
            maxWidth: 780,
          }}
        >
          Built to rank for the jobs people actually search for and the services providers want to sell.
        </h2>
        <p
          style={{
            fontSize: 16,
            fontFamily: fonts.body,
            color: colors.textMuted,
            lineHeight: 1.8,
            maxWidth: 760,
            marginBottom: 34,
          }}
        >
          Skopyr combines direct messaging, escrow-backed hiring, and paid sponsored placements so buyers can discover trusted help quickly and providers can win more visible opportunities.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 18,
            marginBottom: 56,
          }}
        >
          {searchTopics.map((topic) => (
            <article
              key={topic.title}
              style={{
                background: '#FFFFFF',
                border: `1px solid ${colors.borderLight}`,
                borderRadius: 18,
                padding: '28px 24px',
              }}
            >
              <h3
                style={{
                  fontSize: 20,
                  fontFamily: fonts.display,
                  fontWeight: 700,
                  color: colors.textDark,
                  margin: '0 0 10px',
                }}
              >
                {topic.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  fontFamily: fonts.body,
                  color: colors.textMuted,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {topic.body}
              </p>
            </article>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 0.9fr) minmax(320px, 1.1fr)',
            gap: 24,
            alignItems: 'start',
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
              Frequently asked questions
            </div>
            <h3
              style={{
                fontSize: 30,
                fontFamily: fonts.serif,
                fontWeight: 400,
                color: colors.textDark,
                lineHeight: 1.2,
                margin: '0 0 10px',
              }}
            >
              Helpful answers for Google, AI search, buyers, and providers.
            </h3>
            <p
              style={{
                fontSize: 15,
                fontFamily: fonts.body,
                color: colors.textMuted,
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              Clear service language, structured answers, and crawlable page content give search engines more confidence in what Skopyr offers.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {faqs.map((faq) => (
              <details
                key={faq.question}
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${colors.borderLight}`,
                  borderRadius: 18,
                  padding: '18px 20px',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    listStyle: 'none',
                    fontSize: 16,
                    fontFamily: fonts.display,
                    fontWeight: 700,
                    color: colors.textDark,
                  }}
                >
                  {faq.question}
                </summary>
                <p
                  style={{
                    fontSize: 14,
                    fontFamily: fonts.body,
                    color: colors.textMuted,
                    lineHeight: 1.7,
                    margin: '12px 0 0',
                  }}
                >
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
