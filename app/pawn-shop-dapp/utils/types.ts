import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export type NftData = {
    address: PublicKey;
    name: string;
    symbol: string;
    image: string;
    loanAmount: number;
};

export type LoanData = {
    key: PublicKey;
    owner: PublicKey;
    nftMint: PublicKey;
    loanStartedTime: BN;
    loanAmount: BN;
    paybacked: boolean;
}

export type PawnShopData = {
    authority: PublicKey;
    backend: PublicKey;
    name: string;
    bump: number;
    totalLoanCount: number;
    totalBalance: BN;
    loanPeriod: BN;
    interestRate: BN;
}