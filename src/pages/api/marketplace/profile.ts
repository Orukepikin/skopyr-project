import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { updateProfileRole } from '@/lib/marketplace-server';
import type { AppRole } from '@/lib/marketplace';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const rolePreference = await updateProfileRole(
      session?.user,
      (req.body as { role: AppRole }).role,
    );
    return res.status(200).json({ rolePreference: rolePreference.rolePreference });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to update the profile.';
    return res.status(500).json({ message });
  }
}
