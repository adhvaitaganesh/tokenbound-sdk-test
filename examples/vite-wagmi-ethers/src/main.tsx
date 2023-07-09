// import { ConnectKitProvider } from 'connectkit'
// import * as React from 'react'
// import * as ReactDOM from 'react-dom/client'
// import { WagmiConfig } from 'wagmi'

// import { App } from './App'
// import { wagmiClient } from './wagmi'

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <WagmiConfig client={wagmiClient}>
//       <ConnectKitProvider>
//         <App />
//       </ConnectKitProvider>
//     </WagmiConfig>
//   </React.StrictMode>
// )

import { ConnectKitProvider } from 'connectkit'
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
//import { WagmiConfig } from 'wagmi'

import { App } from './App'
import { wagmiConfig } from './wagmi'

import { MagicAuthConnector } from "@magiclabs/wagmi-connector";
import type { AppProps } from "next/app";
import { WagmiConfig, configureChains, createConfig, mainnet } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors: [
    new MagicAuthConnector({
      chains,
      options: {
        apiKey: process.env.NEXT_PUBLIC_MAGIC_API_KEY as string,
        isDarkMode: true,
        /* Make sure to enable OAuth options from magic dashboard */
        oauthOptions: {
          providers: ["google", "facebook", "twitter", "discord"],
        },
        magicSdkConfiguration: {
          network: {
            rpcUrl: "https://rpc.ankr.com/eth",
            chainId: 5,
          },
        },
      },
    }),
  ],
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <ConnectKitProvider>
        <App />
      </ConnectKitProvider>
    </WagmiConfig>
  </React.StrictMode>
)
