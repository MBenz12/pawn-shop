import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import { PAWNSHOP_NAME, SOLANA_RPC_URL } from "config";
import idl from "idl/pawn_shop.json";
import { getAssociatedTokenAddress } from "@solana/spl-token";
const programId = new PublicKey(idl.metadata.address);

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