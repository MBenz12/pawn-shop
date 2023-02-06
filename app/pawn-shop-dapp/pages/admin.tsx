/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { AnchorProvider, BN, Program, Wallet } from "@project-serum/anchor";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { IDL } from "idl/pawn_shop";
import { IDL as AuctionIDL } from "idl/auction";
import idl from "idl/pawn_shop.json";
import auctionIdl from "idl/auction.json";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import { getAta, getAuctionAddress, getFloorPrice, getGlobalAddress, getLoanAddress, getMetaplex, getPawnShopAddress } from "utils";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Collection, LoanData, NftData, PawnShopData } from "utils/types";
import axios from "axios";
import { Timer } from "components/Timer";
import { JWT_TOKEN, PAWNSHOP_NAME } from "config";
import jwt from "jsonwebtoken";

const metaplex = getMetaplex();

export default function Home() {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const [pawnShopData, setPawnShopData] = useState<PawnShopData | undefined>();
  const [pawnShopName, setPawnShopName] = useState(PAWNSHOP_NAME);
  const [backend, setBackend] = useState("");
  const [loanPeriod, setLoanPeriod] = useState(7);
  const [interestRate, setInterestRate] = useState(1);
  const [fundAmount, setFundAmount] = useState(0);
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [nfts, setNfts] = useState<NftData[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionAddress, setCollectionAddress] = useState('');
  const [percent, setPercent] = useState(0);
  const [globalData, setGlobalData] = useState<any>();
  const [fee, setFee] = useState(3);
  const [minPercent, setMinPercent] = useState(50);
  const [decreaseInterval, setDecreaseInterval] = useState(600);
  const [decreasePercent, setDecreasePercent] = useState(1);
  const [maxDuration, setMaxDuration] = useState(48 * 3600);
  const [differTime, setDifferTime] = useState(0);

  const getProgramAndProvider = () => {
    const provider = new AnchorProvider(connection, anchorWallet as Wallet, AnchorProvider.defaultOptions());
    const program = new Program(IDL, idl.metadata.address, provider);
    const auctionProgram = new Program(AuctionIDL, auctionIdl.metadata.address, provider);
    return { program, auctionProgram, provider };
  }

  const createGlobal = async () => {
    if (!wallet.publicKey || !pawnShopName) return;
    try {
      const { auctionProgram: program } = getProgramAndProvider();
      const [global] = await getGlobalAddress();
      const [pawnShop] = await getPawnShopAddress(pawnShopName);
      const transaction = new Transaction();
      transaction.add(
        program.instruction.createGlobal(
          pawnShop,
          fee * 100,
          decreaseInterval,
          decreasePercent * 100,
          minPercent * 100,
          maxDuration,
          {
            accounts: {
              authority: wallet.publicKey,
              global,
              systemProgram: SystemProgram.programId
            }
          }
        )
      );
      const txSignature = await wallet.sendTransaction(transaction, connection, { skipPreflight: true });
      await connection.confirmTransaction(txSignature, "confirmed");
      console.log(txSignature);
      toast.success("Auction Global Created Successfully");
      fetchData();
    } catch (error) {
      console.log(error);
      toast.error("Failed");
    }
  }

  const closeGlobal = async () => {
    if (!wallet.publicKey || !pawnShopName) return;
    try {
      const { auctionProgram: program } = getProgramAndProvider();
      const [global] = await getGlobalAddress();
      const transaction = new Transaction();
      transaction.add(
        program.instruction.closePda({
          accounts: {
            signer: wallet.publicKey,
            pda: global,
            systemProgram: SystemProgram.programId
          }
        })
      );
      const txSignature = await wallet.sendTransaction(transaction, connection, { skipPreflight: true });
      await connection.confirmTransaction(txSignature, "confirmed");
      console.log(txSignature);
      toast.success("Auction Global Closed Successfully");
      fetchData();
    } catch (error) {
      console.log(error);
      toast.error("Failed");
    }
  }

  const updateGlobal = async () => {
    if (!wallet.publicKey || !pawnShopName) return;
    try {
      const { auctionProgram: program } = getProgramAndProvider();
      const [global] = await getGlobalAddress();
      const [pawnShop] = await getPawnShopAddress(pawnShopName);
      const transaction = new Transaction();
      transaction.add(
        program.instruction.updateGlobal(
          pawnShop,
          fee * 100,
          decreaseInterval,
          decreasePercent * 100,
          minPercent * 100,
          maxDuration,
          {
            accounts: {
              authority: wallet.publicKey,
              global,
            }
          }
        )
      );
      const txSignature = await wallet.sendTransaction(transaction, connection, { skipPreflight: true });
      await connection.confirmTransaction(txSignature, "confirmed");
      console.log(txSignature);
      toast.success("Auction Global Updated Successfully");
      fetchData();
    } catch (error) {
      console.log(error);
      toast.error("Failed");
    }
  }

  const getWithdrawLoanInstruction = async (loanData: LoanData) => {
    if (!wallet.publicKey || !pawnShopData) return;
    const { program } = getProgramAndProvider();
    const [pawnShop] = await getPawnShopAddress(pawnShopData.name);
    const { key: loan, nftMint } = loanData;
    const authority = wallet.publicKey;
    const authorityNftAta = await getAta(authority, nftMint);
    const loanNftAta = await getAta(loan, nftMint, true);
    const transaction = new Transaction();
    transaction.add(
      program.instruction.withdrawLoan(
        {
          accounts: {
            authority: wallet.publicKey,
            pawnShop,
            loan,
            nftMint,
            loanNftAta,
            authorityNftAta,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
          }
        }
      )
    );
    return transaction;
  }

  const submitToAuction = async (loans: LoanData[]) => {
    if (!wallet.publicKey || !wallet.signAllTransactions || !pawnShopName || !backend) return;
    try {
      const { auctionProgram: program } = getProgramAndProvider();
      const txns = [];
      let cnt = 0;
      let transaction = new Transaction();
      for (const loan of loans) {
        // const floorPrice = await getFloorPrice(nftMint);
        const [global] = await getGlobalAddress();
        const nftMint = loan.nftMint;
        const [auction] = await getAuctionAddress(nftMint);
        const auctionData = await program.account.auction.fetchNullable(auction);
        if (auctionData && (!auctionData.withdrawn || auctionData.finishedTime.toNumber() !== 0)) {
          continue;
        }
        const creator = wallet.publicKey;
        const creatorAta = await getAta(creator, nftMint);
        const auctionAta = await getAta(auction, nftMint, true);
        
        const balance = await program.provider.connection.getTokenAccountBalance(creatorAta);
        const withdrawLoanTx = await getWithdrawLoanInstruction(loan);
        if (withdrawLoanTx && balance.value.uiAmount === 0) transaction.add(withdrawLoanTx);
        transaction.add(
          program.instruction.createAuction(
            new BN(1 * LAMPORTS_PER_SOL),
            {
              accounts: {
                creator,
                global,
                auction,
                nftMint,
                creatorAta,
                auctionAta,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY,
              }
            }
          )
        );
        cnt += 2;
        if (cnt % 6 === 0) {
          txns.push(transaction);
          transaction = new Transaction();
        }
      }
      if (cnt % 6 && transaction.instructions.length) txns.push(transaction);
      if (!txns.length) return;
      const recentBlockhash = await (await program.provider.connection.getLatestBlockhash('finalized')).blockhash;
      for (const transaction of txns) {
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = recentBlockhash;
      }
      const signedTxns = await wallet.signAllTransactions(txns);
      const txSignatures = [];
      for (const signedTxn of signedTxns) {
        const txSignature = await program.provider.connection.sendRawTransaction(signedTxn.serialize(), { skipPreflight: true });
        txSignatures.push(txSignature);
      }
      for (const txSignature of txSignatures) {
        await program.provider.connection.confirmTransaction(txSignature, "confirmed");
      }
      toast.success("Auction Created Successfully");
      fetchData();
    } catch (error) {
      console.log(error);
      toast.error("Failed");
    }
  }

  const withdraw = async (nftMint: PublicKey) => {
    if (!wallet.publicKey || !pawnShopName) return;
    try {
      const { auctionProgram: program } = getProgramAndProvider();
      const [global] = await getGlobalAddress();
      const [auction] = await getAuctionAddress(nftMint);
        const auctionData = await program.account.auction.fetchNullable(auction);
        if (auctionData && (auctionData.withdrawn || auctionData.finishedTime.toNumber())) {
          return;
        }
      const creator = wallet.publicKey;
      const creatorAta = await getAta(creator, nftMint);
      const auctionAta = await getAta(auction, nftMint, true);
      const transaction = new Transaction();
      transaction.add(
        program.instruction.withdraw(
          {
            accounts: {
              creator,
              global,
              auction,
              nftMint,
              auctionAta,
              creatorAta,
              systemProgram: SystemProgram.programId,
              tokenProgram: TOKEN_PROGRAM_ID,
            }
          }
        )
      );
      const txSignature = await wallet.sendTransaction(transaction, connection, { skipPreflight: true });
      await connection.confirmTransaction(txSignature, "confirmed");
      console.log(txSignature);
      toast.success("PawnShop Created Successfully");
      fetchData();
    } catch (error) {
      console.log(error);
      toast.error("Failed");
    }
  }

  const createPawnShop = async () => {
    if (!wallet.publicKey || !pawnShopName || !backend) return;
    try {
      const { program } = getProgramAndProvider();
      const [pawnShop] = await getPawnShopAddress(pawnShopName);
      console.log(pawnShop.toString());
      const transaction = new Transaction();
      transaction.add(
        program.instruction.createPawnShop(
          pawnShopName,
          new PublicKey(backend),
          {
            accounts: {
              authority: wallet.publicKey,
              pawnShop,
              systemProgram: SystemProgram.programId
            }
          }
        )
      );
      const txSignature = await wallet.sendTransaction(transaction, connection, { skipPreflight: true });
      await connection.confirmTransaction(txSignature, "confirmed");
      console.log(txSignature);
      toast.success("PawnShop Created Successfully");
      fetchData();
    } catch (error) {
      console.log(error);
      toast.error("Failed");
    }
  }

  const updatePawnShop = async () => {
    if (!wallet.publicKey || !pawnShopName || !backend || !pawnShopData) return;
    try {
      const { program } = getProgramAndProvider();
      const [pawnShop] = await getPawnShopAddress(pawnShopData.name);
      const transaction = new Transaction();
      transaction.add(
        program.instruction.updatePawnShop(
          pawnShopData.authority,
          new PublicKey(backend),
          new BN(loanPeriod),
          new BN(interestRate * 100),
          {
            accounts: {
              authority: wallet.publicKey,
              pawnShop,
            }
          }
        )
      );
      const txSignature = await wallet.sendTransaction(transaction, connection, { skipPreflight: true });
      console.log(txSignature);
      toast.success("PawnShop Updated Successfully");
      fetchData();
    } catch (error) {
      console.log(error);
      toast.error("Failed");
    }
  }

  const fund = async () => {
    if (!wallet.publicKey || !pawnShopData) return;
    try {
      const { program } = getProgramAndProvider();
      const [pawnShop] = await getPawnShopAddress(pawnShopData.name);
      const transaction = new Transaction();
      transaction.add(
        program.instruction.fund(
          new BN(fundAmount * LAMPORTS_PER_SOL),
          {
            accounts: {
              funder: wallet.publicKey,
              pawnShop,
              systemProgram: SystemProgram.programId
            }
          }
        )
      );
      const txSignature = await wallet.sendTransaction(transaction, connection, { skipPreflight: true });
      await connection.confirmTransaction(txSignature, "confirmed");
      console.log(txSignature);
      toast.success("Funded Successfully");
      fetchData();
    } catch (error) {
      console.log(error);
      toast.error("Failed");
    }
  }

  const drain = async () => {
    if (!wallet.publicKey || !pawnShopData) return;
    try {
      const { program } = getProgramAndProvider();
      const [pawnShop] = await getPawnShopAddress(pawnShopData.name);
      const transaction = new Transaction();
      transaction.add(
        program.instruction.drain(
          {
            accounts: {
              authority: wallet.publicKey,
              pawnShop,
              systemProgram: SystemProgram.programId
            }
          }
        )
      );
      const txSignature = await wallet.sendTransaction(transaction, connection, { skipPreflight: true });
      await connection.confirmTransaction(txSignature, "confirmed");
      console.log(txSignature);
      toast.success("Drained Successfully");
      fetchData();
    } catch (error) {
      console.log(error);
      toast.error("Failed");
    }
  }

  const withdrawLoan = async (loanData: LoanData) => {
    if (!wallet.publicKey || !pawnShopData) return;
    try {
      console.log(new Date().getTime(), (loanData.loanStartedTime.toNumber() + pawnShopData.loanPeriod.toNumber()) * 1000);
      const { program } = getProgramAndProvider();
      const [pawnShop] = await getPawnShopAddress(pawnShopData.name);
      const { key: loan, nftMint } = loanData;
      const authority = wallet.publicKey;
      const authorityNftAta = await getAta(authority, nftMint);
      const loanNftAta = await getAta(loan, nftMint, true);
      const transaction = new Transaction();
      transaction.add(
        program.instruction.withdrawLoan(
          {
            accounts: {
              authority: wallet.publicKey,
              pawnShop,
              loan,
              nftMint,
              loanNftAta,
              authorityNftAta,
              systemProgram: SystemProgram.programId,
              tokenProgram: TOKEN_PROGRAM_ID,
              associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
              rent: SYSVAR_RENT_PUBKEY,
            }
          }
        )
      );
      const txSignature = await wallet.sendTransaction(transaction, connection, { skipPreflight: true });
      await connection.confirmTransaction(txSignature, "confirmed");
      console.log(txSignature);
      toast.success("Loan Withdrawed Successfully");
      fetchData();
    } catch (error) {
      console.log(error);
      toast.error("Failed");
    }
  }

  const fetchData = async () => {
    if (!wallet.publicKey) return;
    try {
      const { program, auctionProgram } = getProgramAndProvider();
      const [global] = await getGlobalAddress();
      const globalData = await auctionProgram.account.global.fetchNullable(global);
      setGlobalData(globalData);
      if (globalData) {
        setFee(globalData.fee / 100);
        setMinPercent(globalData.minPercent / 100);
        setDecreaseInterval(globalData.decreaseInterval);
        setDecreasePercent(globalData.decreasePercent / 100);
        setMaxDuration(globalData.maxDuration);
      } else {
        setFee(3);
        setMinPercent(50);
        setDecreaseInterval(600);
        setDecreasePercent(1);
        setMaxDuration(48 * 3600);
      }
      const [pawnShop] = await getPawnShopAddress(pawnShopName);
      const pawnShopAccount = await program.account.pawnShop.fetchNullable(pawnShop);
      if (pawnShopAccount) {
        const pawnShopData: PawnShopData = { ...pawnShopAccount };
        setPawnShopData(pawnShopData);
        setBackend(pawnShopData.backend.toString());
        setLoanPeriod(pawnShopData.loanPeriod.toNumber());
        setInterestRate(pawnShopData.interestRate.toNumber() / 100);

        let loans = await program.account.loan.all();
        loans = await Promise.all(loans.filter(async (loan) => {
          const { account: { nftMint } } = loan;
          const [loanAddress] = await getLoanAddress(nftMint, pawnShop);
          return loanAddress.toString() === loan.publicKey.toString();
        }));
        setLoans(loans.map(loan => {
          const { account: { bump, ...rest }, publicKey: key } = loan;
          return { ...rest, key } as LoanData;
        }).filter(loan => !loan.paybacked));
      } else {
        setPawnShopData(undefined);
        setLoans([]);
      }

      const { data: { backendWallet } } = await axios.get('/api/backendWallet');
      setBackend(backendWallet);
    } catch (error) {
      console.log(error);
      toast.error("Failed");
    }
  }

  function updateAccessToken(token: string) {
    if (token) {
      localStorage.setItem("accessToken", token);
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('accessToken');
      delete axios.defaults.headers.common.Authorization;
    }
  }

  async function getSignedMessage() {
    if (wallet.signMessage && wallet.publicKey) {
      const message = "I am an authorized admin wallet.";
      const signature = await wallet.signMessage(new Uint8Array(Buffer.from(message)));

      return { message, signature, wallet: wallet.publicKey.toString() };
    }
  }
  // console.log(jwt.sign("hello", "key", { expiresIn: 3600 }));

  async function getCollections() {
    if (!wallet.signMessage || !wallet.publicKey) return;

    try {
      let token = localStorage.getItem('accessToken');
      console.log(token);
      if (!token) {
        const payload = await getSignedMessage();
        console.log(payload);
        if (payload) {
          updateAccessToken(jwt.sign(payload, JWT_TOKEN, { expiresIn: 3600 }));
        }
      } else {
        try {
          const { payload } = jwt.verify(token, JWT_TOKEN, { complete: true });
          // @ts-ignore
          if (!payload || payload && payload.wallet !== wallet.publicKey.toString()) {
            throw "Token invalid or unahtorized wallet";
          }
          updateAccessToken(token);
        } catch (error) {
          const newPayload = await getSignedMessage();
          if (newPayload) {
            updateAccessToken(jwt.sign(newPayload, JWT_TOKEN, { expiresIn: 3600 }));
          }
        }
      }

      const { data } = await axios.get(`/api/collection/all`);
      if (data) {
        setCollections(data as Collection[]);
      }
    } catch (error) {
      console.log(error);
      toast.error('Unauthorized Wallet');
    }
  }

  const addCollection = async () => {
    try {
      let token = localStorage.getItem('accessToken');
      if (token) {
        updateAccessToken(token);
        await axios.post(`/api/collection`, { collection: collectionAddress, loanPercent: percent });
      }
      const newCollections = collections.map(collection => ({ ...collection }));
      newCollections.push({ address: collectionAddress, percent });
      setCollections(newCollections);
      toast.success('Success');
    } catch (error) {
      console.log(error);
      toast.error('Failed');
    }
  }

  const updateCollection = async (collection: Collection, del: boolean = false) => {
    try {
      let token = localStorage.getItem('accessToken');
      if (token) {
        updateAccessToken(token);
        await axios.post(`/api/collection`, { collection: collection.address, loanPercent: del ? 0 : collection.percent });
      }
      if (del) {
        const newCollections = collections.map(collection => ({ ...collection })).filter(col => col.address !== collection.address);
        setCollections(newCollections);
      }
      toast.success('Success');
    } catch (error) {
      console.log(error);
      toast.error('Failed');
    }
  }

  useEffect(() => {
    fetchData();
  }, [pawnShopName]);

  const getBlockTime = async () => {
    const slot = await connection.getSlot();
    const timeStamp = await connection.getBlockTime(slot) || 0;
    const now = Math.floor(new Date().getTime() / 1000);
    setDifferTime(now - timeStamp);
  }

  const fetchNfts = async () => {
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

    setNfts(nfts);
  }

  useEffect(() => {
    fetchNfts();
  }, [loans]);

  useEffect(() => {
    fetchData();
    if (!wallet.publicKey) {
      setLoans([]);
    }
    getCollections();
    getBlockTime();
  }, [wallet.publicKey, connection]);

  return (
    <div className="flex flex-col mx-5 text-black">
      <div className="flex justify-center my-5">
        {
          !wallet.publicKey ? <WalletModalButton /> : <WalletMultiButton />
        }
      </div>
      {wallet.publicKey && (
        <div className="flex flex-col gap-3 items-center">
          <div className="flex flex-col gap-4 items-center">
            <div className="flex gap-2 items-center">
              <p>Pawn Shop Name: </p>
              <input value={pawnShopName} onChange={(e) => setPawnShopName(e.target.value)} className="border border-black p-2" />
            </div>
            <div className="flex gap-2 items-center">
              <p>Backend: </p>
              <input value={backend} onChange={(e) => setBackend(e.target.value)} className="border border-black p-2 w-[450px]" />
            </div>
            <div className="flex gap-2 items-center">
              <p>Loan Period: </p>
              <input value={loanPeriod} onChange={(e) => setLoanPeriod(parseInt(e.target.value) || 0)} className="border border-black p-2" />s
            </div>
            <div className="flex gap-2 items-center">
              <p>Interest Rate: </p>
              <input value={interestRate} onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)} className="border border-black p-2" />%
            </div>
            <div className="flex justify-center">
              {pawnShopData ?
                <button className="border border-black p-2" onClick={updatePawnShop}>Update Pawn Shop</button> :
                <button className="border border-black p-2" onClick={createPawnShop}>Create Pawn Shop</button>
              }
            </div>
          </div>

          <div className="flex flex-col gap-4 items-center">
            <div className="flex gap-2 items-center">
              <p>Decrease Interval: </p>
              <input type="number" value={decreaseInterval} onChange={(e) => setDecreaseInterval(parseInt(e.target.value) || 0)} className="border border-black p-2" />s
            </div>
            <div className="flex gap-2 items-center">
              <p>Decrease Percent: </p>
              <input type="number" value={decreasePercent} onChange={(e) => setDecreasePercent(parseFloat(e.target.value) || 0)} className="border border-black p-2" />%
            </div>
            <div className="flex gap-2 items-center">
              <p>Min Percent of Floor Price: </p>
              <input type="number" value={minPercent} onChange={(e) => setMinPercent(parseFloat(e.target.value) || 0)} className="border border-black p-2" />%
            </div>
            <div className="flex gap-2 items-center">
              <p>Max Duration: </p>
              <input type="number" value={maxDuration} onChange={(e) => setMaxDuration(parseInt(e.target.value) || 0)} className="border border-black p-2" />s
            </div>
            <div className="flex gap-2 items-center">
              <p>Admin Fee: </p>
              <input type="number" value={fee} onChange={(e) => setFee(parseFloat(e.target.value) || 0)} className="border border-black p-2" />%
            </div>

            <div className="flex justify-center">
              {!globalData ?
                <button className="border border-black p-2" onClick={createGlobal}>Create Auction Global</button> :
                <button className="border border-black p-2" onClick={updateGlobal}>Update Auction Shop</button>
              }
              <button className="border border-black p-2" onClick={closeGlobal}>Close Global</button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <p>Collection: </p>
              <input value={collectionAddress} onChange={(e) => setCollectionAddress(e.target.value)} className="border border-black p-2 w-[450px]" />
              <input value={percent} onChange={(e) => setPercent(parseFloat(e.target.value) || 0)} type="number" min={0} step={0.1} className="border border-black p-2 w-[60px]" />%
              <button className="border border-black p-2" onClick={addCollection}>Add</button>
            </div>
            {collections.map((collection, index) => (
              <div className="flex gap-2 items-center" key={collection.address}>
                <p>Collection: {collection.address}</p>
                <input value={collection.percent} onChange={(e) => {
                  const newCollections = collections.map(collection => ({ ...collection }));
                  newCollections[index].percent = parseFloat(e.target.value) || 0;
                  setCollections(newCollections);
                }} type="number" min={0} step={0.1} className="border border-black p-2 w-[60px]" />%
                <button className="border border-black p-2" onClick={() => updateCollection(collection)}>Update</button>
                <button className="border border-black p-2" onClick={() => updateCollection(collection, true)}>Delete</button>
              </div>
            ))}
          </div>

          {pawnShopData &&
            <>
              <div className="flex gap-2 items-center">
                <p>Total Balance: {pawnShopData.totalBalance.toNumber() / LAMPORTS_PER_SOL}</p>
                <button className="border border-black p-2" onClick={drain}>Drain</button>
              </div>
              <div className="flex gap-2 items-center">
                <p>Fund Amount: </p>
                <input type="number" value={fundAmount} onChange={(e) => setFundAmount(parseFloat(e.target.value) || 0)} className="border border-black p-2" /> SOL
                <button className="border border-black p-2" onClick={fund}>Fund</button>
              </div>

              <div>
                <button
                  className="p-2 border border-black rounded-md text-[16px] w-full"
                  onClick={() => submitToAuction(loans.filter(loan => !(new Date().getTime() < (loan.loanStartedTime.toNumber() + pawnShopData.loanPeriod.toNumber()) * 1000 || loan.paybacked)))}
                >
                  Submit All to Auction
                </button>
              </div>
              <div className="w-full mx-5">
                <div className="w-full grid xl:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
                  {loans.map((loan, index) => (
                    <div key={loan.key.toString()} className="flex flex-col gap-2 p-1 rounded-md border border-black">
                      <div className="flex justify-center items-center text-center text-[20px] font-semibold h-[24px]">{nfts[index] && nfts[index].name}</div>
                      <div className="flex items-center justify-center">
                        <img src={nfts[index] && nfts[index].image} alt="" className="w-full object-contain"/>
                      </div>
                      <div className="flex items-center justify-center text-center text-[18px]">Owner: {loan.owner.toString().slice(0, 4) + "..." + loan.owner.toString().slice(-4)}</div>
                      <div className="flex items-center justify-center text-center text-[20px] font-semibold">{(loan.loanAmount.toNumber() / LAMPORTS_PER_SOL).toLocaleString('en-us', { maximumFractionDigits: 3 })} SOL</div>
                      <div className="flex justify-center">
                        <Timer differTime={differTime} finishTime={(loan.loanStartedTime.toNumber() + pawnShopData.loanPeriod.toNumber()) * 1000} />
                      </div>
                      {!(new Date().getTime() - differTime * 1000 < (loan.loanStartedTime.toNumber() + pawnShopData.loanPeriod.toNumber()) * 1000 || loan.paybacked) &&
                        <div className="flex flex-col items-center justify-center gap-2">
                          {/* <button
                            className="p-2 border border-black rounded-md text-[16px] w-full"
                            onClick={() => withdrawLoan(loan)}
                          >
                            Withdraw Loan
                          </button> */}
                          <button
                            className="p-2 border border-black rounded-md text-[16px] w-full"
                            onClick={() => submitToAuction([loan])}
                          >
                            Submit to Auction
                          </button>
                          <button
                            className="p-2 border border-black rounded-md text-[16px] w-full"
                            onClick={() => withdraw(loan.nftMint)}
                          >
                            Withdraw
                          </button>
                        </div>
                      }
                    </div>
                  ))}
                </div>
              </div>
            </>
          }
        </div>
      )}
    </div>
  )
}