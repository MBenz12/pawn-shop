import { AnchorProvider, BN, Program } from '@project-serum/anchor';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from '@solana/web3.js';
import { IDL } from 'idl/pawn_shop';
import idl from 'idl/pawn_shop.json';
import type { NextApiRequest, NextApiResponse } from 'next'
import { getAta, getConnection, getLoanAddress, getPawnShopAddress } from 'utils';
import { getLoanAmount } from './loanAmount/[mintAddress]';
const SITE_KEYPAIR = [
  161, 39, 159, 108, 238, 107, 72, 188, 47, 149, 172, 136, 162, 177, 255, 246,
  194, 4, 123, 169, 90, 202, 103, 92, 81, 205, 147, 49, 208, 195, 205, 56, 154,
  13, 169, 190, 13, 69, 177, 38, 251, 181, 248, 65, 128, 174, 130, 255, 54, 91,
  52, 238, 100, 31, 142, 227, 152, 111, 69, 47, 90, 68, 217, 254,
];
const keypair = Keypair.fromSecretKey(Buffer.from(SITE_KEYPAIR));
const wallet = new NodeWallet(keypair);
const provider = new AnchorProvider(getConnection(), wallet, {
  preflightCommitment: "processed",
});
const program = new Program(IDL, idl.metadata.address, provider);

type Data = {
  serializedBuffer: string
}
export const backendWallet = wallet.publicKey.toString();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  let { mintAddress, owner: ownerAddress } = req.body;
  if (typeof mintAddress === 'object') mintAddress = mintAddress[0];
  let loanAmount;
  if (!mintAddress) loanAmount = 0;
  else loanAmount = await getLoanAmount(mintAddress);
  console.log(mintAddress, loanAmount);
  
  const backend = wallet.publicKey;
  const nftMint = new PublicKey(mintAddress);
  const owner = new PublicKey(ownerAddress);
  const [pawnShop] = await getPawnShopAddress();
  const [loan] = await getLoanAddress(nftMint, pawnShop);
  const ownerNftAta = await getAta(owner, nftMint);
  const loanNftAta = await getAta(loan, nftMint, true);

  const transaction = new Transaction();
  transaction.add(
    program.instruction.createLoan(
      new BN(loanAmount * LAMPORTS_PER_SOL),
      {
        accounts: {
          owner,
          backend,
          pawnShop,
          loan,
          nftMint,
          ownerNftAta,
          loanNftAta,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY
        }
      }
    )
  );
  transaction.feePayer = owner;
  transaction.recentBlockhash = (await program.provider.connection.getLatestBlockhash("finalized")).blockhash;
  transaction.partialSign(keypair);
  const serializedBuffer = transaction.serialize({ requireAllSignatures: false }).toString("base64");
  res.status(200).json({ serializedBuffer });
}