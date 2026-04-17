import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import '@/styles/globals.css';

type SkopyrAppProps = AppProps<{
  session: Session | null;
}>;

export default function App({ Component, pageProps }: SkopyrAppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
