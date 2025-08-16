"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, type State } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { TRPCReactProvider } from "@/trpc/react";

import { getConfig } from "@/lib/wagmi/config";

const queryClient = new QueryClient();

type Props = {
  children: ReactNode;
  initialState: State | undefined;
};

export function Providers({ children, initialState }: Props) {
  const [config] = useState(() => getConfig());
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <TRPCReactProvider>
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </TRPCReactProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
