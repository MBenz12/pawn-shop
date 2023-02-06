import { useEffect, useState } from "react";
import { AuctionData, GlobalData } from "utils/types";
import moment from "moment";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const AuctionPrice = ({ differTime, auction, global }: { differTime: number, auction: AuctionData, global: GlobalData | null }) => {
    const [price, setPrice] = useState(0);

    useEffect(() => {
        if (!global) return;
        const timerId = setInterval(() => {
            let price = auction.startPrice.toNumber();
            let time = Math.floor(Math.max(new Date().getTime() - differTime * 1000 - auction.startedTime.toNumber() * 1000) / (global.decreaseInterval * 1000));
            let decreasedAmount = price * time * global.decreasePercent / 10000;
            let minPrice = price * global.minPercent / 10000;
            price = Math.max(price - decreasedAmount, minPrice);
            setPrice(price);
        }, 1000);
        return () => clearInterval(timerId);
    }, []);

    return (
        <>
            <div className="flex items-center justify-center text-center text-[16px] font-semibold">
                Started At: {moment(new Date((auction.startedTime.toNumber() + differTime) * 1000)).fromNow()}
            </div>
            <div className="flex items-center justify-center text-center text-[16px] font-semibold">
                Start Price: {(auction.startPrice.toNumber() / LAMPORTS_PER_SOL).toLocaleString('en-us', { maximumFractionDigits: 3 })} SOL
            </div>
            {auction.finishedTime.toNumber() === 0 ?
                <div className="flex items-center justify-center text-center text-[16px] font-semibold">
                    Current Price: {(price / LAMPORTS_PER_SOL).toLocaleString('en-us', { maximumFractionDigits: 3 })} SOL
                </div> :
                <>
                    <div className="flex items-center justify-center text-center text-[16px] font-semibold">
                        Sold Price: {(auction.soldPrice.toNumber() / LAMPORTS_PER_SOL).toLocaleString('en-us', { maximumFractionDigits: 3 })} SOL
                    </div>
                    <div className="flex items-center justify-center text-center text-[16px] font-semibold">
                        Finished At: {moment(new Date((auction.finishedTime.toNumber() + differTime) * 1000)).fromNow()}
                    </div>
                    <div className="flex items-center justify-center text-center text-[16px] font-semibold">
                        Winner: {auction.winner.toString().slice(0, 5) + "..." + auction.winner.toString().slice(-5)}
                    </div>
                </>
            }
        </>
    );
}