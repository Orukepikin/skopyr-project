import { getProviders } from 'next-auth/react';

export async function isGoogleProviderAvailable() {
  const providers = await getProviders();
  return Boolean(providers?.google);
}
