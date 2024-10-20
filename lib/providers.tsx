'use client';

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { config } from "@/lib/wagmi";


export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {

  const queryClient = new QueryClient();

  return (
    <DynamicContextProvider
      theme="auto"
      settings={{
        environmentId: "2762a57b-faa4-41ce-9f16-abff9300e2c9",
           walletConnectors: [EthereumWalletConnectors],
      }}
    >
      
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            {children}
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
      
    </DynamicContextProvider>
  );
}