import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getMarketplaceState } from '@/lib/marketplace-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const state = await getMarketplaceState(session?.user);
    return res.status(200).json({ state });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load marketplace data.';
    return res.status(500).json({ message });
  }
}
