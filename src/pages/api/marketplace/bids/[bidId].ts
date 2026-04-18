import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { updateMarketplaceBid } from '@/lib/marketplace-server';
import type { BidUpdateDraft } from '@/lib/marketplace';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const bidId = Array.isArray(req.query.bidId) ? req.query.bidId[0] : req.query.bidId;

  if (!bidId) {
    return res.status(400).json({ message: 'Bid id is required.' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const bid = await updateMarketplaceBid(session?.user, bidId, req.body as BidUpdateDraft);
    return res.status(200).json({ bid });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to update the provider bid.';
    return res.status(500).json({ message });
  }
}
