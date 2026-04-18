import { useEffect, useState } from 'react';

export type AppRole = 'customer' | 'provider';

export interface ProfileSummary {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  rolePreference: AppRole;
  verified: boolean;
  rating: number;
  completedJobs: number;
  city: string;
}

export interface ConversationEntry {
  id: string;
  sender: string;
  body: string;
  time: string;
  direction: 'incoming' | 'outgoing' | 'system';
}

export interface MarketplaceThread {
  id: string;
  threadKey: string;
  counterpart: string;
  counterpartProfileId?: string | null;
  category: string;
  preview: string;
  time: string;
  unread: boolean;
  subject: string;
  serviceRequestId?: string | null;
  conversation: ConversationEntry[];
}

export interface BrowseRequest {
  id: string;
  title: string;
  cat: string;
  categoryName: string;
  budget: string;
  loc: string;
  when: string;
  bids: number;
  ago: string;
  requester: string;
  requesterProfileId?: string | null;
  summary: string;
}

export interface SponsoredAd {
  id: string;
  providerProfileId?: string | null;
  providerName: string;
  service: string;
  headline: string;
  body: string;
  location: string;
  startingPrice: string;
  cta: string;
  badge: string;
  budget: string;
  active: boolean;
  rating: number;
  jobs: number;
  verified: boolean;
}

export interface MarketplaceBid {
  id: string;
  providerProfileId?: string | null;
  adId?: string | null;
  name: string;
  rating: number;
  jobs: number;
  price: number;
  avatar: string;
  verified: boolean;
  msg: string;
  eta: string;
  time: string;
  location: string;
}

export interface AdDraft {
  service: string;
  headline: string;
  body: string;
  location: string;
  startingPrice: string;
  budget: string;
  badge?: string;
}

export interface RequestDraft {
  categoryId: string;
  categoryName: string;
  title: string;
  summary: string;
  budgetMin: number;
  budgetMax: number;
  location: string;
  urgency: string;
}

export interface CustomerRequest {
  id: string;
  title: string;
  location: string;
  budget: string;
  bids: number;
  status: string;
  provider: string;
}

export interface ProviderLead {
  id: string;
  requester: string;
  requesterProfileId?: string | null;
  service: string;
  location: string;
  budget: string;
  urgency: string;
  interest: string;
}

export interface EscrowItem {
  id: string;
  title: string;
  amount: string;
  status: string;
  provider: string;
  updatedAt: string;
  details: string[];
}

export interface Payout {
  id: string;
  title: string;
  amount: string;
  status: string;
  date: string;
  details: string[];
}

export interface ProviderBalance {
  available: string;
  pending: string;
  nextWindow: string;
  details: string[];
}

export interface MarketplaceState {
  viewer: ProfileSummary | null;
  customerThreads: MarketplaceThread[];
  providerThreads: MarketplaceThread[];
  browseRequests: BrowseRequest[];
  sponsoredAds: SponsoredAd[];
  customerRequests: CustomerRequest[];
  providerLeads: ProviderLead[];
  customerEscrows: EscrowItem[];
  providerBalance: ProviderBalance;
  providerPayouts: Payout[];
}

export interface SendMessageInput {
  senderRole: AppRole;
  body: string;
  threadId?: string;
  providerProfileId?: string | null;
  customerProfileId?: string | null;
  subject?: string;
  category?: string;
  serviceRequestId?: string | null;
}

const STORAGE_KEY = 'skopyr:marketplace-state';
const DEFAULT_CITY = 'Abuja';

const DEFAULT_PROVIDER_BALANCE: ProviderBalance = {
  available: 'NGN 0',
  pending: 'NGN 0',
  nextWindow: 'Tomorrow by 9:00 AM',
  details: [
    'Released jobs move here first before bank payout starts.',
    'Pending money includes jobs still inside escrow confirmation windows.',
    'As soon as payments verify in production, your balance updates here automatically.',
  ],
};

const INITIAL_STATE: MarketplaceState = {
  viewer: null,
  customerThreads: [
    {
      id: 'customer-thread-1',
      threadKey: 'generator-amaka',
      counterpart: 'Amaka Eze',
      counterpartProfileId: 'fallback-provider-amaka',
      category: 'Generator repair',
      preview:
        'I can be at Games Village by 3:30 PM. Do you want me to bring replacement plugs too?',
      time: '4m ago',
      unread: true,
      subject: 'Generator not starting',
      serviceRequestId: 'request-generator',
      conversation: [
        {
          id: 'customer-thread-1-message-1',
          sender: 'Amaka Eze',
          body: 'Hi. I checked your generator notes and I can get to Games Village by 3:30 PM.',
          time: '3:21 PM',
          direction: 'incoming',
        },
        {
          id: 'customer-thread-1-message-2',
          sender: 'Amaka Eze',
          body: 'Do you want me to bring replacement plugs too? I can include them in the same visit.',
          time: '3:23 PM',
          direction: 'incoming',
        },
      ],
    },
    {
      id: 'customer-thread-2',
      threadKey: 'generator-chidi',
      counterpart: 'Chidi Okonkwo',
      counterpartProfileId: 'fallback-provider-chidi',
      category: 'Generator repair',
      preview:
        'I just sent a revised quote that includes diagnostics and fuel system checks.',
      time: '19m ago',
      unread: true,
      subject: 'Generator not starting',
      serviceRequestId: 'request-generator',
      conversation: [
        {
          id: 'customer-thread-2-message-1',
          sender: 'You',
          body: 'Can you confirm if your quote includes diagnostics?',
          time: '2:58 PM',
          direction: 'outgoing',
        },
        {
          id: 'customer-thread-2-message-2',
          sender: 'Chidi Okonkwo',
          body: 'Yes. I just sent a revised quote that includes diagnostics and fuel system checks.',
          time: '3:08 PM',
          direction: 'incoming',
        },
      ],
    },
  ],
  providerThreads: [
    {
      id: 'provider-thread-1',
      threadKey: 'provider-aisha',
      counterpart: 'Aisha Bello',
      counterpartProfileId: 'fallback-customer-aisha',
      category: 'Generator repair',
      preview: 'Can you still make it to Wuse today if I accept your bid this afternoon?',
      time: '2m ago',
      unread: true,
      subject: 'Generator not starting',
      serviceRequestId: 'request-generator',
      conversation: [
        {
          id: 'provider-thread-1-message-1',
          sender: 'Aisha Bello',
          body: 'Can you still make it to Wuse today if I accept your bid this afternoon?',
          time: '4:10 PM',
          direction: 'incoming',
        },
      ],
    },
    {
      id: 'provider-thread-2',
      threadKey: 'provider-david',
      counterpart: 'David Ogunleye',
      counterpartProfileId: 'fallback-customer-david',
      category: 'Solar and inverter',
      preview:
        'I like your profile. Are you available for a same-day solar inverter inspection?',
      time: '13m ago',
      unread: true,
      subject: 'Solar inverter inspection',
      serviceRequestId: 'request-solar',
      conversation: [
        {
          id: 'provider-thread-2-message-1',
          sender: 'David Ogunleye',
          body: 'I like your profile. Are you available for a same-day solar inverter inspection?',
          time: '3:57 PM',
          direction: 'incoming',
        },
      ],
    },
  ],
  browseRequests: [
    {
      id: 'request-generator',
      title: 'Generator not starting',
      cat: 'generator',
      categoryName: 'Generator',
      budget: 'NGN 15k - NGN 25k',
      loc: 'Games Village',
      when: 'ASAP',
      bids: 3,
      ago: '12m',
      requester: 'Aisha Bello',
      requesterProfileId: 'fallback-customer-aisha',
      summary: 'Mikano set is turning over but not firing. Need someone today.',
    },
    {
      id: 'request-plumbing',
      title: 'Kitchen sink leaking badly',
      cat: 'plumbing',
      categoryName: 'Plumbing',
      budget: 'NGN 8k - NGN 15k',
      loc: 'Gwarinpa',
      when: 'Today',
      bids: 5,
      ago: '28m',
      requester: 'Tolu Adesina',
      requesterProfileId: 'fallback-customer-tolu',
      summary: 'Leak under the basin and water pressure is getting worse.',
    },
    {
      id: 'request-cleaning',
      title: 'Deep clean 3BR flat',
      cat: 'cleaning',
      categoryName: 'Cleaning',
      budget: 'NGN 20k - NGN 35k',
      loc: 'Maitama',
      when: 'Weekend',
      bids: 7,
      ago: '1h',
      requester: 'Ngozi Okafor',
      requesterProfileId: 'fallback-customer-ngozi',
      summary: 'Need post-tenant deep cleaning before new move-in this weekend.',
    },
    {
      id: 'request-solar',
      title: 'Solar inverter inspection',
      cat: 'solar',
      categoryName: 'Solar and inverter',
      budget: 'NGN 30k - NGN 45k',
      loc: 'Wuse II',
      when: 'Today',
      bids: 2,
      ago: '45m',
      requester: 'David Ogunleye',
      requesterProfileId: 'fallback-customer-david',
      summary: 'Battery bank drops fast and the inverter cuts out under load.',
    },
  ],
  sponsoredAds: [
    {
      id: 'ad-1',
      providerProfileId: 'fallback-provider-chidi',
      providerName: 'Sparkline Power',
      service: 'Generator repair',
      headline: 'Sponsor your power fix with same-day generator specialists',
      body:
        'Featured across Skopyr home, browse, and inbox surfaces with a 30-day repair warranty.',
      location: 'Abuja',
      startingPrice: 'From NGN 18k',
      cta: 'Message sponsor',
      badge: 'Sponsored',
      budget: 'NGN 20k / week',
      active: true,
      rating: 4.9,
      jobs: 234,
      verified: true,
    },
    {
      id: 'ad-2',
      providerProfileId: 'fallback-provider-polarcool',
      providerName: 'PolarCool Services',
      service: 'AC repair',
      headline: 'Be the first provider buyers see for AC repairs in Abuja',
      body:
        'Featured placement above fold with direct message CTA and same-day availability.',
      location: 'Wuse and Maitama',
      startingPrice: 'From NGN 12k',
      cta: 'Open ad',
      badge: 'Top spot',
      budget: 'NGN 14k / week',
      active: true,
      rating: 4.8,
      jobs: 156,
      verified: true,
    },
    {
      id: 'ad-3',
      providerProfileId: 'fallback-provider-cleannest',
      providerName: 'CleanNest Crew',
      service: 'Home cleaning',
      headline: 'Get premium cleaning jobs with promoted visibility',
      body: 'Ideal for weekend move-ins, deep cleans, and office turnover jobs.',
      location: 'Maitama and Gwarinpa',
      startingPrice: 'From NGN 20k',
      cta: 'View ad',
      badge: 'Featured',
      budget: 'NGN 11k / week',
      active: true,
      rating: 4.7,
      jobs: 189,
      verified: true,
    },
  ],
  customerRequests: [
    {
      id: 'request-generator',
      title: 'Generator not starting',
      location: 'Games Village',
      budget: 'NGN 15k - NGN 25k',
      bids: 3,
      status: 'Comparing bids',
      provider: '3 verified providers interested',
    },
    {
      id: 'request-cleaning',
      title: 'Deep clean for 3BR flat',
      location: 'Maitama',
      budget: 'NGN 20k - NGN 35k',
      bids: 7,
      status: 'Provider booked',
      provider: 'Sparkle Crew arriving Saturday 9 AM',
    },
    {
      id: 'request-plumbing',
      title: 'Kitchen sink leaking badly',
      location: 'Gwarinpa',
      budget: 'NGN 8k - NGN 15k',
      bids: 5,
      status: 'Escrow active',
      provider: 'Tunde Plumbing has started work',
    },
  ],
  providerLeads: [
    {
      id: 'lead-1',
      requester: 'Aisha Bello',
      requesterProfileId: 'fallback-customer-aisha',
      service: 'Generator not starting',
      location: 'Games Village',
      budget: 'NGN 15k - NGN 25k',
      urgency: 'ASAP',
      interest: 'Shortlisted you after reading your warranty terms.',
    },
    {
      id: 'lead-2',
      requester: 'David Ogunleye',
      requesterProfileId: 'fallback-customer-david',
      service: 'Solar inverter inspection',
      location: 'Wuse II',
      budget: 'NGN 30k - NGN 45k',
      urgency: 'Today',
      interest: 'Asked for a direct message before accepting a bid.',
    },
    {
      id: 'lead-3',
      requester: 'Ngozi Okafor',
      requesterProfileId: 'fallback-customer-ngozi',
      service: 'Routine generator servicing',
      location: 'Gwarinpa',
      budget: 'NGN 18k - NGN 22k',
      urgency: 'This week',
      interest: 'Viewed your profile twice and saved your service card.',
    },
  ],
  customerEscrows: [
    {
      id: 'escrow-1',
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
      id: 'escrow-2',
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
  ],
  providerBalance: {
    available: 'NGN 142k',
    pending: 'NGN 42k',
    nextWindow: 'Tomorrow by 9:00 AM',
    details: [
      'Released jobs move here first before bank payout starts.',
      'Pending money includes jobs still inside escrow confirmation windows.',
      'You can track each payout item below and watch the status change.',
    ],
  },
  providerPayouts: [
    {
      id: 'payout-1',
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
      id: 'payout-2',
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
      id: 'payout-3',
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
  ],
};

function cloneInitialState() {
  return JSON.parse(JSON.stringify(INITIAL_STATE)) as MarketplaceState;
}

function safeParse(value: string | null): MarketplaceState | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as MarketplaceState;
  } catch {
    return null;
  }
}

function toDateValue(input: string | Date) {
  return input instanceof Date ? input : new Date(input);
}

export function isSupabaseEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatBudget(min: number, max: number) {
  return `${formatNaira(min)} - ${formatNaira(max)}`;
}

export function formatRelativeTime(input: string | Date) {
  const value = toDateValue(input);

  if (Number.isNaN(value.getTime())) {
    return 'Just now';
  }

  const diffMs = Date.now() - value.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays}d`;
  }

  return value.toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatClockTime(input: string | Date) {
  const value = toDateValue(input);

  if (Number.isNaN(value.getTime())) {
    return 'Just now';
  }

  return value.toLocaleTimeString('en-NG', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function nextPayoutWindowLabel(reference = new Date()) {
  const next = new Date(reference);

  if (next.getHours() >= 9) {
    next.setDate(next.getDate() + 1);
  }

  next.setHours(9, 0, 0, 0);

  return next.toLocaleString('en-NG', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function createThreadKey(subject: string, providerName: string) {
  return `${subject.toLowerCase().replace(/\s+/g, '-')}-${providerName
    .toLowerCase()
    .replace(/\s+/g, '-')}`;
}

export function getInitials(value?: string | null) {
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

export function normalizeServiceLabel(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function extractNumericPrice(value: string) {
  const digits = value.replace(/[^0-9]/g, '');

  if (!digits) {
    return 0;
  }

  return Number.parseInt(digits, 10);
}

export function buildMarketplaceBids(
  request: BrowseRequest | null,
  ads: SponsoredAd[],
): MarketplaceBid[] {
  const activeAds = ads.filter((ad) => ad.active);

  if (activeAds.length === 0) {
    return [];
  }

  const requestText = normalizeServiceLabel(
    `${request?.categoryName || ''} ${request?.title || ''} ${request?.summary || ''}`,
  );

  const matchingAds =
    requestText.length > 0
      ? activeAds.filter((ad) => requestText.includes(normalizeServiceLabel(ad.service)))
      : activeAds;

  const sourceAds = matchingAds.length > 0 ? matchingAds : activeAds;

  return sourceAds.slice(0, 6).map((ad, index) => ({
    id: `bid-${ad.id}`,
    providerProfileId: ad.providerProfileId,
    adId: ad.id,
    name: ad.providerName,
    rating: ad.rating,
    jobs: ad.jobs,
    price: extractNumericPrice(ad.startingPrice),
    avatar: getInitials(ad.providerName),
    verified: ad.verified,
    msg: ad.body,
    eta: ['Today 2 PM', 'Today 3:30 PM', 'Tomorrow 9 AM'][index % 3],
    time: ['~2 hrs', '~3 hrs', '~1 hr'][index % 3],
    location: ad.location,
  }));
}

function buildViewerState(user?: {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  rolePreference?: AppRole;
}) {
  if (!user?.email) {
    return null;
  }

  return {
    id: user.id || `fallback-${user.email}`,
    email: user.email,
    name: user.name || user.email.split('@')[0] || 'Skopyr member',
    image: user.image,
    rolePreference: user.rolePreference || 'customer',
    verified: true,
    rating: 4.8,
    completedJobs: 0,
    city: DEFAULT_CITY,
  } satisfies ProfileSummary;
}

export function useMarketplaceFallbackState(viewer?: {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  rolePreference?: AppRole;
}) {
  const [state, setState] = useState<MarketplaceState>(cloneInitialState);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = safeParse(window.localStorage.getItem(STORAGE_KEY));

    if (stored) {
      setState(stored);
      return;
    }

    setState(cloneInitialState());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const nextViewer = buildViewerState(viewer);

    if (!nextViewer) {
      return;
    }

    setState((current) => ({
      ...current,
      viewer: {
        ...current.viewer,
        ...nextViewer,
      },
    }));
  }, [viewer]);

  return [state, setState] as const;
}

function nowDate() {
  return new Date();
}

function threadPreviewTime() {
  return 'Just now';
}

function nextConversationId(thread: MarketplaceThread) {
  return `${thread.id}-message-${thread.conversation.length + 1}`;
}

function ensureThread(
  threads: MarketplaceThread[],
  input: {
    threadId?: string;
    threadKey: string;
    counterpart: string;
    counterpartProfileId?: string | null;
    category: string;
    subject: string;
    serviceRequestId?: string | null;
  },
) {
  const existing = threads.find((thread) => {
    if (input.threadId && thread.id === input.threadId) {
      return true;
    }

    return thread.threadKey === input.threadKey;
  });

  if (existing) {
    return existing;
  }

  return {
    id: input.threadId || `thread-${input.threadKey}`,
    threadKey: input.threadKey,
    counterpart: input.counterpart,
    counterpartProfileId: input.counterpartProfileId,
    category: input.category,
    preview: '',
    time: threadPreviewTime(),
    unread: false,
    subject: input.subject,
    serviceRequestId: input.serviceRequestId,
    conversation: [],
  } satisfies MarketplaceThread;
}

function updateThreadList(
  threads: MarketplaceThread[],
  thread: MarketplaceThread,
  message: ConversationEntry,
  unread: boolean,
) {
  const exists = threads.some((item) => item.id === thread.id);
  const nextThreads = exists
    ? threads.map((item) =>
        item.id === thread.id
          ? {
              ...item,
              preview: message.body,
              time: threadPreviewTime(),
              unread,
              conversation: [...item.conversation, message],
            }
          : item,
      )
    : [
        {
          ...thread,
          preview: message.body,
          time: threadPreviewTime(),
          unread,
          conversation: [message],
        },
        ...threads,
      ];

  return nextThreads.sort((left, right) => {
    const leftTime = left.time === 'Just now' ? Number.MAX_SAFE_INTEGER : 0;
    const rightTime = right.time === 'Just now' ? Number.MAX_SAFE_INTEGER : 0;
    return rightTime - leftTime;
  });
}

export function sendFallbackMessage(
  state: MarketplaceState,
  viewer: ProfileSummary | null,
  input: SendMessageInput,
) {
  if (!viewer) {
    return { state, threadId: null as string | null };
  }

  if (input.threadId) {
    const customerThread = state.customerThreads.find((thread) => thread.id === input.threadId);
    const providerThread = state.providerThreads.find((thread) => thread.id === input.threadId);
    const sourceThread = customerThread || providerThread;

    if (!sourceThread) {
      return { state, threadId: null as string | null };
    }

    return sendFallbackMessage(state, viewer, {
      senderRole: input.senderRole,
      providerProfileId:
        input.senderRole === 'customer'
          ? sourceThread.counterpartProfileId || undefined
          : viewer.id,
      customerProfileId:
        input.senderRole === 'provider'
          ? sourceThread.counterpartProfileId || undefined
          : viewer.id,
      body: input.body,
      subject: sourceThread.subject,
      category: sourceThread.category,
      serviceRequestId: sourceThread.serviceRequestId,
      threadId: sourceThread.id,
    });
  }

  const senderName = viewer.name;
  const providerName =
    input.senderRole === 'provider'
      ? senderName
      : state.sponsoredAds.find((ad) => ad.providerProfileId === input.providerProfileId)?.providerName ||
        state.customerThreads.find((thread) => thread.counterpartProfileId === input.providerProfileId)?.counterpart ||
        'Provider';
  const customerName =
    input.senderRole === 'customer'
      ? senderName
      : state.browseRequests.find((request) => request.requesterProfileId === input.customerProfileId)?.requester ||
        state.providerThreads.find((thread) => thread.counterpartProfileId === input.customerProfileId)?.counterpart ||
        'Customer';
  const subject = input.subject || 'New conversation';
  const category = input.category || 'General';
  const threadKey = createThreadKey(subject, providerName);

  const customerBase = ensureThread(state.customerThreads, {
    threadId: input.threadId,
    threadKey,
    counterpart: providerName,
    counterpartProfileId: input.providerProfileId,
    category,
    subject,
    serviceRequestId: input.serviceRequestId,
  });
  const providerBase = ensureThread(state.providerThreads, {
    threadId: input.threadId,
    threadKey,
    counterpart: customerName,
    counterpartProfileId: input.customerProfileId,
    category,
    subject,
    serviceRequestId: input.serviceRequestId,
  });
  const customerMessage: ConversationEntry = {
    id: nextConversationId(customerBase),
    sender: input.senderRole === 'customer' ? 'You' : providerName,
    body: input.body,
    time: formatClockTime(nowDate()),
    direction: input.senderRole === 'customer' ? 'outgoing' : 'incoming',
  };
  const providerMessage: ConversationEntry = {
    id: nextConversationId(providerBase),
    sender: input.senderRole === 'provider' ? 'You' : customerName,
    body: input.body,
    time: formatClockTime(nowDate()),
    direction: input.senderRole === 'provider' ? 'outgoing' : 'incoming',
  };

  const nextState: MarketplaceState = {
    ...state,
    customerThreads: updateThreadList(
      state.customerThreads,
      customerBase,
      customerMessage,
      input.senderRole === 'provider',
    ),
    providerThreads: updateThreadList(
      state.providerThreads,
      providerBase,
      providerMessage,
      input.senderRole === 'customer',
    ),
  };

  const nextThreadId =
    input.senderRole === 'customer'
      ? nextState.customerThreads.find((thread) => thread.threadKey === threadKey)?.id || customerBase.id
      : nextState.providerThreads.find((thread) => thread.threadKey === threadKey)?.id || providerBase.id;

  return {
    state: nextState,
    threadId: nextThreadId,
  };
}

export function createFallbackRequest(
  state: MarketplaceState,
  viewer: ProfileSummary | null,
  draft: RequestDraft,
) {
  if (!viewer) {
    return { state, requestId: null as string | null };
  }

  const id = `request-${Date.now()}`;
  const nextRequest: BrowseRequest = {
    id,
    title: draft.title,
    cat: draft.categoryId,
    categoryName: draft.categoryName,
    budget: formatBudget(draft.budgetMin, draft.budgetMax),
    loc: draft.location,
    when: draft.urgency,
    bids: 0,
    ago: 'Just now',
    requester: viewer.name,
    requesterProfileId: viewer.id,
    summary: draft.summary,
  };

  const nextCustomerRequest: CustomerRequest = {
    id,
    title: draft.title,
    location: draft.location,
    budget: formatBudget(draft.budgetMin, draft.budgetMax),
    bids: 0,
    status: 'Open',
    provider: 'Waiting for provider messages',
  };

  return {
    requestId: id,
    state: {
      ...state,
      browseRequests: [nextRequest, ...state.browseRequests],
      customerRequests: [nextCustomerRequest, ...state.customerRequests],
    },
  };
}

export function createFallbackAd(
  state: MarketplaceState,
  viewer: ProfileSummary | null,
  draft: AdDraft,
) {
  if (!viewer) {
    return state;
  }

  const nextAd: SponsoredAd = {
    id: `ad-${Date.now()}`,
    providerProfileId: viewer.id,
    providerName: viewer.name,
    service: draft.service,
    headline: draft.headline,
    body: draft.body,
    location: draft.location,
    startingPrice: draft.startingPrice,
    cta: 'Message sponsor',
    badge: draft.badge || 'Sponsored',
    budget: draft.budget,
    active: true,
    rating: viewer.rating,
    jobs: viewer.completedJobs,
    verified: viewer.verified,
  };

  return {
    ...state,
    sponsoredAds: [nextAd, ...state.sponsoredAds].slice(0, 12),
  };
}

export function toggleFallbackAd(state: MarketplaceState, adId: string) {
  return {
    ...state,
    sponsoredAds: state.sponsoredAds.map((ad) =>
      ad.id === adId ? { ...ad, active: !ad.active } : ad,
    ),
  };
}

export function updateFallbackRole(
  state: MarketplaceState,
  rolePreference: AppRole,
  viewer?: ProfileSummary | null,
) {
  const nextViewer = viewer || state.viewer;

  if (!nextViewer) {
    return state;
  }

  return {
    ...state,
    viewer: {
      ...nextViewer,
      rolePreference,
    },
  };
}

export function markFallbackThreadRead(
  state: MarketplaceState,
  role: AppRole,
  threadId: string,
) {
  const key = role === 'provider' ? 'providerThreads' : 'customerThreads';

  return {
    ...state,
    [key]: state[key].map((thread) =>
      thread.id === threadId ? { ...thread, unread: false } : thread,
    ),
  } as MarketplaceState;
}

export function emptyMarketplaceState(): MarketplaceState {
  return {
    viewer: null,
    customerThreads: [] as MarketplaceThread[],
    providerThreads: [] as MarketplaceThread[],
    browseRequests: [] as BrowseRequest[],
    sponsoredAds: [] as SponsoredAd[],
    customerRequests: [] as CustomerRequest[],
    providerLeads: [] as ProviderLead[],
    customerEscrows: [] as EscrowItem[],
    providerBalance: DEFAULT_PROVIDER_BALANCE,
    providerPayouts: [] as Payout[],
  };
}
