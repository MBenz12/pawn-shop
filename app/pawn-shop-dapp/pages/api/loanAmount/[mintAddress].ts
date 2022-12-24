import { PublicKey } from '@solana/web3.js';
import type { NextApiRequest, NextApiResponse } from 'next'
import { getMetaplex } from 'utils';
import { HyperspaceClient } from "hyperspace-client-js";
import { HYPERSPACE_API_KEY } from 'config';
const hsClient = new HyperspaceClient(HYPERSPACE_API_KEY);

type Data = {
  loanAmount: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  let { mintAddress } = req.query;
  if (typeof mintAddress === 'object') mintAddress = mintAddress[0];
  let loanAmount;
  if (!mintAddress) loanAmount = 0;
  else loanAmount = await getLoanAmount(mintAddress);
  res.status(200).json({ loanAmount });
}

export async function getLoanAmount(mintAddress: string) {
  try {
    const metaplex = getMetaplex();
    const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mintAddress) });
    const creator = nft.creators[0].address;
    let floorPrice = 0;
    const res = await hsClient.getProjects({ condition: { projectIds: [creator.toString()] } });
    if (res.getProjectStats.project_stats?.length) {
      const project = res.getProjectStats.project_stats[0];
      floorPrice = project.floor_price || 0;
    }
    return floorPrice;
  } catch (error) {
    // console.log(error);
  }
  return 0;
}