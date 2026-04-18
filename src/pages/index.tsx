import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import Splash from '@/components/Splash';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import RequestForm from '@/components/RequestForm';
import BidsView from '@/components/BidsView';
import BrowseJobs from '@/components/BrowseJobs';
import ProfileDashboard from '@/components/ProfileDashboard';
import { SelectedCategory } from '@/lib/constants';
import type { DashboardDetail, DashboardRole } from '@/lib/dashboard';
import { useMarketplace } from '@/lib/marketplace-client';
import {
  type AdDraft,
  buildMarketplaceBids,
  type BidUpdateDraft,
  type MarketplaceBid,
  type RequestDraft,
  type SponsoredAd,
} from '@/lib/marketplace';

type Screen = 'splash' | 'home' | 'categories' | 'form' | 'bids' | 'browse' | 'dashboard';

const siteUrl = 'https://www.skopyr.com';
const ACTIVE_REQUEST_STORAGE_KEY = 'skopyr:active-request-id';

interface AdCheckoutPayload {
  accessCode: string;
  reference: string;
  amount: number;
  planId: string;
  planName: string;
  budgetLabel: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const marketplace = useMarketplace(session?.user);
  const [screen, setScreen] = useState<Screen>('splash');
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory | null>(null);
  const [dashboardRole, setDashboardRole] = useState<DashboardRole>('customer');
  const [dashboardDetail, setDashboardDetail] = useState<DashboardDetail | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  const navigate = (nextScreen: Screen) => setScreen(nextScreen);
  const navigateDashboard = (role: DashboardRole, detail: DashboardDetail | null = null) => {
    setDashboardRole(role);
    setDashboardDetail(detail);
    setScreen('dashboard');
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedRequestId = window.localStorage.getItem(ACTIVE_REQUEST_STORAGE_KEY);

    if (storedRequestId) {
      setActiveRequestId(storedRequestId);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (activeRequestId) {
      window.localStorage.setItem(ACTIVE_REQUEST_STORAGE_KEY, activeRequestId);
      return;
    }

    window.localStorage.removeItem(ACTIVE_REQUEST_STORAGE_KEY);
  }, [activeRequestId]);

  useEffect(() => {
    if (marketplace.state.viewer?.rolePreference) {
      setDashboardRole(marketplace.state.viewer.rolePreference);
    }
  }, [marketplace.state.viewer?.rolePreference]);

  useEffect(() => {
    if (status !== 'authenticated' || typeof window === 'undefined') {
      return;
    }

    const returnScreen = window.localStorage.getItem('skopyr:return-screen');
    const returnRole = window.localStorage.getItem('skopyr:return-role');

    if (returnScreen === 'bids') {
      navigate('bids');
    }

    if (returnScreen === 'dashboard') {
      navigateDashboard(returnRole === 'provider' ? 'provider' : 'customer');
    }

    window.localStorage.removeItem('skopyr:return-screen');
    window.localStorage.removeItem('skopyr:return-role');
  }, [status]);

  const activeRequest = useMemo(
    () =>
      marketplace.state.browseRequests.find((request) => request.id === activeRequestId) ??
      (marketplace.state.viewer
        ? marketplace.state.browseRequests.find(
            (request) => request.requesterProfileId === marketplace.state.viewer?.id,
          ) ?? null
        : null),
    [activeRequestId, marketplace.state.browseRequests, marketplace.state.viewer],
  );

  const liveBids = useMemo(
    () => buildMarketplaceBids(activeRequest, marketplace.state.requestBids),
    [activeRequest, marketplace.state.requestBids],
  );

  const providerOwnedAds = useMemo(
    () =>
      marketplace.state.sponsoredAds.filter(
        (ad) => ad.providerProfileId && ad.providerProfileId === marketplace.state.viewer?.id,
      ),
    [marketplace.state.sponsoredAds, marketplace.state.viewer?.id],
  );

  const providerSubmittedBids = useMemo(
    () =>
      marketplace.state.requestBids.filter(
        (bid) => bid.providerProfileId && bid.providerProfileId === marketplace.state.viewer?.id,
      ),
    [marketplace.state.requestBids, marketplace.state.viewer?.id],
  );

  const providerBidMap = useMemo(
    () =>
      providerSubmittedBids.reduce<Record<string, MarketplaceBid>>((accumulator, bid) => {
        accumulator[bid.serviceRequestId] = bid;
        return accumulator;
      }, {}),
    [providerSubmittedBids],
  );

  const browseableRequests = useMemo(
    () =>
      marketplace.state.browseRequests.filter(
        (request) => request.requesterProfileId !== marketplace.state.viewer?.id,
      ),
    [marketplace.state.browseRequests, marketplace.state.viewer?.id],
  );

  const seoJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${siteUrl}/#organization`,
          name: 'Skopyr',
          url: siteUrl,
          description:
            'Skopyr is a reverse marketplace in Abuja where buyers post service requests, providers promote services, message directly, and payments stay protected with escrow.',
        },
        {
          '@type': 'WebSite',
          '@id': `${siteUrl}/#website`,
          url: siteUrl,
          name: 'Skopyr',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${siteUrl}/?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@type': 'Service',
          name: 'Home services marketplace in Abuja',
          provider: {
            '@id': `${siteUrl}/#organization`,
          },
          areaServed: 'Abuja, Nigeria',
          serviceType: [
            'Generator repair',
            'Plumbing',
            'Cleaning',
            'AC repair',
            'Solar and inverter support',
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'How do buyers and providers message each other on Skopyr?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Buyers can message providers from bids and sponsored service cards, while providers can message buyers from live requests and their profile inbox. Every conversation syncs into both sides of the dashboard.',
              },
            },
            {
              '@type': 'Question',
              name: 'How do provider ads work on Skopyr?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Providers can launch sponsored ads from their dashboard so their services appear above the fold on the homepage and drive direct message conversations.',
              },
            },
            {
              '@type': 'Question',
              name: 'How are provider earnings tracked?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'When a buyer accepts a real provider bid and pays through Paystack, Skopyr creates an escrow record for the buyer and a matching earnings record for the provider dashboard.',
              },
            },
          ],
        },
      ],
    }),
    [],
  );

  const handleCustomerToProviderMessage = async (input: {
    providerProfileId?: string | null;
    providerName: string;
    category: string;
    subject: string;
    body: string;
    serviceRequestId?: string | null;
  }) => {
    const threadId = await marketplace.sendMessage({
      senderRole: 'customer',
      providerProfileId: input.providerProfileId,
      subject: input.subject,
      category: input.category,
      body: input.body,
      serviceRequestId: input.serviceRequestId,
    });

    navigateDashboard('customer', threadId ? { kind: 'message', id: threadId } : null);
  };

  const handleProviderToCustomerMessage = async (input: {
    requesterName: string;
    requesterProfileId?: string | null;
    category: string;
    subject: string;
    body: string;
    serviceRequestId?: string | null;
  }) => {
    const threadId = await marketplace.sendMessage({
      senderRole: 'provider',
      customerProfileId: input.requesterProfileId,
      subject: input.subject,
      category: input.category,
      body: input.body,
      serviceRequestId: input.serviceRequestId,
    });

    navigateDashboard('provider', threadId ? { kind: 'message', id: threadId } : null);
  };

  const handleCreateBid = async (requestId: string, draft: BidUpdateDraft) => {
    const bid = await marketplace.createBid({
      serviceRequestId: requestId,
      amount: draft.amount,
      eta: draft.eta,
      message: draft.message,
    });

    if (bid?.id) {
      navigateDashboard('provider', { kind: 'bid', id: bid.id });
    }
  };

  const handleUpdateBid = async (bidId: string, draft: BidUpdateDraft) => {
    const bid = await marketplace.updateBid(bidId, draft);

    if (bid?.id) {
      setDashboardDetail({ kind: 'bid', id: bid.id });
    }
  };

  const handleCreateAdCheckout = async (draft: AdDraft) => {
    if (marketplace.mode === 'fallback') {
      await marketplace.createAd(draft);
      return { mode: 'created' as const };
    }

    const response = await fetch('/api/paystack/ads/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(draft),
    });
    const payload = (await response.json()) as AdCheckoutPayload & { message?: string };

    if (!response.ok) {
      throw new Error(payload.message || 'Unable to initialize the ad checkout.');
    }

    return {
      mode: 'checkout' as const,
      ...payload,
    };
  };

  const handleVerifyAdPayment = async (reference: string) => {
    if (marketplace.mode === 'fallback') {
      return true;
    }

    const response = await fetch(
      `/api/paystack/ads/verify?reference=${encodeURIComponent(reference)}`,
    );
    const payload = (await response.json()) as { verified?: boolean; message?: string };

    if (!response.ok || !payload.verified) {
      throw new Error(payload.message || 'Unable to verify the sponsored ad payment.');
    }

    await marketplace.refresh();
    return true;
  };

  const handleDashboardReply = async (role: DashboardRole, threadId: string, body: string) => {
    await marketplace.sendMessage({
      senderRole: role,
      threadId,
      body,
    });
  };

  const handleCreateRequest = async (draft: RequestDraft) => {
    const request = await marketplace.createRequest(draft);

    if (request?.id) {
      setActiveRequestId(request.id);
      setScreen('bids');
    }
  };

  const handleRoleChange = (nextRole: DashboardRole) => {
    setDashboardRole(nextRole);
    void marketplace.setRolePreference(nextRole);
  };

  const handleOpenThread = (role: DashboardRole, threadId: string) => {
    void marketplace.markThreadRead(role, threadId);
  };

  return (
    <>
      <Head>
        <title>Skopyr | Hire trusted service providers in Abuja</title>
        <meta
          name="description"
          content="Skopyr helps buyers in Abuja post jobs, message trusted providers, compare real provider bids, run protected escrow payments, and discover sponsored services that stand out."
        />
        <meta
          name="robots"
          content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        />
        <meta
          name="keywords"
          content="Abuja service providers, reverse marketplace Nigeria, generator repair Abuja, plumbers Abuja, AC repair Abuja, sponsored service ads, provider earnings"
        />
        <link rel="canonical" href={siteUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Skopyr | Hire trusted service providers in Abuja" />
        <meta
          property="og:description"
          content="Post what you need, message providers directly, compare live provider bids, and promote your services with premium sponsored placements on Skopyr."
        />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:site_name" content="Skopyr" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Skopyr | Hire trusted service providers in Abuja" />
        <meta
          name="twitter:description"
          content="Buyers and providers can message each other, pay through escrow, and launch sponsored ads that appear above the fold."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seoJsonLd) }}
        />
      </Head>

      {screen === 'splash' && <Splash onComplete={() => navigate('home')} />}
      {screen === 'home' && (
        <Hero
          onPost={() => navigate('categories')}
          onBrowse={() => navigate('browse')}
          onDashboard={(role) => navigateDashboard(role)}
          sponsoredAds={marketplace.state.sponsoredAds}
          onMessageSponsor={(ad: SponsoredAd) =>
            void handleCustomerToProviderMessage({
              providerProfileId: ad.providerProfileId,
              providerName: ad.providerName,
              category: ad.service,
              subject: `${ad.service} enquiry`,
              body: `Hi ${ad.providerName.split(' ')[0]}, I found your sponsored service and I want to know if you can help me in ${ad.location}.`,
            })
          }
        />
      )}
      {screen === 'categories' && (
        <Categories
          onSelect={(category) => {
            setSelectedCategory(category);
            navigate('form');
          }}
          onBack={() => navigate('home')}
        />
      )}
      {screen === 'form' && selectedCategory && (
        <RequestForm
          category={selectedCategory}
          onSubmit={handleCreateRequest}
          onBack={() => navigate('categories')}
        />
      )}
      {screen === 'bids' && (
        <BidsView
          request={activeRequest}
          bids={liveBids}
          onBack={() => navigate(selectedCategory ? 'form' : 'home')}
          onHome={() => navigate('home')}
          onMessageProvider={handleCustomerToProviderMessage}
        />
      )}
      {screen === 'browse' && (
        <BrowseJobs
          onBack={() => navigate('home')}
          requests={browseableRequests}
          providerBidMap={providerBidMap}
          onSubmitBid={(request, draft) => void handleCreateBid(request.id, draft)}
          onMessageRequester={(request) =>
            void handleProviderToCustomerMessage({
              requesterName: request.requester,
              requesterProfileId: request.requesterProfileId,
              category: request.categoryName,
              subject: request.title,
              serviceRequestId: request.id,
              body: `Hi ${request.requester.split(' ')[0]}, I saw your request for "${request.title}" and I can help. Can I ask a few quick questions before I send my final bid?`,
            })
          }
        />
      )}
      {screen === 'dashboard' && (
        <ProfileDashboard
          role={dashboardRole}
          userName={marketplace.state.viewer?.name || session?.user?.name}
          userEmail={marketplace.state.viewer?.email || session?.user?.email}
          customerThreads={marketplace.state.customerThreads}
          providerThreads={marketplace.state.providerThreads}
          requestBids={marketplace.state.requestBids}
          providerBids={providerSubmittedBids}
          sponsoredAds={providerOwnedAds}
          customerRequests={marketplace.state.customerRequests}
          providerLeads={marketplace.state.providerLeads}
          customerEscrows={marketplace.state.customerEscrows}
          providerBalance={marketplace.state.providerBalance}
          providerPayouts={marketplace.state.providerPayouts}
          initialDetail={dashboardDetail}
          onRoleChange={handleRoleChange}
          onHome={() => navigate('home')}
          onBrowse={() => navigate('browse')}
          onPost={() => navigate('categories')}
          onSendMessage={(role, threadId, body) => {
            void handleDashboardReply(role, threadId, body);
          }}
          onOpenThread={handleOpenThread}
          onCreateAd={handleCreateAdCheckout}
          onVerifyAdPayment={handleVerifyAdPayment}
          onUpdateBid={(bidId, draft) => {
            void handleUpdateBid(bidId, draft);
          }}
          onToggleAd={(adId) => {
            void marketplace.toggleAd(adId);
          }}
          onClearInitialDetail={() => setDashboardDetail(null)}
        />
      )}
    </>
  );
}
