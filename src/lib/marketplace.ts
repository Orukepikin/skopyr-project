import { useEffect, useState } from 'react';

export type AppRole = 'customer' | 'provider';

export interface ConversationEntry {
  id: number;
  sender: string;
  body: string;
  time: string;
  direction: 'incoming' | 'outgoing' | 'system';
}

export interface MarketplaceThread {
  id: string;
  threadKey: string;
  counterpart: string;
  category: string;
  preview: string;
  time: string;
  unread: boolean;
  subject: string;
  conversation: ConversationEntry[];
}

export interface BrowseRequest {
  id: number;
  title: string;
  cat: string;
  budget: string;
  loc: string;
  when: string;
  bids: number;
  ago: string;
  requester: string;
  summary: string;
}

export interface SponsoredAd {
  id: string;
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

export interface MarketplaceState {
  customerThreads: MarketplaceThread[];
  providerThreads: MarketplaceThread[];
  browseRequests: BrowseRequest[];
  sponsoredAds: SponsoredAd[];
}

const STORAGE_KEY = 'skopyr:marketplace-state';

export function createThreadKey(subject: string, providerName: string) {
  return `${subject.toLowerCase().replace(/\s+/g, '-')}-${providerName.toLowerCase().replace(/\s+/g, '-')}`;
}

function nextMessageId(thread: MarketplaceThread) {
  return thread.conversation.length + 1;
}

function addMinutesAgoLabel(index: number) {
  return `${(index + 1) * 4}m ago`;
}

const INITIAL_STATE: MarketplaceState = {
  customerThreads: [
    {
      id: 'customer-thread-1',
      threadKey: 'generator-amaka',
      counterpart: 'Amaka Eze',
      category: 'Generator repair',
      preview: 'I can be at Games Village by 3:30 PM. Do you want me to bring replacement plugs too?',
      time: '4m ago',
      unread: true,
      subject: 'Generator not starting',
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
      id: 'customer-thread-2',
      threadKey: 'generator-chidi',
      counterpart: 'Chidi Okonkwo',
      category: 'Generator repair',
      preview: 'I just sent a revised quote that includes diagnostics and fuel system checks.',
      time: '19m ago',
      unread: true,
      subject: 'Generator not starting',
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
      id: 'customer-thread-3',
      threadKey: 'support-escrow-update',
      counterpart: 'Skopyr support',
      category: 'Escrow update',
      preview: 'Your payment for the AC repair job is still protected in escrow until you confirm completion.',
      time: 'Yesterday',
      unread: false,
      subject: 'Escrow update',
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
  ],
  providerThreads: [
    {
      id: 'provider-thread-1',
      threadKey: 'provider-aisha',
      counterpart: 'Aisha Bello',
      category: 'Generator repair',
      preview: 'Can you still make it to Wuse today if I accept your bid this afternoon?',
      time: '2m ago',
      unread: true,
      subject: 'Generator not starting',
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
      id: 'provider-thread-2',
      threadKey: 'provider-david',
      counterpart: 'David Ogunleye',
      category: 'Solar and inverter',
      preview: 'I like your profile. Are you available for a same-day solar inverter inspection?',
      time: '13m ago',
      unread: true,
      subject: 'Solar inverter inspection',
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
      id: 'provider-thread-3',
      threadKey: 'provider-payouts',
      counterpart: 'Skopyr payouts',
      category: 'Earnings',
      preview: 'NGN 36,000 from the Maitama deep clean job has been released to your payout balance.',
      time: 'Today',
      unread: false,
      subject: 'Earnings',
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
  ],
  browseRequests: [
    {
      id: 1,
      title: 'Generator not starting',
      cat: 'generator',
      budget: 'NGN 15k - NGN 25k',
      loc: 'Games Village',
      when: 'ASAP',
      bids: 3,
      ago: '12m',
      requester: 'Aisha Bello',
      summary: 'Mikano set is turning over but not firing. Need someone today.',
    },
    {
      id: 2,
      title: 'Kitchen sink leaking badly',
      cat: 'plumbing',
      budget: 'NGN 8k - NGN 15k',
      loc: 'Gwarinpa',
      when: 'Today',
      bids: 5,
      ago: '28m',
      requester: 'Tolu Adesina',
      summary: 'Leak under the basin and water pressure is getting worse.',
    },
    {
      id: 3,
      title: 'Deep clean 3BR flat',
      cat: 'cleaning',
      budget: 'NGN 20k - NGN 35k',
      loc: 'Maitama',
      when: 'Weekend',
      bids: 7,
      ago: '1h',
      requester: 'Ngozi Okafor',
      summary: 'Need post-tenant deep cleaning before new move-in this weekend.',
    },
    {
      id: 4,
      title: 'Car AC blowing hot air',
      cat: 'auto',
      budget: 'NGN 10k - NGN 30k',
      loc: 'Wuse II',
      when: 'Tomorrow',
      bids: 2,
      ago: '45m',
      requester: 'David Ogunleye',
      summary: 'Likely compressor issue. Looking for fast diagnosis and repair.',
    },
  ],
  sponsoredAds: [
    {
      id: 'ad-1',
      providerName: 'Sparkline Power',
      service: 'Generator repair',
      headline: 'Sponsor your power fix with same-day generator specialists',
      body: 'Featured across Skopyr home, browse, and inbox surfaces with a 30-day repair warranty.',
      location: 'Abuja',
      startingPrice: 'From NGN 18k',
      cta: 'Message sponsor',
      badge: 'Sponsored',
      budget: 'NGN 20k / week',
      active: true,
    },
    {
      id: 'ad-2',
      providerName: 'PolarCool Services',
      service: 'AC repair',
      headline: 'Be the first provider buyers see for AC repairs in Abuja',
      body: 'Featured placement above fold with direct message CTA and same-day availability.',
      location: 'Wuse and Maitama',
      startingPrice: 'From NGN 12k',
      cta: 'Open ad',
      badge: 'Top spot',
      budget: 'NGN 14k / week',
      active: true,
    },
    {
      id: 'ad-3',
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
    },
  ],
};

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

export function useMarketplaceState() {
  const [state, setState] = useState<MarketplaceState>(INITIAL_STATE);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = safeParse(window.localStorage.getItem(STORAGE_KEY));

    if (stored) {
      setState(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return [state, setState] as const;
}

function ensureThread(
  threads: MarketplaceThread[],
  threadKey: string,
  counterpart: string,
  category: string,
  subject: string,
  initialDirection: ConversationEntry['direction'],
  initialMessage: string,
) {
  const existing = threads.find((thread) => thread.threadKey === threadKey);

  if (existing) {
    return existing;
  }

  return {
    id: `${threadKey}-${threads.length + 1}`,
    threadKey,
    counterpart,
    category,
    preview: initialMessage,
    time: 'Just now',
    unread: initialDirection === 'incoming',
    subject,
    conversation: [
      {
        id: 1,
        sender: initialDirection === 'incoming' ? counterpart : 'You',
        body: initialMessage,
        time: 'Just now',
        direction: initialDirection,
      },
    ],
  };
}

export function addCustomerProviderMessage(
  state: MarketplaceState,
  input: {
    providerName: string;
    requesterName: string;
    category: string;
    subject: string;
    body: string;
    senderRole: AppRole;
  },
) {
  const threadKey = createThreadKey(input.subject, input.providerName);

  const customerBase = ensureThread(
    state.customerThreads,
    threadKey,
    input.providerName,
    input.category,
    input.subject,
    input.senderRole === 'provider' ? 'incoming' : 'outgoing',
    input.body,
  );

  const providerBase = ensureThread(
    state.providerThreads,
    threadKey,
    input.requesterName,
    input.category,
    input.subject,
    input.senderRole === 'customer' ? 'incoming' : 'outgoing',
    input.body,
  );

  const customerMessage: ConversationEntry = {
    id: nextMessageId(customerBase),
    sender: input.senderRole === 'customer' ? 'You' : input.providerName,
    body: input.body,
    time: 'Just now',
    direction: input.senderRole === 'customer' ? 'outgoing' : 'incoming',
  };

  const providerMessage: ConversationEntry = {
    id: nextMessageId(providerBase),
    sender: input.senderRole === 'provider' ? 'You' : input.requesterName,
    body: input.body,
    time: 'Just now',
    direction: input.senderRole === 'provider' ? 'outgoing' : 'incoming',
  };

  const updateThread = (
    threads: MarketplaceThread[],
    thread: MarketplaceThread,
    message: ConversationEntry,
    unread: boolean,
  ) => {
    const exists = threads.some((item) => item.threadKey === thread.threadKey);
    const updated = exists
      ? threads.map((item) => {
          if (item.threadKey !== thread.threadKey) {
            return item;
          }

          return {
            ...item,
            preview: message.body,
            time: 'Just now',
            unread,
            conversation: [...item.conversation, message],
          };
        })
      : [
          {
            ...thread,
            preview: message.body,
            time: 'Just now',
            unread,
          },
          ...threads,
        ];

    return updated.map((item, index) => ({
      ...item,
      time: item.time === 'Just now' ? 'Just now' : addMinutesAgoLabel(index),
    }));
  };

  return {
    ...state,
    customerThreads: updateThread(
      state.customerThreads,
      customerBase,
      customerMessage,
      input.senderRole === 'provider',
    ),
    providerThreads: updateThread(
      state.providerThreads,
      providerBase,
      providerMessage,
      input.senderRole === 'customer',
    ),
  };
}

export function markThreadRead(state: MarketplaceState, role: AppRole, threadId: string) {
  const key = role === 'provider' ? 'providerThreads' : 'customerThreads';

  return {
    ...state,
    [key]: state[key].map((thread) => (thread.id === threadId ? { ...thread, unread: false } : thread)),
  } as MarketplaceState;
}

export function addSponsoredAd(
  state: MarketplaceState,
  providerName: string,
  draft: AdDraft,
) {
  const newAd: SponsoredAd = {
    id: `ad-${Date.now()}`,
    providerName,
    service: draft.service,
    headline: draft.headline,
    body: draft.body,
    location: draft.location,
    startingPrice: draft.startingPrice,
    cta: 'Message sponsor',
    badge: draft.badge || 'Sponsored',
    budget: draft.budget,
    active: true,
  };

  return {
    ...state,
    sponsoredAds: [newAd, ...state.sponsoredAds].slice(0, 6),
  };
}

export function toggleSponsoredAd(state: MarketplaceState, adId: string) {
  return {
    ...state,
    sponsoredAds: state.sponsoredAds.map((ad) => (ad.id === adId ? { ...ad, active: !ad.active } : ad)),
  };
}
