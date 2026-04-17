import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const hasGoogleCredentials = Boolean(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET);

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: hasGoogleCredentials
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_ID!,
          clientSecret: process.env.GOOGLE_SECRET!,
        }),
      ]
    : [],
};

export const isGoogleAuthConfigured = hasGoogleCredentials;
