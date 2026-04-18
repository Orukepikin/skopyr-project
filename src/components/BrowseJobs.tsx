import { useEffect, useMemo, useState } from 'react';
import { colors, fonts, categories } from '@/lib/constants';
import {
  formatNaira,
  type BidUpdateDraft,
  type BrowseRequest,
  type MarketplaceBid,
} from '@/lib/marketplace';
import Button from './Button';

interface Props {
  onBack: () => void;
  requests: BrowseRequest[];
  providerBidMap: Record<string, MarketplaceBid>;
  canAct: boolean;
  onRequireAuth: () => void | Promise<void>;
  onMessageRequester: (request: BrowseRequest) => void;
  onSubmitBid: (request: BrowseRequest, draft: BidUpdateDraft) => void | Promise<void>;
}

const DEFAULT_BID_DRAFT: BidUpdateDraft = {
  amount: 18000,
  eta: 'Today 4 PM',
  message: 'I can handle this request and keep you updated from arrival to completion.',
};

function suggestBidAmount(budget: string) {
  const match = budget.match(/NGN\s*([0-9]+)\s*k/i);

  if (!match) {
    return DEFAULT_BID_DRAFT.amount;
  }

  return Number.parseInt(match[1], 10) * 1000;
}

export default function BrowseJobs({
  onBack,
  requests,
  providerBidMap,
  canAct,
  onRequireAuth,
  onMessageRequester,
  onSubmitBid,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [bidDraft, setBidDraft] = useState<BidUpdateDraft>(DEFAULT_BID_DRAFT);
  const [savingBid, setSavingBid] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setVisible(true), 50);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const activeRequest = useMemo(
    () => requests.find((request) => request.id === editingRequestId) ?? null,
    [editingRequestId, requests],
  );

  const openBidModal = (request: BrowseRequest) => {
    if (!canAct) {
      setBidError('Sign in with Google to message requesters and send real provider bids.');
      void onRequireAuth();
      return;
    }

    const existingBid = providerBidMap[request.id];
    const suggestedAmount = existingBid?.price || suggestBidAmount(request.budget);

    setBidDraft({
      amount: suggestedAmount,
      eta: existingBid?.eta || 'Today 4 PM',
      message:
        existingBid?.msg ||
        `Hi ${request.requester.split(' ')[0]}, I can help with "${request.title}" and I can start ${request.when.toLowerCase()}.`,
    });
    setBidError(null);
    setEditingRequestId(request.id);
  };

  const closeBidModal = () => {
    setEditingRequestId(null);
    setBidError(null);
    setSavingBid(false);
  };

  const handleSubmitBid = async () => {
    if (!activeRequest || !Number.isFinite(bidDraft.amount) || bidDraft.amount <= 0) {
      setBidError('Add a valid bid amount before sending your quote.');
      return;
    }

    if (!bidDraft.eta.trim() || !bidDraft.message.trim()) {
      setBidError('Add your arrival time and a short note before sending the bid.');
      return;
    }

    try {
      setSavingBid(true);
      setBidError(null);
      await onSubmitBid(activeRequest, {
        amount: Math.round(bidDraft.amount),
        eta: bidDraft.eta.trim(),
        message: bidDraft.message.trim(),
      });
      closeBidModal();
    } catch (error) {
      setBidError(error instanceof Error ? error.message : 'Unable to save your bid right now.');
      setSavingBid(false);
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
          Message requesters directly, send a real quote, and come back later to edit the same bid.
        </p>

        {!canAct && (
          <div
            style={{
              margin: '0 0 20px',
              background: colors.accentDim,
              border: `1px solid ${colors.accentBorder}`,
              borderRadius: 14,
              padding: '14px 16px',
              fontSize: 13,
              fontFamily: fonts.body,
              color: colors.text2,
              lineHeight: 1.7,
            }}
          >
            Sign in with Google first so your bids and buyer conversations are saved to your provider profile.
          </div>
        )}

        {bidError && !editingRequestId && (
          <div
            style={{
              margin: '0 0 16px',
              fontSize: 12,
              fontFamily: fonts.body,
              color: '#FCA5A5',
              lineHeight: 1.6,
            }}
          >
            {bidError}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {requests.map((request, index) => {
            const category = categories.find((item) => item.id === request.cat);
            const existingBid = providerBidMap[request.id];

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
                      {category?.icon || '\u2022'}
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

                      {existingBid && (
                        <div
                          style={{
                            marginTop: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: colors.accentDim,
                            border: `1px solid ${colors.accentBorder}`,
                            borderRadius: 999,
                            padding: '8px 12px',
                            fontSize: 11,
                            fontFamily: fonts.body,
                            color: colors.text1,
                            fontWeight: 700,
                          }}
                        >
                          <span>{existingBid.status}</span>
                          <span>{formatNaira(existingBid.price)}</span>
                          <span>{existingBid.eta}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ minWidth: 210, textAlign: 'right' }}>
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
                      {request.bids < 3 && ' \u00b7 Low competition'}
                    </div>
                    <div
                      style={{
                        marginTop: 14,
                        display: 'flex',
                        gap: 8,
                        justifyContent: 'flex-end',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Button size="sm" variant="ghost" onClick={() => onMessageRequester(request)}>
                        {canAct ? 'Message requester' : 'Sign in to message'}
                      </Button>
                      <Button size="sm" onClick={() => openBidModal(request)}>
                        {existingBid ? 'Edit your bid' : canAct ? 'Send bid' : 'Sign in to bid'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeRequest && (
        <div
          onClick={closeBidModal}
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
              maxWidth: 560,
              background: '#141418',
              border: `1px solid ${colors.border}`,
              borderRadius: 22,
              padding: 28,
              boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: fonts.body,
                    fontWeight: 700,
                    color: colors.accent,
                    letterSpacing: 1.6,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  {providerBidMap[activeRequest.id] ? 'Edit provider bid' : 'Create provider bid'}
                </div>
                <div style={{ fontSize: 24, fontFamily: fonts.display, fontWeight: 700, color: colors.text1 }}>
                  {activeRequest.title}
                </div>
                <div style={{ fontSize: 13, fontFamily: fonts.body, color: colors.text3, marginTop: 8 }}>
                  {activeRequest.requester} | {activeRequest.loc} | {activeRequest.budget}
                </div>
              </div>
              <button
                type="button"
                onClick={closeBidModal}
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
                  height: 'fit-content',
                }}
              >
                Close
              </button>
            </div>

            <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
              <div>
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
                  Your price
                </div>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={bidDraft.amount}
                  onChange={(event) =>
                    setBidDraft((current) => ({
                      ...current,
                      amount: Number.parseInt(event.target.value || '0', 10),
                    }))
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
              </div>

              <div>
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
                  Arrival time
                </div>
                <input
                  value={bidDraft.eta}
                  onChange={(event) =>
                    setBidDraft((current) => ({ ...current, eta: event.target.value }))
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
              </div>

              <div>
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
                  What the buyer should know
                </div>
                <textarea
                  value={bidDraft.message}
                  onChange={(event) =>
                    setBidDraft((current) => ({ ...current, message: event.target.value }))
                  }
                  style={{
                    width: '100%',
                    minHeight: 120,
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
              </div>
            </div>

            {bidError && (
              <div
                style={{
                  marginTop: 14,
                  fontSize: 12,
                  fontFamily: fonts.body,
                  color: '#FCA5A5',
                  lineHeight: 1.6,
                }}
              >
                {bidError}
              </div>
            )}

            <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, fontFamily: fonts.body, color: colors.text3, lineHeight: 1.6, maxWidth: 320 }}>
                This bid becomes a real record the buyer can compare, message against, accept, and fund through escrow.
              </div>
              <Button onClick={() => void handleSubmitBid()} disabled={savingBid}>
                {savingBid
                  ? 'Saving bid...'
                  : providerBidMap[activeRequest.id]
                    ? 'Save bid changes'
                    : 'Send provider bid'}
              </Button>
            </div>
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
      `}</style>
    </div>
  );
}
