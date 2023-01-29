import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import { PAWNSHOP_NAME, SOLANA_RPC_URL } from "config";
import idl from "idl/pawn_shop.json";
import auctionIdl from "idl/auction.json";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { HyperspaceClient } from "hyperspace-client-js";
import { HYPERSPACE_API_KEY } from 'config';

const hsClient = new HyperspaceClient(HYPERSPACE_API_KEY);
const programId = new PublicKey(idl.metadata.address);
const auctionProgramId = new PublicKey(auctionIdl.metadata.address);
export const getConnection = () => {
    // const rpc = clusterApiUrl('devnet');
    return new Connection(SOLANA_RPC_URL, "confirmed");
};

export const getMetaplex = () => {
    return new Metaplex(getConnection());
};

export const getPawnShopAddress = async (pawnShopName: string = PAWNSHOP_NAME) => {
    return await PublicKey.findProgramAddress(
        [
            Buffer.from("pawn-shop"),
            Buffer.from(pawnShopName),
        ],
        programId
    );
};

export const getLoanAddress = async (nftMint: PublicKey, pawnShop: PublicKey) => {
    return await PublicKey.findProgramAddress(
        [
            Buffer.from("loan"),
            pawnShop.toBuffer(),
            nftMint.toBuffer()
        ],
        programId
    )
};

export const getAta = async (owner: PublicKey, mint: PublicKey, allowOffCurve: boolean = false) => {
    return getAssociatedTokenAddress(mint, owner, allowOffCurve);
};

export const getGlobalAddress = async () => {
    return await PublicKey.findProgramAddress(
        [
            Buffer.from("global"),
        ],
        auctionProgramId
    );
};

export const getAuctionAddress = async (nftMint: PublicKey) => {
    return await PublicKey.findProgramAddress(
        [
            Buffer.from("auction"),
            nftMint.toBuffer()
        ],
        auctionProgramId
    )
};

export async function getFloorPrice(mintAddress: PublicKey) {
    try {
      const metaplex = getMetaplex();
      const nft = await metaplex.nfts().findByMint({ mintAddress });
      const creator = nft.creators[0].address;
      let floorPrice = 0;
      const res = await hsClient.getProjects({ condition: { projectIds: [creator.toString()] } });
      if (res.getProjectStats.project_stats?.length) {
        const project = res.getProjectStats.project_stats[0];
        floorPrice = project.floor_price || 0;
      }
      return floorPrice;
    } catch (error) {
      console.log(error);
    }
    return 0;
  }