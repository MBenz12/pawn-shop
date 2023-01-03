/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { AnchorProvider, Program, Wallet } from "@project-serum/anchor";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { IDL } from "idl/pawn_shop";
import idl from "idl/pawn_shop.json";
import { Metaplex } from "@metaplex-foundation/js";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";
import axios from "axios";
import { Collection, LoanData, NftData, PawnShopData } from "utils/types";
import { getAta, getPawnShopAddress } from "utils";
import { Timer } from "components/Timer";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export default function Home() {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const metaplex = useMemo(() => new Metaplex(connection), [connection]);
  const [nfts, setNfts] = useState<NftData[]>([]);
  const [pawnShopData, setPawnShopData] = useState<PawnShopData | undefined>();
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [pawnedNfts, setPawnedNfts] = useState<NftData[]>([]);
  const [collections, setCollections] = useState<string[]>([]);


  const getProgramAndProvider = () => {
    const provider = new AnchorProvider(connection, anchorWallet as Wallet, AnchorProvider.defaultOptions());
    const program = new Program(IDL, idl.metadata.address, provider);
    return { program, provider };
  }

  const pawn = async (nft: NftData) => {
    if (!wallet.publicKey || !wallet.signTransaction) return;
    try {
      const { data: { serializedBuffer } } = await axios.post(`/api/transaction`, {
        mintAddress: nft.address.toString(),
        owner: wallet.publicKey.toString(),
      });
      const recoveredTx = Transaction.from(Buffer.from(serializedBuffer, "base64"));
      const signedTx = await wallet.signTransaction(recoveredTx);
      console.log(signedTx);
      const txSignature = await connection.sendRawTransaction(signedTx.serialize(), { skipPreflight: true });
      await connection.confirmTransaction(txSignature, "confirmed");
      console.log(txSignature);
      toast.success("Pawned Successfully");
      fetchWalletNfts();
      fetchLoans();
    } catch (error) {
      console.log(error);
      toast.error("Failed");
    }
  };

  const payback = async (loanData: LoanData) => {
    if (!wallet.publicKey || !pawnShopData) return;
    try {
      const { program } = getProgramAndProvider();
      const [pawnShop] = await getPawnShopAddress(pawnShopData.name);
      const { key: loan, nftMint } = loanData;
      const owner = wallet.publicKey;
      const ownerNftAta = await getAta(owner, nftMint);
      const loanNftAta = await getAta(loan, nftMint, true);
      const transaction = new Transaction();
      transaction.add(
        program.instruction.paybackLoan(
          {
            accounts: {
              owner: wallet.publicKey,
              pawnShop,
              loan,
              loanNftAta,
              ownerNftAta,
              systemProgram: SystemProgram.programId,
              tokenProgram: TOKEN_PROGRAM_ID,
            }
          }
        )
      );
      const txSignature = await wallet.sendTransaction(transaction, connection, { skipPreflight: true });
      await connection.confirmTransaction(txSignature, "confirmed");
      console.log(txSignature);

      fetchWalletNfts();
      fetchLoans();
      toast.success("Paybacked Successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed");
    }
  };

  const fetchWalletNfts = async () => {
    if (!wallet.publicKey) return;
    try {
      const nfts = await metaplex.nfts().findAllByOwner({ owner: wallet.publicKey });
      setNfts(
        await Promise.all(
          nfts.filter((nft) => {
            const { creators } = nft;
            const creator = creators[0].address.toString();
            return collections.includes(creator);
          }).map(async (nft) => {
            // @ts-ignore
            const { mintAddress, name, symbol, uri } = nft;
            const nftData: NftData = { address: mintAddress, name, symbol, image: '', loanAmount: 0 };
            try {
              const { data: { image } } = await axios.get(uri);
              nftData.image = image;
              const { data: { loanAmount } } = await axios.get(`/api/loanAmount/${mintAddress.toString()}`);
              nftData.loanAmount = loanAmount;
            } catch (error) {
              console.log(error);
            }
            return nftData;
          })
        )
      );
      console.log(nfts);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch NFTs");
    }
  };

  const fetchLoans = async () => {
    if (!wallet.publicKey) return;
    try {
      const { program } = getProgramAndProvider();
      const [pawnShop] = await getPawnShopAddress();
      const pawnShopAccount = await program.account.pawnShop.fetchNullable(pawnShop);
      if (pawnShopAccount) {
        const pawnShopData: PawnShopData = { ...pawnShopAccount };
        console.log(pawnShopData.interestRate.toString());
        setPawnShopData(pawnShopData);
      }
      const loans = await program.account.loan.all();
      setLoans(loans.map(loan => {
        const { account: { bump, ...rest }, publicKey: key } = loan;
        return { ...rest, key } as LoanData;
      }).filter(loanData => !loanData.paybacked && loanData.owner.toString() === wallet.publicKey?.toString()));
    } catch (error) {
      console.log(error);
      toast.error("Failed");
    }
  }

  const fetchPawnedNfts = async () => {
    const nfts = await Promise.all(
      loans.map(async (loan) => {
        const mintAddress = loan.nftMint;
        const nft = await metaplex.nfts().findByMint({ mintAddress });
        const { name, symbol, uri } = nft;
        const nftData: NftData = { address: mintAddress, name, symbol, image: '', loanAmount: 0 };
        try {
          const { data: { image } } = await axios.get(uri);
          nftData.image = image;
          nftData.loanAmount = loan.loanAmount.toNumber();
        } catch (error) {
          console.log(error);
        }
        return nftData;
      })
    );

    setPawnedNfts(nfts);
  }

  useEffect(() => {
    fetchPawnedNfts();
  }, [loans]);

  useEffect(() => {
    fetchWalletNfts();
    fetchLoans();
    if (!wallet.publicKey) {
      setLoans([]);
      setNfts([]);
    }
    getCollections();
  }, [wallet.publicKey, connection]);

  const getCollections = async () => {
    try {
      const { data } = await axios.get('/api/collection/all');
      const collections = (data as Collection[]).map(collection => collection.address);
      setCollections(collections);
    } catch (error) {
      console.log(error);
      toast.error("Failed");
    }
  }

  return (
    <div className="flex flex-col mx-5 gap-10">
      <div className="flex justify-end py-2 border-b border-white/[0.07]">
        {
          !wallet.publicKey ? <WalletModalButton className="custom-connect-style" /> : <WalletMultiButton className="custom-connect-style" />
        }
      </div>
      {wallet.connected && (
        <div className="flex flex-col gap-5">
          <div className="text-center text-[20px] font-bold">Your Wallet</div>
          <div className="w-full grid xl:grid-cols-6 md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4">
            {nfts.map((nft, index) => (
              <div className="flex flex-col gap-2 p-1 rounded-md border border-white" key={"nft" + index}>
                <div className="flex justify-center items-center text-center text-[20px] font-semibold h-[24px]">{nft.name}</div>
                <div className="flex items-center h-[300px]">
                  <img src={nft.image} alt="" />
                </div>
                <div className="flex items-center justify-center text-center text-[20px] font-semibold">{nft.loanAmount} SOL</div>
                <button className="p-2 border border-white rounded-md text-[16px]" onClick={() => pawn(nft)}>Pawn</button>
              </div>
            ))}
          </div>

          {pawnShopData &&
            <div className="flex flex-col gap-5 mb-5">
              <div className="text-center text-[20px] font-bold">Pawned NFTs</div>
              <div className="w-full grid xl:grid-cols-6 md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4">
                {loans.map((loan, index) => (
                  <div key={loan.key.toString()} className="flex flex-col gap-2 p-1 rounded-md border border-white">
                    <div className="flex justify-center items-center text-center text-[20px] font-semibold h-[24px]">{pawnedNfts[index] && pawnedNfts[index].name}</div>
                    <div className="flex items-center h-[300px]">
                      <img src={pawnedNfts[index] && pawnedNfts[index].image} alt="" />
                    </div>
                    <div className="flex items-center justify-center text-center text-[16px] font-semibold">Loan Amount: {loan.loanAmount.toNumber() / LAMPORTS_PER_SOL} SOL</div>
                    <div className="flex items-center justify-center text-center text-[16px] font-semibold">
                      Interest Amount: {(loan.loanAmount.toNumber() * pawnShopData.interestRate.toNumber() * Math.ceil((new Date().getTime() - loan.loanStartedTime.toNumber() * 1000) / 86400 / 1000) / (100 * 100)) / LAMPORTS_PER_SOL} SOL
                    </div>
                    <div className="flex items-center justify-center text-center text-[16px] font-semibold">
                      Payback Amount: {(loan.loanAmount.toNumber() * (pawnShopData.interestRate.toNumber() * Math.ceil((new Date().getTime() - loan.loanStartedTime.toNumber() * 1000) / 86400 / 1000) + 100 * 100) / (100 * 100)) / LAMPORTS_PER_SOL} SOL
                    </div>
                    <div className="flex justify-center">
                      <Timer finishTime={(loan.loanStartedTime.toNumber() + pawnShopData.loanPeriod.toNumber()) * 1000} />
                    </div>
                    <button
                      disabled={(new Date().getTime() > (loan.loanStartedTime.toNumber() + pawnShopData.loanPeriod.toNumber()) * 1000 && !loan.paybacked)}
                      className="p-2 border border-white rounded-md text-[16px]"
                      onClick={() => payback(loan)}
                    >
                      Payback
                    </button>
                  </div>
                ))}
              </div>
            </div>
          }
        </div>
      )}
    </div>
  )
}
