import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createMarketplaceRequest } from '@/lib/marketplace-server';
import type { RequestDraft } from '@/lib/marketplace';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({
        message: 'Sign in with Google before posting a request.',
      });
    }
    const request = await createMarketplaceRequest(
      session?.user,
      req.body as RequestDraft,
    );
    return res.status(200).json({ request });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to create the request.';
    return res.status(500).json({ message });
  }
}
