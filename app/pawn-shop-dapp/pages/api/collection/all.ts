// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Collection } from '.'
import collections from 'data/collections.json';


export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Collection[]>
) {
  res.status(200).json(collections);
}
