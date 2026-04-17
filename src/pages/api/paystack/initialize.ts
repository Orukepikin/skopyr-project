import crypto from 'node:crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { initializePaystackTransaction } from '@/lib/paystack';

interface InitializeRequestBody {
  amount?: number;
  providerName?: string;
  bidId?: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Sign in with Google before making a payment.' });
  }

  const { amount, providerName, bidId } = req.body as InitializeRequestBody;

  if (!Number.isInteger(amount) || !amount || amount <= 0) {
    return res.status(400).json({ message: 'A valid payment amount is required.' });
  }

  try {
    const reference = `skopyr-${crypto.randomUUID()}`;
    const response = await initializePaystackTransaction({
      amount,
      email: session.user.email,
      reference,
      currency: 'NGN',
      metadata: {
        providerName,
        bidId,
        customerName: session.user.name,
        custom_fields: [
          {
            display_name: 'Provider',
            variable_name: 'provider_name',
            value: providerName ?? 'Unknown provider',
          },
          {
            display_name: 'Bid ID',
            variable_name: 'bid_id',
            value: bidId ?? 'N/A',
          },
        ],
      },
    });

    return res.status(200).json({
      accessCode: response.data.access_code,
      reference: response.data.reference,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to initialize Paystack payment.';
    return res.status(500).json({ message });
  }
}
