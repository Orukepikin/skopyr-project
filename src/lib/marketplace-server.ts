import crypto from 'node:crypto';
import type { Session } from 'next-auth';
import {
  buildSponsoredAdWindow,
  createThreadKey,
  emptyMarketplaceState,
  formatBudget,
  formatClockTime,
  formatNaira,
  formatRelativeTime,
  getSponsoredAdPlan,
  getSponsoredAdPlanFromBudgetLabel,
  isSponsoredAdExpired,
  nextPayoutWindowLabel,
  normalizeServiceLabel,
  type AdDraft,
  type BidDraft,
  type BidUpdateDraft,
  type AppRole,
  type BrowseRequest,
  type MarketplaceBid,
  type MarketplaceState,
  type ProfileSummary,
  type RequestDraft,
  type SendMessageInput,
  type SponsoredAd,
} from '@/lib/marketplace';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

type SessionUser = {
  email: string;
  name?: string | null;
  image?: string | null;
};

interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role_preference: AppRole;
  verified: boolean | null;
  rating_average: number | null;
  completed_jobs: number | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

interface ThreadRow {
  id: string;
  customer_profile_id: string;
  provider_profile_id: string;
  subject: string;
  category: string;
  service_request_id: string | null;
  last_message_preview: string | null;
  last_message_at: string;
  customer_last_read_at: string | null;
  provider_last_read_at: string | null;
  created_at: string;
}

interface MessageRow {
  id: string;
  thread_id: string;
  sender_profile_id: string | null;
  body: string;
  created_at: string;
}

interface ServiceRequestRow {
  id: string;
  customer_profile_id: string;
  category_id: string;
  category_name: string;
  title: string;
  summary: string;
  budget_min: number;
  budget_max: number;
  location: string;
  urgency: string;
  status: string;
  bid_count: number;
  created_at: string;
  updated_at: string;
}

interface ProviderBidRow {
  id: string;
  service_request_id: string;
  provider_profile_id: string;
  amount_kobo: number;
  eta_label: string;
  message: string;
  status: 'Submitted' | 'Accepted';
  created_at: string;
  updated_at: string;
}

interface SponsoredAdRow {
  id: string;
  provider_profile_id: string;
  service: string;
  headline: string;
  body: string;
  location: string;
  starting_price: string;
  budget: string;
  badge: string;
  active: boolean;
  created_at: string;
}

interface EscrowRow {
  id: string;
  service_request_id: string | null;
  customer_profile_id: string;
  provider_profile_id: string | null;
  title: string;
  amount_kobo: number;
  status: string;
  paystack_reference: string;
  provider_name_snapshot: string;
  notes: string[] | null;
  updated_at: string;
  created_at: string;
}

interface EarningsRow {
  id: string;
  provider_profile_id: string;
  escrow_account_id: string;
  title: string;
  amount_kobo: number;
  status: string;
  payout_date: string | null;
  notes: string[] | null;
  created_at: string;
}

interface PaystackTransactionRow {
  id: string;
  paystack_reference: string;
  customer_profile_id: string;
  provider_profile_id: string | null;
  provider_name_snapshot: string;
  service_request_id: string | null;
  title: string;
  category: string;
  amount_kobo: number;
  platform_fee_kobo: number;
  total_amount_kobo: number;
  status: string;
  created_at: string;
  verified_at: string | null;
}

interface PaymentIntentInput {
  reference: string;
  user: SessionUser;
  providerProfileId?: string | null;
  providerName: string;
  serviceRequestId?: string | null;
  title: string;
  category: string;
  amountKobo: number;
  platformFeeKobo: number;
  totalAmountKobo: number;
}

export type MarketplaceStateScope = 'public' | 'interactive' | 'full';

function requireSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  return getSupabaseAdmin();
}

function isMissingProviderBidTableError(error: { message?: string } | null | undefined) {
  return Boolean(
    error?.message &&
      error.message.includes('provider_bids') &&
      error.message.includes('does not exist'),
  );
}

function ensureSessionUser(user: Session['user'] | undefined | null): SessionUser {
  if (!user?.email) {
    throw new Error('Sign in with Google before using marketplace actions.');
  }

  return user as SessionUser;
}

function toProfileSummary(row: ProfileRow): ProfileSummary {
  return {
    id: row.id,
    email: row.email,
    name: row.full_name || row.email.split('@')[0] || 'Skopyr member',
    image: row.avatar_url,
    rolePreference: row.role_preference,
    verified: row.verified ?? true,
    rating: Number(row.rating_average ?? 4.8),
    completedJobs: row.completed_jobs ?? 0,
    city: row.city || 'Abuja',
  };
}

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

async function fetchProfiles(ids: string[]) {
  if (ids.length === 0) {
    return new Map<string, ProfileRow>();
  }

  const supabase = requireSupabase();
  const { data, error } = await supabase.from('profiles').select('*').in('id', ids);

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data as ProfileRow[]).map((row) => [row.id, row]));
}

async function ensureProfile(user: SessionUser, rolePreference?: AppRole) {
  const supabase = requireSupabase();
  const now = new Date().toISOString();
  const { data: existingData, error: existingError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();
  const existing = existingData as ProfileRow | null;

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    const updates: Partial<ProfileRow> = {};

    if (user.name && user.name !== existing.full_name) {
      updates.full_name = user.name;
    }

    if (user.image && user.image !== existing.avatar_url) {
      updates.avatar_url = user.image;
    }

    if (rolePreference && rolePreference !== existing.role_preference) {
      updates.role_preference = rolePreference;
    }

    if (Object.keys(updates).length > 0) {
      const { data: updatedData, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: now,
        })
        .eq('id', existing.id)
        .select('*')
        .single();
      const updated = updatedData as ProfileRow;

      if (updateError) {
        throw new Error(updateError.message);
      }

      return updated as ProfileRow;
    }

    return existing as ProfileRow;
  }

  const { data: insertedData, error: insertError } = await supabase
    .from('profiles')
    .insert({
      email: user.email,
      full_name: user.name || user.email.split('@')[0],
      avatar_url: user.image || null,
      role_preference: rolePreference || 'customer',
      verified: true,
      rating_average: 4.8,
      completed_jobs: 0,
      city: 'Abuja',
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single();
  const inserted = insertedData as ProfileRow;

  if (insertError) {
    throw new Error(insertError.message);
  }

  return inserted as ProfileRow;
}

function mapSponsoredAd(row: SponsoredAdRow, profile: ProfileRow | undefined): SponsoredAd {
  const summary = profile ? toProfileSummary(profile) : null;
  const plan = getSponsoredAdPlanFromBudgetLabel(row.budget);
  const lifecycle =
    plan.id === 'legacy_featured'
      ? { active: row.active, expiresAt: null as string | null, paymentStatus: 'paid' as const }
      : {
          active: row.active && !isSponsoredAdExpired(buildSponsoredAdWindow(plan.id, row.created_at).expiresAt),
          expiresAt: buildSponsoredAdWindow(plan.id, row.created_at).expiresAt,
          paymentStatus: 'paid' as const,
        };

  return {
    id: row.id,
    providerProfileId: row.provider_profile_id,
    providerName: summary?.name || row.provider_profile_id,
    planId: plan.id,
    service: row.service,
    headline: row.headline,
    body: row.body,
    location: row.location,
    startingPrice: row.starting_price,
    cta: 'Message sponsor',
    badge: row.badge,
    budget: row.budget,
    active: lifecycle.active,
    paymentStatus: lifecycle.paymentStatus,
    createdAt: row.created_at,
    expiresAt: lifecycle.expiresAt,
    rating: summary?.rating ?? 4.8,
    jobs: summary?.completedJobs ?? 0,
    verified: summary?.verified ?? true,
  };
}

function mapBrowseRequest(row: ServiceRequestRow, profile: ProfileRow | undefined): BrowseRequest {
  return {
    id: row.id,
    title: row.title,
    cat: row.category_id,
    categoryName: row.category_name,
    budget: formatBudget(row.budget_min, row.budget_max),
    loc: row.location,
    when: row.urgency,
    bids: row.bid_count,
    ago: formatRelativeTime(row.created_at),
    requester: profile?.full_name || profile?.email.split('@')[0] || 'Skopyr member',
    requesterProfileId: row.customer_profile_id,
    summary: row.summary,
  };
}

function mapMarketplaceBid(
  row: ProviderBidRow,
  providerProfile: ProfileRow | undefined,
  requestRow: ServiceRequestRow | undefined,
  requesterProfile: ProfileRow | undefined,
): MarketplaceBid | null {
  if (!requestRow) {
    return null;
  }

  return {
    id: row.id,
    serviceRequestId: row.service_request_id,
    requestTitle: requestRow.title,
    requestBudget: formatBudget(requestRow.budget_min, requestRow.budget_max),
    requesterName:
      requesterProfile?.full_name ||
      requesterProfile?.email.split('@')[0] ||
      'Skopyr member',
    requesterProfileId: requestRow.customer_profile_id,
    category: requestRow.category_name,
    providerProfileId: row.provider_profile_id,
    name:
      providerProfile?.full_name ||
      providerProfile?.email.split('@')[0] ||
      'Provider',
    rating: Number(providerProfile?.rating_average ?? 4.8),
    jobs: providerProfile?.completed_jobs ?? 0,
    price: Math.round(row.amount_kobo / 100),
    avatar:
      providerProfile?.full_name
        ?.split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || 'SK',
    verified: providerProfile?.verified ?? true,
    msg: row.message,
    eta: row.eta_label,
    time: formatRelativeTime(row.updated_at),
    location: requestRow.location,
    status: row.status === 'Accepted' ? 'Accepted' : 'Submitted',
    updatedAt: row.updated_at,
  };
}

async function fetchSponsoredAds() {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('sponsored_ads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data as SponsoredAdRow[]) ?? [];
  const profileMap = await fetchProfiles(uniqueValues(rows.map((row) => row.provider_profile_id)));
  return rows.map((row) => mapSponsoredAd(row, profileMap.get(row.provider_profile_id)));
}

async function fetchServiceRequests(limit = 18) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .neq('status', 'Cancelled')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data as ServiceRequestRow[]) ?? [];
  const profileMap = await fetchProfiles(uniqueValues(rows.map((row) => row.customer_profile_id)));

  return {
    rows,
    mapped: rows.map((row) => mapBrowseRequest(row, profileMap.get(row.customer_profile_id))),
  };
}

async function fetchRequestRowsByIds(ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  const supabase = requireSupabase();
  const { data, error } = await supabase.from('service_requests').select('*').in('id', ids);

  if (error) {
    throw new Error(error.message);
  }

  return (data as ServiceRequestRow[]) ?? [];
}

async function fetchRelevantBidRows(viewerId: string, customerRequestIds: string[]) {
  const supabase = requireSupabase();
  const bidRowsById = new Map<string, ProviderBidRow>();

  const queries = [
    supabase.from('provider_bids').select('*').eq('provider_profile_id', viewerId),
  ];

  if (customerRequestIds.length > 0) {
    queries.push(
      supabase.from('provider_bids').select('*').in('service_request_id', customerRequestIds),
    );
  }

  const results = await Promise.all(queries);

  for (const result of results) {
    if (result.error) {
      if (isMissingProviderBidTableError(result.error)) {
        return [];
      }

      throw new Error(result.error.message);
    }

    for (const row of (result.data as ProviderBidRow[]) ?? []) {
      bidRowsById.set(row.id, row);
    }
  }

  return Array.from(bidRowsById.values());
}

async function mapBidRows(
  rows: ProviderBidRow[],
  requestRows: ServiceRequestRow[] = [],
) {
  if (rows.length === 0) {
    return [];
  }

  const requestRowMap = new Map(requestRows.map((row) => [row.id, row]));
  const missingRequestIds = uniqueValues(
    rows
      .map((row) => row.service_request_id)
      .filter((requestId) => !requestRowMap.has(requestId)),
  );
  const loadedRequestRows = await fetchRequestRowsByIds(missingRequestIds);

  loadedRequestRows.forEach((row) => {
    requestRowMap.set(row.id, row);
  });

  const providerProfiles = await fetchProfiles(
    uniqueValues(rows.map((row) => row.provider_profile_id)),
  );
  const requesterProfiles = await fetchProfiles(
    uniqueValues(
      Array.from(requestRowMap.values()).map((row) => row.customer_profile_id),
    ),
  );

  return rows
    .map((row) =>
      mapMarketplaceBid(
        row,
        providerProfiles.get(row.provider_profile_id),
        requestRowMap.get(row.service_request_id),
        requesterProfiles.get(requestRowMap.get(row.service_request_id)?.customer_profile_id || ''),
      ),
    )
    .filter((bid): bid is MarketplaceBid => Boolean(bid));
}

function buildProviderLeads(
  requestRows: ServiceRequestRow[],
  profileMap: Map<string, ProfileRow>,
  viewer: ProfileRow,
  providerAds: SponsoredAd[],
  bidRows: ProviderBidRow[],
) {
  const requestIdsWithExistingBid = new Set(
    bidRows
      .filter((row) => row.provider_profile_id === viewer.id)
      .map((row) => row.service_request_id),
  );
  const viewerServiceText = providerAds
    .filter((ad) => ad.providerProfileId === viewer.id && ad.active)
    .map((ad) => normalizeServiceLabel(`${ad.service} ${ad.headline}`));

  const rows = requestRows.filter((row) => {
    if (row.customer_profile_id === viewer.id) {
      return false;
    }

    if (requestIdsWithExistingBid.has(row.id)) {
      return false;
    }

    if (viewerServiceText.length === 0) {
      return true;
    }

    const requestText = normalizeServiceLabel(
      `${row.category_name} ${row.title} ${row.summary} ${row.location}`,
    );

    return viewerServiceText.some(
      (serviceText) =>
        requestText.includes(serviceText) || serviceText.includes(normalizeServiceLabel(row.category_name)),
    );
  });

  return rows.slice(0, 8).map((row) => ({
    id: row.id,
    requester: profileMap.get(row.customer_profile_id)?.full_name || 'Skopyr member',
    requesterProfileId: row.customer_profile_id,
    service: row.title,
    location: row.location,
    budget: formatBudget(row.budget_min, row.budget_max),
    urgency: row.urgency,
    interest: `Open request for ${row.category_name.toLowerCase()} in ${row.location}. Reach out early to win the job.`,
  }));
}

async function fetchThreadRows(viewerId: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('threads')
    .select('*')
    .or(`customer_profile_id.eq.${viewerId},provider_profile_id.eq.${viewerId}`)
    .order('last_message_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as ThreadRow[]) ?? [];
}

async function fetchMessagesByThreadIds(threadIds: string[]) {
  if (threadIds.length === 0) {
    return new Map<string, MessageRow[]>();
  }

  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .in('thread_id', threadIds)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data as MessageRow[]) ?? [];
  return rows.reduce((accumulator, row) => {
    const existing = accumulator.get(row.thread_id) || [];
    existing.push(row);
    accumulator.set(row.thread_id, existing);
    return accumulator;
  }, new Map<string, MessageRow[]>());
}

function mapThreadCollection(
  rows: ThreadRow[],
  messagesByThreadId: Map<string, MessageRow[]>,
  profileMap: Map<string, ProfileRow>,
  viewer: ProfileRow,
  role: AppRole,
) {
  return rows
    .filter((row) =>
      role === 'customer' ? row.customer_profile_id === viewer.id : row.provider_profile_id === viewer.id,
    )
    .map((row) => {
      const counterpartId =
        role === 'customer' ? row.provider_profile_id : row.customer_profile_id;
      const counterpart = profileMap.get(counterpartId);
      const conversation = (messagesByThreadId.get(row.id) || []).map((message) => {
        const outgoing = message.sender_profile_id === viewer.id;
        const senderProfile = message.sender_profile_id
          ? profileMap.get(message.sender_profile_id)
          : null;
        const direction: 'incoming' | 'outgoing' = outgoing ? 'outgoing' : 'incoming';

        return {
          id: message.id,
          sender: outgoing ? 'You' : senderProfile?.full_name || counterpart?.full_name || 'Skopyr member',
          body: message.body,
          time: formatClockTime(message.created_at),
          direction,
        };
      });

      const unread =
        role === 'customer'
          ? Boolean(
              row.last_message_at &&
                (!row.customer_last_read_at ||
                  new Date(row.customer_last_read_at).getTime() <
                    new Date(row.last_message_at).getTime()),
            )
          : Boolean(
              row.last_message_at &&
                (!row.provider_last_read_at ||
                  new Date(row.provider_last_read_at).getTime() <
                    new Date(row.last_message_at).getTime()),
            );

      return {
        id: row.id,
        threadKey: createThreadKey(row.subject, counterpart?.full_name || 'provider'),
        counterpart: counterpart?.full_name || counterpart?.email || 'Skopyr member',
        counterpartProfileId: counterpartId,
        category: row.category,
        preview: row.last_message_preview || conversation.at(-1)?.body || 'New conversation',
        time: formatRelativeTime(row.last_message_at || row.created_at),
        unread,
        subject: row.subject,
        serviceRequestId: row.service_request_id,
        conversation,
      };
    });
}

function buildCustomerRequestCards(
  rows: ServiceRequestRow[],
  viewerId: string,
  bidRows: ProviderBidRow[],
  profileMap: Map<string, ProfileRow>,
) {
  return rows
    .filter((row) => row.customer_profile_id === viewerId)
    .map((row) => {
      const requestBids = bidRows.filter((bid) => bid.service_request_id === row.id);
      const acceptedBid = requestBids.find((bid) => bid.status === 'Accepted');
      const acceptedProvider = acceptedBid
        ? profileMap.get(acceptedBid.provider_profile_id)
        : null;

      return {
        id: row.id,
        title: row.title,
        location: row.location,
        budget: formatBudget(row.budget_min, row.budget_max),
        bids: row.bid_count,
        status: row.status,
        provider:
          row.status === 'Escrow active'
            ? `${acceptedProvider?.full_name || 'Accepted provider'} is booked with payment protected in escrow`
            : row.bid_count > 0
              ? `${row.bid_count} provider${row.bid_count === 1 ? '' : 's'} submitted real bids`
              : 'Waiting for provider bids',
      };
    });
}

async function fetchEscrowsForCustomer(viewerId: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('escrow_accounts')
    .select('*')
    .eq('customer_profile_id', viewerId)
    .order('updated_at', { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data as EscrowRow[]) ?? [];
  const providerProfiles = await fetchProfiles(
    uniqueValues(rows.map((row) => row.provider_profile_id)),
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    amount: formatNaira(row.amount_kobo / 100),
    status: row.status,
    provider:
      providerProfiles.get(row.provider_profile_id || '')?.full_name || row.provider_name_snapshot,
    updatedAt: `Updated ${formatRelativeTime(row.updated_at)} ago`,
    details:
      row.notes && row.notes.length > 0
        ? row.notes
        : [
            'Payment is protected until the customer confirms the work is complete.',
            'If there is an issue, Skopyr support can keep the payout paused while it is reviewed.',
            'Once completion is confirmed, payout starts automatically.',
          ],
  }));
}

async function fetchProviderEarnings(viewerId: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('earnings_records')
    .select('*')
    .eq('provider_profile_id', viewerId)
    .order('created_at', { ascending: false })
    .limit(12);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data as EarningsRow[]) ?? [];
  const available = rows
    .filter((row) => row.status === 'Released')
    .reduce((sum, row) => sum + row.amount_kobo, 0);
  const pending = rows
    .filter((row) => row.status !== 'Released')
    .reduce((sum, row) => sum + row.amount_kobo, 0);

  return {
    balance: {
      available: formatNaira(available / 100),
      pending: formatNaira(pending / 100),
      nextWindow: nextPayoutWindowLabel(),
      details: [
        'Released jobs move here first before bank payout starts.',
        'Pending money includes jobs still inside escrow confirmation windows.',
        'Sponsored ads help you get discovered, but completed jobs are what grow this balance.',
      ],
    },
    payouts: rows.map((row) => ({
      id: row.id,
      title: row.title,
      amount: formatNaira(row.amount_kobo / 100),
      status: row.status,
      date:
        row.payout_date ||
        new Date(row.created_at).toLocaleDateString('en-NG', {
          month: 'short',
          day: 'numeric',
        }),
      details:
        row.notes && row.notes.length > 0
          ? row.notes
          : [
              'This earnings record came from a verified Paystack escrow payment.',
              'It will keep moving through the payout states as the job is confirmed.',
            ],
    })),
  };
}

export async function getMarketplaceState(
  sessionUser: Session['user'] | null | undefined,
  scope: MarketplaceStateScope = 'full',
) {
  if (!isSupabaseConfigured()) {
    return emptyMarketplaceState();
  }

  const state = emptyMarketplaceState();
  const [sponsoredAds, requestData] = await Promise.all([fetchSponsoredAds(), fetchServiceRequests()]);
  state.sponsoredAds = sponsoredAds;
  state.browseRequests = requestData.mapped;

  if (scope === 'public' || !sessionUser?.email) {
    return state;
  }

  const viewer = await ensureProfile(ensureSessionUser(sessionUser));
  const viewerSummary = toProfileSummary(viewer);
  state.viewer = viewerSummary;
  const customerRequestIds = requestData.rows
    .filter((row) => row.customer_profile_id === viewer.id)
    .map((row) => row.id);

  if (scope === 'interactive') {
    const bidRows = await fetchRelevantBidRows(viewer.id, customerRequestIds);
    const requestProfileMap = await fetchProfiles(
      uniqueValues(requestData.rows.map((row) => row.customer_profile_id)),
    );
    const requestBidProfiles = await fetchProfiles(
      uniqueValues(bidRows.map((row) => row.provider_profile_id)),
    );
    const requestRowMap = new Map(requestData.rows.map((row) => [row.id, row]));

    state.requestBids = bidRows
      .map((row) =>
        mapMarketplaceBid(
          row,
          requestBidProfiles.get(row.provider_profile_id),
          requestRowMap.get(row.service_request_id),
          requestProfileMap.get(requestRowMap.get(row.service_request_id)?.customer_profile_id || ''),
        ),
      )
      .filter((bid): bid is MarketplaceBid => Boolean(bid));

    return state;
  }

  const [threadRows, customerEscrows, providerEarnings, bidRows] = await Promise.all([
    fetchThreadRows(viewer.id),
    fetchEscrowsForCustomer(viewer.id),
    fetchProviderEarnings(viewer.id),
    fetchRelevantBidRows(viewer.id, customerRequestIds),
  ]);
  const participantIds = uniqueValues(
    threadRows.flatMap((row) => [row.customer_profile_id, row.provider_profile_id]),
  );
  const requestProfileMap = await fetchProfiles(
    uniqueValues(requestData.rows.map((row) => row.customer_profile_id)),
  );
  const participantProfiles = await fetchProfiles(participantIds);
  const messagesByThreadId = await fetchMessagesByThreadIds(threadRows.map((row) => row.id));
  const requestBidProfiles = await fetchProfiles(
    uniqueValues(bidRows.map((row) => row.provider_profile_id)),
  );
  const providerLeads = buildProviderLeads(
    requestData.rows,
    requestProfileMap,
    viewer,
    sponsoredAds,
    bidRows,
  );
  const requestRowMap = new Map(requestData.rows.map((row) => [row.id, row]));

  state.customerThreads = mapThreadCollection(
    threadRows,
    messagesByThreadId,
    participantProfiles,
    viewer,
    'customer',
  );
  state.providerThreads = mapThreadCollection(
    threadRows,
    messagesByThreadId,
    participantProfiles,
    viewer,
    'provider',
  );
  state.requestBids = bidRows
    .map((row) =>
      mapMarketplaceBid(
        row,
        requestBidProfiles.get(row.provider_profile_id),
        requestRowMap.get(row.service_request_id),
        requestProfileMap.get(requestRowMap.get(row.service_request_id)?.customer_profile_id || ''),
      ),
    )
    .filter((bid): bid is MarketplaceBid => Boolean(bid));
  state.customerRequests = buildCustomerRequestCards(
    requestData.rows,
    viewer.id,
    bidRows,
    requestBidProfiles,
  );
  state.customerEscrows = customerEscrows;
  state.providerLeads = providerLeads;
  state.providerBalance = providerEarnings.balance;
  state.providerPayouts = providerEarnings.payouts;

  return state;
}

export async function updateProfileRole(sessionUser: Session['user'] | null | undefined, role: AppRole) {
  const viewer = await ensureProfile(ensureSessionUser(sessionUser), role);
  return toProfileSummary(viewer);
}

export async function createMarketplaceRequest(
  sessionUser: Session['user'] | null | undefined,
  draft: RequestDraft,
) {
  const viewer = await ensureProfile(ensureSessionUser(sessionUser), 'customer');
  const supabase = requireSupabase();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('service_requests')
    .insert({
      customer_profile_id: viewer.id,
      category_id: draft.categoryId,
      category_name: draft.categoryName,
      title: draft.title,
      summary: draft.summary,
      budget_min: draft.budgetMin,
      budget_max: draft.budgetMax,
      location: draft.location,
      urgency: draft.urgency,
      status: 'Open',
      bid_count: 0,
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapBrowseRequest(data as ServiceRequestRow, viewer);
}

function sanitizeAdDraft(draft: AdDraft) {
  const plan = getSponsoredAdPlan(draft.planId || 'starter_week');

  return {
    plan,
    service: draft.service.trim(),
    headline: draft.headline.trim(),
    body: draft.body.trim(),
    location: draft.location.trim() || 'Abuja',
    startingPrice: draft.startingPrice.trim(),
  };
}

export async function recordSponsoredAdPaymentIntent(input: {
  reference: string;
  user: SessionUser;
  draft: AdDraft;
}) {
  const viewer = await ensureProfile(input.user, 'provider');
  const supabase = requireSupabase();
  const sanitized = sanitizeAdDraft(input.draft);

  if (!sanitized.service || !sanitized.headline || !sanitized.body || !sanitized.startingPrice) {
    throw new Error('Add the ad service, headline, copy, and starting price before paying.');
  }

  const { error } = await supabase.from('paystack_transactions').upsert(
    {
      paystack_reference: input.reference,
      customer_profile_id: viewer.id,
      provider_profile_id: viewer.id,
      provider_name_snapshot: viewer.full_name || viewer.email.split('@')[0] || 'Skopyr provider',
      service_request_id: null,
      title: `Sponsored ad: ${sanitized.headline}`,
      category: `Sponsored ad:${sanitized.plan.id}`,
      amount_kobo: sanitized.plan.priceKobo,
      platform_fee_kobo: sanitized.plan.priceKobo,
      total_amount_kobo: sanitized.plan.priceKobo,
      status: 'initialized',
      created_at: new Date().toISOString(),
      verified_at: null,
    },
    {
      onConflict: 'paystack_reference',
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return {
    viewer,
    plan: sanitized.plan,
    draft: sanitized,
  };
}

export async function createMarketplaceAd(
  sessionUser: Session['user'] | null | undefined,
  draft: AdDraft,
) {
  void sessionUser;
  void draft;
  throw new Error(
    'Sponsored ads now require payment checkout. Start them from the provider dashboard.',
  );
}

async function syncServiceRequestBidCount(serviceRequestId: string) {
  const supabase = requireSupabase();
  const { count, error } = await supabase
    .from('provider_bids')
    .select('*', { count: 'exact', head: true })
    .eq('service_request_id', serviceRequestId);

  if (error) {
    if (isMissingProviderBidTableError(error)) {
      throw new Error(
        'Provider bid storage is not live yet. Run the provider_bids SQL in Supabase first.',
      );
    }

    throw new Error(error.message);
  }

  const { error: updateError } = await supabase
    .from('service_requests')
    .update({
      bid_count: count ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', serviceRequestId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

export async function createMarketplaceBid(
  sessionUser: Session['user'] | null | undefined,
  draft: BidDraft,
) {
  if (!Number.isFinite(draft.amount) || draft.amount <= 0) {
    throw new Error('Add a valid bid amount before sending your quote.');
  }

  if (!draft.eta.trim() || !draft.message.trim()) {
    throw new Error('Add your arrival time and a short note before sending the bid.');
  }

  const viewer = await ensureProfile(ensureSessionUser(sessionUser), 'provider');
  const supabase = requireSupabase();
  const { data: requestData, error: requestError } = await supabase
    .from('service_requests')
    .select('*')
    .eq('id', draft.serviceRequestId)
    .single();

  if (requestError) {
    throw new Error(requestError.message);
  }

  const request = requestData as ServiceRequestRow;

  if (request.customer_profile_id === viewer.id) {
    throw new Error('You cannot bid on your own request.');
  }

  const now = new Date().toISOString();
  const { data: existing, error: existingError } = await supabase
    .from('provider_bids')
    .select('*')
    .eq('service_request_id', draft.serviceRequestId)
    .eq('provider_profile_id', viewer.id)
    .maybeSingle();

  if (existingError) {
    if (isMissingProviderBidTableError(existingError)) {
      throw new Error(
        'Provider bid storage is not live yet. Run the provider_bids SQL in Supabase first.',
      );
    }

    throw new Error(existingError.message);
  }

  const payload = {
    service_request_id: draft.serviceRequestId,
    provider_profile_id: viewer.id,
    amount_kobo: Math.round(draft.amount * 100),
    eta_label: draft.eta.trim(),
    message: draft.message.trim(),
    status: (existing as ProviderBidRow | null)?.status || 'Submitted',
    updated_at: now,
  };
  const mutation = existing
    ? supabase
        .from('provider_bids')
        .update(payload)
        .eq('id', (existing as ProviderBidRow).id)
    : supabase.from('provider_bids').insert({
        ...payload,
        created_at: now,
      });
  const { data, error } = await mutation.select('*').single();

  if (error) {
    if (isMissingProviderBidTableError(error)) {
      throw new Error(
        'Provider bid storage is not live yet. Run the provider_bids SQL in Supabase first.',
      );
    }

    throw new Error(error.message);
  }

  await syncServiceRequestBidCount(draft.serviceRequestId);
  const bids = await mapBidRows([data as ProviderBidRow], [request]);
  return bids[0] || null;
}

export async function updateMarketplaceBid(
  sessionUser: Session['user'] | null | undefined,
  bidId: string,
  draft: BidUpdateDraft,
) {
  if (!Number.isFinite(draft.amount) || draft.amount <= 0) {
    throw new Error('Add a valid bid amount before saving changes.');
  }

  if (!draft.eta.trim() || !draft.message.trim()) {
    throw new Error('Add your arrival time and a short note before saving this bid.');
  }

  const viewer = await ensureProfile(ensureSessionUser(sessionUser), 'provider');
  const supabase = requireSupabase();
  const { data: existingData, error: existingError } = await supabase
    .from('provider_bids')
    .select('*')
    .eq('id', bidId)
    .eq('provider_profile_id', viewer.id)
    .single();

  if (existingError) {
    if (isMissingProviderBidTableError(existingError)) {
      throw new Error(
        'Provider bid storage is not live yet. Run the provider_bids SQL in Supabase first.',
      );
    }

    throw new Error(existingError.message);
  }

  const existing = existingData as ProviderBidRow;

  if (existing.status === 'Accepted') {
    throw new Error('Accepted bids can no longer be edited.');
  }

  const { data, error } = await supabase
    .from('provider_bids')
    .update({
      amount_kobo: Math.round(draft.amount * 100),
      eta_label: draft.eta.trim(),
      message: draft.message.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', bidId)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await syncServiceRequestBidCount(existing.service_request_id);
  const bids = await mapBidRows([data as ProviderBidRow]);
  return bids[0] || null;
}

export async function finalizeSponsoredAdPayment(
  reference: string,
  metadata?: Record<string, unknown> | null,
) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = requireSupabase();
  const { data: transaction, error: transactionError } = await supabase
    .from('paystack_transactions')
    .select('*')
    .eq('paystack_reference', reference)
    .single();

  if (transactionError) {
    throw new Error(transactionError.message);
  }

  const record = transaction as PaystackTransactionRow;

  if (!record.category.startsWith('Sponsored ad:')) {
    throw new Error('This payment reference does not belong to a sponsored ad purchase.');
  }

  if (record.status === 'verified') {
    return null;
  }

  const providerId = record.provider_profile_id || record.customer_profile_id;
  const providerProfiles = await fetchProfiles([providerId]);
  const provider = providerProfiles.get(providerId);

  if (!provider) {
    throw new Error('Unable to find the provider for this sponsored ad payment.');
  }

  const adMetadata = metadata || {};
  const draft = sanitizeAdDraft({
    planId:
      (typeof adMetadata.planId === 'string'
        ? adMetadata.planId
        : record.category.split(':')[1]) as AdDraft['planId'],
    service: typeof adMetadata.service === 'string' ? adMetadata.service : 'Sponsored service',
    headline:
      typeof adMetadata.headline === 'string'
        ? adMetadata.headline
        : record.title.replace(/^Sponsored ad:\s*/i, ''),
    body:
      typeof adMetadata.body === 'string'
        ? adMetadata.body
        : 'Promoted across the Skopyr homepage and inbox surfaces.',
    location: typeof adMetadata.location === 'string' ? adMetadata.location : 'Abuja',
    startingPrice:
      typeof adMetadata.startingPrice === 'string'
        ? adMetadata.startingPrice
        : formatNaira(Math.round(record.amount_kobo / 100)),
    budget: '',
    badge: '',
  });
  const window = buildSponsoredAdWindow(draft.plan.id);
  const { data: inserted, error: insertError } = await supabase
    .from('sponsored_ads')
    .insert({
      provider_profile_id: provider.id,
      service: draft.service,
      headline: draft.headline,
      body: draft.body,
      location: draft.location,
      starting_price: draft.startingPrice,
      budget: draft.plan.budgetLabel,
      badge: draft.plan.badge,
      active: true,
      created_at: window.startsAt,
    })
    .select('*')
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  const { error: transactionUpdateError } = await supabase
    .from('paystack_transactions')
    .update({
      status: 'verified',
      verified_at: new Date().toISOString(),
    })
    .eq('paystack_reference', reference);

  if (transactionUpdateError) {
    throw new Error(transactionUpdateError.message);
  }

  return mapSponsoredAd(inserted as SponsoredAdRow, provider);
}

export async function toggleMarketplaceAd(
  sessionUser: Session['user'] | null | undefined,
  adId: string,
) {
  const viewer = await ensureProfile(ensureSessionUser(sessionUser));
  const supabase = requireSupabase();
  const { data: existing, error: readError } = await supabase
    .from('sponsored_ads')
    .select('*')
    .eq('id', adId)
    .eq('provider_profile_id', viewer.id)
    .single();

  if (readError) {
    throw new Error(readError.message);
  }

  const existingRow = existing as SponsoredAdRow;
  const plan = getSponsoredAdPlanFromBudgetLabel(existingRow.budget);

  if (
    plan.id !== 'legacy_featured' &&
    isSponsoredAdExpired(buildSponsoredAdWindow(plan.id, existingRow.created_at).expiresAt)
  ) {
    throw new Error('This campaign has expired. Launch a new paid ad plan to go live again.');
  }

  const { data, error } = await supabase
    .from('sponsored_ads')
    .update({ active: !existingRow.active })
    .eq('id', adId)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapSponsoredAd(data as SponsoredAdRow, viewer);
}

export async function markMarketplaceThreadRead(
  sessionUser: Session['user'] | null | undefined,
  threadId: string,
) {
  const viewer = await ensureProfile(ensureSessionUser(sessionUser));
  const supabase = requireSupabase();
  const { data: thread, error: readError } = await supabase
    .from('threads')
    .select('*')
    .eq('id', threadId)
    .single();

  if (readError) {
    throw new Error(readError.message);
  }

  const row = thread as ThreadRow;

  if (row.customer_profile_id !== viewer.id && row.provider_profile_id !== viewer.id) {
    throw new Error('You cannot access this thread.');
  }

  const now = new Date().toISOString();
  const updates =
    row.customer_profile_id === viewer.id
      ? { customer_last_read_at: now }
      : { provider_last_read_at: now };
  const { error } = await supabase.from('threads').update(updates).eq('id', threadId);

  if (error) {
    throw new Error(error.message);
  }
}

async function findOrCreateThread(
  viewer: ProfileRow,
  input: SendMessageInput,
) {
  const supabase = requireSupabase();
  const senderRole = input.senderRole;
  const customerProfileId =
    senderRole === 'customer' ? viewer.id : input.customerProfileId || null;
  const providerProfileId =
    senderRole === 'provider' ? viewer.id : input.providerProfileId || null;

  if (!customerProfileId || !providerProfileId) {
    throw new Error('A valid buyer and provider are required to start a conversation.');
  }

  if (!input.subject || !input.category) {
    throw new Error('A subject and category are required to start a conversation.');
  }

  let query = supabase
    .from('threads')
    .select('*')
    .eq('customer_profile_id', customerProfileId)
    .eq('provider_profile_id', providerProfileId)
    .eq('subject', input.subject)
    .eq('category', input.category);

  query = input.serviceRequestId
    ? query.eq('service_request_id', input.serviceRequestId)
    : query.is('service_request_id', null);

  const { data: existing, error: existingError } = await query.maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    return existing as ThreadRow;
  }

  const now = new Date().toISOString();
  const { data: inserted, error: insertError } = await supabase
    .from('threads')
    .insert({
      customer_profile_id: customerProfileId,
      provider_profile_id: providerProfileId,
      subject: input.subject,
      category: input.category,
      service_request_id: input.serviceRequestId || null,
      last_message_preview: input.body,
      last_message_at: now,
      customer_last_read_at: senderRole === 'customer' ? now : null,
      provider_last_read_at: senderRole === 'provider' ? now : null,
      created_at: now,
    })
    .select('*')
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return inserted as ThreadRow;
}

export async function sendMarketplaceMessage(
  sessionUser: Session['user'] | null | undefined,
  input: SendMessageInput,
) {
  const viewer = await ensureProfile(ensureSessionUser(sessionUser));
  const supabase = requireSupabase();
  let thread: ThreadRow;

  if (input.threadId) {
    const { data, error } = await supabase
      .from('threads')
      .select('*')
      .eq('id', input.threadId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    thread = data as ThreadRow;

    if (thread.customer_profile_id !== viewer.id && thread.provider_profile_id !== viewer.id) {
      throw new Error('You cannot reply to this conversation.');
    }
  } else {
    thread = await findOrCreateThread(viewer, input);
  }

  const now = new Date().toISOString();
  const senderRole: AppRole =
    thread.provider_profile_id === viewer.id ? 'provider' : 'customer';
  const { error: messageError } = await supabase.from('messages').insert({
    id: crypto.randomUUID(),
    thread_id: thread.id,
    sender_profile_id: viewer.id,
    body: input.body,
    created_at: now,
  });

  if (messageError) {
    throw new Error(messageError.message);
  }

  const threadUpdates =
    senderRole === 'customer'
      ? {
          last_message_preview: input.body,
          last_message_at: now,
          customer_last_read_at: now,
        }
      : {
          last_message_preview: input.body,
          last_message_at: now,
          provider_last_read_at: now,
        };

  const { error: threadError } = await supabase
    .from('threads')
    .update(threadUpdates)
    .eq('id', thread.id);

  if (threadError) {
    throw new Error(threadError.message);
  }

  return {
    threadId: thread.id,
  };
}

export async function recordPaymentIntent(input: PaymentIntentInput) {
  if (!isSupabaseConfigured()) {
    return;
  }

  const customer = await ensureProfile(input.user, 'customer');
  const supabase = requireSupabase();
  const now = new Date().toISOString();
  const { error } = await supabase.from('paystack_transactions').upsert(
    {
      paystack_reference: input.reference,
      customer_profile_id: customer.id,
      provider_profile_id: input.providerProfileId || null,
      provider_name_snapshot: input.providerName,
      service_request_id: input.serviceRequestId || null,
      title: input.title,
      category: input.category,
      amount_kobo: input.amountKobo,
      platform_fee_kobo: input.platformFeeKobo,
      total_amount_kobo: input.totalAmountKobo,
      status: 'initialized',
      created_at: now,
      verified_at: null,
    },
    {
      onConflict: 'paystack_reference',
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function finalizeVerifiedPayment(reference: string) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = requireSupabase();
  const { data: transaction, error: transactionError } = await supabase
    .from('paystack_transactions')
    .select('*')
    .eq('paystack_reference', reference)
    .single();

  if (transactionError) {
    throw new Error(transactionError.message);
  }

  const record = transaction as PaystackTransactionRow;
  const { data: existingEscrow, error: existingEscrowError } = await supabase
    .from('escrow_accounts')
    .select('*')
    .eq('paystack_reference', reference)
    .maybeSingle();

  if (existingEscrowError) {
    throw new Error(existingEscrowError.message);
  }

  const now = new Date().toISOString();
  let escrow = existingEscrow as EscrowRow | null;

  if (!escrow) {
    const { data: insertedEscrow, error: insertedEscrowError } = await supabase
      .from('escrow_accounts')
      .insert({
        service_request_id: record.service_request_id,
        customer_profile_id: record.customer_profile_id,
        provider_profile_id: record.provider_profile_id,
        title: record.title,
        amount_kobo: record.amount_kobo,
        status: 'Protected',
        paystack_reference: reference,
        provider_name_snapshot: record.provider_name_snapshot,
        notes: [
          'Payment is protected inside Paystack escrow until work is confirmed.',
          'Provider payout stays pending until the completion window ends.',
          'Skopyr uses this escrow record to power both buyer tracking and provider earnings.',
        ],
        updated_at: now,
        created_at: now,
      })
      .select('*')
      .single();

    if (insertedEscrowError) {
      throw new Error(insertedEscrowError.message);
    }

    escrow = insertedEscrow as EscrowRow;
  }

  if (!escrow) {
    throw new Error('Unable to create the escrow record.');
  }

  if (record.provider_profile_id && record.service_request_id) {
    const { error: bidUpdateError } = await supabase
      .from('provider_bids')
      .update({
        status: 'Accepted',
        updated_at: now,
      })
      .eq('service_request_id', record.service_request_id)
      .eq('provider_profile_id', record.provider_profile_id);

    if (bidUpdateError && !isMissingProviderBidTableError(bidUpdateError)) {
      throw new Error(bidUpdateError.message);
    }
  }

  if (record.provider_profile_id) {
    const { data: existingEarnings, error: earningsReadError } = await supabase
      .from('earnings_records')
      .select('*')
      .eq('escrow_account_id', escrow.id)
      .maybeSingle();

    if (earningsReadError) {
      throw new Error(earningsReadError.message);
    }

    if (!existingEarnings) {
      const { error: earningsInsertError } = await supabase.from('earnings_records').insert({
        provider_profile_id: record.provider_profile_id,
        escrow_account_id: escrow.id,
        title: record.title,
        amount_kobo: record.amount_kobo,
        status: 'Pending',
        payout_date: null,
        notes: [
          'Customer payment has been verified by Paystack.',
          'This job will move from pending to released when the escrow confirmation window closes.',
        ],
        created_at: now,
      });

      if (earningsInsertError) {
        throw new Error(earningsInsertError.message);
      }
    }
  }

  const { error: requestError } = record.service_request_id
    ? await supabase
        .from('service_requests')
        .update({
          status: 'Escrow active',
          updated_at: now,
        })
        .eq('id', record.service_request_id)
    : { error: null };

  if (requestError) {
    throw new Error(requestError.message);
  }

  const { error: transactionUpdateError } = await supabase
    .from('paystack_transactions')
    .update({
      status: 'verified',
      verified_at: now,
    })
    .eq('paystack_reference', reference);

  if (transactionUpdateError) {
    throw new Error(transactionUpdateError.message);
  }

  return {
    escrowId: escrow.id,
  };
}
