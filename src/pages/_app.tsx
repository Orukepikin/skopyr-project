import type { AppProps } from 'next/app';
import Head from 'next/head';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import '@/styles/globals.css';

type SkopyrAppProps = AppProps<{
  session: Session | null;
}>;

export default function App({ Component, pageProps }: SkopyrAppProps) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.location.hostname !== 'skopyr.com') {
      return;
    }

    const redirectUrl = new URL(window.location.href);
    redirectUrl.hostname = 'www.skopyr.com';
    window.location.replace(redirectUrl.toString());
  }, []);

  return (
    <SessionProvider session={pageProps.session}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
