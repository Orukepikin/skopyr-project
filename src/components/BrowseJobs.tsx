import { useEffect, useState } from 'react';
import { colors, fonts, categories } from '@/lib/constants';
import type { BrowseRequest } from '@/lib/marketplace';
import Button from './Button';

interface Props {
  onBack: () => void;
  requests: BrowseRequest[];
  onMessageRequester: (request: BrowseRequest) => void;
}

export default function BrowseJobs({ onBack, requests, onMessageRequester }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setVisible(true), 50);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.bg,
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 820,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: colors.text3,
            fontFamily: fonts.body,
            fontSize: 13,
            cursor: 'pointer',
            padding: 0,
            marginBottom: 32,
            fontWeight: 500,
          }}
        >
          {'<-'} Home
        </button>

        <h2
          style={{
            fontSize: 30,
            fontFamily: fonts.display,
            fontWeight: 700,
            color: colors.text1,
            margin: '0 0 4px',
            letterSpacing: '-1px',
          }}
        >
          Open requests near you
        </h2>

        <p
          style={{
            fontSize: 14,
            fontFamily: fonts.body,
            color: colors.text3,
            margin: '0 0 28px',
          }}
        >
          Message requesters directly, build trust early, and win the job faster.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {requests.map((request, index) => {
            const category = categories.find((item) => item.id === request.cat);

            return (
              <div
                key={request.id}
                style={{
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 16,
                  padding: 22,
                  transition: 'all 0.25s ease',
                  animation: `fadeUp 0.4s ease ${index * 0.06}s both`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 18,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: colors.accentDim,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    >
                      {category?.icon || '•'}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 16,
                          fontFamily: fonts.body,
                          fontWeight: 700,
                          color: colors.text1,
                        }}
                      >
                        {request.title}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontFamily: fonts.body,
                          color: colors.text3,
                          marginTop: 5,
                          display: 'flex',
                          gap: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span>{'\uD83D\uDCCD'} {request.loc}</span>
                        <span>{'\uD83D\uDCB0'} {request.budget}</span>
                        <span>{'\u23F0'} {request.when}</span>
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontFamily: fonts.body,
                          color: colors.text2,
                          marginTop: 12,
                          lineHeight: 1.7,
                          maxWidth: 480,
                        }}
                      >
                        {request.summary}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontFamily: fonts.body,
                          color: colors.text3,
                          marginTop: 10,
                        }}
                      >
                        Requester: {request.requester}
                      </div>
                    </div>
                  </div>

                  <div style={{ minWidth: 170, textAlign: 'right' }}>
                    <div style={{ fontSize: 11, fontFamily: fonts.body, color: colors.text3 }}>
                      {request.ago} ago
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: fonts.body,
                        color: request.bids < 3 ? colors.success : '#F59E0B',
                        fontWeight: 700,
                        marginTop: 4,
                      }}
                    >
                      {request.bids} bid{request.bids !== 1 && 's'}
                      {request.bids < 3 && ' · Low competition'}
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <Button size="sm" onClick={() => onMessageRequester(request)}>
                        Message requester
                      </Button>
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
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
