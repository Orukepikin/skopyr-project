import { useCallback, useEffect, useState } from 'react';
import type { Session } from 'next-auth';
import {
  createFallbackAd,
  createFallbackBid,
  createFallbackRequest,
  emptyMarketplaceState,
  isSupabaseEnabled,
  markFallbackThreadRead,
  sendFallbackMessage,
  toggleFallbackAd,
  updateFallbackBid,
  updateFallbackRole,
  useMarketplaceFallbackState,
  type AdDraft,
  type AppRole,
  type BidDraft,
  type BidUpdateDraft,
  type CustomerRequest,
  type MarketplaceBid,
  type MarketplaceState,
  type RequestDraft,
  type SendMessageInput,
  type BrowseRequest,
} from '@/lib/marketplace';

type Mode = 'supabase' | 'fallback';
type MarketplaceStateScope = 'public' | 'interactive' | 'full';

async function requestJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  const payload = (await response.json()) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload.message || 'Marketplace request failed.');
  }

  return payload;
}

function mergePublicState(current: MarketplaceState, incoming: MarketplaceState): MarketplaceState {
  return {
    ...current,
    sponsoredAds: incoming.sponsoredAds,
    browseRequests: incoming.browseRequests,
  };
}

function mergeBidIntoState(current: MarketplaceState, bid: MarketplaceBid): MarketplaceState {
  const nextRequestBids = [
    bid,
    ...current.requestBids.filter((existingBid) => existingBid.id !== bid.id),
  ];
  const bidCount = nextRequestBids.filter(
    (existingBid) => existingBid.serviceRequestId === bid.serviceRequestId,
  ).length;
  const providerSummary =
    bidCount > 0
      ? `${bidCount} provider${bidCount === 1 ? '' : 's'} submitted real bids`
      : 'Waiting for provider bids';

  return {
    ...current,
    requestBids: nextRequestBids,
    browseRequests: current.browseRequests.map((request) =>
      request.id === bid.serviceRequestId ? { ...request, bids: bidCount } : request,
    ),
    customerRequests: current.customerRequests.map((request) =>
      request.id === bid.serviceRequestId
        ? {
            ...request,
            bids: bidCount,
            provider: providerSummary,
          }
        : request,
    ),
    providerLeads:
      current.viewer?.id && bid.providerProfileId === current.viewer.id
        ? current.providerLeads.filter((lead) => lead.id !== bid.serviceRequestId)
        : current.providerLeads,
  };
}

function buildLocalCustomerRequest(request: BrowseRequest): CustomerRequest {
  return {
    id: request.id,
    title: request.title,
    location: request.loc,
    budget: request.budget,
    bids: request.bids,
    status: 'Open',
    provider: 'Waiting for provider bids',
  };
}

export function useMarketplace(
  user: Session['user'] | null | undefined,
  requestedScope: MarketplaceStateScope = 'full',
) {
  const supabaseMode = isSupabaseEnabled();
  const [fallbackState, setFallbackState] = useMarketplaceFallbackState({
    email: user?.email,
    name: user?.name,
    image: user?.image,
  });
  const [state, setState] = useState<MarketplaceState>(
    supabaseMode ? emptyMarketplaceState() : fallbackState,
  );
  const [mode, setMode] = useState<Mode>(supabaseMode ? 'supabase' : 'fallback');
  const [loading, setLoading] = useState(supabaseMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (scope: MarketplaceStateScope = requestedScope) => {
    if (!supabaseMode) {
      setMode('fallback');
      setState(fallbackState);
      setLoading(false);
      return fallbackState;
    }

    setMode('supabase');
    setLoading(true);

    try {
      const payload = await requestJson<{ state: MarketplaceState }>(
        scope === 'full' ? '/api/marketplace' : `/api/marketplace?scope=${scope}`,
      );
      setState((current) => (scope === 'public' ? mergePublicState(current, payload.state) : payload.state));
      setError(null);
      return payload.state;
    } catch (refreshError) {
      setError(
        refreshError instanceof Error ? refreshError.message : 'Unable to load marketplace data.',
      );
      throw refreshError;
    } finally {
      setLoading(false);
    }
  }, [fallbackState, requestedScope, supabaseMode]);

  useEffect(() => {
    if (supabaseMode) {
      refresh(requestedScope).catch(() => undefined);
      return;
    }

    setMode('fallback');
    setState(fallbackState);
    setLoading(false);
  }, [fallbackState, refresh, requestedScope, supabaseMode, user?.email]);

  const mutate = useCallback(
    async <T,>(
      action: () => Promise<T>,
      fallbackAction?: () => T,
    ) => {
      if (!supabaseMode && fallbackAction) {
        return fallbackAction();
      }

      setSaving(true);

      try {
        const result = await action();
        setError(null);
        return result;
      } catch (mutationError) {
        setError(
          mutationError instanceof Error
            ? mutationError.message
            : 'Unable to save marketplace changes.',
        );
        throw mutationError;
      } finally {
        setSaving(false);
      }
    },
    [supabaseMode],
  );

  const createRequest = useCallback(
    async (draft: RequestDraft) =>
      mutate(
        async () => {
          const payload = await requestJson<{ request: BrowseRequest }>('/api/marketplace/requests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(draft),
          });
          setState((current) => ({
            ...current,
            browseRequests: [
              payload.request,
              ...current.browseRequests.filter((request) => request.id !== payload.request.id),
            ],
            customerRequests: current.viewer
              ? [
                  buildLocalCustomerRequest(payload.request),
                  ...current.customerRequests.filter((request) => request.id !== payload.request.id),
                ]
              : current.customerRequests,
          }));
          void refresh('interactive').catch(() => undefined);
          return payload.request;
        },
        () => {
          const result = createFallbackRequest(fallbackState, fallbackState.viewer, draft);
          setFallbackState(result.state);
          setState(result.state);
          return result.state.browseRequests.find((request) => request.id === result.requestId) || null;
        },
      ),
    [fallbackState, mutate, refresh, setFallbackState],
  );

  const sendMessage = useCallback(
    async (input: SendMessageInput) =>
      mutate(
        async () => {
          const payload = await requestJson<{ threadId: string }>(
            '/api/marketplace/messages',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(input),
            },
          );
          setState((current) => {
            if (!current.viewer) {
              return current;
            }

            return sendFallbackMessage(current, current.viewer, {
              ...input,
              threadId: payload.threadId,
            }).state;
          });
          return payload.threadId;
        },
        () => {
          const result = sendFallbackMessage(fallbackState, fallbackState.viewer, input);
          setFallbackState(result.state);
          setState(result.state);
          return result.threadId;
        },
      ),
    [fallbackState, mutate, setFallbackState],
  );

  const markThreadRead = useCallback(
    async (role: AppRole, threadId: string) =>
      mutate(
        async () => {
          await requestJson<{ ok: true }>('/api/marketplace/threads/read', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ threadId }),
          });
          setState((current) => markFallbackThreadRead(current, role, threadId));
          return true;
        },
        () => {
          const nextState = markFallbackThreadRead(fallbackState, role, threadId);
          setFallbackState(nextState);
          setState(nextState);
          return true;
        },
      ),
    [fallbackState, mutate, setFallbackState],
  );

  const createAd = useCallback(
    async (draft: AdDraft) =>
      mutate(
        async () => {
          await requestJson('/api/marketplace/ads', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(draft),
          });
          await refresh();
          return true;
        },
        () => {
          const nextState = createFallbackAd(fallbackState, fallbackState.viewer, draft);
          setFallbackState(nextState);
          setState(nextState);
          return true;
        },
      ),
    [fallbackState, mutate, refresh, setFallbackState],
  );

  const createBid = useCallback(
    async (draft: BidDraft) =>
      mutate(
        async () => {
          const payload = await requestJson<{ bid: MarketplaceBid | null }>(
            '/api/marketplace/bids',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(draft),
            },
          );
          if (payload.bid) {
            setState((current) => mergeBidIntoState(current, payload.bid as MarketplaceBid));
          }
          return payload.bid;
        },
        () => {
          const result = createFallbackBid(fallbackState, fallbackState.viewer, draft);
          setFallbackState(result.state);
          setState(result.state);
          return result.state.requestBids.find((bid) => bid.id === result.bidId) || null;
        },
      ),
    [fallbackState, mutate, setFallbackState],
  );

  const updateBid = useCallback(
    async (bidId: string, draft: BidUpdateDraft) =>
      mutate(
        async () => {
          const payload = await requestJson<{ bid: MarketplaceBid | null }>(
            `/api/marketplace/bids/${encodeURIComponent(bidId)}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(draft),
            },
          );
          if (payload.bid) {
            setState((current) => mergeBidIntoState(current, payload.bid as MarketplaceBid));
          }
          return payload.bid;
        },
        () => {
          const result = updateFallbackBid(fallbackState, fallbackState.viewer, bidId, draft);
          setFallbackState(result.state);
          setState(result.state);
          return result.state.requestBids.find((bid) => bid.id === result.bidId) || null;
        },
      ),
    [fallbackState, mutate, setFallbackState],
  );

  const toggleAd = useCallback(
    async (adId: string) =>
      mutate(
        async () => {
          await requestJson(`/api/marketplace/ads/${encodeURIComponent(adId)}`, {
            method: 'PATCH',
          });
          setState((current) => toggleFallbackAd(current, adId));
          return true;
        },
        () => {
          const nextState = toggleFallbackAd(fallbackState, adId);
          setFallbackState(nextState);
          setState(nextState);
          return true;
        },
      ),
    [fallbackState, mutate, setFallbackState],
  );

  const setRolePreference = useCallback(
    async (role: AppRole) =>
      mutate(
        async () => {
          const payload = await requestJson<{ rolePreference: AppRole }>('/api/marketplace/profile', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role }),
          });
          setState((current) => updateFallbackRole(current, role, current.viewer));
          return payload.rolePreference;
        },
        () => {
          const nextState = updateFallbackRole(fallbackState, role, fallbackState.viewer);
          setFallbackState(nextState);
          setState(nextState);
          return role;
        },
      ),
    [fallbackState, mutate, setFallbackState],
  );

  return {
    state,
    mode,
    loading,
    saving,
    error,
    refresh,
    createRequest,
    sendMessage,
    markThreadRead,
    createAd,
    createBid,
    updateBid,
    toggleAd,
    setRolePreference,
  };
}
