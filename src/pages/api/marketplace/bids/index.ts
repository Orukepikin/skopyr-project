import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createMarketplaceBid } from '@/lib/marketplace-server';
import type { BidDraft } from '@/lib/marketplace';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({
        message: 'Sign in with Google before sending a bid.',
      });
    }
    const bid = await createMarketplaceBid(session?.user, req.body as BidDraft);
    return res.status(200).json({ bid });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to create the provider bid.';
    return res.status(500).json({ message });
  }
}
