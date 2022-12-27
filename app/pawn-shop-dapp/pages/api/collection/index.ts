// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken';
import collections from "data/collections.json";
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import { authorizedAdmins, JWT_TOKEN } from 'config';
import fs from "fs";

type Data = {
  success: boolean;
  error?: string;
}

type Payload = {
  wallet: string;
  message: string;
  signature: number[];
}

export type Collection = {
  address: string;
  percent: number;
}

export function getPayload(req: NextApiRequest): Payload | undefined {
  const authorizationHeader = req.headers['authorization'];
  
  let token;
  if (authorizationHeader) {
      token = authorizationHeader.split(' ')[1];
  }
  if (token) {
      const { payload } = jwt.verify(token, JWT_TOKEN, { complete: true });
      return payload as Payload;
  }
}

function isVerified(payload: Payload) {
  const { message, wallet, signature } = payload;
  const verified = nacl.sign.detached.verify(
      new Uint8Array(Buffer.from(message)), 
      new Uint8Array(Buffer.from(signature)), 
      new PublicKey(wallet).toBytes()
  );
  return verified;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { collection, loanPercent } = req.body;
  const payload = getPayload(req);
  if (!payload || !isVerified(payload) || !authorizedAdmins.includes(payload.wallet)) {
    return res.status(402).json({ error: "Unauthorized Wallet", success: false});
  }

  const newCollections: Collection[] = collections;
  const index = newCollections.map((collection: Collection) => collection.address).indexOf(collection);
  if (index === -1) {
    newCollections.push({ address: collection, percent: loanPercent });
  } else {
    newCollections[index].percent = loanPercent;
    if (loanPercent === 0) {
      newCollections.splice(index, 1);
    }
  }

  fs.writeFileSync('data/collections.json', JSON.stringify(newCollections));
  res.status(200).json({ success: true })
}
