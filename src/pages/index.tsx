import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Splash from '@/components/Splash';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import RequestForm from '@/components/RequestForm';
import BidsView from '@/components/BidsView';
import BrowseJobs from '@/components/BrowseJobs';
import ProfileDashboard from '@/components/ProfileDashboard';
import { SelectedCategory } from '@/lib/constants';
import type { DashboardRole } from '@/lib/dashboard';

type Screen = 'splash' | 'home' | 'categories' | 'form' | 'bids' | 'browse' | 'dashboard';

export default function Home() {
  const { data: session, status } = useSession();
  const [screen, setScreen] = useState<Screen>('splash');
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory | null>(null);
  const [dashboardRole, setDashboardRole] = useState<DashboardRole>('customer');

  const navigate = (s: Screen) => setScreen(s);
  const navigateDashboard = (role: DashboardRole) => {
    setDashboardRole(role);
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

  return (
    <>
      <Head>
        <title>{'Skopyr \u2014 Scope the best. Pick the best.'}</title>
      </Head>

      {screen === 'splash' && <Splash onComplete={() => navigate('home')} />}
      {screen === 'home' && (
        <Hero
          onPost={() => navigate('categories')}
          onBrowse={() => navigate('browse')}
          onDashboard={navigateDashboard}
        />
      )}
      {screen === 'categories' && (
        <Categories
          onSelect={(cat) => { setSelectedCategory(cat); navigate('form'); }}
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
        />
      )}
      {screen === 'browse' && <BrowseJobs onBack={() => navigate('home')} />}
      {screen === 'dashboard' && (
        <ProfileDashboard
          role={dashboardRole}
          userName={session?.user?.name}
          userEmail={session?.user?.email}
          onRoleChange={setDashboardRole}
          onHome={() => navigate('home')}
          onBrowse={() => navigate('browse')}
          onPost={() => navigate('categories')}
        />
      )}
    </>
  );
}
