import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import {
  PhantomWalletAdapter,
  GlowWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ToastContainer } from "react-toastify";
import { useMemo } from 'react';
import { SOLANA_RPC_URL } from 'config';
import "@solana/wallet-adapter-react-ui/styles.css";
import "react-toastify/dist/ReactToastify.css";

export default function App({ Component, pageProps }: AppProps) {
  let solanaRpc = SOLANA_RPC_URL;
  let network = WalletAdapterNetwork.Mainnet; 
  // network = WalletAdapterNetwork.Devnet;
  // solanaRpc = clusterApiUrl(network);
  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => solanaRpc, [solanaRpc]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded.
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          <Component {...pageProps} />
          <ToastContainer position="top-right" newestOnTop autoClose={5000} closeOnClick pauseOnHover />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
