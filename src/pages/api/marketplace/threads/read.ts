import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { markMarketplaceThreadRead } from '@/lib/marketplace-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({
        message: 'Sign in with Google before opening marketplace threads.',
      });
    }
    const { threadId } = req.body as { threadId: string };
    await markMarketplaceThreadRead(session?.user, threadId);
    return res.status(200).json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to mark the thread as read.';
    return res.status(500).json({ message });
  }
}
