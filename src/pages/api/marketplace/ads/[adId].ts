import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { toggleMarketplaceAd } from '@/lib/marketplace-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const adId = Array.isArray(req.query.adId) ? req.query.adId[0] : req.query.adId;

    if (!adId) {
      return res.status(400).json({ message: 'Ad id is required.' });
    }

    const ad = await toggleMarketplaceAd(session?.user, adId);
    return res.status(200).json({ ad });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to update the sponsored ad.';
    return res.status(500).json({ message });
  }
}
