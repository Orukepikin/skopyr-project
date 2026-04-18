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
import {
  addCustomerProviderMessage,
  addSponsoredAd,
  createThreadKey,
  toggleSponsoredAd,
  useMarketplaceState,
} from '@/lib/marketplace';

type Screen = 'splash' | 'home' | 'categories' | 'form' | 'bids' | 'browse' | 'dashboard';

const siteUrl = 'https://www.skopyr.com';

export default function Home() {
  const { data: session, status } = useSession();
  const [screen, setScreen] = useState<Screen>('splash');
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory | null>(null);
  const [dashboardRole, setDashboardRole] = useState<DashboardRole>('customer');
  const [dashboardDetail, setDashboardDetail] = useState<DashboardDetail | null>(null);
  const [marketplaceState, setMarketplaceState] = useMarketplaceState();

  const navigate = (nextScreen: Screen) => setScreen(nextScreen);
  const navigateDashboard = (role: DashboardRole, detail: DashboardDetail | null = null) => {
    setDashboardRole(role);
    setDashboardDetail(detail);
    setScreen('dashboard');
  };

  useEffect(() => {
    if (status !== 'authenticated') {
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
            'Skopyr is a reverse marketplace in Abuja where buyers post service requests, providers compete, and payments are protected with escrow.',
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
                text: 'Buyers can message providers from bids and sponsored service cards, while providers can message requesters from open jobs and their dashboard inbox.',
              },
            },
            {
              '@type': 'Question',
              name: 'How do sponsored ads work on Skopyr?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Providers can launch sponsored campaigns from their dashboard so their services appear in premium homepage placements with a direct message call to action.',
              },
            },
          ],
        },
      ],
    }),
    []
  );

  const handleCustomerToProviderMessage = (input: {
    providerName: string;
    category: string;
    subject: string;
    body: string;
  }) => {
    const requesterName = session?.user?.name || 'Buyer';
    const threadKey = createThreadKey(input.subject, input.providerName);
    let nextThreadId = '';

    setMarketplaceState((current) => {
      const next = addCustomerProviderMessage(current, {
        ...input,
        requesterName,
        senderRole: 'customer',
      });
      nextThreadId = next.customerThreads.find((thread) => thread.threadKey === threadKey)?.id || '';
      return next;
    });

    navigateDashboard('customer', nextThreadId ? { kind: 'message', id: nextThreadId } : null);
  };

  const handleProviderToCustomerMessage = (input: {
    requesterName: string;
    category: string;
    subject: string;
    body: string;
  }) => {
    const providerName = session?.user?.name || 'Provider';
    const threadKey = createThreadKey(input.subject, providerName);
    let nextThreadId = '';

    setMarketplaceState((current) => {
      const next = addCustomerProviderMessage(current, {
        ...input,
        providerName,
        senderRole: 'provider',
      });
      nextThreadId = next.providerThreads.find((thread) => thread.threadKey === threadKey)?.id || '';
      return next;
    });

    navigateDashboard('provider', nextThreadId ? { kind: 'message', id: nextThreadId } : null);
  };

  const handleDashboardReply = (role: DashboardRole, threadId: string, body: string) => {
    setMarketplaceState((current) => {
      const threads = role === 'provider' ? current.providerThreads : current.customerThreads;
      const activeThread = threads.find((thread) => thread.id === threadId);

      if (!activeThread) {
        return current;
      }

      if (role === 'provider') {
        return addCustomerProviderMessage(current, {
          providerName: session?.user?.name || 'Provider',
          requesterName: activeThread.counterpart,
          category: activeThread.category,
          subject: activeThread.subject,
          body,
          senderRole: 'provider',
        });
      }

      return addCustomerProviderMessage(current, {
        providerName: activeThread.counterpart,
        requesterName: session?.user?.name || 'Buyer',
        category: activeThread.category,
        subject: activeThread.subject,
        body,
        senderRole: 'customer',
      });
    });
  };

  return (
    <>
      <Head>
        <title>Skopyr | Hire trusted service providers in Abuja</title>
        <meta
          name="description"
          content="Skopyr helps buyers in Abuja post jobs, message trusted providers, compare bids, run protected escrow payments, and discover sponsored services that stand out."
        />
        <meta
          name="robots"
          content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        />
        <meta
          name="keywords"
          content="Abuja service providers, reverse marketplace Nigeria, generator repair Abuja, plumbers Abuja, AC repair Abuja, sponsored service ads"
        />
        <link rel="canonical" href={siteUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Skopyr | Hire trusted service providers in Abuja" />
        <meta
          property="og:description"
          content="Post what you need, message providers directly, compare bids, and promote your services with premium sponsored placements on Skopyr."
        />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:site_name" content="Skopyr" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Skopyr | Hire trusted service providers in Abuja" />
        <meta
          name="twitter:description"
          content="Buyers and providers can message each other, pay through escrow, and launch sponsored service ads that appear above the fold."
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
          sponsoredAds={marketplaceState.sponsoredAds}
          onMessageSponsor={(ad) =>
            handleCustomerToProviderMessage({
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
          onSubmit={() => navigate('bids')}
          onBack={() => navigate('categories')}
        />
      )}
      {screen === 'bids' && (
        <BidsView
          onBack={() => navigate('form')}
          onHome={() => navigate('home')}
          onMessageProvider={handleCustomerToProviderMessage}
        />
      )}
      {screen === 'browse' && (
        <BrowseJobs
          onBack={() => navigate('home')}
          requests={marketplaceState.browseRequests}
          onMessageRequester={(request) =>
            handleProviderToCustomerMessage({
              requesterName: request.requester,
              category: request.title,
              subject: request.title,
              body: `Hi ${request.requester.split(' ')[0]}, I saw your request for "${request.title}" and I can help. Can I ask a few quick questions before I send my final bid?`,
            })
          }
        />
      )}
      {screen === 'dashboard' && (
        <ProfileDashboard
          role={dashboardRole}
          userName={session?.user?.name}
          userEmail={session?.user?.email}
          customerThreads={marketplaceState.customerThreads}
          providerThreads={marketplaceState.providerThreads}
          sponsoredAds={marketplaceState.sponsoredAds}
          initialDetail={dashboardDetail}
          onRoleChange={setDashboardRole}
          onHome={() => navigate('home')}
          onBrowse={() => navigate('browse')}
          onPost={() => navigate('categories')}
          onSendMessage={handleDashboardReply}
          onCreateAd={(draft) =>
            setMarketplaceState((current) => addSponsoredAd(current, session?.user?.name || 'Featured provider', draft))
          }
          onToggleAd={(adId) => setMarketplaceState((current) => toggleSponsoredAd(current, adId))}
          onClearInitialDetail={() => setDashboardDetail(null)}
        />
      )}
    </>
  );
}
