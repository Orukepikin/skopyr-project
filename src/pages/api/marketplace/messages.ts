import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sendMarketplaceMessage } from '@/lib/marketplace-server';
import type { SendMessageInput } from '@/lib/marketplace';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const result = await sendMarketplaceMessage(
      session?.user,
      req.body as SendMessageInput,
    );
    return res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to send the message.';
    return res.status(500).json({ message });
  }
}
