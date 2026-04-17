import Head from 'next/head';
import { useState } from 'react';
import Splash from '@/components/Splash';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import RequestForm from '@/components/RequestForm';
import BidsView from '@/components/BidsView';
import BrowseJobs from '@/components/BrowseJobs';
import { Category } from '@/lib/constants';

type Screen = 'splash' | 'home' | 'categories' | 'form' | 'bids' | 'browse';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const navigate = (s: Screen) => setScreen(s);

  return (
    <>
      <Head>
        <title>Skopyr — Scope the best. Pick the best.</title>
      </Head>

      {screen === 'splash' && <Splash onComplete={() => navigate('home')} />}
      {screen === 'home' && <Hero onPost={() => navigate('categories')} onBrowse={() => navigate('browse')} />}
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
    </>
  );
}
