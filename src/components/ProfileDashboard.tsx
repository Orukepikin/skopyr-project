import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { colors, fonts } from '@/lib/constants';
import type { DashboardDetail, DashboardRole } from '@/lib/dashboard';
import type {
  AdDraft,
  CustomerRequest,
  EscrowItem,
  MarketplaceThread,
  Payout,
  ProviderBalance,
  ProviderLead,
  SponsoredAd,
} from '@/lib/marketplace';
import Button from './Button';

interface Props {
  role: DashboardRole;
  userName?: string | null;
  userEmail?: string | null;
  customerThreads: MarketplaceThread[];
  providerThreads: MarketplaceThread[];
  sponsoredAds: SponsoredAd[];
  customerRequests: CustomerRequest[];
  providerLeads: ProviderLead[];
  customerEscrows: EscrowItem[];
  providerBalance: ProviderBalance;
  providerPayouts: Payout[];
  initialDetail: DashboardDetail | null;
  onRoleChange: (role: DashboardRole) => void;
  onHome: () => void;
  onBrowse: () => void;
  onPost: () => void;
  onSendMessage: (role: DashboardRole, threadId: string, body: string) => void;
  onOpenThread: (role: DashboardRole, threadId: string) => void;
  onCreateAd: (draft: AdDraft) => void;
  onToggleAd: (adId: string) => void;
  onClearInitialDetail: () => void;
}

interface StatCard {
  label: string;
  value: string;
  note: string;
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

function clickableCardStyle(isActive: boolean): CSSProperties {
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

function EmptyPanelMessage({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px dashed ${colors.border}`,
        borderRadius: 16,
        padding: 18,
        fontSize: 13,
        fontFamily: fonts.body,
        color: colors.text2,
        lineHeight: 1.7,
      }}
    >
      {children}
    </div>
  );
}

export default function ProfileDashboard({
  role,
  userName,
  userEmail,
  customerThreads,
  providerThreads,
  sponsoredAds,
  customerRequests,
  providerLeads,
  customerEscrows,
  providerBalance,
  providerPayouts,
  initialDetail,
  onRoleChange,
  onHome,
  onBrowse,
  onPost,
  onSendMessage,
  onOpenThread,
  onCreateAd,
  onToggleAd,
  onClearInitialDetail,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [activeDetail, setActiveDetail] = useState<DashboardDetail | null>(initialDetail);
  const [draftReply, setDraftReply] = useState('');
  const [adDraft, setAdDraft] = useState<AdDraft>({
    service: '',
    headline: '',
    body: '',
    location: 'Abuja',
    startingPrice: 'From NGN 15k',
    budget: 'NGN 10k / week',
    badge: 'Sponsored',
  });

  const messageThreads = role === 'provider' ? providerThreads : customerThreads;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setVisible(true), 50);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    setDraftReply('');
    setActiveDetail(initialDetail);
  }, [initialDetail, role]);

  useEffect(() => {
    if (activeDetail?.kind === 'message') {
      onOpenThread(role, activeDetail.id);
    }
  }, [activeDetail, onOpenThread, role]);

  const headline = useMemo(
    () =>
      role === 'provider'
        ? 'Track who is interested, reply quickly, run ads, and watch real earnings grow from verified jobs.'
        : 'Keep your inbox, open requests, and protected escrow payments together in one place.',
    [role],
  );

  const stats = useMemo<StatCard[]>(() => {
    if (role === 'provider') {
      return [
        {
          label: 'New leads',
          value: `${providerLeads.length}`,
          note: 'Open requests that match your services and location',
        },
        {
          label: 'Unread messages',
          value: `${messageThreads.filter((thread) => thread.unread).length}`,
          note: 'New buyer conversations waiting on your reply',
        },
        {
          label: 'Earnings this month',
          value: providerBalance.available,
          note: `${providerBalance.pending} is still pending release`,
        },
      ];
    }

    return [
      {
        label: 'Live requests',
        value: `${customerRequests.length}`,
        note: 'Every request you post is saved and can collect provider replies',
      },
      {
        label: 'Unread messages',
        value: `${messageThreads.filter((thread) => thread.unread).length}`,
        note: 'Fast replies help you book the right provider sooner',
      },
      {
        label: 'Escrow protected',
        value: `${customerEscrows.length}`,
        note: 'Track every protected payment until the job is complete',
      },
    ];
  }, [customerEscrows.length, customerRequests.length, messageThreads, providerBalance, providerLeads.length, role]);

  const activeMessage =
    activeDetail?.kind === 'message'
      ? messageThreads.find((thread) => thread.id === activeDetail.id) ?? null
      : null;
  const activeRequest =
    activeDetail?.kind === 'request'
      ? customerRequests.find((request) => request.id === activeDetail.id) ?? null
      : null;
  const activeLead =
    activeDetail?.kind === 'lead'
      ? providerLeads.find((lead) => lead.id === activeDetail.id) ?? null
      : null;
  const activeEscrow =
    activeDetail?.kind === 'escrow'
      ? customerEscrows.find((escrow) => escrow.id === activeDetail.id) ?? null
      : null;
  const activePayout =
    activeDetail?.kind === 'payout'
      ? providerPayouts.find((payout) => payout.id === activeDetail.id) ?? null
      : null;

  const openDetail = (detail: DashboardDetail) => {
    setDraftReply('');
    setActiveDetail(detail);
  };

  const closeDetail = () => {
    setActiveDetail(null);
    setDraftReply('');
    onClearInitialDetail();
  };

  const handleReply = () => {
    if (activeDetail?.kind !== 'message' || !draftReply.trim()) {
      return;
    }

    onSendMessage(role, activeDetail.id, draftReply.trim());
    setDraftReply('');
  };

  const handleCreateAd = () => {
    if (!adDraft.service.trim() || !adDraft.headline.trim() || !adDraft.body.trim()) {
      return;
    }

    onCreateAd({
      ...adDraft,
      service: adDraft.service.trim(),
      headline: adDraft.headline.trim(),
      body: adDraft.body.trim(),
      location: adDraft.location.trim(),
      startingPrice: adDraft.startingPrice.trim(),
      budget: adDraft.budget.trim(),
    });

    setAdDraft({
      service: '',
      headline: '',
      body: '',
      location: 'Abuja',
      startingPrice: 'From NGN 15k',
      budget: 'NGN 10k / week',
      badge: 'Sponsored',
    });
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
                    maxWidth: 580,
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
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
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

              <Button size="sm" onClick={role === 'provider' ? onBrowse : onPost}>
                {role === 'provider' ? 'Browse live requests' : 'Post a new request'}
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
              onClick={() => {
                if (role === 'provider' && item.label === 'New leads' && providerLeads[0]) {
                  openDetail({ kind: 'lead', id: providerLeads[0].id });
                  return;
                }

                if (role === 'provider' && item.label === 'Earnings this month') {
                  openDetail({ kind: 'balance' });
                  return;
                }

                if (role === 'customer' && item.label === 'Live requests' && customerRequests[0]) {
                  openDetail({ kind: 'request', id: customerRequests[0].id });
                  return;
                }

                if (role === 'customer' && item.label === 'Escrow protected' && customerEscrows[0]) {
                  openDetail({ kind: 'escrow', id: customerEscrows[0].id });
                  return;
                }

                if (messageThreads[0]) {
                  openDetail({ kind: 'message', id: messageThreads[0].id });
                }
              }}
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
                ? 'Open requests matched from real buyer activity'
                : 'Requests you posted and the current booking status'
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {role === 'provider'
                ? providerLeads.map((lead) => (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => openDetail({ kind: 'lead', id: lead.id })}
                      style={clickableCardStyle(activeDetail?.kind === 'lead' && activeDetail.id === lead.id)}
                    >
                      <div style={{ fontSize: 16, fontFamily: fonts.display, fontWeight: 700, color: colors.text1 }}>
                        {lead.service}
                      </div>
                      <div style={{ fontSize: 12, fontFamily: fonts.body, color: colors.text3, marginTop: 6 }}>
                        {lead.requester} | {lead.location} | {lead.budget}
                      </div>
                      <div style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text2, lineHeight: 1.7, marginTop: 10 }}>
                        {lead.interest}
                      </div>
                    </button>
                  ))
                : customerRequests.map((request) => (
                    <button
                      key={request.id}
                      type="button"
                      onClick={() => openDetail({ kind: 'request', id: request.id })}
                      style={clickableCardStyle(activeDetail?.kind === 'request' && activeDetail.id === request.id)}
                    >
                      <div style={{ fontSize: 16, fontFamily: fonts.display, fontWeight: 700, color: colors.text1 }}>
                        {request.title}
                      </div>
                      <div style={{ fontSize: 12, fontFamily: fonts.body, color: colors.text3, marginTop: 6 }}>
                        {request.location} | {request.budget}
                      </div>
                      <div style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text2, lineHeight: 1.7, marginTop: 10 }}>
                        {request.status} - {request.provider}
                      </div>
                    </button>
                  ))}

              {(role === 'provider' ? providerLeads.length === 0 : customerRequests.length === 0) && (
                <EmptyPanelMessage>
                  {role === 'provider'
                    ? 'No matching leads yet. Create a sponsored ad or browse open requests to start conversations.'
                    : 'You have not posted any requests yet. Create one and providers can start replying.'}
                </EmptyPanelMessage>
              )}
            </div>
          </Panel>

          <Panel
            title="Inbox"
            subtitle="Cross-user conversations sync across bids, sponsored ads, browse, and profile replies"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messageThreads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => openDetail({ kind: 'message', id: thread.id })}
                  style={clickableCardStyle(activeDetail?.kind === 'message' && activeDetail.id === thread.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 16, fontFamily: fonts.display, fontWeight: 700, color: colors.text1 }}>
                        {thread.counterpart}
                      </div>
                      <div style={{ fontSize: 12, fontFamily: fonts.body, color: colors.text3, marginTop: 6 }}>
                        {thread.subject} | {thread.category}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {thread.unread && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: colors.accent,
                            display: 'inline-block',
                          }}
                        />
                      )}
                      <span style={{ fontSize: 12, fontFamily: fonts.body, color: colors.text3 }}>
                        {thread.time}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text2, lineHeight: 1.7, marginTop: 12 }}>
                    {thread.preview}
                  </div>
                </button>
              ))}

              {messageThreads.length === 0 && (
                <EmptyPanelMessage>
                  Your inbox is still quiet. Start a conversation from a bid, an open request, or a sponsored ad.
                </EmptyPanelMessage>
              )}
            </div>
          </Panel>

          <Panel
            title={role === 'provider' ? 'Money and ads' : 'Escrow tracking'}
            subtitle={
              role === 'provider'
                ? 'Sponsored visibility and real provider earnings from verified jobs'
                : 'Protected payments tied to accepted providers'
            }
          >
            {role === 'provider' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <button
                  type="button"
                  onClick={() => openDetail({ kind: 'balance' })}
                  style={clickableCardStyle(activeDetail?.kind === 'balance')}
                >
                  <div style={{ fontSize: 12, fontFamily: fonts.body, fontWeight: 700, color: colors.text3, letterSpacing: 1.4, textTransform: 'uppercase' }}>
                    Available balance
                  </div>
                  <div style={{ fontSize: 30, fontFamily: fonts.serif, color: colors.text1, marginTop: 8 }}>
                    {providerBalance.available}
                  </div>
                  <div style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text2, marginTop: 10 }}>
                    Pending: {providerBalance.pending} | Next window: {providerBalance.nextWindow}
                  </div>
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {providerPayouts.map((payout) => (
                    <button
                      key={payout.id}
                      type="button"
                      onClick={() => openDetail({ kind: 'payout', id: payout.id })}
                      style={clickableCardStyle(activeDetail?.kind === 'payout' && activeDetail.id === payout.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontSize: 16, fontFamily: fonts.display, fontWeight: 700, color: colors.text1 }}>
                            {payout.title}
                          </div>
                          <div style={{ fontSize: 12, fontFamily: fonts.body, color: colors.text3, marginTop: 6 }}>
                            {payout.date} | {payout.status}
                          </div>
                        </div>
                        <div style={{ fontSize: 18, fontFamily: fonts.display, fontWeight: 700, color: colors.text1 }}>
                          {payout.amount}
                        </div>
                      </div>
                    </button>
                  ))}

                  {providerPayouts.length === 0 && (
                    <EmptyPanelMessage>
                      No verified earnings yet. When a customer accepts and pays a real provider bid, the escrow and payout records will appear here.
                    </EmptyPanelMessage>
                  )}
                </div>

                <div
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 18,
                    padding: 18,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: fonts.body,
                      fontWeight: 700,
                      color: colors.accent,
                      letterSpacing: 1.8,
                      textTransform: 'uppercase',
                      marginBottom: 12,
                    }}
                  >
                    Your sponsored ads
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                    {sponsoredAds.map((ad) => (
                      <div
                        key={ad.id}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: `1px solid ${colors.border}`,
                          borderRadius: 16,
                          padding: 16,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                          <div>
                            <div style={{ fontSize: 16, fontFamily: fonts.display, fontWeight: 700, color: colors.text1 }}>
                              {ad.headline}
                            </div>
                            <div style={{ fontSize: 12, fontFamily: fonts.body, color: colors.text3, marginTop: 6 }}>
                              {ad.service} | {ad.location} | {ad.budget}
                            </div>
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              fontFamily: fonts.body,
                              color: ad.active ? colors.success : colors.text3,
                            }}
                          >
                            {ad.active ? 'Live' : 'Paused'}
                          </div>
                        </div>
                        <div style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text2, lineHeight: 1.7, marginTop: 12 }}>
                          {ad.body}
                        </div>
                        <div style={{ marginTop: 12 }}>
                          <Button size="sm" variant={ad.active ? 'outline' : 'primary'} onClick={() => onToggleAd(ad.id)}>
                            {ad.active ? 'Pause ad' : 'Reactivate ad'}
                          </Button>
                        </div>
                      </div>
                    ))}

                    {sponsoredAds.length === 0 && (
                      <EmptyPanelMessage>
                        You have not launched a sponsored ad yet. Create one below and it will show up above the fold on the homepage.
                      </EmptyPanelMessage>
                    )}
                  </div>

                  {[
                    { key: 'service', label: 'Service' },
                    { key: 'headline', label: 'Headline' },
                    { key: 'body', label: 'Ad copy', multiline: true },
                    { key: 'location', label: 'Target area' },
                    { key: 'startingPrice', label: 'Starting price' },
                    { key: 'budget', label: 'Budget' },
                  ].map((field) => (
                    <div key={field.key} style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontFamily: fonts.body,
                          fontWeight: 700,
                          color: colors.text3,
                          letterSpacing: 1.6,
                          textTransform: 'uppercase',
                          marginBottom: 6,
                        }}
                      >
                        {field.label}
                      </div>
                      {field.multiline ? (
                        <textarea
                          value={adDraft[field.key as keyof AdDraft] as string}
                          onChange={(event) =>
                            setAdDraft((current) => ({ ...current, [field.key]: event.target.value }))
                          }
                          style={{
                            width: '100%',
                            minHeight: 90,
                            background: colors.card,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 12,
                            padding: '12px 14px',
                            color: colors.text1,
                            fontSize: 14,
                            fontFamily: fonts.body,
                            resize: 'vertical',
                            boxSizing: 'border-box',
                          }}
                        />
                      ) : (
                        <input
                          value={adDraft[field.key as keyof AdDraft] as string}
                          onChange={(event) =>
                            setAdDraft((current) => ({ ...current, [field.key]: event.target.value }))
                          }
                          style={{
                            width: '100%',
                            background: colors.card,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 12,
                            padding: '12px 14px',
                            color: colors.text1,
                            fontSize: 14,
                            fontFamily: fonts.body,
                            boxSizing: 'border-box',
                          }}
                        />
                      )}
                    </div>
                  ))}

                  <Button full onClick={handleCreateAd}>
                    Launch sponsored ad
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {customerEscrows.map((escrow) => (
                  <button
                    key={escrow.id}
                    type="button"
                    onClick={() => openDetail({ kind: 'escrow', id: escrow.id })}
                    style={clickableCardStyle(activeDetail?.kind === 'escrow' && activeDetail.id === escrow.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: 16, fontFamily: fonts.display, fontWeight: 700, color: colors.text1 }}>
                          {escrow.title}
                        </div>
                        <div style={{ fontSize: 12, fontFamily: fonts.body, color: colors.text3, marginTop: 6 }}>
                          {escrow.provider} | {escrow.updatedAt}
                        </div>
                      </div>
                      <div style={{ fontSize: 18, fontFamily: fonts.display, fontWeight: 700, color: colors.text1 }}>
                        {escrow.amount}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text2, lineHeight: 1.7, marginTop: 12 }}>
                      {escrow.status}
                    </div>
                  </button>
                ))}

                {customerEscrows.length === 0 && (
                  <EmptyPanelMessage>
                    No escrow records yet. Once you accept and pay a provider, the protected payment will appear here automatically.
                  </EmptyPanelMessage>
                )}
              </div>
            )}
          </Panel>
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
              <Panel title="Detail view" subtitle="Open messages, requests, leads, escrow, and payouts in one place">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
                      <div>
                        <div style={{ fontSize: 22, fontFamily: fonts.display, fontWeight: 700, color: colors.text1 }}>
                          Conversation with {activeMessage.counterpart}
                        </div>
                        <div style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text3, marginTop: 6 }}>
                          {activeMessage.subject} | {activeMessage.category}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, fontFamily: fonts.body, color: colors.text3 }}>
                        {activeMessage.time}
                      </div>
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
                            border: `1px solid ${entry.direction === 'outgoing' ? colors.accentBorder : colors.border}`,
                            borderRadius: 16,
                            padding: 14,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
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
                            <span style={{ fontSize: 11, fontFamily: fonts.body, color: colors.text3 }}>
                              {entry.time}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text1, lineHeight: 1.7 }}>
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 12, fontFamily: fonts.body, color: colors.text3 }}>
                          Replies write back into the same buyer and provider inbox thread.
                        </div>
                        <Button size="sm" onClick={handleReply} disabled={!draftReply.trim()}>
                          Send reply
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeRequest && (
                  <div>
                    <div style={{ fontSize: 22, fontFamily: fonts.display, fontWeight: 700, color: colors.text1 }}>
                      {activeRequest.title}
                    </div>
                    <div style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text3, marginTop: 6 }}>
                      {activeRequest.location} | {activeRequest.budget} | {activeRequest.status}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 16 }}>
                      {[`${activeRequest.bids} live bid${activeRequest.bids === 1 ? '' : 's'} are linked to this request.`, activeRequest.provider, 'You can keep comparing, message providers directly, or move into a protected payment flow.'].map((item) => (
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
                    <div style={{ fontSize: 22, fontFamily: fonts.display, fontWeight: 700, color: colors.text1 }}>
                      {activeLead.service}
                    </div>
                    <div style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text3, marginTop: 6 }}>
                      {activeLead.requester} in {activeLead.location} | {activeLead.budget} | {activeLead.urgency}
                    </div>
                    <div
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: `1px solid ${colors.border}`,
                        borderRadius: 16,
                        padding: 16,
                        marginTop: 16,
                        fontSize: 13,
                        fontFamily: fonts.body,
                        color: colors.text2,
                        lineHeight: 1.7,
                      }}
                    >
                      {activeLead.interest}
                    </div>
                  </div>
                )}

                {activeEscrow && (
                  <div>
                    <div style={{ fontSize: 22, fontFamily: fonts.display, fontWeight: 700, color: colors.text1 }}>
                      {activeEscrow.title}
                    </div>
                    <div style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text3, marginTop: 6 }}>
                      {activeEscrow.provider} | {activeEscrow.updatedAt} | {activeEscrow.amount}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
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

                {activeDetail.kind === 'balance' && (
                  <div>
                    <div style={{ fontSize: 22, fontFamily: fonts.display, fontWeight: 700, color: colors.text1 }}>
                      Provider payout balance
                    </div>
                    <div style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text3, marginTop: 6 }}>
                      Available: {providerBalance.available} | Pending: {providerBalance.pending} | Next window: {providerBalance.nextWindow}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                      {providerBalance.details.map((detail) => (
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
                    <div style={{ fontSize: 22, fontFamily: fonts.display, fontWeight: 700, color: colors.text1 }}>
                      {activePayout.title}
                    </div>
                    <div style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text3, marginTop: 6 }}>
                      {activePayout.date} | {activePayout.status} | {activePayout.amount}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
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
