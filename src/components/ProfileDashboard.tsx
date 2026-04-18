import { useEffect, useMemo, useState } from 'react';
import { colors, fonts } from '@/lib/constants';
import type { DashboardRole } from '@/lib/dashboard';
import Button from './Button';

interface Props {
  role: DashboardRole;
  userName?: string | null;
  userEmail?: string | null;
  onRoleChange: (role: DashboardRole) => void;
  onHome: () => void;
  onBrowse: () => void;
  onPost: () => void;
}

interface StatCard {
  label: string;
  value: string;
  note: string;
}

interface MessageThread {
  id: number;
  counterpart: string;
  preview: string;
  time: string;
  unread: boolean;
  category: string;
}

interface CustomerRequest {
  id: number;
  title: string;
  location: string;
  budget: string;
  bids: number;
  status: string;
  provider: string;
}

interface ProviderLead {
  id: number;
  requester: string;
  service: string;
  location: string;
  budget: string;
  urgency: string;
  interest: string;
}

interface Payout {
  id: number;
  title: string;
  amount: string;
  status: string;
  date: string;
}

const CUSTOMER_STATS: StatCard[] = [
  { label: 'Live requests', value: '3', note: '2 already have shortlisted providers' },
  { label: 'Unread messages', value: '5', note: 'Fast replies improve your booking speed' },
  { label: 'Escrow protected', value: 'NGN 58k', note: 'Held safely until work is confirmed' },
];

const PROVIDER_STATS: StatCard[] = [
  { label: 'New leads', value: '12', note: 'People currently looking for your services' },
  { label: 'Earnings this month', value: 'NGN 184k', note: 'NGN 42k pending release' },
  { label: 'Response rate', value: '96%', note: 'Top providers in Abuja answer within 10 mins' },
];

const CUSTOMER_MESSAGES: MessageThread[] = [
  {
    id: 1,
    counterpart: 'Amaka Eze',
    preview: 'I can be at Games Village by 3:30 PM. Do you want me to bring replacement plugs too?',
    time: '4m ago',
    unread: true,
    category: 'Generator repair',
  },
  {
    id: 2,
    counterpart: 'Chidi Okonkwo',
    preview: 'I just sent a revised quote that includes diagnostics and fuel system checks.',
    time: '19m ago',
    unread: true,
    category: 'Generator repair',
  },
  {
    id: 3,
    counterpart: 'Skopyr support',
    preview: 'Your payment for the AC repair job is still protected in escrow until you confirm completion.',
    time: 'Yesterday',
    unread: false,
    category: 'Escrow update',
  },
];

const PROVIDER_MESSAGES: MessageThread[] = [
  {
    id: 1,
    counterpart: 'Aisha Bello',
    preview: 'Can you still make it to Wuse today if I accept your bid this afternoon?',
    time: '2m ago',
    unread: true,
    category: 'Generator repair',
  },
  {
    id: 2,
    counterpart: 'David Ogunleye',
    preview: 'I like your profile. Are you available for a same-day solar inverter inspection?',
    time: '13m ago',
    unread: true,
    category: 'Solar & inverter',
  },
  {
    id: 3,
    counterpart: 'Skopyr payouts',
    preview: 'NGN 36,000 from the Maitama deep clean job has been released to your payout balance.',
    time: 'Today',
    unread: false,
    category: 'Earnings',
  },
];

const CUSTOMER_REQUESTS: CustomerRequest[] = [
  {
    id: 1,
    title: 'Generator not starting',
    location: 'Games Village',
    budget: 'NGN 15k - NGN 25k',
    bids: 3,
    status: 'Comparing bids',
    provider: '3 verified providers interested',
  },
  {
    id: 2,
    title: 'Deep clean for 3BR flat',
    location: 'Maitama',
    budget: 'NGN 20k - NGN 35k',
    bids: 7,
    status: 'Provider booked',
    provider: 'Sparkle Crew arriving Saturday 9 AM',
  },
  {
    id: 3,
    title: 'Kitchen sink leaking badly',
    location: 'Gwarinpa',
    budget: 'NGN 8k - NGN 15k',
    bids: 5,
    status: 'Escrow active',
    provider: 'Tunde Plumbing has started work',
  },
];

const PROVIDER_LEADS: ProviderLead[] = [
  {
    id: 1,
    requester: 'Aisha Bello',
    service: 'Generator not starting',
    location: 'Games Village',
    budget: 'NGN 15k - NGN 25k',
    urgency: 'ASAP',
    interest: 'Shortlisted you after reading your warranty terms',
  },
  {
    id: 2,
    requester: 'David Ogunleye',
    service: 'Solar inverter inspection',
    location: 'Wuse II',
    budget: 'NGN 30k - NGN 45k',
    urgency: 'Today',
    interest: 'Asked for a direct message before accepting a bid',
  },
  {
    id: 3,
    requester: 'Ngozi Okafor',
    service: 'Routine generator servicing',
    location: 'Gwarinpa',
    budget: 'NGN 18k - NGN 22k',
    urgency: 'This week',
    interest: 'Viewed your profile twice and saved your service card',
  },
];

const PAYOUTS: Payout[] = [
  { id: 1, title: 'Maitama deep clean', amount: 'NGN 36,000', status: 'Released', date: 'Apr 16' },
  { id: 2, title: 'Wuse generator repair', amount: 'NGN 52,000', status: 'Pending', date: 'Apr 15' },
  { id: 3, title: 'Gwarinpa solar inspection', amount: 'NGN 18,500', status: 'Processing', date: 'Apr 13' },
];

function getInitials(value?: string | null) {
  if (!value) {
    return 'SK';
  }

  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 20,
        padding: 24,
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 18,
            fontFamily: fonts.display,
            fontWeight: 700,
            color: colors.text1,
            letterSpacing: '-0.4px',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 13,
            fontFamily: fonts.body,
            color: colors.text3,
            marginTop: 4,
          }}
        >
          {subtitle}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function ProfileDashboard({
  role,
  userName,
  userEmail,
  onRoleChange,
  onHome,
  onBrowse,
  onPost,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setVisible(true), 50);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const stats = role === 'provider' ? PROVIDER_STATS : CUSTOMER_STATS;
  const messages = role === 'provider' ? PROVIDER_MESSAGES : CUSTOMER_MESSAGES;
  const quickAction = role === 'provider'
    ? { label: 'Browse live requests', onClick: onBrowse }
    : { label: 'Post a new request', onClick: onPost };

  const headline = useMemo(() => {
    return role === 'provider'
      ? 'Track leads, reply faster, and stay on top of your earnings.'
      : 'Keep every request, message, and escrow payment in one place.';
  }, [role]);

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
          maxWidth: 1120,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <button
          type="button"
          onClick={onHome}
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
          {'<-'} Home
        </button>

        <div
          style={{
            background: `linear-gradient(135deg, rgba(255,107,43,0.12), rgba(255,255,255,0.03))`,
            border: `1px solid ${colors.accentBorder}`,
            borderRadius: 28,
            padding: 28,
            marginBottom: 22,
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
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 22,
                  background: 'rgba(255,255,255,0.08)',
                  border: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.text1,
                  fontFamily: fonts.display,
                  fontSize: 22,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {getInitials(userName || userEmail)}
              </div>

              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: fonts.body,
                    fontWeight: 700,
                    color: colors.accent,
                    letterSpacing: 2.5,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  {role === 'provider' ? 'Provider profile' : 'Customer profile'}
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 34,
                    fontFamily: fonts.serif,
                    fontWeight: 400,
                    color: colors.text1,
                    lineHeight: 1.1,
                  }}
                >
                  {userName || 'Skopyr account'}
                </h2>
                <p
                  style={{
                    margin: '10px 0 0',
                    fontSize: 14,
                    fontFamily: fonts.body,
                    color: colors.text2,
                    maxWidth: 540,
                    lineHeight: 1.7,
                  }}
                >
                  {headline}
                </p>
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: fonts.body,
                    color: colors.text3,
                    marginTop: 8,
                  }}
                >
                  {userEmail || 'Signed in with Google'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  onClick={() => onRoleChange('customer')}
                  style={{
                    background: role === 'customer' ? colors.accent : 'rgba(255,255,255,0.05)',
                    color: role === 'customer' ? '#fff' : colors.text2,
                    border: `1px solid ${role === 'customer' ? colors.accent : colors.border}`,
                    borderRadius: 999,
                    padding: '10px 16px',
                    fontSize: 13,
                    fontFamily: fonts.body,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  I hire
                </button>
                <button
                  type="button"
                  onClick={() => onRoleChange('provider')}
                  style={{
                    background: role === 'provider' ? colors.accent : 'rgba(255,255,255,0.05)',
                    color: role === 'provider' ? '#fff' : colors.text2,
                    border: `1px solid ${role === 'provider' ? colors.accent : colors.border}`,
                    borderRadius: 999,
                    padding: '10px 16px',
                    fontSize: 13,
                    fontFamily: fonts.body,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  I provide
                </button>
              </div>

              <Button size="sm" onClick={quickAction.onClick}>
                {quickAction.label}
              </Button>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
            marginBottom: 22,
          }}
        >
          {stats.map((item) => (
            <div
              key={item.label}
              style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: 18,
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontFamily: fonts.body,
                  fontWeight: 700,
                  color: colors.text3,
                  letterSpacing: 1.6,
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontFamily: fonts.serif,
                  color: colors.text1,
                  lineHeight: 1,
                  marginBottom: 10,
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontFamily: fonts.body,
                  color: colors.text2,
                  lineHeight: 1.6,
                }}
              >
                {item.note}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20,
          }}
        >
          <Panel
            title={role === 'provider' ? 'Who wants your services' : 'Your requests'}
            subtitle={
              role === 'provider'
                ? 'Fresh demand from customers already leaning toward your profile'
                : 'Track responses, bookings, and escrow progress at a glance'
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {role === 'provider'
                ? PROVIDER_LEADS.map((lead) => (
                    <div
                      key={lead.id}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: `1px solid ${colors.border}`,
                        borderRadius: 16,
                        padding: 16,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 12,
                          flexWrap: 'wrap',
                          marginBottom: 12,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 15,
                              fontFamily: fonts.display,
                              fontWeight: 700,
                              color: colors.text1,
                            }}
                          >
                            {lead.service}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              fontFamily: fonts.body,
                              color: colors.text3,
                              marginTop: 4,
                            }}
                          >
                            {lead.requester} in {lead.location}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            fontFamily: fonts.body,
                            color: colors.accent,
                            fontWeight: 700,
                          }}
                        >
                          {lead.urgency}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 10,
                          fontSize: 12,
                          fontFamily: fonts.body,
                          color: colors.text2,
                          marginBottom: 10,
                        }}
                      >
                        <span>{lead.budget}</span>
                        <span>Interest: {lead.interest}</span>
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          fontFamily: fonts.body,
                          color: colors.success,
                          fontWeight: 700,
                        }}
                      >
                        Ready for message or bid follow-up
                      </div>
                    </div>
                  ))
                : CUSTOMER_REQUESTS.map((request) => (
                    <div
                      key={request.id}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: `1px solid ${colors.border}`,
                        borderRadius: 16,
                        padding: 16,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 12,
                          flexWrap: 'wrap',
                          marginBottom: 10,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 15,
                              fontFamily: fonts.display,
                              fontWeight: 700,
                              color: colors.text1,
                            }}
                          >
                            {request.title}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              fontFamily: fonts.body,
                              color: colors.text3,
                              marginTop: 4,
                            }}
                          >
                            {request.location} · {request.budget}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            fontFamily: fonts.body,
                            color: colors.accent,
                            fontWeight: 700,
                          }}
                        >
                          {request.status}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 12,
                          fontSize: 12,
                          fontFamily: fonts.body,
                          color: colors.text2,
                        }}
                      >
                        <span>{request.bids} bids</span>
                        <span>{request.provider}</span>
                      </div>
                    </div>
                  ))}
            </div>
          </Panel>

          <Panel
            title="Messages"
            subtitle="Stay close to customers, providers, and payout updates"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 16,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontFamily: fonts.display,
                        fontWeight: 700,
                        color: colors.text1,
                      }}
                    >
                      {message.counterpart}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: fonts.body,
                        color: message.unread ? colors.accent : colors.text3,
                        fontWeight: 700,
                      }}
                    >
                      {message.unread ? 'Unread' : message.time}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: fonts.body,
                      color: colors.text3,
                      marginBottom: 8,
                    }}
                  >
                    {message.category}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      fontFamily: fonts.body,
                      color: colors.text2,
                      lineHeight: 1.6,
                    }}
                  >
                    {message.preview}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {role === 'provider' ? (
            <Panel
              title="Earnings tracker"
              subtitle="See what is released, what is pending, and what is on the way"
            >
              <div
                style={{
                  background: 'rgba(255,107,43,0.08)',
                  border: `1px solid ${colors.accentBorder}`,
                  borderRadius: 18,
                  padding: 18,
                  marginBottom: 16,
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
                    marginBottom: 10,
                  }}
                >
                  Available for payout
                </div>
                <div
                  style={{
                    fontSize: 34,
                    fontFamily: fonts.serif,
                    color: colors.text1,
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  NGN 142k
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontFamily: fonts.body,
                    color: colors.text2,
                  }}
                >
                  Next release window: tomorrow by 9:00 AM
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PAYOUTS.map((payout) => (
                  <div
                    key={payout.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '14px 0',
                      borderTop: `1px solid ${colors.border}`,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontFamily: fonts.body,
                          fontWeight: 700,
                          color: colors.text1,
                        }}
                      >
                        {payout.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontFamily: fonts.body,
                          color: colors.text3,
                          marginTop: 4,
                        }}
                      >
                        {payout.date} · {payout.status}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontFamily: fonts.body,
                        color: colors.accent,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {payout.amount}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          ) : (
            <Panel
              title="Booking confidence"
              subtitle="Helpful signals before you pick who should handle the job"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  'All shortlisted providers are NIN-verified and rated above 4.7.',
                  'Two active jobs already have escrow protection switched on.',
                  'Your average provider reply time this week is 8 minutes.',
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${colors.border}`,
                      borderRadius: 16,
                      padding: 16,
                      fontSize: 13,
                      fontFamily: fonts.body,
                      color: colors.text2,
                      lineHeight: 1.7,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
