import { useEffect, useMemo, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { colors, fonts } from '@/lib/constants';
import { isGoogleProviderAvailable } from '@/lib/googleAuth';
import Button from './Button';

interface Props {
  onBack: () => void;
  onHome: () => void;
  onMessageProvider: (input: {
    providerName: string;
    category: string;
    subject: string;
    body: string;
  }) => void;
}

type PaymentState = 'idle' | 'initializing' | 'verifying' | 'success' | 'error';

interface Bid {
  id: number;
  name: string;
  rating: number;
  jobs: number;
  price: number;
  avatar: string;
  verified: boolean;
  msg: string;
  eta: string;
  time: string;
}

interface InitializePaymentResponse {
  accessCode?: string;
  message?: string;
}

interface VerifyPaymentResponse {
  verified?: boolean;
  message?: string;
}

const BIDS: Bid[] = [
  {
    id: 1,
    name: 'Chidi Okonkwo',
    rating: 4.9,
    jobs: 234,
    price: 18000,
    avatar: 'CO',
    verified: true,
    msg: 'Specialist in Mikano & Mantrac generators. Full toolkit, parts included. 30-day warranty.',
    eta: 'Today 2PM',
    time: '~2 hrs',
  },
  {
    id: 2,
    name: 'Amaka Eze',
    rating: 4.7,
    jobs: 156,
    price: 15000,
    avatar: 'AE',
    verified: true,
    msg: 'All brands covered. Price includes diagnostics and minor parts. Same-day service guaranteed.',
    eta: 'Today 3:30PM',
    time: '~3 hrs',
  },
  {
    id: 3,
    name: 'Ibrahim Musa',
    rating: 4.8,
    jobs: 312,
    price: 22000,
    avatar: 'IM',
    verified: true,
    msg: 'Master technician, 15 years experience. Premium express service with full warranty on all repairs.',
    eta: 'Today 1PM',
    time: '~1 hr',
  },
];

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
const PLATFORM_FEE_RATE = 0.1;

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function BidsView({ onBack, onHome, onMessageProvider }: Props) {
  const { data: session } = useSession();
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [checkoutBidId, setCheckoutBidId] = useState<number | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [checkingGoogle, setCheckingGoogle] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setVisible(true), 50);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    let active = true;

    isGoogleProviderAvailable()
      .then((available) => {
        if (!active) {
          return;
        }

        setGoogleReady(available);
      })
      .catch(() => {
        if (active) {
          setGoogleReady(false);
        }
      })
      .finally(() => {
        if (active) {
          setCheckingGoogle(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const checkoutBid = useMemo(
    () => BIDS.find((bid) => bid.id === checkoutBidId) ?? null,
    [checkoutBidId]
  );

  const pricing = checkoutBid
    ? {
        serviceFee: checkoutBid.price,
        platformFee: Math.round(checkoutBid.price * PLATFORM_FEE_RATE),
      }
    : null;

  const totalAmount = pricing ? pricing.serviceFee + pricing.platformFee : 0;

  const resetPaymentFeedback = () => {
    setPaymentState('idle');
    setPaymentMessage(null);
  };

  const openPaymentModal = (bidId: number) => {
    setCheckoutBidId(bidId);
    setSelected(bidId);
    resetPaymentFeedback();
  };

  const closePaymentModal = () => {
    setCheckoutBidId(null);
    resetPaymentFeedback();
  };

  const handleGoogleSignIn = async () => {
    setPaymentState('initializing');
    setPaymentMessage(null);

    const ready = googleReady || (await isGoogleProviderAvailable().catch(() => false));

    setGoogleReady(ready);
    setCheckingGoogle(false);

    if (!ready) {
      setPaymentState('error');
      setPaymentMessage("Google sign-in isn't available right now. Refresh and try again.");
      return;
    }

    window.localStorage.setItem('skopyr:return-screen', 'bids');
    await signIn('google');
  };

  const handlePayment = async () => {
    if (!checkoutBid || !pricing) {
      return;
    }

    if (!session?.user?.email) {
      setPaymentState('error');
      setPaymentMessage('Sign in with Google before paying for a provider.');
      return;
    }

    if (!PAYSTACK_PUBLIC_KEY) {
      setPaymentState('error');
      setPaymentMessage('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is missing. Add it in Vercel and redeploy.');
      return;
    }

    try {
      setPaymentState('initializing');
      setPaymentMessage(null);

      const initializeResponse = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount * 100,
          providerName: checkoutBid.name,
          bidId: checkoutBid.id,
        }),
      });

      const initializePayload = (await initializeResponse.json()) as InitializePaymentResponse;

      if (!initializeResponse.ok || !initializePayload.accessCode) {
        throw new Error(initializePayload.message || 'Unable to initialize Paystack payment.');
      }

      const { default: PaystackPop } = await import('@paystack/inline-js');
      const paystack = new PaystackPop();

      paystack.resumeTransaction(initializePayload.accessCode, {
        onCancel: () => {
          setPaymentState('idle');
          setPaymentMessage('Payment was cancelled before completion.');
        },
        onError: (error) => {
          setPaymentState('error');
          setPaymentMessage(error.message || 'Unable to open the Paystack checkout.');
        },
        onSuccess: async (transaction) => {
          try {
            setPaymentState('verifying');
            setPaymentMessage('Verifying your payment with Paystack...');

            const verifyResponse = await fetch(
              `/api/paystack/verify?reference=${encodeURIComponent(transaction.reference)}`
            );
            const verifyPayload = (await verifyResponse.json()) as VerifyPaymentResponse;

            if (!verifyResponse.ok || !verifyPayload.verified) {
              throw new Error(verifyPayload.message || 'Payment could not be verified.');
            }

            setPaymentState('success');
            setPaymentMessage(
              `Payment verified for ${checkoutBid.name}. Your Paystack escrow is now active.`
            );
          } catch (error) {
            setPaymentState('error');
            setPaymentMessage(
              error instanceof Error ? error.message : 'Unable to verify your payment.'
            );
          }
        },
      });
    } catch (error) {
      setPaymentState('error');
      setPaymentMessage(
        error instanceof Error ? error.message : 'Unable to start the Paystack checkout.'
      );
    }
  };

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
          maxWidth: 720,
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
            marginBottom: 28,
            fontWeight: 500,
          }}
        >
          {'\u2190'} Back
        </button>

        <div
          style={{
            background: colors.accentDim,
            border: `1px solid ${colors.accentBorder}`,
            borderRadius: 16,
            padding: '22px 24px',
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontFamily: fonts.body,
                  fontWeight: 700,
                  color: colors.accent,
                  letterSpacing: 2.5,
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                {'Your request \u00B7 Live'}
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontFamily: fonts.display,
                  fontWeight: 700,
                  color: colors.text1,
                  letterSpacing: '-0.5px',
                }}
              >
                Generator not starting
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontFamily: fonts.body,
                  color: colors.text3,
                  marginTop: 6,
                  display: 'flex',
                  gap: 14,
                  flexWrap: 'wrap',
                }}
              >
                <span>{'\u26A1'} Generator</span>
                <span>{'\uD83D\uDCCD'} Games Village</span>
                <span>{'\uD83D\uDCB0'} {formatNaira(15000)} - {formatNaira(25000)}</span>
                <span>{'\u23F0'} ASAP</span>
              </div>
            </div>
            <div
              style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: 100,
                padding: '5px 14px',
                fontSize: 12,
                fontFamily: fonts.body,
                color: colors.success,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: colors.success,
                  animation: 'pulse 2s infinite',
                  display: 'inline-block',
                }}
              />
              3 bids
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: 11,
            fontFamily: fonts.body,
            fontWeight: 700,
            color: colors.accent,
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Step 3 / 3
        </div>
        <h2
          style={{
            fontSize: 28,
            fontFamily: fonts.display,
            fontWeight: 700,
            color: colors.text1,
            margin: '0 0 4px',
            letterSpacing: '-1px',
          }}
        >
          Compare & pick
        </h2>
        <p
          style={{
            fontSize: 14,
            fontFamily: fonts.body,
            color: colors.text3,
            margin: '0 0 24px',
          }}
        >
          Tap any bid to see details
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {BIDS.map((bid, index) => (
            <div
              key={bid.id}
              onClick={() => setSelected(selected === bid.id ? null : bid.id)}
              style={{
                background: selected === bid.id ? colors.accentDim : colors.card,
                border: `1px solid ${selected === bid.id ? colors.accentBorder : colors.border}`,
                borderRadius: 16,
                padding: 20,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                animation: `fadeUp 0.4s ease ${index * 0.08}s both`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}08)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontFamily: fonts.display,
                      fontWeight: 700,
                      color: colors.accent,
                      flexShrink: 0,
                    }}
                  >
                    {bid.avatar}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontSize: 15,
                          fontFamily: fonts.body,
                          fontWeight: 700,
                          color: colors.text1,
                        }}
                      >
                        {bid.name}
                      </span>
                      {bid.verified && (
                        <span
                          style={{
                            fontSize: 9,
                            fontFamily: fonts.body,
                            fontWeight: 800,
                            color: colors.success,
                            background: 'rgba(34,197,94,0.1)',
                            padding: '2px 6px',
                            borderRadius: 4,
                            letterSpacing: '0.5px',
                          }}
                        >
                          VERIFIED
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 3, alignItems: 'center' }}>
                      <span style={{ color: '#F59E0B', fontSize: 13 }}>
                        {'\u2605'.repeat(Math.floor(bid.rating))}
                      </span>
                      <span
                        style={{
                          color: colors.text3,
                          fontSize: 13,
                          fontFamily: fonts.body,
                          fontWeight: 600,
                        }}
                      >
                        {bid.rating}
                      </span>
                      <span style={{ fontSize: 11, fontFamily: fonts.body, color: colors.text3 }}>
                        {bid.jobs} jobs
                      </span>
                      <span style={{ fontSize: 11, fontFamily: fonts.body, color: colors.text3 }}>
                        {bid.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div
                    style={{
                      fontSize: 22,
                      fontFamily: fonts.display,
                      fontWeight: 700,
                      color: colors.text1,
                      letterSpacing: '-0.5px',
                    }}
                  >
                    {formatNaira(bid.price)}
                  </div>
                  <div style={{ fontSize: 11, fontFamily: fonts.body, color: colors.text3 }}>
                    {bid.eta}
                  </div>
                </div>
              </div>

              <div
                style={{
                  maxHeight: selected === bid.id ? 180 : 0,
                  overflow: 'hidden',
                  transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                  opacity: selected === bid.id ? 1 : 0,
                }}
              >
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: `1px solid ${colors.border}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      fontFamily: fonts.body,
                      color: colors.text2,
                      lineHeight: 1.6,
                      margin: '0 0 14px',
                      fontStyle: 'italic',
                    }}
                  >
                    {`\u201C${bid.msg}\u201D`}
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      size="sm"
                      onClick={(event: React.MouseEvent) => {
                        event.stopPropagation();
                        openPaymentModal(bid.id);
                      }}
                    >
                      Accept this bid
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(event: React.MouseEvent) => {
                        event.stopPropagation();
                        onMessageProvider({
                          providerName: bid.name,
                          category: 'Generator repair',
                          subject: 'Generator not starting',
                          body: `Hi ${bid.name.split(' ')[0]}, I want to ask a few questions about your bid before I accept it.`,
                        });
                      }}
                    >
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {checkoutBid && pricing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(6px)',
          }}
          onClick={closePaymentModal}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              background: '#141418',
              borderRadius: 20,
              padding: 36,
              border: `1px solid ${colors.border}`,
              maxWidth: 420,
              width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{'\uD83D\uDD12'}</div>
              <h3
                style={{
                  fontSize: 22,
                  fontFamily: fonts.display,
                  fontWeight: 700,
                  color: colors.text1,
                  margin: '0 0 6px',
                  letterSpacing: '-0.5px',
                }}
              >
                Confirm & pay
              </h3>
              <p style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text3, margin: 0 }}>
                Held in escrow until job is complete
              </p>
            </div>

            <div
              style={{
                background: colors.card,
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 16,
                  alignItems: 'center',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontFamily: fonts.display,
                      color: colors.text1,
                      fontWeight: 700,
                    }}
                  >
                    {checkoutBid.name}
                  </div>
                  <div style={{ fontSize: 12, fontFamily: fonts.body, color: colors.text3 }}>
                    {checkoutBid.eta} availability
                  </div>
                </div>
                <div style={{ fontSize: 12, fontFamily: fonts.body, color: colors.text2 }}>
                  {checkoutBid.time}
                </div>
              </div>

              {[
                ['Service', formatNaira(pricing.serviceFee)],
                ['Skopyr fee (10%)', formatNaira(pricing.platformFee)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}
                >
                  <span style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text3 }}>
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontFamily: fonts.body,
                      color: colors.text1,
                      fontWeight: 600,
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}

              <div
                style={{
                  borderTop: `1px solid ${colors.border}`,
                  paddingTop: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    fontFamily: fonts.body,
                    color: colors.text1,
                    fontWeight: 700,
                  }}
                >
                  Total
                </span>
                <span
                  style={{
                    fontSize: 20,
                    fontFamily: fonts.display,
                    color: colors.accent,
                    fontWeight: 700,
                  }}
                >
                  {formatNaira(totalAmount)}
                </span>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontFamily: fonts.body,
                  fontWeight: 700,
                  color: colors.accent,
                  letterSpacing: 1.6,
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Account
              </div>
              <div style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text1 }}>
                {session?.user?.email || 'Not signed in'}
              </div>
            </div>

            {paymentMessage && (
              <p
                style={{
                  fontSize: 12,
                  fontFamily: fonts.body,
                  color: paymentState === 'success' ? colors.success : colors.text2,
                  lineHeight: 1.6,
                  margin: '0 0 16px',
                }}
              >
                {paymentMessage}
              </p>
            )}

            {!session?.user?.email ? (
              <Button
                full
                onClick={handleGoogleSignIn}
                disabled={checkingGoogle || paymentState === 'initializing'}
              >
                {checkingGoogle || paymentState === 'initializing'
                  ? 'Checking Google...'
                  : 'Sign in with Google to pay'}
              </Button>
            ) : paymentState === 'success' ? (
              <Button
                full
                onClick={() => {
                  closePaymentModal();
                  onHome();
                }}
              >
                Return home
              </Button>
            ) : (
              <Button
                full
                onClick={handlePayment}
                disabled={paymentState === 'initializing' || paymentState === 'verifying'}
              >
                {paymentState === 'initializing'
                  ? 'Opening Paystack...'
                  : paymentState === 'verifying'
                    ? 'Verifying payment...'
                    : 'Pay with Paystack'}
              </Button>
            )}

            <button
              type="button"
              onClick={closePaymentModal}
              style={{
                marginTop: 12,
                width: '100%',
                background: 'transparent',
                color: colors.text3,
                border: 'none',
                fontSize: 12,
                fontFamily: fonts.body,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <p
              style={{
                fontSize: 10,
                fontFamily: fonts.body,
                color: colors.text3,
                textAlign: 'center',
                marginTop: 12,
                lineHeight: 1.5,
              }}
            >
              {'Escrow \u2192 Job done \u2192 You confirm \u2192 Provider paid'}
            </p>
          </div>
        </div>
      )}

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

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
