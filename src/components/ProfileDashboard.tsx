import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
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

interface ConversationEntry {
  id: number;
  sender: string;
  body: string;
  time: string;
  direction: 'incoming' | 'outgoing' | 'system';
}

interface MessageThread {
  id: number;
  counterpart: string;
  preview: string;
  time: string;
  unread: boolean;
  category: string;
  conversation: ConversationEntry[];
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

interface EscrowItem {
  id: number;
  title: string;
  amount: string;
  status: string;
  provider: string;
  updatedAt: string;
  details: string[];
}

interface Payout {
  id: number;
  title: string;
  amount: string;
  status: string;
  date: string;
  details: string[];
}

type DetailState =
  | { kind: 'message'; id: number }
  | { kind: 'request'; id: number }
  | { kind: 'lead'; id: number }
  | { kind: 'escrow'; id: number }
  | { kind: 'payout'; id: number }
  | { kind: 'balance' };

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
    conversation: [
      {
        id: 1,
        sender: 'Amaka Eze',
        body: 'Hi. I checked your generator notes and I can get to Games Village by 3:30 PM.',
        time: '3:21 PM',
        direction: 'incoming',
      },
      {
        id: 2,
        sender: 'Amaka Eze',
        body: 'Do you want me to bring replacement plugs too? I can include them in the same visit.',
        time: '3:23 PM',
        direction: 'incoming',
      },
    ],
  },
  {
    id: 2,
    counterpart: 'Chidi Okonkwo',
    preview: 'I just sent a revised quote that includes diagnostics and fuel system checks.',
    time: '19m ago',
    unread: true,
    category: 'Generator repair',
    conversation: [
      {
        id: 1,
        sender: 'You',
        body: 'Can you confirm if your quote includes diagnostics?',
        time: '2:58 PM',
        direction: 'outgoing',
      },
      {
        id: 2,
        sender: 'Chidi Okonkwo',
        body: 'Yes. I just sent a revised quote that includes diagnostics and fuel system checks.',
        time: '3:08 PM',
        direction: 'incoming',
      },
    ],
  },
  {
    id: 3,
    counterpart: 'Skopyr support',
    preview: 'Your payment for the AC repair job is still protected in escrow until you confirm completion.',
    time: 'Yesterday',
    unread: false,
    category: 'Escrow update',
    conversation: [
      {
        id: 1,
        sender: 'Skopyr support',
        body: 'Your payment for the AC repair job is still protected in escrow until you confirm completion.',
        time: 'Yesterday',
        direction: 'system',
      },
      {
        id: 2,
        sender: 'Skopyr support',
        body: 'Once you mark the work complete, the provider payout starts automatically.',
        time: 'Yesterday',
        direction: 'system',
      },
    ],
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
    conversation: [
      {
        id: 1,
        sender: 'Aisha Bello',
        body: 'Can you still make it to Wuse today if I accept your bid this afternoon?',
        time: '4:10 PM',
        direction: 'incoming',
      },
    ],
  },
  {
    id: 2,
    counterpart: 'David Ogunleye',
    preview: 'I like your profile. Are you available for a same-day solar inverter inspection?',
    time: '13m ago',
    unread: true,
    category: 'Solar and inverter',
    conversation: [
      {
        id: 1,
        sender: 'David Ogunleye',
        body: 'I like your profile. Are you available for a same-day solar inverter inspection?',
        time: '3:57 PM',
        direction: 'incoming',
      },
    ],
  },
  {
    id: 3,
    counterpart: 'Skopyr payouts',
    preview: 'NGN 36,000 from the Maitama deep clean job has been released to your payout balance.',
    time: 'Today',
    unread: false,
    category: 'Earnings',
    conversation: [
      {
        id: 1,
        sender: 'Skopyr payouts',
        body: 'NGN 36,000 from the Maitama deep clean job has been released to your payout balance.',
        time: '11:45 AM',
        direction: 'system',
      },
      {
        id: 2,
        sender: 'Skopyr payouts',
        body: 'It will move to your bank in the next payout window.',
        time: '11:46 AM',
        direction: 'system',
      },
    ],
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

const CUSTOMER_ESCROWS: EscrowItem[] = [
  {
    id: 1,
    title: 'AC repair escrow',
    amount: 'NGN 33,000',
    status: 'Protected',
    provider: 'PolarCool Services',
    updatedAt: 'Updated 20 mins ago',
    details: [
      'Payment is protected until you confirm the compressor issue is fixed.',
      'Provider arrival is scheduled for today at 5:30 PM.',
      'Release happens automatically after your completion confirmation.',
    ],
  },
  {
    id: 2,
    title: 'Kitchen sink repair',
    amount: 'NGN 12,000',
    status: 'Awaiting release',
    provider: 'Tunde Plumbing',
    updatedAt: 'Updated 1 hour ago',
    details: [
      'Work is marked done and waiting for your final confirmation.',
      'Escrow protection still covers the payment until you approve the job.',
      'If you report an issue, payout stays paused.',
    ],
  },
];

const PROVIDER_BALANCE = {
  available: 'NGN 142k',
  pending: 'NGN 42k',
  nextWindow: 'Tomorrow by 9:00 AM',
  details: [
    'Released jobs move here first before bank payout starts.',
    'Pending money includes jobs still inside escrow confirmation windows.',
    'You can track each payout item below and watch the status change.',
  ],
};

const PAYOUTS: Payout[] = [
  {
    id: 1,
    title: 'Maitama deep clean',
    amount: 'NGN 36,000',
    status: 'Released',
    date: 'Apr 16',
    details: [
      'Customer confirmed the job was complete.',
      'Funds have already moved from escrow into your available balance.',
      'Bank transfer is scheduled for the next payout run.',
    ],
  },
  {
    id: 2,
    title: 'Wuse generator repair',
    amount: 'NGN 52,000',
    status: 'Pending',
    date: 'Apr 15',
    details: [
      'Work is complete but the customer has not released funds yet.',
      'Escrow remains locked until the customer confirms or the review window ends.',
      'You can message the customer directly if they need a quick update.',
    ],
  },
  {
    id: 3,
    title: 'Gwarinpa solar inspection',
    amount: 'NGN 18,500',
    status: 'Processing',
    date: 'Apr 13',
    details: [
      'Payout instruction has started and is on the way to your bank.',
      'Skopyr already marked the escrow as released.',
      'Transfer confirmation usually lands within the same business day.',
    ],
  },
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

function getClickableCardStyle(isActive: boolean): CSSProperties {
  return {
    width: '100%',
    background: isActive ? colors.accentDim : 'rgba(255,255,255,0.02)',
    border: `1px solid ${isActive ? colors.accentBorder : colors.border}`,
    borderRadius: 16,
    padding: 16,
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
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
  const [customerThreads, setCustomerThreads] = useState(CUSTOMER_MESSAGES);
  const [providerThreads, setProviderThreads] = useState(PROVIDER_MESSAGES);
  const [activeDetail, setActiveDetail] = useState<DetailState | null>(null);
  const [draftReply, setDraftReply] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setVisible(true), 50);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    setDraftReply('');
    setActiveDetail(null);
  }, [role]);

  const stats = role === 'provider' ? PROVIDER_STATS : CUSTOMER_STATS;
  const messageThreads = role === 'provider' ? providerThreads : customerThreads;
  const quickAction = role === 'provider'
    ? { label: 'Browse live requests', onClick: onBrowse }
    : { label: 'Post a new request', onClick: onPost };

  const headline = useMemo(() => {
    return role === 'provider'
      ? 'Track leads, reply faster, and stay on top of your earnings.'
      : 'Keep every request, message, and escrow payment in one place.';
  }, [role]);

  const updateThreadsForRole = (updater: (threads: MessageThread[]) => MessageThread[]) => {
    if (role === 'provider') {
      setProviderThreads((threads) => updater(threads));
      return;
    }

    setCustomerThreads((threads) => updater(threads));
  };

  const openMessage = (id: number) => {
    updateThreadsForRole((threads) =>
      threads.map((thread) => (thread.id === id ? { ...thread, unread: false } : thread))
    );
    setActiveDetail({ kind: 'message', id });
    setDraftReply('');
  };

  const closeDetail = () => {
    setActiveDetail(null);
    setDraftReply('');
  };

  const handleSendReply = () => {
    if (activeDetail?.kind !== 'message' || !draftReply.trim()) {
      return;
    }

    const body = draftReply.trim();
    const sender = userName || 'You';

    updateThreadsForRole((threads) =>
      threads.map((thread) => {
        if (thread.id !== activeDetail.id) {
          return thread;
        }

        return {
          ...thread,
          unread: false,
          time: 'Just now',
          preview: body,
          conversation: [
            ...thread.conversation,
            {
              id: thread.conversation.length + 1,
              sender,
              body,
              time: 'Just now',
              direction: 'outgoing',
            },
          ],
        };
      })
    );

    setDraftReply('');
  };

  const activeMessage = activeDetail?.kind === 'message'
    ? messageThreads.find((thread) => thread.id === activeDetail.id) ?? null
    : null;
  const activeRequest = activeDetail?.kind === 'request'
    ? CUSTOMER_REQUESTS.find((request) => request.id === activeDetail.id) ?? null
    : null;
  const activeLead = activeDetail?.kind === 'lead'
    ? PROVIDER_LEADS.find((lead) => lead.id === activeDetail.id) ?? null
    : null;
  const activeEscrow = activeDetail?.kind === 'escrow'
    ? CUSTOMER_ESCROWS.find((escrow) => escrow.id === activeDetail.id) ?? null
    : null;
  const activePayout = activeDetail?.kind === 'payout'
    ? PAYOUTS.find((payout) => payout.id === activeDetail.id) ?? null
    : null;

  const openMatchingMessage = (counterpart: string) => {
    const matchingThread = messageThreads.find((thread) => thread.counterpart === counterpart);

    if (matchingThread) {
      openMessage(matchingThread.id);
    }
  };

  const openStatDetail = (label: string) => {
    if (role === 'provider') {
      if (label === 'New leads') {
        setActiveDetail({ kind: 'lead', id: PROVIDER_LEADS[0].id });
        return;
      }

      if (label === 'Earnings this month') {
        setActiveDetail({ kind: 'balance' });
        return;
      }

      setActiveDetail({ kind: 'message', id: messageThreads[0].id });
      return;
    }

    if (label === 'Live requests') {
      setActiveDetail({ kind: 'request', id: CUSTOMER_REQUESTS[0].id });
      return;
    }

    if (label === 'Unread messages') {
      setActiveDetail({ kind: 'message', id: messageThreads[0].id });
      return;
    }

    setActiveDetail({ kind: 'escrow', id: CUSTOMER_ESCROWS[0].id });
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
            background: 'linear-gradient(135deg, rgba(255,107,43,0.12), rgba(255,255,255,0.03))',
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
            <button
              key={item.label}
              type="button"
              onClick={() => openStatDetail(item.label)}
              style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: 18,
                padding: 20,
                cursor: 'pointer',
                textAlign: 'left',
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
              <div
                style={{
                  fontSize: 12,
                  fontFamily: fonts.body,
                  color: colors.accent,
                  fontWeight: 700,
                  marginTop: 12,
                }}
              >
                {'Open details ->'}
              </div>
            </button>
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
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => setActiveDetail({ kind: 'lead', id: lead.id })}
                      style={getClickableCardStyle(activeDetail?.kind === 'lead' && activeDetail.id === lead.id)}
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
                        {'Open lead details ->'}
                      </div>
                    </button>
                  ))
                : CUSTOMER_REQUESTS.map((request) => (
                    <button
                      key={request.id}
                      type="button"
                      onClick={() => setActiveDetail({ kind: 'request', id: request.id })}
                      style={getClickableCardStyle(activeDetail?.kind === 'request' && activeDetail.id === request.id)}
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
                            {request.location} | {request.budget}
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
                          marginBottom: 10,
                        }}
                      >
                        <span>{request.bids} bids</span>
                        <span>{request.provider}</span>
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          fontFamily: fonts.body,
                          color: colors.success,
                          fontWeight: 700,
                        }}
                      >
                        {'Open request details ->'}
                      </div>
                    </button>
                  ))}
            </div>
          </Panel>

          <Panel
            title="Messages"
            subtitle="Open a thread, read the conversation, and send a quick reply"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {messageThreads.map((message) => (
                <button
                  key={message.id}
                  type="button"
                  onClick={() => openMessage(message.id)}
                  style={getClickableCardStyle(activeDetail?.kind === 'message' && activeDetail.id === message.id)}
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
                      marginBottom: 10,
                    }}
                  >
                    {message.preview}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: fonts.body,
                      color: colors.success,
                      fontWeight: 700,
                    }}
                  >
                    {'Open thread ->'}
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          {role === 'provider' ? (
            <Panel
              title="Earnings tracker"
              subtitle="Open balances and payouts to inspect release status"
            >
              <button
                type="button"
                onClick={() => setActiveDetail({ kind: 'balance' })}
                style={{
                  ...getClickableCardStyle(activeDetail?.kind === 'balance'),
                  background: activeDetail?.kind === 'balance' ? 'rgba(255,107,43,0.12)' : 'rgba(255,107,43,0.08)',
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
                  {PROVIDER_BALANCE.available}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontFamily: fonts.body,
                    color: colors.text2,
                    marginBottom: 10,
                  }}
                >
                  Next release window: {PROVIDER_BALANCE.nextWindow}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: fonts.body,
                    color: colors.success,
                    fontWeight: 700,
                  }}
                >
                  {'Open payout balance ->'}
                </div>
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PAYOUTS.map((payout) => (
                  <button
                    key={payout.id}
                    type="button"
                    onClick={() => setActiveDetail({ kind: 'payout', id: payout.id })}
                    style={{
                      ...getClickableCardStyle(activeDetail?.kind === 'payout' && activeDetail.id === payout.id),
                      padding: '14px 16px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
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
                          {payout.date} | {payout.status}
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
                  </button>
                ))}
              </div>
            </Panel>
          ) : (
            <Panel
              title="Escrow wallet"
              subtitle="Open each protected payment and see exactly what is happening"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {CUSTOMER_ESCROWS.map((escrow) => (
                  <button
                    key={escrow.id}
                    type="button"
                    onClick={() => setActiveDetail({ kind: 'escrow', id: escrow.id })}
                    style={getClickableCardStyle(activeDetail?.kind === 'escrow' && activeDetail.id === escrow.id)}
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
                          {escrow.title}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            fontFamily: fonts.body,
                            color: colors.text3,
                            marginTop: 4,
                          }}
                        >
                          {escrow.provider}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontFamily: fonts.body,
                          color: colors.accent,
                          fontWeight: 700,
                        }}
                      >
                        {escrow.amount}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontFamily: fonts.body,
                        color: colors.text2,
                        marginBottom: 10,
                      }}
                    >
                      {escrow.status} | {escrow.updatedAt}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontFamily: fonts.body,
                        color: colors.success,
                        fontWeight: 700,
                      }}
                    >
                      {'Open escrow details ->'}
                    </div>
                  </button>
                ))}
              </div>
            </Panel>
          )}
        </div>

        {activeDetail && (
          <div
            onClick={closeDetail}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 120,
              padding: 20,
            }}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 960,
                maxHeight: '88vh',
                overflowY: 'auto',
              }}
            >
              <Panel
                title="Detail view"
                subtitle="Click any message, request, lead, payout, or escrow item to inspect it here"
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: 18,
                  }}
                >
                  <button
                    type="button"
                    onClick={closeDetail}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${colors.border}`,
                      borderRadius: 999,
                      color: colors.text2,
                      fontFamily: fonts.body,
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '10px 14px',
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                </div>
            {activeMessage && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: 18,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 22,
                        fontFamily: fonts.display,
                        fontWeight: 700,
                        color: colors.text1,
                      }}
                    >
                      Conversation with {activeMessage.counterpart}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontFamily: fonts.body,
                        color: colors.text3,
                        marginTop: 6,
                      }}
                    >
                      {activeMessage.category} | Last update {activeMessage.time}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => openMessage(activeMessage.id)}>
                    Mark as viewed
                  </Button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  {activeMessage.conversation.map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        alignSelf: entry.direction === 'outgoing' ? 'flex-end' : 'stretch',
                        maxWidth: entry.direction === 'outgoing' ? '78%' : '100%',
                        background:
                          entry.direction === 'outgoing'
                            ? colors.accentDim
                            : entry.direction === 'system'
                              ? 'rgba(255,255,255,0.04)'
                              : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${
                          entry.direction === 'outgoing'
                            ? colors.accentBorder
                            : entry.direction === 'system'
                              ? colors.border
                              : colors.border
                        }`,
                        borderRadius: 16,
                        padding: 14,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 10,
                          marginBottom: 8,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontFamily: fonts.body,
                            color: entry.direction === 'outgoing' ? colors.accent : colors.text2,
                            fontWeight: 700,
                          }}
                        >
                          {entry.sender}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: fonts.body,
                            color: colors.text3,
                          }}
                        >
                          {entry.time}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontFamily: fonts.body,
                          color: colors.text1,
                          lineHeight: 1.7,
                        }}
                      >
                        {entry.body}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 18,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: fonts.body,
                      fontWeight: 700,
                      color: colors.accent,
                      letterSpacing: 1.6,
                      textTransform: 'uppercase',
                      marginBottom: 10,
                    }}
                  >
                    Quick reply
                  </div>
                  <textarea
                    value={draftReply}
                    onChange={(event) => setDraftReply(event.target.value)}
                    placeholder={`Reply to ${activeMessage.counterpart}...`}
                    style={{
                      width: '100%',
                      minHeight: 96,
                      background: colors.card,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 12,
                      padding: '14px 16px',
                      color: colors.text1,
                      fontSize: 14,
                      fontFamily: fonts.body,
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      alignItems: 'center',
                      marginTop: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontFamily: fonts.body,
                        color: colors.text3,
                      }}
                    >
                      This reply updates the in-app demo thread instantly.
                    </div>
                    <Button size="sm" onClick={handleSendReply} disabled={!draftReply.trim()}>
                      Send reply
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeRequest && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 22,
                        fontFamily: fonts.display,
                        fontWeight: 700,
                        color: colors.text1,
                      }}
                    >
                      {activeRequest.title}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontFamily: fonts.body,
                        color: colors.text3,
                        marginTop: 6,
                      }}
                    >
                      {activeRequest.location} | {activeRequest.budget}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontFamily: fonts.body,
                      color: colors.accent,
                      fontWeight: 700,
                    }}
                  >
                    {activeRequest.status}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  {[
                    `${activeRequest.bids} active bids are currently attached to this request.`,
                    activeRequest.provider,
                    activeRequest.status === 'Escrow active'
                      ? 'Escrow is already protecting this booking until work is confirmed.'
                      : 'You can keep comparing quotes or move straight into a provider conversation.',
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
              </div>
            )}

            {activeLead && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 22,
                        fontFamily: fonts.display,
                        fontWeight: 700,
                        color: colors.text1,
                      }}
                    >
                      {activeLead.service}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontFamily: fonts.body,
                        color: colors.text3,
                        marginTop: 6,
                      }}
                    >
                      {activeLead.requester} in {activeLead.location} | {activeLead.budget}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontFamily: fonts.body,
                      color: colors.accent,
                      fontWeight: 700,
                    }}
                  >
                    {activeLead.urgency}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                    fontSize: 13,
                    fontFamily: fonts.body,
                    color: colors.text2,
                    lineHeight: 1.7,
                  }}
                >
                  {activeLead.interest}
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Button
                    size="sm"
                    onClick={() => openMatchingMessage(activeLead.requester)}
                    disabled={!messageThreads.some((thread) => thread.counterpart === activeLead.requester)}
                  >
                    Open matching message
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onBrowse}>
                    Browse more jobs
                  </Button>
                </div>
              </div>
            )}

            {activeEscrow && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 22,
                        fontFamily: fonts.display,
                        fontWeight: 700,
                        color: colors.text1,
                      }}
                    >
                      {activeEscrow.title}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontFamily: fonts.body,
                        color: colors.text3,
                        marginTop: 6,
                      }}
                    >
                      {activeEscrow.provider} | {activeEscrow.updatedAt}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontFamily: fonts.display,
                      fontWeight: 700,
                      color: colors.accent,
                    }}
                  >
                    {activeEscrow.amount}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255,107,43,0.08)',
                    border: `1px solid ${colors.accentBorder}`,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: fonts.body,
                      fontWeight: 700,
                      color: colors.accent,
                      marginBottom: 8,
                      textTransform: 'uppercase',
                    }}
                  >
                    Escrow status
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontFamily: fonts.body,
                      color: colors.text1,
                    }}
                  >
                    {activeEscrow.status}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {activeEscrow.details.map((detail) => (
                    <div
                      key={detail}
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
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeDetail?.kind === 'balance' && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 22,
                        fontFamily: fonts.display,
                        fontWeight: 700,
                        color: colors.text1,
                      }}
                    >
                      Provider payout balance
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontFamily: fonts.body,
                        color: colors.text3,
                        marginTop: 6,
                      }}
                    >
                      See available cash, pending escrow, and next release timing
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontFamily: fonts.display,
                      fontWeight: 700,
                      color: colors.accent,
                    }}
                  >
                    {PROVIDER_BALANCE.available}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${colors.border}`,
                      borderRadius: 16,
                      padding: 16,
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
                        marginBottom: 10,
                      }}
                    >
                      Pending inside escrow
                    </div>
                    <div
                      style={{
                        fontSize: 26,
                        fontFamily: fonts.serif,
                        color: colors.text1,
                      }}
                    >
                      {PROVIDER_BALANCE.pending}
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${colors.border}`,
                      borderRadius: 16,
                      padding: 16,
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
                        marginBottom: 10,
                      }}
                    >
                      Next release window
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontFamily: fonts.display,
                        color: colors.text1,
                        fontWeight: 700,
                      }}
                    >
                      {PROVIDER_BALANCE.nextWindow}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                  {PROVIDER_BALANCE.details.map((detail) => (
                    <div
                      key={detail}
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
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePayout && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 22,
                        fontFamily: fonts.display,
                        fontWeight: 700,
                        color: colors.text1,
                      }}
                    >
                      {activePayout.title}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontFamily: fonts.body,
                        color: colors.text3,
                        marginTop: 6,
                      }}
                    >
                      {activePayout.date} | {activePayout.status}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontFamily: fonts.display,
                      fontWeight: 700,
                      color: colors.accent,
                    }}
                  >
                    {activePayout.amount}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {activePayout.details.map((detail) => (
                    <div
                      key={detail}
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
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            )}
              </Panel>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
