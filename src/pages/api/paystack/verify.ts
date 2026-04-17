import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyPaystackTransaction } from '@/lib/paystack';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const reference = Array.isArray(req.query.reference) ? req.query.reference[0] : req.query.reference;

  if (!reference) {
    return res.status(400).json({ message: 'Payment reference is required.' });
  }

  try {
    const response = await verifyPaystackTransaction(reference);

    if (response.data.status !== 'success') {
      return res.status(400).json({
        message: `Payment has not completed successfully. Current status: ${response.data.status}.`,
      });
    }

    return res.status(200).json({
      verified: true,
      reference: response.data.reference,
      amount: response.data.amount,
      currency: response.data.currency,
      channel: response.data.channel,
      paidAt: response.data.paid_at,
      customerEmail: response.data.customer.email,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to verify Paystack payment.';
    return res.status(500).json({ message });
  }
}
