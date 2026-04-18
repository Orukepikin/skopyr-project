import { colors, fonts } from '@/lib/constants';
import type { SponsoredAd } from '@/lib/marketplace';
import Button from './Button';

interface Props {
  ads: SponsoredAd[];
  onMessageSponsor: (ad: SponsoredAd) => void;
}

export default function SponsoredAdsRail({ ads, onMessageSponsor }: Props) {
  const activeAds = ads.filter((ad) => ad.active).slice(0, 3);

  if (activeAds.length === 0) {
    return null;
  }

  return (
    <section
      style={{
        width: '100%',
        maxWidth: 1120,
        margin: '0 auto 28px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 14,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontFamily: fonts.body,
              fontWeight: 700,
              color: colors.accent,
              letterSpacing: 2.4,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Sponsored services
          </div>
          <div
            style={{
              fontSize: 18,
              fontFamily: fonts.display,
              color: colors.text1,
              fontWeight: 700,
            }}
          >
            Featured first so buyers notice them before anything else.
          </div>
        </div>
        <div
          style={{
            fontSize: 13,
            fontFamily: fonts.body,
            color: colors.text2,
            maxWidth: 340,
            lineHeight: 1.6,
          }}
        >
          Providers can pay for premium placement, direct message CTA, and stronger visibility across home and inbox surfaces.
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 14,
        }}
      >
        {activeAds.map((ad) => (
          <div
            key={ad.id}
            style={{
              background: 'linear-gradient(135deg, rgba(255,107,43,0.16), rgba(255,255,255,0.03))',
              border: `1px solid ${colors.accentBorder}`,
              borderRadius: 20,
              padding: 20,
              boxShadow: '0 18px 50px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'flex-start',
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: fonts.body,
                    fontWeight: 700,
                    color: colors.accent,
                    letterSpacing: 1.8,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  {ad.badge}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontFamily: fonts.display,
                    color: colors.text1,
                    fontWeight: 700,
                    lineHeight: 1.15,
                  }}
                >
                  {ad.headline}
                </div>
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontFamily: fonts.body,
                  color: colors.text1,
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 999,
                  padding: '7px 10px',
                  whiteSpace: 'nowrap',
                }}
              >
                {ad.startingPrice}
              </div>
            </div>

            <div
              style={{
                fontSize: 14,
                fontFamily: fonts.body,
                color: colors.text2,
                lineHeight: 1.7,
                marginBottom: 16,
              }}
            >
              {ad.body}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 10,
                flexWrap: 'wrap',
                marginBottom: 16,
                fontSize: 12,
                fontFamily: fonts.body,
                color: colors.text2,
              }}
            >
              <span>{ad.providerName}</span>
              <span>{ad.service}</span>
              <span>{ad.location}</span>
            </div>

            <Button size="sm" onClick={() => onMessageSponsor(ad)}>
              {ad.cta}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
