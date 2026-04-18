import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  void req;
  return res.status(403).json({
    message: 'Sponsored ads now require payment checkout. Start them from the provider dashboard.',
  });
}
