import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createMarketplaceAd } from '@/lib/marketplace-server';
import type { AdDraft } from '@/lib/marketplace';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const ad = await createMarketplaceAd(session?.user, req.body as AdDraft);
    return res.status(200).json({ ad });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to create the sponsored ad.';
    return res.status(500).json({ message });
  }
}
