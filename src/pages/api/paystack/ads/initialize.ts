import crypto from 'node:crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { recordSponsoredAdPaymentIntent } from '@/lib/marketplace-server';
import { initializePaystackTransaction } from '@/lib/paystack';
import type { AdDraft } from '@/lib/marketplace';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Sign in with Google before launching a sponsored ad.' });
  }

  try {
    const reference = `skopyr-ad-${crypto.randomUUID()}`;
    const intent = await recordSponsoredAdPaymentIntent({
      reference,
      user: {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      },
      draft: req.body as AdDraft,
    });
    const response = await initializePaystackTransaction({
      amount: intent.plan.priceKobo,
      email: session.user.email,
      reference,
      currency: 'NGN',
      metadata: {
        purpose: 'sponsored_ad',
        planId: intent.plan.id,
        service: intent.draft.service,
        headline: intent.draft.headline,
        body: intent.draft.body,
        location: intent.draft.location,
        startingPrice: intent.draft.startingPrice,
        providerName: intent.viewer.full_name || session.user.name,
      },
    });

    return res.status(200).json({
      accessCode: response.data.access_code,
      reference: response.data.reference,
      amount: intent.plan.priceKobo,
      planId: intent.plan.id,
      planName: intent.plan.name,
      budgetLabel: intent.plan.budgetLabel,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to initialize the sponsored ad checkout.';
    return res.status(500).json({ message });
  }
}
